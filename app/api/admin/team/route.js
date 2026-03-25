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

// PUT /api/admin/team -- invite a new team member
export async function PUT(request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email, role, fullName } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const supabase = createServerClient();

    // Create user via Supabase Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: fullName || '', role: role || 'preparer' },
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Send password reset email so they can set their password
    await supabase.auth.admin.generateLink({ type: 'magiclink', email });

    return NextResponse.json({ success: true, userId: data.user?.id });
  } catch (e) {
    console.error('[admin/team] Invite error:', e);
    return NextResponse.json({ error: 'Failed to invite member' }, { status: 500 });
  }
}

// DELETE /api/admin/team -- deactivate a team member
export async function DELETE(request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Prevent deactivating yourself
    if (userId === admin.id) {
      return NextResponse.json({ error: 'Cannot deactivate yourself' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Update profile to mark as inactive
    await supabase.from('profiles').update({ role: 'deactivated' }).eq('id', userId);

    // Ban the user from signing in
    const { error } = await supabase.auth.admin.updateUserById(userId, { banned_until: '2099-12-31T00:00:00Z' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[admin/team] Deactivate error:', e);
    return NextResponse.json({ error: 'Failed to deactivate member' }, { status: 500 });
  }
}
