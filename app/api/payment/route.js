import { NextResponse } from 'next/server';
import { createPaymentLink } from '@/lib/api-integrations';
import { logActivity } from '@/lib/activity-log';

export async function POST(request) {
  try {
    const { amount, clientName, clientEmail, clientPhone, caseRef, caseId, description } = await request.json();

    if (!amount || !clientName) {
      return NextResponse.json({ error: 'Amount and client name required' }, { status: 400 });
    }

    const result = await createPaymentLink(amount, clientName, clientEmail, clientPhone, caseRef, description);

    if (result.available && result.data) {
      logActivity(caseId || null, null, 'payment_link_created', { amount, shortUrl: result.data.shortUrl }).catch(() => {});
    }

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: 'Payment link creation failed' }, { status: 500 });
  }
}
