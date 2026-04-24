# std::N

기본이 탄탄한 주니어 개발자의 개인 홈페이지 + 블로그.
Astro 5 + Cloudflare Pages 로 배포합니다.

---

## 🗂 프로젝트 구조

```
stdN/
├── _legacy/                 # 기존 단일 HTML 포트폴리오 보관 (참고용)
├── public/
│   ├── images/              # 프로필·게임·뮤지컬 이미지
│   ├── favicon.svg
│   ├── site.webmanifest
│   ├── og-default.svg       # 기본 Open Graph 이미지
│   ├── robots.txt
│   └── _headers             # Cloudflare Pages 캐시/보안 헤더
├── functions/
│   └── api/
│       ├── contact.ts       # 연락 폼 — Resend 연동
│       ├── guestbook.ts     # 방명록 — D1 필요
│       └── views/[slug].ts  # 포스트 조회수 — D1 필요
├── src/
│   ├── components/          # Header, CommandPalette, TOC 등
│   ├── content/
│   │   ├── blog/            # Markdown 블로그 글
│   │   ├── projects/        # 프로젝트 카드
│   │   └── config.ts        # Content Collection 스키마
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── BlogLayout.astro
│   ├── lib/
│   │   ├── site.ts          # 사이트 메타데이터 (이름/핸들/nav 등)
│   │   └── format.ts
│   ├── pages/
│   │   ├── index.astro       /   홈
│   │   ├── about.astro       /about
│   │   ├── skills.astro      /skills
│   │   ├── contact.astro     /contact
│   │   ├── now.astro         /now       — 현재 상태
│   │   ├── uses.astro        /uses      — 장비·툴
│   │   ├── ps.astro          /ps        — 알고리즘 풀이 허브
│   │   ├── search.astro      /search    — Pagefind UI
│   │   ├── 404.astro
│   │   ├── rss.xml.ts
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   ├── [...slug].astro
│   │   │   └── tags/[tag].astro
│   │   └── projects/
│   │       ├── index.astro
│   │       └── [...slug].astro
│   └── styles/
│       └── global.css       # 토큰화된 전역 스타일
├── astro.config.mjs
├── tsconfig.json
├── wrangler.toml
└── package.json
```

---

## 🚀 로컬에서 돌리기

```bash
# 1. Node 20 이상 설치 — https://nodejs.org
# 2. (권장) pnpm 사용. npm/yarn 도 됩니다.
npm install -g pnpm

# 3. 의존성 설치
pnpm install

# 4. dev 서버
pnpm dev            # http://localhost:4321

# 5. 프로덕션 빌드 + 검색 인덱스 생성
pnpm build          # dist/ 에 빌드됨

# 6. 빌드 결과 로컬 미리보기
pnpm preview
```

> Pagefind 검색 인덱스는 `pnpm build` 시점에 생성됩니다.
> `pnpm dev` 환경에서는 `/search` 결과가 비어 보일 수 있어요.

---

## ☁️ Cloudflare Pages 배포

### A. 수동 한 번 (권장하지 않음, 테스트용)

```bash
pnpm build
npx wrangler pages deploy dist --project-name=std-n
```

### B. Git 연동 자동 배포 (추천)

1. 이 폴더를 GitHub repo 로 푸시 (예: `github.com/namgyumo/std-n`).
2. https://dash.cloudflare.com → Pages → Create project → Connect to Git.
3. 해당 repo 선택. 빌드 설정:
   - **Framework preset**: Astro
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
   - **Node version**: 20 이상 (환경변수 `NODE_VERSION=20`)
4. 환경변수 (Settings → Environment variables):

   | Key | 예시 | 용도 |
   |---|---|---|
   | `PUBLIC_SITE_URL` | `https://std-n.dev` | 절대 URL (canonical/RSS/OG) |
   | `PUBLIC_CF_ANALYTICS_TOKEN` | (Cloudflare 발급) | Web Analytics |
   | `RESEND_API_KEY` | `re_...` | 연락 폼 전송 (선택) |
   | `CONTACT_TO_EMAIL` | `n.gyumo13@gmail.com` | 받는 이 |
   | `CONTACT_FROM_EMAIL` | `std::N <hello@std-n.dev>` | 보내는 이 (선택) |

5. 배포 완료되면 도메인 연결 (Custom domain → `std-n.dev`).

### C. D1 연결 (방명록·조회수)

```bash
# 1. D1 생성
npx wrangler d1 create std-n
# 출력된 database_id 를 wrangler.toml 의 [[d1_databases]] 섹션에 기입 + 주석 해제

# 2. 스키마 적용
npx wrangler d1 execute std-n --command "
  CREATE TABLE IF NOT EXISTS guestbook (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS views (
    slug TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0
  );
"

# 3. Pages 프로젝트 → Settings → Functions → D1 database bindings
#    Binding name: DB / Database: std-n
```

---

## ✍️ 새 글 쓰기

`src/content/blog/<slug>.md(x)` 파일 생성.

```markdown
---
title: '새 글 제목'
description: '검색/OG 용 1-2줄 요약'
publishedAt: 2026-05-01
tags: ['ps', 'cpp']
draft: false
---

여기서부터 본문입니다.
```

- `draft: true` 이면 빌드에서 제외됩니다.
- `#ps` 태그가 붙은 글은 `/ps` 페이지에도 자동 등록됩니다.
- 코드 블록은 Shiki (`github-dark`) 로 하이라이트, `copy` 버튼이 자동 주입됩니다.

### 프로젝트 추가

`src/content/projects/<slug>.md` 파일 생성.

```markdown
---
title: '프로젝트 이름'
summary: '한 줄 요약'
status: 'wip'       # active | wip | done | idea
stack: ['C++', 'CMake']
repo: 'https://github.com/namgyumo/...'
demo: 'https://...'
startedAt: 2026-03-01
featured: true
order: 90
---
```

---

## 🎨 디자인 토큰

`src/styles/global.css` 의 `:root` 섹션에서 관리합니다:

| 토큰 | 기본값 |
|---|---|
| `--color-bg` | `#080808` |
| `--color-fg` | `#e0f7fa` (시안) |
| `--color-accent` | `#c1ff00` (네온 라임) |
| `--color-blue` | `#0062ff` |
| `--color-pink` | `#ff003c` |
| `--font-sans` | `Trebuchet MS, Pretendard, ...` |
| `--font-mono` | `JetBrains Mono, Cascadia Code, ...` |

전역 배경의 그리드 격자·비네팅·유체 그라데이션은 `body::before`, `body::after` 에서 관리합니다.

---

## 🧩 주요 기능

- **Content Collections** — 블로그·프로젝트 모두 타입 안전 Frontmatter
- **View Transitions** — Astro `ClientRouter` 로 부드러운 페이지 전환
- **Command Palette** — `Ctrl/Cmd + K` 또는 `/` 로 열기
- **Cursor Glow** — 마우스 주변 라임색 radial glow
- **Reading Progress Bar** — 블로그 스크롤 진행률
- **Table of Contents** — 자동 생성, 스크롤에 따라 active 이동
- **Copy Code Button** — 코드 블록마다 복사 버튼
- **Pagefind Search** — `pnpm build` 시점에 정적 인덱스 생성
- **RSS + Sitemap** — `/rss.xml`, `/sitemap-index.xml`
- **OG / Twitter Card / JSON-LD** — 페이지별 자동 생성
- **Touch-Active 클래스** — 모바일에서도 호버 전용 효과 동작

---

## 🐛 레거시 대비 수정된 것

- `lang="kr"` → `lang="ko"` (표준 코드)
- `<p><h1>…</h1></p>` 같은 잘못된 중첩 제거
- `<table>` 레이아웃 → semantic HTML + CSS grid/flex
- `align="center"` → CSS
- `http://` BOJ 뱃지 → `https://`
- `poby01.JPG` → `public/images/poby01.jpg` (확장자 소문자)
- 페이지별 `<title>`, `meta description`, Open Graph 세팅
- 키보드 포커스 스타일 (`:focus-visible`)
- `prefers-reduced-motion` 대응
- 모바일에서 프로필 슬라이드 엣지 케이스 정리

---

## 🛣 로드맵

- [ ] `pnpm install` + `pnpm dev` 로 동작 확인
- [ ] GitHub repo 생성 + push
- [ ] Cloudflare Pages 연결 및 첫 배포
- [ ] 도메인 연결 (std-n.dev 또는 원하는 도메인)
- [ ] 실제 `poby01.jpg` 를 WebP 로 재생성 (1.9MB → ~100KB)
- [ ] OG 기본 SVG 를 PNG 로 렌더 (카카오톡 등 일부 스크레이퍼는 SVG 미지원)
- [ ] Giscus 리포지토리·카테고리 ID 세팅
- [ ] D1 생성 + 방명록·조회수 활성화
- [ ] Resend API 키 등록 + 연락 폼 활성화
- [ ] 블로그 글 추가

---

## 📝 라이선스

개인 콘텐츠는 © {year} std::N — All rights reserved.
사이트 구조/코드는 편하게 참고 가능합니다.
