// GET    /api/admin/posts/:id  — 단건 조회 (draft 포함, body_md 포함)
// PUT    /api/admin/posts/:id  — 수정
// DELETE /api/admin/posts/:id  — 삭제

import { requireAdmin, json } from '../../../_lib/auth';
import { renderMarkdown, slugify } from '../../../_lib/md';

interface Env {
  DB?: D1Database;
  SESSION_SECRET?: string;
}

interface PostRow {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  body_md: string;
  body_html: string;
  tags: string;
  draft: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

function safeJsonArray(s: string | null): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const auth = await requireAdmin(request, env.SESSION_SECRET);
  if (auth instanceof Response) return auth;
  if (!env.DB) return json({ ok: false, error: 'db_not_configured' }, 503);

  const id = Number(params.id);
  if (!Number.isFinite(id)) return json({ ok: false, error: 'invalid_id' }, 400);

  const row = await env.DB.prepare(
    `SELECT id, slug, title, description, body_md, body_html, tags, draft,
            published_at, created_at, updated_at
     FROM posts WHERE id = ?`,
  ).bind(id).first<PostRow>();

  if (!row) return json({ ok: false, error: 'not_found' }, 404);
  return json({
    ok: true,
    post: { ...row, tags: safeJsonArray(row.tags), draft: !!row.draft },
  });
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const auth = await requireAdmin(request, env.SESSION_SECRET);
  if (auth instanceof Response) return auth;
  if (!env.DB) return json({ ok: false, error: 'db_not_configured' }, 503);

  const id = Number(params.id);
  if (!Number.isFinite(id)) return json({ ok: false, error: 'invalid_id' }, 400);

  let body: {
    slug?: string;
    title?: string;
    description?: string | null;
    body_md?: string;
    tags?: string[];
    draft?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_body' }, 400);
  }

  const existing = await env.DB.prepare(`SELECT * FROM posts WHERE id = ?`)
    .bind(id)
    .first<PostRow>();
  if (!existing) return json({ ok: false, error: 'not_found' }, 404);

  const title = body.title?.trim() || existing.title;
  const body_md = body.body_md ?? existing.body_md;
  if (title.length > 200) return json({ ok: false, error: 'title_too_long' }, 400);
  if (body_md.length > 500_000) return json({ ok: false, error: 'body_too_long' }, 400);

  const slug = body.slug?.trim() || existing.slug || slugify(title);
  const description = body.description !== undefined ? (body.description || null) : existing.description;
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t) => typeof t === 'string').slice(0, 20)
    : safeJsonArray(existing.tags);
  const newDraft = body.draft === undefined ? !!existing.draft : !!body.draft;
  const draft = newDraft ? 1 : 0;
  const body_html = renderMarkdown(body_md);
  const now = new Date().toISOString();
  // draft 에서 published 로 바뀔 때만 published_at 갱신
  const published_at = draft ? null : (existing.published_at ?? now);

  try {
    await env.DB.prepare(
      `UPDATE posts
       SET slug = ?, title = ?, description = ?, body_md = ?, body_html = ?,
           tags = ?, draft = ?, published_at = ?, updated_at = ?
       WHERE id = ?`,
    )
      .bind(slug, title, description, body_md, body_html, JSON.stringify(tags), draft, published_at, now, id)
      .run();
    return json({ ok: true, slug });
  } catch (e) {
    const msg = (e as Error).message ?? '';
    if (msg.includes('UNIQUE')) return json({ ok: false, error: 'slug_taken' }, 409);
    return json({ ok: false, error: 'db_error', detail: msg }, 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  const auth = await requireAdmin(request, env.SESSION_SECRET);
  if (auth instanceof Response) return auth;
  if (!env.DB) return json({ ok: false, error: 'db_not_configured' }, 503);

  const id = Number(params.id);
  if (!Number.isFinite(id)) return json({ ok: false, error: 'invalid_id' }, 400);

  const res = await env.DB.prepare(`DELETE FROM posts WHERE id = ?`).bind(id).run();
  if (!res.success || res.meta.changes === 0) return json({ ok: false, error: 'not_found' }, 404);
  return json({ ok: true });
};
