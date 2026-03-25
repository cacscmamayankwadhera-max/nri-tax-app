import { NextResponse } from 'next/server';
import { createServerClient as createSSR } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { verifyPAN } from '@/lib/api-integrations';

export const dynamic = 'force-dynamic';

// Verify authenticated user
async function verifyAuth() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  const cookieStore = cookies();
  const supabase = createSSR(supabaseUrl, supabaseKey, {
    cookies: { get(name) { return cookieStore.get(name)?.value; } },
  });

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// POST /api/verify-pan -- verify a PAN number
export async function POST(request) {
  const user = await verifyAuth();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { pan } = await request.json();

    if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase())) {
      return NextResponse.json({
        available: true,
        data: { valid: false },
        error: 'Invalid PAN format. Expected: ABCDE1234F',
      });
    }

    const result = await verifyPAN(pan.toUpperCase());
    return NextResponse.json(result);
  } catch (e) {
    console.error('[verify-pan] Error:', e);
    return NextResponse.json({ available: true, error: e.message }, { status: 500 });
  }
}
