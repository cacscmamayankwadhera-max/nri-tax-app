import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { createServerClient as createSSR } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendEmail } from '@/lib/api-integrations';

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
    const cleanedEmail = (email || '').trim().toLowerCase();
    if (!cleanedEmail || !cleanedEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const supabase = createServerClient();
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
    const redirectTo = appUrl ? `${appUrl}/reset-password` : undefined;

    // Single generateLink({ type:'invite' }) call — atomically creates the user
    // AND produces a valid invite token. The admin client bypasses the redirect URL
    // whitelist that caused the old inviteUserByEmail + generateLink double-call to fail.
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'invite',
      email: cleanedEmail,
      options: {
        data: { full_name: fullName || '', role: role || 'preparer' },
        ...(redirectTo ? { redirectTo } : {}),
      },
    });

    if (linkError) {
      console.error('[admin/team] generateLink invite error:', linkError.message);
      return NextResponse.json({ error: linkError.message }, { status: 400 });
    }

    const invitedUserId = linkData?.user?.id || null;
    const actionLink = linkData?.properties?.action_link || null;

    // Send via Resend if configured
    let emailSent = false;
    if (actionLink && process.env.RESEND_API_KEY) {
      try {
        const displayName = fullName || cleanedEmail;
        const emailResult = await sendEmail(
          cleanedEmail,
          "You've been invited to MKW Advisors Tax Suite",
          `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
            <h2 style="font-size:20px;font-weight:700;color:#0B054C;margin-bottom:8px;">You're invited to join MKW Advisors</h2>
            <p style="color:#334155;font-size:14px;line-height:1.6;margin-bottom:8px;">Hi ${displayName},</p>
            <p style="color:#334155;font-size:14px;line-height:1.6;margin-bottom:24px;">
              You've been invited as a <strong>${role || 'preparer'}</strong> on the MKW Advisors NRI Tax Suite.
              Click below to set your password and activate your account. This link expires in 24 hours.
            </p>
            <a href="${actionLink}"
               style="display:inline-block;background:#046BD2;color:#fff;text-decoration:none;
                      padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">
              Accept Invitation
            </a>
            <p style="color:#999;font-size:12px;margin-top:24px;">
              If you did not expect this invitation, you can safely ignore this email.
            </p>
          </div>`
        );
        if (emailResult.available && emailResult.data) emailSent = true;
      } catch (emailErr) {
        console.error('[admin/team] Resend error:', emailErr.message);
      }
    }

    // Always return actionLink — admin UI shows it as a copyable fallback when emailSent=false
    return NextResponse.json({ success: true, userId: invitedUserId, actionLink, emailSent });
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
