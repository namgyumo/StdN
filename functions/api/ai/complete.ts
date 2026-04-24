// POST /api/ai/complete  body: { before: string, after: string }
// → { ok, text } : 커서 위치 자동완성 (고스트 텍스트).

import { requireAdmin, json } from '../../_lib/auth';
import { callGemini, SYSTEM_PROMPT_KO, buildCompletePrompt } from '../../_lib/ai';

interface Env {
  SESSION_SECRET?: string;
  GEMINI_API_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env.SESSION_SECRET);
  if (auth instanceof Response) return auth;
  if (!env.GEMINI_API_KEY) return json({ ok: false, error: 'gemini_not_configured' }, 503);

  let body: { before?: string; after?: string };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_body' }, 400);
  }

  const before = (body.before ?? '').slice(-4000);
  const after = (body.after ?? '').slice(0, 1000);
  if (!before.trim() && !after.trim()) return json({ ok: true, text: '' });

  const result = await callGemini({
    apiKey: env.GEMINI_API_KEY,
    prompt: buildCompletePrompt(before, after),
    systemInstruction: SYSTEM_PROMPT_KO,
    temperature: 0.6,
    maxOutputTokens: 180,
  });
  if (!result.ok) return json({ ok: false, error: result.error }, 502);
  return json({ ok: true, text: result.text.trim() });
};
