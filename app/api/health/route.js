import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    internalSecret: !!process.env.INTERNAL_SECRET,
  };

  const allGood = checks.supabase && checks.anthropic;

  return NextResponse.json(checks, { status: allGood ? 200 : 503 });
}
