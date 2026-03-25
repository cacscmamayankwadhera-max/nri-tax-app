import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET /api/portal?ref=ABCD1234
// Returns sanitized case data + module outputs (no internal pricing details)
export async function GET(request) {
  try {
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
      .select('*')
      .eq('portal_token', ref)
      .limit(1);

    if (caseError) {
      console.error('[portal] Case lookup error:', caseError.message);
      return NextResponse.json(
        { error: 'Unable to look up case. Please try again.' },
        { status: 500 }
      );
    }

    if (!cases || cases.length === 0) {
      return NextResponse.json(
        { error: 'Case not found. Please check your reference and try again.' },
        { status: 404 }
      );
    }

    const caseData = cases[0];

    // Fetch module outputs for this case
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

    // Strip internal output text to just completion status for client view
    // (keep output only for specific modules the client should see findings from)
    const clientModules = sanitizedModules.map(m => ({
      module_id: m.module_id,
      completed_at: m.completed_at,
      // Only include output text for modules that produce client-visible findings
      has_output: !!m.output_text && !m.output_text.startsWith('[AUTO-RUN ERROR]'),
      has_error: m.output_text ? m.output_text.startsWith('[AUTO-RUN ERROR]') : false,
    }));

    // Build sanitized case object — exclude internal fields
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
      // Include only non-PII fields from intake_data for client-side computations
      intake_data: {
        salePrice: caseData.intake_data?.salePrice,
        purchaseCost: caseData.intake_data?.purchaseCost,
        propertyAcqFY: caseData.intake_data?.propertyAcqFY,
        propertySale: caseData.intake_data?.propertySale,
        rent: caseData.intake_data?.rent,
        rentalMonthly: caseData.intake_data?.rentalMonthly,
        foreignSalary: caseData.intake_data?.foreignSalary,
        name: caseData.intake_data?.name, // client's own name is fine
        country: caseData.intake_data?.country,
        // Explicitly exclude: email, phone, nroInterest, fdInterest, notes, occupation
      },
    };

    // Include phone + dob for client-side identity verification (stripped after verification on frontend)
    const verificationData = {
      phone: caseData.intake_data?.phone || '',
      dob: caseData.intake_data?.dob || '',
    };

    return NextResponse.json({
      case: sanitizedCase,
      modules: clientModules,
      modulesCompleted: clientModules.filter(m => m.has_output).length,
      totalModules: 9, // total client-visible modules (excluding pricing)
      intake_data: verificationData, // for identity verification only
    });

  } catch (error) {
    console.error('[portal] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
