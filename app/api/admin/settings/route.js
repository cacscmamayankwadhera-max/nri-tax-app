import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { createServerClient as createSSR } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { testConnection } from '@/lib/api-integrations';

export const dynamic = 'force-dynamic';

// Verify admin/partner role
async function verifyAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  const cookieStore = cookies();
  const supabase = createSSR(supabaseUrl, supabaseKey, {
    cookies: { get(name) { return cookieStore.get(name)?.value; } },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createServerClient();
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'partner'].includes(profile.role)) return null;

  return { ...user, role: profile.role };
}

// Check integration status from environment variables
function getIntegrationStatus() {
  const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  return {
    anthropic: {
      configured: !!process.env.ANTHROPIC_API_KEY,
      label: 'Anthropic (Claude AI)',
      icon: 'brain',
      maskedKey: anthropicKey ? '\u2022'.repeat(16) + anthropicKey.slice(-8) : '',
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      description: 'AI modules, narrative parsing',
      signupUrl: 'https://console.anthropic.com',
    },
    supabase: {
      configured: !!supabaseUrl && !!supabaseKey,
      label: 'Supabase (Database)',
      icon: 'database',
      maskedUrl: supabaseUrl ? supabaseUrl.slice(0, 12) + '...' + supabaseUrl.slice(-14) : '',
      maskedKey: supabaseKey ? '\u2022'.repeat(16) + supabaseKey.slice(-5) : '',
      description: 'Cases, module outputs, user auth',
      signupUrl: 'https://supabase.com/dashboard',
    },
    pan: {
      configured: !!process.env.SUREPASS_API_KEY,
      label: 'PAN Verification (Surepass)',
      icon: 'id-card',
      maskedKey: process.env.SUREPASS_API_KEY ? '\u2022'.repeat(16) + process.env.SUREPASS_API_KEY.slice(-4) : '',
      description: 'Auto-verify PAN, name, DOB, Aadhaar link',
      signupUrl: 'https://surepass.io',
      pricing: '\u20B92-3 per verification',
    },
    eri: {
      configured: !!process.env.ERI_API_KEY,
      label: 'ERI (Income Tax APIs)',
      icon: 'landmark',
      maskedKey: process.env.ERI_API_KEY ? '\u2022'.repeat(16) + process.env.ERI_API_KEY.slice(-4) : '',
      apiUrl: process.env.ERI_API_URL || '',
      description: '26AS fetch, AIS fetch, ITR filing',
      signupUrl: 'https://incometaxindiaefiling.gov.in',
    },
    whatsapp: {
      configured: !!process.env.WHATSAPP_API_KEY,
      label: 'WhatsApp Notifications (AiSensy)',
      icon: 'message-circle',
      maskedKey: process.env.WHATSAPP_API_KEY ? '\u2022'.repeat(16) + process.env.WHATSAPP_API_KEY.slice(-4) : '',
      sender: process.env.WHATSAPP_SENDER || '',
      description: 'Auto status updates to clients',
      signupUrl: 'https://aisensy.com',
      pricing: '\u20B90.50-1 per message',
    },
    digilocker: {
      configured: !!process.env.DIGILOCKER_CLIENT_ID,
      label: 'Digilocker',
      icon: 'folder-lock',
      maskedClientId: process.env.DIGILOCKER_CLIENT_ID ? '\u2022'.repeat(16) + process.env.DIGILOCKER_CLIENT_ID.slice(-4) : '',
      description: 'PAN card, Aadhaar verification',
      signupUrl: 'https://partners.digilocker.gov.in',
    },
    setu: {
      configured: !!process.env.SETU_API_KEY,
      label: 'Setu Account Aggregator',
      icon: 'bank',
      maskedKey: process.env.SETU_API_KEY ? '\u2022'.repeat(16) + process.env.SETU_API_KEY.slice(-4) : '',
      description: 'Auto-fetch NRO/NRE bank statements, FD certificates, financial data',
      signupUrl: 'https://setu.co/products/account-aggregator',
      pricing: '\u20B95-20 per consent',
      envVars: ['SETU_API_KEY', 'SETU_API_URL', 'SETU_PRODUCT_ID'],
    },
    cams: {
      configured: !!process.env.CAMS_API_KEY,
      label: 'CAMS Mutual Fund CAS',
      icon: 'chart',
      maskedKey: process.env.CAMS_API_KEY ? '\u2022'.repeat(16) + process.env.CAMS_API_KEY.slice(-4) : '',
      description: 'Auto-fetch MF portfolio for capital gains computation',
      signupUrl: 'https://www.camsonline.com',
      pricing: 'Per transaction',
      envVars: ['CAMS_API_KEY'],
    },
    razorpay: {
      configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      label: 'Razorpay Payments',
      icon: 'credit-card',
      maskedKey: process.env.RAZORPAY_KEY_ID ? '\u2022'.repeat(16) + process.env.RAZORPAY_KEY_ID.slice(-4) : '',
      description: 'Send payment links to clients after engagement quote is accepted',
      signupUrl: 'https://razorpay.com',
      pricing: '2% per transaction',
      envVars: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
    },
    resend: {
      configured: !!process.env.RESEND_API_KEY,
      label: 'Resend Email',
      icon: 'mail',
      maskedKey: process.env.RESEND_API_KEY ? '\u2022'.repeat(16) + process.env.RESEND_API_KEY.slice(-4) : '',
      description: 'Email notifications as backup to WhatsApp, document delivery',
      signupUrl: 'https://resend.com',
      pricing: 'Free tier: 3,000 emails/month',
      envVars: ['RESEND_API_KEY', 'RESEND_FROM_EMAIL'],
    },
    sentry: {
      configured: !!process.env.SENTRY_DSN,
      label: 'Sentry Error Monitoring',
      icon: 'shield',
      maskedKey: process.env.SENTRY_DSN ? '\u2022'.repeat(16) + process.env.SENTRY_DSN.slice(-4) : '',
      description: 'Production error alerts, performance monitoring',
      signupUrl: 'https://sentry.io',
      pricing: 'Free tier: 5,000 errors/month',
      envVars: ['SENTRY_DSN'],
    },
  };
}

// GET /api/admin/settings -- returns integration status and settings
export async function GET(request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if this is a test connection request
  const { searchParams } = new URL(request.url);
  const testIntegration = searchParams.get('test');
  if (testIntegration) {
    const result = await testConnection(testIntegration);
    return NextResponse.json(result);
  }

  // Load saved settings from admin_settings table
  let savedSettings = {};
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from('admin_settings').select('key, value');
    if (data) {
      data.forEach(row => {
        try { savedSettings[row.key] = JSON.parse(row.value); }
        catch { savedSettings[row.key] = row.value; }
      });
    }
  } catch (e) {
    // Table may not exist yet
  }

  return NextResponse.json({
    integrations: getIntegrationStatus(),
    settings: {
      firmName: savedSettings.firm_name || process.env.FIRM_NAME || 'MKW Advisors',
      firmTagline: savedSettings.firm_tagline || process.env.FIRM_TAGLINE || 'NRI Tax Filing \u00b7 Advisory \u00b7 Compliance',
      contactEmail: savedSettings.contact_email || '',
      contactPhone: savedSettings.contact_phone || '',
      websiteUrl: savedSettings.website_url || '',
      defaultFY: savedSettings.default_fy || '2025-26',
      defaultModel: savedSettings.default_model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    },
    appUrl: process.env.NEXT_PUBLIC_APP_URL || '',
  });
}

// POST /api/admin/settings -- save non-secret settings
export async function POST(request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = createServerClient();

    // Save each setting as a key-value pair
    const settingsMap = {
      firm_name: body.firmName,
      firm_tagline: body.firmTagline,
      contact_email: body.contactEmail,
      contact_phone: body.contactPhone,
      website_url: body.websiteUrl,
      default_fy: body.defaultFY,
      default_model: body.defaultModel,
    };

    for (const [key, value] of Object.entries(settingsMap)) {
      if (value !== undefined) {
        await supabase.from('admin_settings').upsert(
          { key, value: JSON.stringify(value), updated_at: new Date().toISOString(), updated_by: admin.id },
          { onConflict: 'key' }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[admin/settings] Save error:', e);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
