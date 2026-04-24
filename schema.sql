-- std::N — D1 스키마
-- 적용 (로컬 터미널에서):
--   npx wrangler d1 execute std-n --remote --file=schema.sql
-- 또는 Cloudflare 대시보드 → D1 → std-n → Console 탭에 붙여넣기.

-- 방명록
CREATE TABLE IF NOT EXISTS guestbook (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_guestbook_created_at ON guestbook(created_at DESC);

-- 포스트 조회수
CREATE TABLE IF NOT EXISTS views (
  slug  TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0
);

-- 어드민에서 쓴 블로그 글
CREATE TABLE IF NOT EXISTS posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  body_md      TEXT NOT NULL,
  body_html    TEXT NOT NULL,
  tags         TEXT NOT NULL DEFAULT '[]',   -- JSON 배열
  draft        INTEGER NOT NULL DEFAULT 1,   -- 1 = draft, 0 = published
  published_at DATETIME,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_draft ON posts(draft);

-- 어드민 세션 (쿠키 서명 방식이지만 revoke 용으로 두는 선택적 테이블)
CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,              -- 랜덤 토큰
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
