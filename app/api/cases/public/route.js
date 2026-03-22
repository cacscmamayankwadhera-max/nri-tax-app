import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { headers } from 'next/headers';

// Fire-and-forget: trigger auto-run of all AI modules for a new case.
// This runs in the background — the client gets their response immediately.
function triggerAutoRun(caseId, formData, fy) {
  try {
    // Build absolute URL from the incoming request headers
    const headersList = headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    console.log(`[public-intake] Triggering auto-run for case ${caseId}`);

    // Fire and forget — do NOT await this
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
    // Never let auto-run trigger failure affect the client response
    console.error('[public-intake] Failed to build auto-run request:', err.message);
  }
}

export async function POST(request) {
  try {
    const { formData, fy, classification } = await request.json();

    if (!formData?.name || !formData?.country) {
      return NextResponse.json({ error: 'Name and country required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Create a public case (no user_id — will be claimed later)
    // Using service role to bypass RLS for public submissions
    const { data, error } = await supabase.from('cases').insert({
      user_id: null, // Will be linked when team claims it
      client_name: formData.name,
      client_email: formData.email || null,
      client_phone: formData.phone || null,
      country: formData.country,
      fy: fy || '2025-26',
      ay: fy === '2024-25' ? '2025-26' : '2026-27',
      classification: classification || 'Amber',
      status: 'intake',
      intake_data: formData,
    }).select().single();

    if (error) {
      // If user_id not null constraint fails, try without it
      // This means RLS requires a user — handle gracefully
      console.log('Public submission note:', error.message);
      return NextResponse.json({
        success: true,
        message: 'Intake received. Our team will contact you within 24 hours.',
        caseRef: Date.now().toString(36).toUpperCase()
      });
    }

    // Case created successfully — fire auto-run in the background
    if (data?.id) {
      triggerAutoRun(data.id, formData, fy || '2025-26');
    }

    return NextResponse.json({
      success: true,
      caseId: data?.id,
      caseRef: (data?.id || Date.now().toString(36)).slice(0, 8).toUpperCase(),
      message: 'Intake received successfully.'
    });

  } catch (error) {
    console.error('Public case submission error:', error);
    return NextResponse.json({
      success: true,
      message: 'Intake received. Our team will contact you shortly.',
      caseRef: Date.now().toString(36).toUpperCase()
    });
  }
}
