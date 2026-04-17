import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SKILL_PROMPTS, buildCaseContext } from '@/lib/skills';
import { rateLimit } from '@/lib/rate-limit';
import { createServerClient as createSupabaseSSR } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { logActivity } from '@/lib/activity-log';

async function verifyAuth(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null; // Supabase not configured — allow in dev

  const cookieStore = cookies();
  const supabase = createSupabaseSSR(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) { return cookieStore.get(name)?.value; },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  return error ? null : user;
}

export async function POST(request) {
  // Auth check — require authenticated user in production
  const user = await verifyAuth(request);
  if (!user && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const limit = await rateLimit(ip, 20, 60000);
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 });
  }

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key is not configured. Set ANTHROPIC_API_KEY in your environment.' },
        { status: 500 }
      );
    }

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

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Here is the complete case file:\n\n${caseContext}\n\nProduce your structured ${moduleId} analysis based on all available information.`
      }]
    });

    const output = message.content
      .map(block => block.type === 'text' ? block.text : '')
      .join('\n');

    const usage = message.usage; // { input_tokens, output_tokens }
    logActivity(null, null, 'ai_module_run', { moduleId, inputTokens: usage?.input_tokens, outputTokens: usage?.output_tokens }).catch(() => {});

    return NextResponse.json({ output, moduleId });

  } catch (error) {
    console.error('AI module error:', error);
    return NextResponse.json({ error: 'AI processing failed. Please try again.' }, { status: 500 });
  }
}
