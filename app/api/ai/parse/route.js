import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { rateLimit } from '@/lib/rate-limit';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  // Parse endpoint is public (used by client intake) — rate limit is the primary protection
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const limit = rateLimit(ip, 10, 60000);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    const { narrative } = await request.json();

    if (!narrative?.trim()) {
      return NextResponse.json({ error: 'No narrative provided' }, { status: 400 });
    }

    // Cap input length to prevent abuse
    const trimmedNarrative = narrative.slice(0, 3000);

    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
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
      messages: [{ role: 'user', content: trimmedNarrative }]
    });

    let parsed;
    try {
      const raw = message.content[0]?.text?.replace(/```json|```/g, '').trim();
      if (!raw) throw new Error('Empty AI response');
      parsed = JSON.parse(raw);

      // Whitelist only expected keys to prevent unexpected data injection
      const allowedKeys = new Set([
        'name','country','stayDays','occupation',
        'salary','rent','interest','dividend',
        'cgProperty','cgShares','cgMF','cgESOPRSU',
        'business','foreignSalary','foreignTaxPaid',
        'propertySale','propertySaleDetails','rentalDetails',
        'foreignDetails','salePrice','purchaseCost',
        'propertyAcqFY','propertyLocation',
        'rentalMonthly','nroInterest','fdInterest','notes'
      ]);
      parsed = Object.fromEntries(
        Object.entries(parsed).filter(([k]) => allowedKeys.has(k))
      );
    } catch (parseError) {
      console.error('Parse JSON error:', parseError.message);
      return NextResponse.json({ error: 'Could not parse your description. Please fill the form manually.' }, { status: 422 });
    }
    return NextResponse.json({ parsed });

  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json({ error: 'AI processing failed. Please try again.' }, { status: 500 });
  }
}
