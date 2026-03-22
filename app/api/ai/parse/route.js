import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  // Basic protection: require either auth cookie or same-origin
  const origin = request.headers.get('origin') || request.headers.get('referer') || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  if (!origin.startsWith(appUrl) && !request.headers.get('cookie')?.includes('auth-token')) {
    // Allow in dev mode but log
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const { narrative } = await request.json();
    
    if (!narrative?.trim()) {
      return NextResponse.json({ error: 'No narrative provided' }, { status: 400 });
    }
    
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      system: `You are an NRI tax intake parser. Extract structured data from the client description.
Return ONLY valid JSON, no markdown, no backticks, no explanation.
JSON schema:
{
  "name":"","country":"","stayDays":"","occupation":"",
  "salary":false,"rent":false,"interest":false,"dividend":false,
  "cgProperty":false,"cgShares":false,"cgMF":false,"cgESOPRSU":false,
  "business":false,"foreignSalary":false,"foreignTaxPaid":false,
  "propertySale":false,"propertySaleDetails":"","rentalDetails":"",
  "foreignDetails":"","salePrice":0,"purchaseCost":0,
  "propertyAcqFY":"","propertyLocation":"",
  "rentalMonthly":0,"nroInterest":0,"fdInterest":0,"notes":""
}
Extract what you can. Use false or 0 for anything not mentioned.`,
      messages: [{ role: 'user', content: narrative }]
    });
    
    let parsed;
    try {
      const raw = message.content[0]?.text?.replace(/```json|```/g, '').trim();
      if (!raw) throw new Error('Empty AI response');
      parsed = JSON.parse(raw);
    } catch (parseError) {
      console.error('Parse JSON error:', parseError.message);
      return NextResponse.json({ error: 'Could not parse your description. Please fill the form manually.' }, { status: 422 });
    }
    return NextResponse.json({ parsed });

  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
