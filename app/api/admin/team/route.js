import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { createServerClient as createSSR } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
  return { ...user, role: profile.role };
}

// GET /api/admin/team -- list all team members with case counts
export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServerClient();

    // Get all profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, firm_name, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to load team' }, { status: 500 });
    }

    // Get case counts per user
    const { data: cases } = await supabase
      .from('cases')
      .select('user_id');

    const caseCounts = {};
    if (cases) {
      cases.forEach(c => {
        if (c.user_id) {
          caseCounts[c.user_id] = (caseCounts[c.user_id] || 0) + 1;
        }
      });
    }

    // Enrich profiles with case counts
    const members = (profiles || []).map(p => ({
      id: p.id,
      email: p.email,
      name: p.full_name || p.email?.split('@')[0] || 'Unknown',
      role: p.role || 'preparer',
      firmName: p.firm_name,
      createdAt: p.created_at,
      casesAssigned: caseCounts[p.id] || 0,
      status: 'active',
    }));

    return NextResponse.json({ members });
  } catch (e) {
    console.error('[admin/team] Error:', e);
    return NextResponse.json({ error: 'Failed to load team' }, { status: 500 });
  }
}

// POST /api/admin/team -- update a member's role
export async function POST(request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { memberId, role } = body;

    if (!memberId || !role) {
      return NextResponse.json({ error: 'Missing memberId or role' }, { status: 400 });
    }

    const validRoles = ['admin', 'partner', 'senior', 'preparer', 'client'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Only admins can promote to admin/partner
    if (['admin', 'partner'].includes(role) && admin.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can assign admin/partner roles' }, { status: 403 });
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', memberId);

    if (error) {
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[admin/team] Update error:', e);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}
