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
      ?¹ì‹ ?€ ?°ì—…??ë¶€?™ì‚°(ì§€?ì‚°?…ì„¼?? ?„ë¬¸ AI ì»¨ì„¤?´íŠ¸?…ë‹ˆ??
      ?„ëž˜ ?œê³µ??[ì§€??ë² ì´??ë¥?ë°”íƒ•?¼ë¡œ ?¬ìš©?ì˜ ì§ˆë¬¸???•í™•?˜ê³  ?„ë¬¸?ìœ¼ë¡??µë??˜ì„¸??
      
      [ì§€??ë² ì´??
      ${context}
      
      ê·œì¹™:
      1. ì§€??ë² ì´?¤ì— ?ˆëŠ” ?´ìš©ë§??¬ì‹¤?€ë¡??µë??˜ì„¸??
      2. ë²•ë¥ ?´ë‚˜ ?¸ë¬´ ê´€???´ìš©?€ "2025??ê¸°ì?" ???œì ??ëª…ì‹œ?˜ì„¸??
      3. ì§€??ë² ì´?¤ì— ?†ëŠ” ?´ìš©?€ "ì£„ì†¡?©ë‹ˆ?? ?´ë‹¹ ?´ìš©?€ ?„ìž¬ ë¬¸ì„œ???†ìŠµ?ˆë‹¤."?¼ê³  ?µí•˜?¸ìš”.
      4. ë§íˆ¬???•ì¤‘?˜ê³  ?„ë¬¸?ì¸ "?´ìš”ì²?ë¥??¬ìš©?˜ì„¸??
      5. ?µë??€ ë§ˆí¬?¤ìš´ ?•ì‹?¼ë¡œ ê¹”ë”?˜ê²Œ ?•ë¦¬?˜ì„¸??
    `;

        // Capture request details for logging
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';
        const referer = headersList.get('referer') || 'unknown';
        const userAgent = headersList.get('user-agent') || 'unknown';

        console.log("[API] Starting streamText with model: gemini-1.5-flash");

        const result = await streamText({
            model: google('gemini-1.5-flash'),
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

