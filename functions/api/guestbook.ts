// Cloudflare Pages Function — /api/guestbook
// D1 기반 방명록. 최초엔 env.DB 가 없어서 503 을 반환하지만,
// D1 바인딩을 추가하면 자동으로 동작합니다.
//
// 사용 전 준비:
//   1. wrangler d1 create std-n
//   2. wrangler.toml 의 [[d1_databases]] 섹션 주석 해제, database_id 채움
//   3. Pages 프로젝트 Settings → Functions → D1 bindings 에 DB 추가
//   4. 아래 CREATE TABLE 을 D1 콘솔 또는 wrangler d1 execute 로 실행:
//        CREATE TABLE IF NOT EXISTS guestbook (
//          id INTEGER PRIMARY KEY AUTOINCREMENT,
//          name TEXT NOT NULL,
//          message TEXT NOT NULL,
//          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//        );

interface Env {
  DB?: D1Database;
}

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return json({ ok: false, error: 'db_not_configured' }, 503);
  const { results } = await env.DB.prepare(
    'SELECT id, name, message, created_at FROM guestbook ORDER BY id DESC LIMIT 100',
  ).all();
  return json({ ok: true, entries: results });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return json({ ok: false, error: 'db_not_configured' }, 503);
  const body = await request.json().catch(() => null) as { name?: string; message?: string } | null;
  if (!body) return json({ ok: false, error: 'invalid_body' }, 400);

  const name = body.name?.trim() ?? '';
  const message = body.message?.trim() ?? '';
  if (name.length < 1 || name.length > 40) return json({ ok: false, error: 'name_length' }, 400);
  if (message.length < 1 || message.length > 500) return json({ ok: false, error: 'message_length' }, 400);

  await env.DB.prepare('INSERT INTO guestbook (name, message) VALUES (?, ?)')
    .bind(name, message)
    .run();

  return json({ ok: true });
};
