import { NextResponse } from 'next/server';
import { createServerClient as createSSR } from '@supabase/ssr';
import { createPaymentLink } from '@/lib/api-integrations';
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
    const { amount, clientName, clientEmail, clientPhone, caseRef, caseId, description } = await request.json();

    if (!amount || !clientName) {
      return NextResponse.json({ error: 'Amount and client name required' }, { status: 400 });
    }

    const result = await createPaymentLink(amount, clientName, clientEmail, clientPhone, caseRef, description);

    if (result.available && result.data) {
      logActivity(caseId || null, null, 'payment_link_created', { amount, shortUrl: result.data.shortUrl }).catch(() => {});
    }

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: 'Payment link creation failed' }, { status: 500 });
  }
}
