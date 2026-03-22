import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// GET /api/portal?ref=ABCD1234
// Returns sanitized case data + module outputs (no internal pricing details)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get('ref');

    if (!ref || ref.length < 6) {
      return NextResponse.json(
        { error: 'Invalid case reference. Please provide at least 6 characters.' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const refLower = ref.toLowerCase();

    // Find case where ID starts with the provided reference
    const { data: cases, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .ilike('id', `${refLower}%`)
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
      .select('module_id, completed_at, output')
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
      has_output: !!m.output && !m.output.startsWith('[AUTO-RUN ERROR]'),
      has_error: m.output ? m.output.startsWith('[AUTO-RUN ERROR]') : false,
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
      // Include intake_data for computing findings client-side
      intake_data: caseData.intake_data || {},
    };

    return NextResponse.json({
      case: sanitizedCase,
      modules: clientModules,
      modulesCompleted: clientModules.filter(m => m.has_output).length,
      totalModules: 9, // total client-visible modules (excluding pricing)
    });

  } catch (error) {
    console.error('[portal] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
