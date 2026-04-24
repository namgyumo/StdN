// GET  /api/views/:slug  → { ok: true, count }
// POST /api/views/:slug  → { ok: true, count }
// D1 바인딩(DB) 이 있을 때만 동작. 스키마 예시:
//   CREATE TABLE IF NOT EXISTS views (
//     slug TEXT PRIMARY KEY,
//     count INTEGER NOT NULL DEFAULT 0
//   );

interface Env {
  DB?: D1Database;
}

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  if (!env.DB) return json({ ok: false, error: 'db_not_configured' }, 503);
  const slug = String(params.slug ?? '');
  const row = await env.DB.prepare('SELECT count FROM views WHERE slug = ?').bind(slug).first<{ count: number }>();
  return json({ ok: true, count: row?.count ?? 0 });
};

export const onRequestPost: PagesFunction<Env> = async ({ env, params }) => {
  if (!env.DB) return json({ ok: false, error: 'db_not_configured' }, 503);
  const slug = String(params.slug ?? '');
  await env.DB.prepare(
    'INSERT INTO views (slug, count) VALUES (?, 1) ON CONFLICT(slug) DO UPDATE SET count = count + 1',
  ).bind(slug).run();
  const row = await env.DB.prepare('SELECT count FROM views WHERE slug = ?').bind(slug).first<{ count: number }>();
  return json({ ok: true, count: row?.count ?? 0 });
};
