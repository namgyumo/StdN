---
title: 'PikaBuddy'
summary: 'AI 기반 통합 교육 플랫폼 — 코딩 과제·글쓰기·퀴즈·시험 감독을 한 곳에서. Gemini 로 과정(process) 중심 피드백, Obsidian 스타일 지식 그래프로 학습 시각화.'
status: 'done'
stack: ['React 19', 'TypeScript', 'Vite', 'FastAPI', 'Python', 'Gemini', 'Supabase', 'PostgreSQL', 'Docker', 'AWS EC2', 'Cloudflare R2']
repo: 'https://github.com/namgyumo/pikabuddy'
demo: 'https://pikabuddy.com'
startedAt: 2026-03-20
finishedAt: 2026-03-27
featured: true
order: 100
---

## 개요

학생이 **결과가 아닌 과정**을 제출·분석받을 수 있는 통합 교육 플랫폼. 코딩, 글쓰기, 퀴즈, 시험 감독까지 한 시스템에서 처리하고, Gemini 기반 AI 가 "코드 작성 과정" · "글쓰기 과정" · "지식 그래프" 를 분석해서 학생·교강사 각자에게 다른 레이어의 피드백을 돌려준다.

- 개발 기간: **1주**
- 코드 규모: **약 64,400줄** (프론트 44,500 + 백 19,800)
- UI: **28페이지**, API: **168개 엔드포인트**
- 지원 언어(코딩 과제): Python / JS / C / C++ / Java / C# / Rust / Go / ASM

## 핵심 기능

- **3종 과제 통합** — 코딩(OJ 판정 9개 언어), 글쓰기(TipTap), 퀴즈(자동 채점)
- **AI 학습 분석 (11종)** — 자동 채점·피드백, 소크라테스식 튜터, 복붙 감지, 노트 갭 분석, 주간 리포트 등
- **스냅샷 기반 과정 추적** — 코드 작성 중 스냅샷 자동 저장, 붙여넣기 추적, diff 비교
- **Obsidian 스타일 지식 그래프** — Force-directed 레이아웃, 노트 간 관계 자동 분석, 양방향 링크
- **시험 감독(Proctoring)** — 전체화면 이탈 / 탭 전환 / 스크린샷 / 감사 로그
- **게임화** — 24단계 티어, 55개 시각 이펙트, 3단계 테마 커스터마이징
- **다중 역할** — 교강사 / 학생 / 개인 학습자 전환

## 기술 결정

- **Gemini 3단계 폴백** — 모델 실패 시 순차적 degradation 으로 사용자 경험 유지
- **SSE 실시간 스트리밍** — AI 응답·채점 진행률 즉시 반영
- **Supabase RLS** — DB 레벨에서 역할 기반 권한 강제
- **모노에디터 Monaco** — VSCode 와 동일한 DX 를 브라우저에서

## 역할

설계·개발 전반. AI 바이브코딩 워크플로우를 적극적으로 써서 1주 안에 풀스택을 완성한 경험.
