import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      ai: !!process.env.ANTHROPIC_API_KEY,
    },
  };

  const allGood = checks.services.database && checks.services.ai;

  return NextResponse.json(checks, { status: allGood ? 200 : 503 });
}
