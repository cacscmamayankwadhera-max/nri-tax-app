import { NextResponse } from 'next/server';
import Anthropic from 'anthropic';
import { SKILL_PROMPTS, buildCaseContext } from '@/lib/skills';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const { moduleId, formData, fy, moduleOutputs } = await request.json();
    
    if (!moduleId || !formData || !fy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const promptFn = SKILL_PROMPTS[moduleId];
    if (!promptFn) {
      return NextResponse.json({ error: `Unknown module: ${moduleId}` }, { status: 400 });
    }
    
    const systemPrompt = promptFn(fy);
    const caseContext = buildCaseContext(formData, fy, moduleOutputs || {});
    
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Here is the complete case file:\n\n${caseContext}\n\nProduce your structured ${moduleId} analysis based on all available information.`
      }]
    });
    
    const output = message.content
      .map(block => block.type === 'text' ? block.text : '')
      .join('\n');
    
    return NextResponse.json({ output, moduleId });
    
  } catch (error) {
    console.error('AI module error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
