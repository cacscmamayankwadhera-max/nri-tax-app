import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { createServerClient as createSSR } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Verify the caller is an authenticated team member
async function verifyTeamAuth() {
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

// GET /api/cases — returns all cases for authenticated team members
export async function GET(request) {
  const user = await verifyTeamAuth();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServerClient(); // service role — bypasses RLS
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[cases] Load error:', error.message);
      return NextResponse.json({ error: 'Failed to load cases' }, { status: 500 });
    }

    return NextResponse.json({ cases: data || [] });
  } catch (error) {
    console.error('[cases] Unexpected error:', error);
    return NextResponse.json({ error: 'Failed to load cases' }, { status: 500 });
  }
}
