import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { createServerClient as createSSR } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { BLOGS } from '@/app/blog/data';

export const dynamic = 'force-dynamic';

async function verifyAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  const cookieStore = cookies();
  const supabase = createSSR(supabaseUrl, supabaseKey, {
    cookies: { get(name) { return cookieStore.get(name)?.value; } },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createServerClient();
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'partner'].includes(profile.role)) return null;
  return user;
}

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServerClient();

    const [casesRes, teamRes, latestCaseRes] = await Promise.all([
      supabase.from('cases').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('cases').select('created_at').order('created_at', { ascending: false }).limit(1),
    ]);

    // Check integration status
    const integrations = {
      supabase: { ok: true, message: 'Connected' },
      anthropic: { ok: !!process.env.ANTHROPIC_API_KEY, message: process.env.ANTHROPIC_API_KEY ? 'Configured' : 'Not configured' },
      pan: { ok: !!process.env.SUREPASS_API_KEY, message: process.env.SUREPASS_API_KEY ? 'Configured' : 'Not configured' },
      eri: { ok: !!process.env.ERI_API_KEY, message: process.env.ERI_API_KEY ? 'Configured' : 'Not configured' },
      whatsapp: { ok: !!process.env.WHATSAPP_API_KEY, message: process.env.WHATSAPP_API_KEY ? 'Configured' : 'Not configured' },
      digilocker: { ok: !!process.env.DIGILOCKER_CLIENT_ID, message: process.env.DIGILOCKER_CLIENT_ID ? 'Configured' : 'Not configured' },
    };

    return NextResponse.json({
      cases: casesRes.count || 0,
      team: teamRes.count || 0,
      blogs: BLOGS.length,
      latestCase: latestCaseRes.data?.[0]?.created_at || null,
      version: '1.0.0',
      integrations,
      dbConnected: true,
    });
  } catch (e) {
    console.error('[admin/stats] Error:', e);
    return NextResponse.json({
      cases: 0,
      team: 0,
      blogs: BLOGS.length,
      latestCase: null,
      version: '1.0.0',
      integrations: {},
      dbConnected: false,
      error: e.message,
    });
  }
}
