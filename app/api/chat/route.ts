import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { getContext } from '@/lib/rag';
import { logChat } from '@/lib/db';
import { appendLogToSheet } from '@/lib/google-sheets';
import { headers } from 'next/headers';

// Ensure we only run in Node.js runtime where env vars are available
export const runtime = 'nodejs';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        // Support both common env var names: our own and AI SDK default
        const apiKey =
            process.env.GOOGLE_API_KEY ||
            process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
            process.env.NEXT_PUBLIC_GOOGLE_API_KEY; // last-resort fallback if user set public var

        // Safe debug: log which GOOGLE* env keys exist (not values)
        try {
            const envKeys = Object.keys(process.env).filter((k) => k.toUpperCase().includes('GOOGLE'));
            console.log('[Env Debug] Present GOOGLE-related keys:', envKeys);
        } catch {}
        if (!apiKey) {
            // Collect safe debug info: present env var NAMES (no values) and Vercel env context
            let presentEnvKeys: string[] = [];
            try {
                presentEnvKeys = Object.keys(process.env).filter((k) => k.toUpperCase().includes('GOOGLE'));
            } catch {}

            return new Response(
                JSON.stringify({
                    error: 'Missing API key',
                    details:
                        'Set GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY (NEXT_PUBLIC_GOOGLE_API_KEY also accepted) in Vercel Project > Settings > Environment Variables. Ensure the correct Environment (Production/Preview) and redeploy.',
                    debug: {
                        presentEnvKeys,
                        vercelEnv: process.env.VERCEL_ENV,
                        nodeVersion: process.version,
                        runtime,
                    },
                }),
                { status: 500 }
            );
        }

        const google = createGoogleGenerativeAI({ apiKey });
        const { messages, sourceId = 'default' } = await req.json();
        const lastMessage = messages[messages.length - 1];
        const query = lastMessage.content;

        // 1. Retrieve Context (RAG)
        const context = await getContext(query);

        // 2. Generate Response with Streaming
        const systemPrompt = `
      당신은 산업용 부동산(지식산업센터) 전문 AI 컨설턴트입니다.
      아래 제공된 [지식 베이스]를 바탕으로 사용자의 질문에 정확하고 전문적으로 답변하세요.
      
      [지식 베이스]
      ${context}
      
      규칙:
      1. 지식 베이스에 있는 내용만 사실대로 답변하세요.
      2. 법률이나 세무 관련 내용은 "2025년 기준" 등 시점을 명시하세요.
      3. 지식 베이스에 없는 내용은 "죄송합니다. 해당 내용은 현재 문서에 없습니다."라고 답하세요.
      4. 말투는 정중하고 전문적인 "해요체"를 사용하세요.
      5. 답변은 마크다운 형식으로 깔끔하게 정리하세요.
    `;

        // Capture request details for logging
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';
        const referer = headersList.get('referer') || 'unknown';
        const userAgent = headersList.get('user-agent') || 'unknown';

        console.log("[API] Starting streamText with model: gemini-2.0-flash");

        const result = await streamText({
            model: google('gemini-2.0-flash'),
            system: systemPrompt,
            messages: messages,
            onFinish: async (completion) => {
                // 3. Log Interaction
                // Note: In Edge/Serverless, ensure this doesn't block the response or use a proper queue.
                // For prototype, we just log to console.
                console.log(`[Log] Source: ${sourceId}, Q: ${query}, A: ${completion.text}`);

                // Log to local file (existing)
                await logChat(sourceId, query, completion.text);

                // Log to Google Sheets (new)
                await appendLogToSheet({
                    timestamp: new Date().toISOString(),
                    ip,
                    referer,
                    userAgent,
                    sourceId,
                    question: query,
                    answer: completion.text
                });
            },
        });


        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error("Chat API Error:", error);
        // Return detailed error for debugging (remove in production later)
        return new Response(JSON.stringify({
            error: "Internal Server Error",
            details: error.message,
            stack: error.stack
        }), { status: 500 });
    }
}
