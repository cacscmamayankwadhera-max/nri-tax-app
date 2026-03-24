import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';
import { FY_CONFIG } from '@/lib/compute';

// Fire-and-forget: trigger auto-run of all AI modules for a new case.
function triggerAutoRun(caseId, formData, fy) {
  try {
    const headersList = headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    console.log(`[public-intake] Triggering auto-run for case ${caseId}`);

    fetch(`${baseUrl}/api/auto-run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_SECRET || '' },
      body: JSON.stringify({ caseId, formData, fy }),
    })
      .then(res => {
        if (!res.ok) {
          console.error(`[public-intake] Auto-run request failed with status ${res.status}`);
        } else {
          console.log(`[public-intake] Auto-run triggered successfully for case ${caseId}`);
        }
      })
      .catch(err => {
        console.error(`[public-intake] Auto-run trigger error:`, err.message);
      });
  } catch (err) {
    console.error('[public-intake] Failed to build auto-run request:', err.message);
  }
}

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const limit = rateLimit(ip, 5, 60000);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many submissions. Please wait.' }, { status: 429 });
  }

  try {
    const { formData, fy, classification } = await request.json();

    if (!formData?.name || !formData?.country) {
      return NextResponse.json({ error: 'Name and country required' }, { status: 400 });
    }

    let supabase;
    try {
      supabase = createServerClient();
    } catch (e) {
      // Supabase not configured — return error honestly
      console.error('[public-intake] Supabase not configured:', e.message);
      return NextResponse.json({
        success: false,
        error: 'Service temporarily unavailable. Please contact us directly.',
      }, { status: 503 });
    }

    const { data, error } = await supabase.from('cases').insert({
      user_id: null, // Will be linked when team claims it
      client_name: formData.name,
      client_email: formData.email || null,
      client_phone: formData.phone || null,
      country: formData.country,
      fy: fy || '2025-26',
      ay: FY_CONFIG[fy || '2025-26']?.ay || '2026-27',
      classification: classification || 'Amber',
      status: 'intake',
      intake_data: formData,
    }).select().single();

    if (error) {
      console.error('[public-intake] Database insert failed:', error.message);
      return NextResponse.json({
        success: false,
        error: 'Unable to save your submission. Please try again or contact us directly.',
      }, { status: 500 });
    }

    // Case created successfully — fire auto-run in the background
    if (data?.id) {
      triggerAutoRun(data.id, formData, fy || '2025-26');
    }

    return NextResponse.json({
      success: true,
      caseId: data?.id,
      caseRef: (data?.id || '').slice(0, 8).toUpperCase(),
      portalToken: data?.portal_token,
      message: 'Intake received successfully.'
    });

  } catch (error) {
    console.error('[public-intake] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Something went wrong. Please try again or contact us directly.',
    }, { status: 500 });
  }
}
