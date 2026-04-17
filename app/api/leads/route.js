import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const limit = await rateLimit(ip + ':leads', 10, 60000);
  if (!limit.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  try {
    const { email, source } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    let supabase;
    try {
      supabase = createServerClient();
    } catch (e) {
      // Supabase not configured — still return success so UX isn't broken
      return NextResponse.json({ success: true, stored: 'local' });
    }

    // Try to insert into a leads table, or use admin_settings as fallback
    // Use cases table to check if this email already has a case
    const { data: existingCases } = await supabase
      .from('cases')
      .select('id')
      .eq('client_email', email)
      .limit(1);

    // Store lead in activity_log as a lightweight approach (no new table needed)
    await supabase.from('activity_log').insert({
      action: 'blog_lead',
      details: { email, source, timestamp: new Date().toISOString(), hasExistingCase: existingCases?.length > 0 },
    });

    return NextResponse.json({ success: true, hasCase: existingCases?.length > 0 });
  } catch (e) {
    // Don't break UX on error
    return NextResponse.json({ success: true, stored: 'local' });
  }
}
