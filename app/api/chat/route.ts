import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getContext } from '@/lib/rag';
import { logChat } from '@/lib/db';
import { appendLogToSheet } from '@/lib/google-sheets';
import { headers } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'Missing API key',
          details:
            'Set GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY in Vercel Project > Settings > Environment Variables. Ensure the correct Environment (Production/Preview) and redeploy.'
        }),
        { status: 500 }
      );
    }

    const google = createGoogleGenerativeAI({ apiKey });

    const { messages, sourceId = 'default' } = await req.json();
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage?.content ?? '';

    // 1) Knowledge base
    const context = await getContext(query);

    // 2) System prompt (Korean)
    const systemPrompt = `
지식산업센터 AI 컨설턴트입니다. 아래 지식베이스를 참고하여 사용자의 질문을 정확하고 친절하게 답변하세요.

[지식베이스]
${context}

규칙:
1) 반드시 지식베이스의 내용에 근거해 설명하세요. 추측은 피하고 사실을 명확히 밝힙니다.
2) 법률/세무 관련 내용은 "2025년 기준"임을 분명히 표기합니다.
3) 지식베이스에 없는 내용이면 "죄송합니다. 현재 문서에는 해당 정보가 없습니다."라고 안내합니다.
4) 말투는 정중하고 간결하게, 필요 시 마지막에 한 문장 요약을 덧붙입니다.
5) 가능한 경우 마크다운 형식으로 보기 좋게 정리합니다.
`;

    // Request metadata (for logging)
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const referer = headersList.get('referer') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Default: non-stream for stability. Use ?stream=1 to stream.
    const url = new URL(req.url);
    const stream = url.searchParams.get('stream') === '1';

    if (!stream) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `${systemPrompt}\n\n[User Question]\n${query}`;
      const resp = await model.generateContent(prompt);
      const text = resp.response.text() || '응답이 비어 있습니다.';

      // Log
      await logChat(sourceId, query, text);
      await appendLogToSheet({
        timestamp: new Date().toISOString(),
        ip,
        referer,
        userAgent,
        sourceId,
        question: query,
        answer: text,
      });

      return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    console.log('[API] Starting streamText with model: gemini-1.5-flash');

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages,
      onFinish: async (completion) => {
        try {
          await logChat(sourceId, query, completion.text);
          await appendLogToSheet({
            timestamp: new Date().toISOString(),
            ip,
            referer,
            userAgent,
            sourceId,
            question: query,
            answer: completion.text,
          });
        } catch (e) {
          console.warn('[Log] Skipped logging error:', e);
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message, stack: error.stack }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
