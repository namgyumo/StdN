// POST /api/ai/fix  body: { selection: string, context?: string }
// → { ok, text } : 사실 오류 / 오타 / 문법 오류 수정.

import { requireAdmin, json } from '../../_lib/auth';
import { callGemini, SYSTEM_PROMPT_KO, buildFixPrompt } from '../../_lib/ai';

interface Env {
  SESSION_SECRET?: string;
  GEMINI_API_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env.SESSION_SECRET);
  if (auth instanceof Response) return auth;
  if (!env.GEMINI_API_KEY) return json({ ok: false, error: 'gemini_not_configured' }, 503);

  let body: { selection?: string; context?: string };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_body' }, 400);
  }

  const selection = (body.selection ?? '').trim();
  const context = (body.context ?? '').slice(-2000);
  if (!selection) return json({ ok: false, error: 'empty_selection' }, 400);
  if (selection.length > 4000) return json({ ok: false, error: 'selection_too_long' }, 400);

  const result = await callGemini({
    apiKey: env.GEMINI_API_KEY,
    prompt: buildFixPrompt(selection, context),
    systemInstruction: SYSTEM_PROMPT_KO,
    temperature: 0.2,
    maxOutputTokens: 1024,
  });
  if (!result.ok) return json({ ok: false, error: result.error }, 502);
  return json({ ok: true, text: result.text.trim() });
};
