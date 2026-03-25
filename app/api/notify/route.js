import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { notifyStatusChange } from '@/lib/notifications';

export async function POST(request) {
  try {
    const { caseId, newStatus } = await request.json();
    if (!caseId || !newStatus) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const supabase = createServerClient();
    const { data: caseData } = await supabase.from('cases').select('*').eq('id', caseId).single();
    if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

    const result = await notifyStatusChange(caseData, newStatus);

    // Log to activity_log
    await supabase.from('activity_log').insert({
      case_id: caseId,
      action: 'status_change',
      details: { oldStatus: caseData.status, newStatus, notification: result },
    });

    return NextResponse.json({ success: true, notification: result });
  } catch (e) {
    return NextResponse.json({ error: 'Notification failed' }, { status: 500 });
  }
}
