import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { sendEmail } from '@/lib/api-integrations';

export const dynamic = 'force-dynamic';

// POST /api/auth/reset-password
//
// Fix C1-6: browser-side supabase.auth.resetPasswordForEmail() validates
// redirectTo against Supabase's Redirect URLs whitelist and returns the
// misleading "email is invalid" error when the URL is not whitelisted.
// This server-side route uses the admin/service-role client which bypasses
// that restriction entirely.
export async function POST(request) {
  try {
    const { email } = await request.json();
    const cleanedEmail = (email || '').trim().toLowerCase();

    if (!cleanedEmail || !cleanedEmail.includes('@') || !cleanedEmail.includes('.')) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }

    const supabase = createServerClient();
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
    const redirectTo = appUrl ? `${appUrl}/reset-password` : undefined;

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: cleanedEmail,
      options: redirectTo ? { redirectTo } : {},
    });

    if (linkError) {
      console.error('[auth/reset-password] generateLink error:', linkError.message);
      // Return success to prevent account enumeration
      return NextResponse.json({ success: true, emailSent: false, actionLink: null });
    }

    const actionLink = linkData?.properties?.action_link || null;

    if (actionLink && process.env.RESEND_API_KEY) {
      const emailResult = await sendEmail(
        cleanedEmail,
        'Reset your MKW Advisors password',
        `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
          <h2 style="font-size:20px;font-weight:700;color:#1a1a1a;margin-bottom:8px;">Reset your password</h2>
          <p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:24px;">
            Click the button below to set a new password for your MKW Advisors account.
            This link expires in 1 hour.
          </p>
          <a href="${actionLink}"
             style="display:inline-block;background:#C49A3C;color:#fff;text-decoration:none;
                    padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">
            Reset Password
          </a>
          <p style="color:#999;font-size:12px;margin-top:24px;">
            If you did not request this, you can safely ignore this email.
          </p>
        </div>`
      );
      if (emailResult.available && emailResult.data) {
        return NextResponse.json({ success: true, emailSent: true });
      }
    }

    // Resend not configured — return raw link so UI can show a copyable fallback
    return NextResponse.json({ success: true, emailSent: false, actionLink });
  } catch (e) {
    console.error('[auth/reset-password] Unexpected error:', e);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
