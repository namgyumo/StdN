// GET /api/admin/me  — 세션 확인용
import { verifySessionCookie, json } from '../../_lib/auth';

interface Env {
  SESSION_SECRET?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.SESSION_SECRET) return json({ ok: true, authed: false });
  const session = await verifySessionCookie(request.headers.get('cookie'), env.SESSION_SECRET);
  return json({ ok: true, authed: !!session, sub: session?.sub ?? null });
};
