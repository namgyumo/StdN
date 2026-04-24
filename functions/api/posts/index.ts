// GET /api/posts  — 공개된 D1 포스트 목록 (블로그 리스트 클라이언트 사이드 머지용).
// 어드민 API 와 분리: 여기는 인증 없음, draft 도 노출 안 함.

interface Env {
  DB?: D1Database;
}

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=60, s-maxage=60',
    },
  });

function safeJsonArray(s: string | null): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return json({ ok: true, posts: [] });

  const { results } = await env.DB.prepare(
    `SELECT slug, title, description, tags, published_at, updated_at
     FROM posts
     WHERE draft = 0
     ORDER BY COALESCE(published_at, updated_at) DESC
     LIMIT 200`,
  ).all<{
    slug: string;
    title: string;
    description: string | null;
    tags: string;
    published_at: string | null;
    updated_at: string;
  }>();

  return json({
    ok: true,
    posts: results.map((r) => ({
      slug: r.slug,
      title: r.title,
      description: r.description,
      tags: safeJsonArray(r.tags),
      publishedAt: r.published_at ?? r.updated_at,
    })),
  });
};
