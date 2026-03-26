import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Anthropic from '@anthropic-ai/sdk';
import { SKILL_PROMPTS, buildCaseContext } from '@/lib/skills';
import { createServerClient } from '@/lib/supabase-server';
import { logActivity } from '@/lib/activity-log';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// All modules in execution order (intake is skipped — auto-marked from form data)
const MODULE_ORDER = [
  'residency',
  'income',
  'pricing',
  'recon',
  'filing',
  'cg',
  'dtaa',
  'prefiling',
  'memo',
];

async function runModule(moduleId, formData, fy, moduleOutputs) {
  const promptFn = SKILL_PROMPTS[moduleId];
  if (!promptFn) {
    throw new Error(`Unknown module: ${moduleId}`);
  }

  const systemPrompt = promptFn(fy);
  const caseContext = buildCaseContext(formData, fy, moduleOutputs);

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

  return output;
}

async function saveModuleOutput(supabase, caseId, moduleId, output) {
  // Upsert into module_outputs table
  const { error } = await supabase.from('module_outputs').upsert({
    case_id: caseId,
    module_id: moduleId,
    output_text: output,
    completed_at: new Date().toISOString(),
  }, {
    onConflict: 'case_id,module_id',
  });

  if (error) {
    console.error(`[auto-run] Failed to save ${moduleId} output for case ${caseId}:`, error.message);
    // Do not throw — caller will continue with remaining modules
  }

  return !error;
}

async function updateCaseStatus(supabase, caseId, status, modulesCompleted) {
  const update = { status };
  if (typeof modulesCompleted === 'number') {
    update.modules_completed = modulesCompleted;
  }

  const { error } = await supabase.from('cases').update(update).eq('id', caseId);

  if (error) {
    console.error(`[auto-run] Failed to update case ${caseId} status to ${status}:`, error.message);
  }
}

export async function POST(request) {
  const startTime = Date.now();

  // Internal secret check — protect auto-run from external calls
  const secret = request.headers.get('x-internal-secret');
  if (!process.env.INTERNAL_SECRET || secret !== process.env.INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { caseId, formData, fy, startModule, moduleOutputs: prevOutputs } = await request.json();

    if (!caseId || !formData || !fy) {
      return NextResponse.json(
        { error: 'Missing required fields: caseId, formData, fy' },
        { status: 400 }
      );
    }

    const currentIndex = startModule || 0;

    console.log(`[auto-run] Running module ${currentIndex + 1}/${MODULE_ORDER.length} for case ${caseId} (FY ${fy})`);

    const supabase = createServerClient();

    // On first module, mark case as in_progress
    if (currentIndex === 0) {
      await updateCaseStatus(supabase, caseId, 'in_progress', 0);
    }

    // Accumulate module outputs from previous invocations
    const moduleOutputs = prevOutputs || { intake: 'auto' };

    // Run current module
    const moduleId = MODULE_ORDER[currentIndex];
    const moduleStart = Date.now();

    try {
      console.log(`[auto-run] Running module: ${moduleId} (${currentIndex + 1}/${MODULE_ORDER.length}) for case ${caseId}`);

      const output = await runModule(moduleId, formData, fy, moduleOutputs);
      moduleOutputs[moduleId] = output;
      await saveModuleOutput(supabase, caseId, moduleId, output);
      await updateCaseStatus(supabase, caseId, 'in_progress', currentIndex + 1);

      const elapsed = ((Date.now() - moduleStart) / 1000).toFixed(1);
      logActivity(caseId, null, 'module_completed', { moduleId, elapsed }).catch(() => {});
      logActivity(caseId, null, 'ai_module_run', { moduleId }).catch(() => {});
      console.log(`[auto-run] Completed ${moduleId} in ${elapsed}s (${currentIndex + 1}/${MODULE_ORDER.length})`);

    } catch (moduleError) {
      const elapsed = ((Date.now() - moduleStart) / 1000).toFixed(1);
      console.error(`[auto-run] Module ${moduleId} failed after ${elapsed}s:`, moduleError.message);

      // Save error marker so the team knows this module needs manual re-run
      await saveModuleOutput(supabase, caseId, moduleId, `[AUTO-RUN ERROR] ${moduleError.message}`);
    }

    // Chain next module (fire-and-forget)
    if (currentIndex + 1 < MODULE_ORDER.length) {
      const headersList = headers();
      const host = headersList.get('host') || 'localhost:3000';
      const protocol = headersList.get('x-forwarded-proto') || 'http';
      fetch(`${protocol}://${host}/api/auto-run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': process.env.INTERNAL_SECRET || '' },
        body: JSON.stringify({ caseId, formData, fy, startModule: currentIndex + 1, moduleOutputs }),
      }).catch(err => console.error('[auto-run] Chain failed:', err.message));
    } else {
      // All modules done — update status to review
      await updateCaseStatus(supabase, caseId, 'review', MODULE_ORDER.length);
      console.log(`[auto-run] All modules complete for case ${caseId}`);
    }

    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    return NextResponse.json({
      success: true,
      caseId,
      moduleCompleted: moduleId,
      moduleIndex: currentIndex,
      totalModules: MODULE_ORDER.length,
      elapsedSeconds: parseFloat(totalElapsed),
    });

  } catch (error) {
    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`[auto-run] Fatal error after ${totalElapsed}s:`, error);

    return NextResponse.json(
      { error: 'Auto-run pipeline failed', elapsedSeconds: parseFloat(totalElapsed) },
      { status: 500 }
    );
  }
}
