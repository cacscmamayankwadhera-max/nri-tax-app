import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// POST /api/my-cases/verify
// Body: { email: "client@email.com", phone4: "1234" }
// Returns full case data after phone verification
export async function POST(request) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const phone4 = (body.phone4 || '').trim();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const dob = (body.dob || '').trim();

    if ((!phone4 || phone4.length !== 4 || !/^\d{4}$/.test(phone4)) && !dob) {
      return NextResponse.json(
        { error: 'Please enter exactly 4 digits.' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Fetch all cases for this email
    const { data: cases, error: caseError } = await supabase
      .from('cases')
      .select('id, client_name, client_email, client_phone, country, fy, ay, classification, status, modules_completed, created_at, updated_at, portal_token, intake_data')
      .or(`client_email.ilike.${email},intake_data->>email.ilike.${email}`)
      .order('created_at', { ascending: false });

    if (caseError) {
      console.error('[my-cases/verify] Lookup error:', caseError.message);
      return NextResponse.json(
        { error: 'Unable to look up cases. Please try again.' },
        { status: 500 }
      );
    }

    if (!cases || cases.length === 0) {
      return NextResponse.json(
        { error: 'No cases found for this email.' },
        { status: 404 }
      );
    }

    // Check if any case has a phone number
    const hasPhone = cases.some(c => {
      const phone = (c.client_phone || c.intake_data?.phone || '').replace(/\D/g, '');
      return phone.length >= 4;
    });

    if (!hasPhone) {
      // Fallback: try DOB verification
      const dobMatch = cases.some(c => {
        const caseDob = c.intake_data?.dob || '';
        return caseDob && dob && caseDob === dob;
      });
      if (!dob || !dobMatch) {
        return NextResponse.json({
          error: 'No phone number on file. Please contact us on WhatsApp to access your cases.',
          noPhone: true
        }, { status: 422 });
      }
      // DOB verified — fall through to return cases
    } else {
      // Verify: check if the last 4 digits of the phone number on ANY case match
      const phoneMatch = cases.some(c => {
        const phone = (c.client_phone || c.intake_data?.phone || '').replace(/\D/g, '');
        const last4 = phone.slice(-4);
        return last4 === phone4;
      });

      if (!phoneMatch) {
        return NextResponse.json(
          { error: 'Verification failed. The digits do not match our records.' },
          { status: 403 }
        );
      }
    }

    // Verification passed — fetch module data for all cases
    const caseIds = cases.map(c => c.id);
    const { data: allModules, error: moduleError } = await supabase
      .from('module_outputs')
      .select('case_id, module_id, completed_at, output_text')
      .in('case_id', caseIds)
      .order('completed_at', { ascending: true });

    if (moduleError) {
      console.error('[my-cases/verify] Module lookup error:', moduleError.message);
    }

    // Group modules by case_id
    const modulesByCase = {};
    (allModules || []).forEach(m => {
      if (!modulesByCase[m.case_id]) modulesByCase[m.case_id] = [];
      // Filter out pricing module and sanitize
      if (m.module_id !== 'pricing') {
        modulesByCase[m.case_id].push({
          module_id: m.module_id,
          completed_at: m.completed_at,
          has_output: !!m.output_text && !m.output_text.startsWith('[AUTO-RUN ERROR]'),
          has_error: m.output_text ? m.output_text.startsWith('[AUTO-RUN ERROR]') : false,
        });
      }
    });

    // Build sanitized case objects
    const sanitizedCases = cases.map(c => {
      const modules = modulesByCase[c.id] || [];
      const modulesCompleted = modules.filter(m => m.has_output).length;

      return {
        id: c.id,
        client_name: c.client_name,
        country: c.country,
        fy: c.fy,
        ay: c.ay,
        classification: c.classification,
        status: c.status,
        modules_completed: modulesCompleted,
        total_modules: 8, // client-visible modules (excluding pricing)
        created_at: c.created_at,
        updated_at: c.updated_at,
        portal_token: c.portal_token,
        modules,
      };
    });

    return NextResponse.json({
      verified: true,
      clientName: cases[0].client_name || cases[0].intake_data?.name || 'Client',
      clientEmail: email,
      cases: sanitizedCases,
    });

  } catch (error) {
    console.error('[my-cases/verify] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
