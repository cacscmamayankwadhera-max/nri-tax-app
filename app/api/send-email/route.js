import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/api-integrations';
import { logActivity } from '@/lib/activity-log';

export async function POST(request) {
  try {
    const { to, subject, html, caseId } = await request.json();
    if (!to || !subject) return NextResponse.json({ error: 'to and subject required' }, { status: 400 });

    const result = await sendEmail(to, subject, html);

    if (result.available && result.data) {
      logActivity(caseId || null, null, 'email_sent', { to, subject }).catch(() => {});
    }

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: 'Email send failed' }, { status: 500 });
  }
}
