import { NextResponse } from 'next/server';
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
    const { caseId, formData, fy } = await request.json();

    if (!caseId || !formData || !fy) {
      return NextResponse.json(
        { error: 'Missing required fields: caseId, formData, fy' },
        { status: 400 }
      );
    }

    console.log(`[auto-run] Starting auto-run for case ${caseId} (FY ${fy})`);

    const supabase = createServerClient();

    // Mark case as in_progress
    await updateCaseStatus(supabase, caseId, 'in_progress', 0);

    // Accumulate module outputs so each subsequent module has full context
    const moduleOutputs = { intake: 'auto' };
    let completedCount = 0;
    const errors = [];

    for (const moduleId of MODULE_ORDER) {
      const moduleStart = Date.now();

      try {
        console.log(`[auto-run] Running module: ${moduleId} (${completedCount + 1}/${MODULE_ORDER.length}) for case ${caseId}`);

        const output = await runModule(moduleId, formData, fy, moduleOutputs);

        // Add this module's output to context for subsequent modules
        moduleOutputs[moduleId] = output;
        completedCount++;

        // Persist to Supabase (non-blocking for the sequence — errors are logged but don't halt)
        await saveModuleOutput(supabase, caseId, moduleId, output);

        // Update completed count on the case
        await updateCaseStatus(supabase, caseId, 'in_progress', completedCount);

        const elapsed = ((Date.now() - moduleStart) / 1000).toFixed(1);
        logActivity(caseId, null, 'module_completed', { moduleId, elapsed }).catch(() => {});
        console.log(`[auto-run] Completed ${moduleId} in ${elapsed}s (${completedCount}/${MODULE_ORDER.length})`);

      } catch (moduleError) {
        const elapsed = ((Date.now() - moduleStart) / 1000).toFixed(1);
        console.error(`[auto-run] Module ${moduleId} failed after ${elapsed}s:`, moduleError.message);

        errors.push({ module: moduleId, error: moduleError.message });

        // Save error marker so the team knows this module needs manual re-run
        await saveModuleOutput(supabase, caseId, moduleId, `[AUTO-RUN ERROR] ${moduleError.message}`);

        // Continue with remaining modules
      }
    }

    // Mark case as ready for review
    await updateCaseStatus(supabase, caseId, 'review', completedCount);

    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[auto-run] Finished case ${caseId}: ${completedCount}/${MODULE_ORDER.length} modules in ${totalElapsed}s`);

    return NextResponse.json({
      success: true,
      caseId,
      modulesCompleted: completedCount,
      totalModules: MODULE_ORDER.length,
      errors: errors.length > 0 ? errors : undefined,
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
