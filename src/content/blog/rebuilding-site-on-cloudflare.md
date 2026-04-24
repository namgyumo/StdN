---
title: '포트폴리오 사이트를 Cloudflare Stack 으로 갈아엎은 이유'
description: 'AWS 쓰지 않고 Cloudflare Pages + D1 + R2 + Workers 로 개인 사이트를 운영하기로 한 결정 정리.'
publishedAt: 2026-04-20
tags: ['meta', 'cloudflare', 'infra']
---

원래 단일 도메인에서 정적 HTML 4장으로 돌아가던 포트폴리오 사이트를, 블로그·프로젝트 섹션까지 포함한 개인 홈페이지로 확장하기로 했다.

처음엔 AWS + S3 + CloudFront + Lambda 조합을 떠올렸지만, 결국 **Cloudflare 올인**으로 방향을 잡았다.

## 왜 AWS 가 아닌 Cloudflare 인가

| 항목 | AWS 일반적 구성 | Cloudflare |
|---|---|---|
| 정적 호스팅 | S3 + CloudFront | Pages |
| 함수 | Lambda@Edge / API Gateway | Pages Functions / Workers |
| DB | RDS / DynamoDB | D1 |
| 오브젝트 스토리지 | S3 | R2 (egress 무료) |
| 분석 | Athena / CloudWatch | Web Analytics (무료, 쿠키리스) |
| 청구 복잡도 | 서비스별 라인아이템 다수 | 단일 계정, 대부분 free tier |

내 사용 패턴(월 방문 수천 단위, 블로그/포트폴리오)에서는 Cloudflare 무료 티어만으로도 충분하다.
`egress` 비용 걱정이 없다는 점이 특히 크다.

## 스택 구성

- **프레임워크**: Astro 5
- **배포**: Cloudflare Pages (`git push` → 자동 배포, PR 프리뷰)
- **콘텐츠**: `src/content/blog/*.md(x)` (git 에 그대로 버전 관리)
- **검색**: Pagefind (정적 인덱스)
- **댓글**: 초기엔 Giscus (GitHub Discussions), 이후 D1 자체 구현
- **이미지**: 초기엔 Astro Image → 트래픽 늘면 R2 + Transform
- **분석**: Cloudflare Web Analytics

## 확장 훅

- `functions/api/*.ts` 로 Pages Functions 를 덧붙이면 바로 서버리스 엔드포인트
- 방명록·조회수는 D1 테이블 한두 개만 추가하면 됨
- 뉴스레터는 Resend 한 군데에서 발급한 API 키로 처리
- 관리자 페이지는 lucia-auth + D1 로 별도 Worker 에 올릴 예정

## 느낀 점

- **빌드·배포 체인을 단순하게 유지**하는 게 장기적으로 이긴다. Pages 는 정말 Push → Ship 수준이다.
- 동적 기능은 "필요해진 순간에 D1 테이블 하나 추가" 정도로만 확장할 수 있어서, 미리 인프라를 설계할 필요가 거의 없다.
- 플랫폼 lock-in 은 있지만, 콘텐츠는 전부 Markdown + git 에 있기 때문에 언제든 이주 가능.

다음 글에서는 Pages Functions 로 방명록을 D1 에 저장하는 부분을 정리할 예정.
