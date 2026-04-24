---
title: 'std::N 개인 홈페이지'
summary: 'Astro + Cloudflare Pages 기반으로 만든 개인 홈페이지 겸 블로그. 포트폴리오·프로젝트·PS 풀이를 한 곳에서 관리.'
status: 'active'
stack: ['Astro', 'TypeScript', 'Cloudflare Pages', 'Pagefind', 'MDX']
repo: 'https://github.com/namgyumo/std-n'
startedAt: 2026-04-24
featured: true
order: 100
---

## 왜 만들었나

기존 정적 HTML 4페이지 포트폴리오를 확장하면서, "블로그·프로젝트·PS 풀이" 를 한 곳에서
일관된 디자인으로 보여주고 싶었다. 글쓰기도 쉬워야 하고, 배포도 단순해야 했다.

## 핵심 결정

- **Astro** — Markdown 콘텐츠에 최적화, View Transitions 내장
- **Cloudflare Pages** — 푸시 = 배포, 무료 tier 넉넉
- **Pagefind** — 정적 검색 인덱스, DB 불필요
- **Content Collections** — 글이 git 에 버전 관리됨

## 구조

```
src/
  content/blog/        마크다운 글
  content/projects/    프로젝트 설명
  layouts/             BaseLayout, BlogLayout
  components/          Header, CommandPalette, TOC, ...
  pages/               라우트
```

## 앞으로

- D1 기반 방명록·조회수
- Resend 기반 contact 폼
- OG 이미지 자동 생성 (Workers)
- 알고리즘 시각화 인터랙티브 컴포넌트
