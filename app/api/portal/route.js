import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// GET /api/portal?ref=ABCD1234
// Returns status-only case data (no PII, no client name, no intake_data).
// Full data requires POST verification.
export async function GET(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const limit = await rateLimit(ip + ':portal', 10, 60000);
    if (!limit.allowed) return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });

    const { searchParams } = new URL(request.url);
    const ref = searchParams.get('ref');

    if (!ref || ref.length < 10) {
      return NextResponse.json(
        { error: 'Invalid case reference. Please provide a valid tracking code.' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Find case by portal_token (unguessable hex token)
    const { data: cases, error: caseError } = await supabase
      .from('cases')
      .select('id, status, classification, fy, ay, created_at, modules_completed')
      .eq('portal_token', ref)
      .limit(1);

    if (caseError) {
      console.error('[portal] Case lookup error:', caseError.message);
      return NextResponse.json(
        { error: 'Unable to look up case. Please try again.' },
        { status: 500 }
      );
    }

    // Fallback: try matching the first 8+ hex chars of the case UUID.
    // Handles cases where portal_token is NULL (created before that column existed)
    // or where the client was given the short UUID-prefix reference.
    if (!cases || cases.length === 0) {
      const trimmedRef = ref.trim().toLowerCase();
      if (/^[0-9a-f-]{8,}$/i.test(trimmedRef)) {
        const prefix = trimmedRef.replace(/-/g, '');
        const { data: fallbackCases, error: fallbackError } = await supabase
          .from('cases')
          .select('id, status, classification, fy, ay, created_at, modules_completed')
          .gte('id', trimmedRef)
          .limit(10);
        if (!fallbackError && fallbackCases?.length > 0) {
          const match = fallbackCases.find(c => c.id.replace(/-/g, '').startsWith(prefix));
          if (match) cases = [match];
        }
      }
    }

    if (!cases || cases.length === 0) {
      return NextResponse.json(
        { error: 'Case not found. Please check your reference and try again.' },
        { status: 404 }
      );
    }

    const caseData = cases[0];

    // Fetch module outputs — only completion status (no output text)
    const { data: modules, error: moduleError } = await supabase
      .from('module_outputs')
      .select('module_id, completed_at, output_text')
      .eq('case_id', caseData.id)
      .order('completed_at', { ascending: true });

    if (moduleError) {
      console.error('[portal] Module outputs lookup error:', moduleError.message);
    }

    // Filter out pricing module — internal only
    const sanitizedModules = (modules || []).filter(m => m.module_id !== 'pricing');

    const clientModules = sanitizedModules.map(m => ({
      module_id: m.module_id,
      completed_at: m.completed_at,
      has_output: !!m.output_text && !m.output_text.startsWith('[AUTO-RUN ERROR]'),
      has_error: m.output_text ? m.output_text.startsWith('[AUTO-RUN ERROR]') : false,
    }));

    // Status-only case object — NO PII, NO client name, NO intake_data
    const statusCase = {
      status: caseData.status,
      classification: caseData.classification,
      fy: caseData.fy,
      ay: caseData.ay,
      created_at: caseData.created_at,
      modules_completed: caseData.modules_completed || 0,
    };

    return NextResponse.json({
      case: statusCase,
      modules: clientModules,
      modulesCompleted: clientModules.filter(m => m.has_output).length,
      totalModules: 8,
    });

  } catch (error) {
    console.error('[portal] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// POST /api/portal — verify identity and return full case data
export async function POST(request) {
  try {
    const { ref, phone4 } = await request.json();

    // Rate limit
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const limit = await rateLimit(ip + ':portal-verify', 5, 300000);
    if (!limit.allowed) return NextResponse.json({ error: 'Too many attempts. Try again in 5 minutes.' }, { status: 429 });

    if (!ref || ref.length < 10) {
      return NextResponse.json({ error: 'Invalid case reference.' }, { status: 400 });
    }

    if (!phone4 || phone4.length !== 4 || !/^\d{4}$/.test(phone4)) {
      return NextResponse.json({ error: 'Please enter exactly 4 digits.' }, { status: 400 });
    }

    // Lookup case
    const supabase = createServerClient();
    const { data: cases } = await supabase.from('cases').select('*').eq('portal_token', ref).limit(1);
    if (!cases?.length) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

    const caseData = cases[0];
    const phone = (caseData.client_phone || caseData.intake_data?.phone || '').replace(/\D/g, '');
    const last4 = phone.slice(-4);

    if (!last4 || phone4 !== last4) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 401 });
    }

    // Verified — fetch module outputs
    const { data: modules, error: moduleError } = await supabase
      .from('module_outputs')
      .select('module_id, completed_at, output_text')
      .eq('case_id', caseData.id)
      .order('completed_at', { ascending: true });

    if (moduleError) {
      console.error('[portal] Module outputs lookup error:', moduleError.message);
    }

    // Filter out pricing module — internal only
    const sanitizedModules = (modules || []).filter(m => m.module_id !== 'pricing');

    const clientModules = sanitizedModules.map(m => ({
      module_id: m.module_id,
      completed_at: m.completed_at,
      has_output: !!m.output_text && !m.output_text.startsWith('[AUTO-RUN ERROR]'),
      has_error: m.output_text ? m.output_text.startsWith('[AUTO-RUN ERROR]') : false,
    }));

    // Build sanitized case object — include non-PII intake fields for CG computations
    const sanitizedCase = {
      id: caseData.id,
      client_name: caseData.client_name,
      country: caseData.country,
      fy: caseData.fy,
      ay: caseData.ay,
      classification: caseData.classification,
      status: caseData.status,
      modules_completed: caseData.modules_completed || 0,
      created_at: caseData.created_at,
      updated_at: caseData.updated_at,
      intake_data: {
        salePrice: caseData.intake_data?.salePrice,
        purchaseCost: caseData.intake_data?.purchaseCost,
        propertyAcqFY: caseData.intake_data?.propertyAcqFY,
        propertySale: caseData.intake_data?.propertySale,
        rent: caseData.intake_data?.rent,
        rentalMonthly: caseData.intake_data?.rentalMonthly,
        foreignSalary: caseData.intake_data?.foreignSalary,
        name: caseData.intake_data?.name,
        country: caseData.intake_data?.country,
      },
    };

    return NextResponse.json({
      verified: true,
      case: sanitizedCase,
      modules: clientModules,
      modulesCompleted: clientModules.filter(m => m.has_output).length,
      totalModules: 8,
    });

  } catch (error) {
    console.error('[portal] POST unexpected error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
