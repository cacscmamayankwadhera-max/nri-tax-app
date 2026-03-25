import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { logActivity } from '@/lib/activity-log';

export async function DELETE(request) {
  // Verify admin
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return NextResponse.json({ error: 'Not configured' }, { status: 503 });

  const { cookies } = await import('next/headers');
  const { createServerClient: createSSR } = await import('@supabase/ssr');
  const cookieStore = cookies();
  const authSupabase = createSSR(supabaseUrl, supabaseKey, {
    cookies: { get(name) { return cookieStore.get(name)?.value; } },
  });
  const { data: { user } } = await authSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check admin role
  const supabase = createServerClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'partner'].includes(profile.role)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { caseId } = await request.json();
  if (!caseId) return NextResponse.json({ error: 'caseId required' }, { status: 400 });

  // Delete in order: module_outputs -> deliverables -> activity_log -> cases
  await supabase.from('module_outputs').delete().eq('case_id', caseId);
  await supabase.from('deliverables').delete().eq('case_id', caseId);
  await supabase.from('activity_log').delete().eq('case_id', caseId);
  const { error } = await supabase.from('cases').delete().eq('id', caseId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  logActivity(null, user.id, 'case_deleted', { caseId }).catch(() => {});
  return NextResponse.json({ success: true });
}
