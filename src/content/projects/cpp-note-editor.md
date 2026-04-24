---
title: 'C++ 노트 에디터'
summary: '싱글턴·커맨드·팩토리 등 GoF 디자인 패턴을 실제 기능에 붙여보면서 OOP 설계 감각을 쌓는 학습 프로젝트.'
status: 'wip'
stack: ['C++', 'Visual Studio', 'Design Patterns']
startedAt: 2026-04-01
featured: true
order: 95
---

## 만드는 이유

책으로 배운 디자인 패턴을 실제로 써봐야 체화된다는 판단. 단순 토이 코드가 아니라 **메모 작성·편집·undo/redo·저장** 같은 흐름이 자연스러운 에디터를 대상으로 삼아, 같은 패턴이 어떤 상황에서 "정말" 도움이 되는지 느껴보는 것이 목적.

## 적용 중인 패턴

- **Singleton** — 문서 상태(Document)·설정(Config) 관리자. 전역 접근과 lazy init.
- **Command** — 모든 사용자 액션을 명령 객체로 캡슐화. undo/redo 스택 구현의 기반.
- **Factory** — 파일 포맷별 loader/saver 생성(텍스트 / 마크다운 / JSON 등). 새 포맷 추가 시 기존 코드 변경 없이 확장.

## 앞으로 붙일 것

- **Observer** — 문서 변경을 여러 뷰(미리보기·통계)가 구독
- **Memento** — Command 의 반대, 스냅샷 저장
- **Strategy** — 자동 저장 정책(시간 기반 / 키스트로크 기반) 전환

## 목표

"필요해서 쓰는 패턴" 과 "그냥 끼워 넣는 패턴" 을 구분할 수 있게 되는 것.
