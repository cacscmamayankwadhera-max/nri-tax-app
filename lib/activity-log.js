import { createServerClient } from './supabase-server';

export async function logActivity(caseId, userId, action, details = {}) {
  try {
    const supabase = createServerClient();
    await supabase.from('activity_log').insert({
      case_id: caseId || null,
      user_id: userId || null,
      action,
      details,
    });
  } catch (e) {
    console.error('[activity-log] Failed to log:', action, e.message);
    // Never throw — logging should not break the main flow
  }
}
