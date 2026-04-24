---
title: 'BOJ 1753 · 최단경로 — 다익스트라 정석 정리'
description: '우선순위 큐를 활용한 다익스트라 알고리즘으로 희소 그래프에서 O((V+E) log V) 시간에 단일 시작점 최단거리를 구한다. 템플릿과 함정 정리.'
publishedAt: 2026-04-18
tags: ['ps', 'graph', 'cpp']
---

BOJ [1753 최단경로](https://www.acmicpc.net/problem/1753) 는 다익스트라의 교과서적인 문제다.
단일 시작점에서 모든 정점까지의 최단거리를 구하면 된다.

## 문제 요약

- 정점 수 $V \leq 20{,}000$, 간선 수 $E \leq 300{,}000$
- 가중치 $w \geq 0$ (양의 가중치 전제)
- 시작 정점 `K` 에서 모든 정점까지의 최단거리 출력. 도달 불가면 `INF`.

## 접근

- 양의 가중치 → **다익스트라** 가능
- 희소 그래프 → 우선순위 큐 기반 $O((V+E) \log V)$ 사용
- 음수 간선 / 음수 사이클 → 벨만-포드나 SPFA 를 고려해야 하지만 여기선 해당 없음

## C++ 템플릿

```cpp
#include <bits/stdc++.h>
using namespace std;

constexpr int INF = 0x3f3f3f3f;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int V, E, K;
    cin >> V >> E >> K;

    vector<vector<pair<int,int>>> g(V + 1); // g[u] = { {v, w}, ... }
    while (E--) {
        int u, v, w; cin >> u >> v >> w;
        g[u].push_back({v, w});
    }

    vector<int> dist(V + 1, INF);
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    dist[K] = 0;
    pq.push({0, K});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue; // 낡은 항목 스킵 (중요)
        for (auto [v, w] : g[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }

    for (int i = 1; i <= V; ++i) {
        if (dist[i] == INF) cout << "INF\n";
        else cout << dist[i] << '\n';
    }
}
```

## 자주 틀리는 포인트

1. **낡은 항목 필터링**: `if (d > dist[u]) continue;` 를 빼면 $E \log E$ 보다 훨씬 나빠진다. 한 정점이 여러 번 큐에 들어갈 수 있기 때문.
2. **`INF` 값 선택**: `0x3f3f3f3f` 로 고정해두면 두 번 더해도 오버플로우가 안 난다. 1e9 같은 값은 서로 더할 때 조심해야 함.
3. **우선순위 큐 방향**: `priority_queue` 기본은 max-heap 이다. 반드시 `greater<>` 로 min-heap 을 만들 것.
4. **인덱스 1-based vs 0-based**: 문제에 따라 다르니 주의.
5. **같은 간선 여러 번**: 입력에 중복 간선이 올 수 있다. 그래도 로직은 유효하지만, 인접 리스트 사이즈가 커질 수 있음.

## 메모리/시간 체크

| 구분 | 값 |
|---|---|
| 시간 복잡도 | $O((V+E) \log V)$ |
| 공간 복잡도 | $O(V + E)$ |
| 입력 최대 | $V=2\cdot10^4,\ E=3\cdot10^5$ |
| 제출 결과 | 72 ms / 24 MB |

## 변형 문제 링크

- [BOJ 1916 최소비용 구하기](https://www.acmicpc.net/problem/1916) — 동일
- [BOJ 1504 특정한 최단 경로](https://www.acmicpc.net/problem/1504) — 다익스트라 2~3번 조합
- [BOJ 11657 타임머신](https://www.acmicpc.net/problem/11657) — 음수 간선 → 벨만-포드

---

> 다익스트라는 "정점 방문 순서 = 거리 오름차순" 이라는 불변식이 핵심이다.
> 이 불변식 덕분에 한 번 빠진 정점은 다시 갱신할 필요가 없어진다.
