import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) {
    // Return a mock client during build/SSG when env vars aren't available
    return { auth: { getUser: () => ({ data: { user: null } }), signInWithPassword: () => ({ error: { message: 'Not configured' } }), signUp: () => ({ error: { message: 'Not configured' } }) }, from: () => ({ select: () => ({ order: () => ({ data: [] }), eq: () => ({ single: () => ({ data: null }) }) }), insert: () => ({ select: () => ({ single: () => ({ data: null }) }) }), upsert: () => ({}), update: () => ({ eq: () => ({}) }) }) };
  }
  return createBrowserClient(url, key);
}
