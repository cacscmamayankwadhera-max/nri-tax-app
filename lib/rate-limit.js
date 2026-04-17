import { createClient } from '@supabase/supabase-js';

const WINDOW_MS = 60000; // 1 minute
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Singleton Supabase client — avoid creating a new client on every rate-limit call
let _supabase = null;
function getClient() {
  if (!_supabase && supabaseUrl && supabaseKey) {
    _supabase = createClient(supabaseUrl, supabaseKey);
  }
  return _supabase;
}

export async function rateLimit(key, maxRequests = 10, windowMs = WINDOW_MS) {
  // Fallback to permissive if Supabase not configured
  if (!supabaseUrl || !supabaseKey) {
    return { allowed: true, remaining: maxRequests };
  }

  try {
    const supabase = getClient();
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);

    // Count recent attempts
    const { count } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('key', key)
      .gte('created_at', windowStart.toISOString());

    if ((count || 0) >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    // Log this attempt
    await supabase.from('rate_limits').insert({ key, created_at: now.toISOString() });

    return { allowed: true, remaining: maxRequests - (count || 0) - 1 };
  } catch (e) {
    // If rate limiting fails, allow the request (don't block legitimate users)
    return { allowed: true, remaining: maxRequests };
  }
}
