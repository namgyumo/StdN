---
title: 'algo-visualizer (가제)'
summary: '블로그 포스트 안에 바로 삽입할 수 있는 알고리즘 시각화 컴포넌트 모음. DFS/BFS/다익스트라/DP 테이블 등을 대화형으로 보여준다.'
status: 'idea'
stack: ['Astro', 'Canvas', 'TypeScript']
startedAt: 2026-05-01
featured: true
order: 90
---

## 만들려는 것

블로그에 PS 풀이 글을 쓸 때, 단순히 코드 블록만 붙이는 것보다
실제로 알고리즘이 어떻게 동작하는지 시각적으로 보여주면 이해가 훨씬 빠르다.

- 입력 그래프를 드래그로 그릴 수 있음
- Step / Play / Reset 버튼으로 실행 제어
- 각 단계에서 자료구조 내부 상태 표시 (큐/스택/우선순위 큐)

## 기술 후보

- Canvas 2D 직접 그리기 (가장 가벼움)
- D3 의 Force Layout 으로 자동 레이아웃 후 커스텀 렌더
- Astro Island 로 필요한 페이지에서만 JS 로딩

## 로드맵

1. DFS / BFS 기본 시각화
2. 다익스트라 (우선순위 큐 내부 포함)
3. DP 테이블 (LCS, Knapsack)
4. 유니온 파인드 포레스트
