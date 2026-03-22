import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
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
    
    const raw = message.content[0]?.text?.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);
    
    return NextResponse.json({ parsed });
    
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
