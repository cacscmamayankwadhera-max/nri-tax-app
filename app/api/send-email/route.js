import { NextResponse } from 'next/server';
import { createServerClient as createSSR } from '@supabase/ssr';
import { sendEmail } from '@/lib/api-integrations';
import { logActivity } from '@/lib/activity-log';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // Auth check
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const authSupabase = createSSR(supabaseUrl, supabaseKey, {
        cookies: { get(name) { return cookieStore.get(name)?.value; } },
      });
      const { data: { user } } = await authSupabase.auth.getUser();
      if (!user && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    const { to, subject, html, caseId } = await request.json();
    if (!to || !subject) return NextResponse.json({ error: 'to and subject required' }, { status: 400 });

    const result = await sendEmail(to, subject, html);

    if (result.available && result.data) {
      logActivity(caseId || null, null, 'email_sent', { to, subject }).catch(() => {});
    }

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: 'Email send failed' }, { status: 500 });
  }
}
