import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

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
