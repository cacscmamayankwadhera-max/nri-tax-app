/**
 * API Integration Layer — NRI Tax Suite
 * Each function checks if the API key exists, returns { available, data, error }
 * When not configured, returns { available: false, message: "..." }
 */

export async function verifyPAN(pan) {
  const apiKey = process.env.SUREPASS_API_KEY;
  if (!apiKey) {
    return {
      available: false,
      message: 'PAN verification not configured. Set up at Admin \u2192 API Keys \u2192 Surepass.',
    };
  }

  try {
    const res = await fetch('https://kyc-api.surepass.io/api/v1/pan/pan', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id_number: pan }),
    });
    const data = await res.json();

    if (data.success || data.status_code === 200) {
      return {
        available: true,
        data: {
          valid: true,
          name: data.data?.full_name || data.data?.name_on_pan,
          category: data.data?.category,
          aadhaarLinked: data.data?.aadhaar_linked || null,
        },
      };
    }
    return { available: true, data: { valid: false }, error: data.message };
  } catch (e) {
    return { available: true, error: e.message };
  }
}

export async function fetch26AS(pan, fy) {
  const apiKey = process.env.ERI_API_KEY;
  if (!apiKey) {
    return {
      available: false,
      message: '26AS fetch not configured. Register as ERI at incometaxindiaefiling.gov.in',
    };
  }
  // Placeholder -- ERI API integration point
  return {
    available: false,
    message: 'ERI integration coming soon. Register at incometaxindiaefiling.gov.in',
  };
}

export async function fetchAIS(pan, fy) {
  const apiKey = process.env.ERI_API_KEY;
  if (!apiKey) {
    return {
      available: false,
      message: 'AIS fetch not configured. Register as ERI.',
    };
  }
  return {
    available: false,
    message: 'ERI integration coming soon.',
  };
}

export async function sendWhatsApp(phone, templateId, data) {
  const apiKey = process.env.WHATSAPP_API_KEY;
  const sender = process.env.WHATSAPP_SENDER;
  if (!apiKey || !sender) {
    return {
      available: false,
      message: 'WhatsApp not configured. Set up at Admin \u2192 API Keys \u2192 AiSensy.',
    };
  }

  try {
    const res = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        campaignName: templateId,
        destination: phone.replace(/\D/g, ''),
        userName: data.clientName || 'Client',
        templateParams: Object.values(data.params || {}),
      }),
    });
    const result = await res.json();
    return { available: true, sent: true, data: result };
  } catch (e) {
    return { available: true, sent: false, error: e.message };
  }
}

export async function verifyDigilocker(docType) {
  const clientId = process.env.DIGILOCKER_CLIENT_ID;
  const clientSecret = process.env.DIGILOCKER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return {
      available: false,
      message: 'Digilocker not configured. Register at partners.digilocker.gov.in',
    };
  }
  return {
    available: false,
    message: 'Digilocker integration coming soon.',
  };
}

/**
 * Test connection for a given integration
 * Returns { ok: boolean, message: string, latency?: number }
 */
export async function testConnection(integration) {
  const start = Date.now();

  switch (integration) {
    case 'anthropic': {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) return { ok: false, message: 'API key not configured' };
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
            max_tokens: 5,
            messages: [{ role: 'user', content: 'ping' }],
          }),
        });
        const latency = Date.now() - start;
        if (res.ok || res.status === 200) {
          return { ok: true, message: `Connected (${latency}ms)`, latency };
        }
        const err = await res.json().catch(() => ({}));
        return { ok: false, message: err.error?.message || `HTTP ${res.status}`, latency };
      } catch (e) {
        return { ok: false, message: e.message };
      }
    }

    case 'supabase': {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) return { ok: false, message: 'Supabase not configured' };
      try {
        const res = await fetch(`${url}/rest/v1/`, {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
        });
        const latency = Date.now() - start;
        return { ok: res.ok, message: res.ok ? `Connected (${latency}ms)` : `HTTP ${res.status}`, latency };
      } catch (e) {
        return { ok: false, message: e.message };
      }
    }

    case 'pan': {
      const key = process.env.SUREPASS_API_KEY;
      if (!key) return { ok: false, message: 'API key not configured' };
      return { ok: true, message: 'API key present (test requires live call)', latency: Date.now() - start };
    }

    case 'eri': {
      const key = process.env.ERI_API_KEY;
      if (!key) return { ok: false, message: 'API key not configured' };
      return { ok: true, message: 'API key present', latency: Date.now() - start };
    }

    case 'whatsapp': {
      const key = process.env.WHATSAPP_API_KEY;
      const sender = process.env.WHATSAPP_SENDER;
      if (!key || !sender) return { ok: false, message: 'API key or sender not configured' };
      return { ok: true, message: 'API key present', latency: Date.now() - start };
    }

    case 'digilocker': {
      const id = process.env.DIGILOCKER_CLIENT_ID;
      if (!id) return { ok: false, message: 'Client ID not configured' };
      return { ok: true, message: 'Client ID present', latency: Date.now() - start };
    }

    default:
      return { ok: false, message: 'Unknown integration' };
  }
}
