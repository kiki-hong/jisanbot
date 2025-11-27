// Simple healthcheck endpoint with safe env diagnostics (names only)
export const runtime = 'nodejs';

export async function GET() {
  try {
    const presentEnvKeys = Object.keys(process.env).filter((k) => k.toUpperCase().includes('GOOGLE'));
    const hasKey = Boolean(process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    return new Response(
      JSON.stringify({
        status: 'ok',
        hasApiKey: hasKey,
        presentEnvKeys,
        vercelEnv: process.env.VERCEL_ENV,
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ status: 'error', message: error?.message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

