import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// POST /api/my-cases
// Body: { email: "client@email.com" }
// Returns case count only (not full data) — requires verification first
export async function POST(request) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Look up cases by client_email (stored in intake_data or as top-level field)
    // Try top-level client_email first, then fall back to intake_data->email
    const { data: cases, error: caseError } = await supabase
      .from('cases')
      .select('id, client_name, client_email, intake_data')
      .or(`client_email.ilike.${email},intake_data->>email.ilike.${email}`)
      .order('created_at', { ascending: false });

    if (caseError) {
      console.error('[my-cases] Lookup error:', caseError.message);
      return NextResponse.json(
        { error: 'Unable to look up cases. Please try again.' },
        { status: 500 }
      );
    }

    if (!cases || cases.length === 0) {
      return NextResponse.json(
        { error: 'No cases found for this email. Please check the email address you used during intake.' },
        { status: 404 }
      );
    }

    // Return count and client name only — no case data until verified
    return NextResponse.json({
      count: cases.length,
      clientName: cases[0].client_name || cases[0].intake_data?.name || 'Client',
      requiresVerification: true,
    });

  } catch (error) {
    console.error('[my-cases] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
