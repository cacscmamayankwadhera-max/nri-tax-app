import { NextResponse } from 'next/server';

// Migration endpoint disabled for security. Use Supabase SQL Editor for schema changes.
export async function POST() {
  return NextResponse.json(
    { message: 'Migration endpoint disabled. Use Supabase SQL Editor for schema changes.' },
    { status: 410 }
  );
}
