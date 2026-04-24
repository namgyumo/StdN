// GET  /api/admin/posts       — 전체 목록 (draft 포함)
// POST /api/admin/posts       — 새 글 생성
// body: { slug?, title, description?, body_md, tags?: string[], draft?: boolean }

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

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env.SESSION_SECRET);
  if (auth instanceof Response) return auth;
  if (!env.DB) return json({ ok: false, error: 'db_not_configured' }, 503);

  const { results } = await env.DB.prepare(
    `SELECT id, slug, title, description, tags, draft, published_at, created_at, updated_at
     FROM posts ORDER BY updated_at DESC LIMIT 200`,
  ).all<Omit<PostRow, 'body_md' | 'body_html'>>();

  return json({
    ok: true,
    posts: results.map((r) => ({
      ...r,
      tags: safeJsonArray(r.tags),
      draft: !!r.draft,
    })),
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env.SESSION_SECRET);
  if (auth instanceof Response) return auth;
  if (!env.DB) return json({ ok: false, error: 'db_not_configured' }, 503);

  let body: {
    slug?: string;
    title?: string;
    description?: string;
    body_md?: string;
    tags?: string[];
    draft?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_body' }, 400);
  }

  const title = body.title?.trim();
  const body_md = body.body_md ?? '';
  if (!title) return json({ ok: false, error: 'missing_title' }, 400);
  if (title.length > 200) return json({ ok: false, error: 'title_too_long' }, 400);
  if (body_md.length > 500_000) return json({ ok: false, error: 'body_too_long' }, 400);

  const slug = (body.slug?.trim() || slugify(title));
  const description = body.description?.trim() || null;
  const tags = Array.isArray(body.tags) ? body.tags.filter((t) => typeof t === 'string').slice(0, 20) : [];
  const draft = body.draft !== false ? 1 : 0;
  const body_html = renderMarkdown(body_md);
  const now = new Date().toISOString();
  const published_at = draft ? null : now;

  try {
    const res = await env.DB.prepare(
      `INSERT INTO posts (slug, title, description, body_md, body_html, tags, draft, published_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(slug, title, description, body_md, body_html, JSON.stringify(tags), draft, published_at, now, now)
      .run();
    return json({ ok: true, id: res.meta.last_row_id, slug });
  } catch (e) {
    const msg = (e as Error).message ?? '';
    if (msg.includes('UNIQUE')) return json({ ok: false, error: 'slug_taken' }, 409);
    return json({ ok: false, error: 'db_error', detail: msg }, 500);
  }
};

function safeJsonArray(s: string | null): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
