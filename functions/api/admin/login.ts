// POST /api/admin/login  body: { password }
// 성공 시 HttpOnly + Secure 쿠키로 세션 부여.

import { verifyPassword, createSessionCookie, json } from '../../_lib/auth';

interface Env {
  ADMIN_PASSWORD_HASH?: string;
  SESSION_SECRET?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.ADMIN_PASSWORD_HASH || !env.SESSION_SECRET) {
    return json({ ok: false, error: 'admin_not_configured' }, 503);
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_body' }, 400);
  }

  const password = body.password;
  if (typeof password !== 'string' || password.length < 1) {
    return json({ ok: false, error: 'missing_password' }, 400);
  }

  // timing-attack 약간 방어를 위해 항상 verify 호출
  const ok = await verifyPassword(password, env.ADMIN_PASSWORD_HASH);
  if (!ok) return json({ ok: false, error: 'invalid_credentials' }, 401);

  const cookie = await createSessionCookie(env.SESSION_SECRET);
  return json({ ok: true }, 200, { 'set-cookie': cookie });
};

export const onRequest: PagesFunction<Env> = async () =>
  json({ ok: false, error: 'method_not_allowed' }, 405);
