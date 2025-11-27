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
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ; // last-resort fallback if user set public var`n
    if (!apiKey) {
      // Collect safe debug info: present env var NAMES (no values) and Vercel env context
      let presentEnvKeys: string[] = [];
      try {
        presentEnvKeys = Object.keys(process.env).filter((k) => k.toUpperCase().includes('GOOGLE'));
      } catch {}

      return new Response( JSON.stringify({ error: 'Missing API key', details: 'Set GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY in Vercel Project > Settings > Environment Variables. Ensure the correct Environment (Production/Preview) and redeploy.' }),
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
    const systemPrompt = [
      'You are an AI consultant specialized in Korean knowledge-industry centers (JISAN).',
      'Use the knowledge base below to understand the user question and answer clearly and professionally.',
      '',
      '[Knowledge Base]',
      context,
      '',
      'Rules:',
      '1) Base your statements only on the knowledge base content.',
      "2) For legal/tax topics, note: 'as of 2025'.",
      "3) If not in the knowledge base, respond: 'Sorry, that information is not in the current documents.'",
      "4) Keep a polite, professional tone; add a short 'Summary' when helpful.",
      '5) When possible, format neatly in Markdown.',
    ].join('\n');

    // Capture request details for logging
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const referer = headersList.get('referer') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    console.log('[API] Starting streamText with model: gemini-1.5-flash');

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: systemPrompt,
      messages: messages,
      onFinish: async (completion) => {
        // 3. Log Interaction
        console.log(`[Log] Source: ${sourceId}, Q: ${query}, A: ${completion.text}`);

        // Log to local file (dev only) and console in prod
        await logChat(sourceId, query, completion.text);

        // Log to Google Sheets (if configured)
        await appendLogToSheet({
          timestamp: new Date().toISOString(),
          ip,
          referer,
          userAgent,
          sourceId,
          question: query,
          answer: completion.text,
        });
      },
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error:', error);
    // Return detailed error for debugging (remove in production later)
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        details: error.message,
        stack: error.stack,
      }),
      { status: 500 }
    );
  }
}


