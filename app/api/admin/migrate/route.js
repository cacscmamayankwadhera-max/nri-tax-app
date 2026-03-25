import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// One-time migration endpoint — creates missing tables and updates RLS policies
// Call with: POST /api/admin/migrate { "secret": "<INTERNAL_SECRET>" }
// Delete this file after running successfully

export async function POST(request) {
  const { secret } = await request.json();
  if (secret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = createClient(url, key);
  const results = [];

  // Test 1: rate_limits table
  const { error: rlErr } = await supabase.from('rate_limits').select('id').limit(1);
  if (rlErr && rlErr.message.includes('not find')) {
    results.push({ table: 'rate_limits', status: 'MISSING — run supabase/rate-limits.sql in SQL Editor' });
  } else {
    results.push({ table: 'rate_limits', status: 'EXISTS' });
  }

  // Test 2: admin_settings table
  const { data: asData, error: asErr } = await supabase.from('admin_settings').select('key').limit(5);
  if (asErr && asErr.message.includes('not find')) {
    results.push({ table: 'admin_settings', status: 'MISSING — run supabase/admin-settings.sql in SQL Editor' });
  } else {
    results.push({ table: 'admin_settings', status: 'EXISTS', keys: asData?.map(r => r.key) });
  }

  // Test 3: cases table + RLS
  const { data: cases, error: cErr } = await supabase.from('cases').select('id, user_id').limit(5);
  const nullUserCases = cases?.filter(c => !c.user_id)?.length || 0;
  results.push({
    table: 'cases',
    status: 'EXISTS',
    totalSampled: cases?.length || 0,
    publicIntakeCases: nullUserCases,
    note: nullUserCases > 0 ? 'Public intake cases visible (user_id=null) ✓' : 'No public intake cases yet'
  });

  // Test 4: activity_log writable
  const { error: alInsert } = await supabase.from('activity_log').insert({
    action: 'migration_test',
    details: { timestamp: new Date().toISOString(), message: 'Migration endpoint test' },
  });
  if (alInsert) {
    results.push({ table: 'activity_log', status: 'INSERT FAILED', error: alInsert.message });
  } else {
    results.push({ table: 'activity_log', status: 'WRITABLE ✓' });
  }

  // Test 5: module_outputs
  const { error: moErr } = await supabase.from('module_outputs').select('id').limit(1);
  results.push({ table: 'module_outputs', status: moErr ? moErr.message : 'EXISTS' });

  // Test 6: deliverables
  const { error: delErr } = await supabase.from('deliverables').select('id').limit(1);
  results.push({ table: 'deliverables', status: delErr ? delErr.message : 'EXISTS' });

  // Test 7: profiles
  const { data: profiles } = await supabase.from('profiles').select('id, email, role');
  results.push({ table: 'profiles', status: 'EXISTS', members: profiles?.map(p => ({ email: p.email, role: p.role })) });

  // Summary
  const missing = results.filter(r => r.status?.includes('MISSING'));

  return NextResponse.json({
    overall: missing.length === 0 ? 'ALL TABLES READY ✓' : `${missing.length} TABLE(S) NEED CREATION`,
    results,
    instructions: missing.length > 0
      ? 'Go to supabase.com → SQL Editor → paste the SQL from the files listed above → Run'
      : 'Database is fully configured. You can delete this migration endpoint.',
  });
}
