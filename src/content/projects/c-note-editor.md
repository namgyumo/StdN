---
title: 'C 노트 에디터'
summary: 'C 의 io/lib 만으로 자료구조·입력 루프·렌더링을 직접 구현하는 저수준 노트 에디터. STL 없이 바닥부터 만들며 포인터·메모리 감각을 다듬는다.'
status: 'wip'
stack: ['C', 'Visual Studio', 'Win32 Console', 'Pointer / Memory']
startedAt: 2026-04-10
featured: true
order: 90
---

## 만드는 이유

C++ 노트 에디터와 짝을 이루는 "바닥 버전". 표준 `stdio.h` / `stdlib.h` / `string.h` 정도만 쓰고 **동적 배열·버퍼 관리·텍스트 저장 구조를 직접 구현**하면서, C++ 의 `std::vector` / `std::string` 이 내부에서 어떤 일을 하고 있는지 감각적으로 이해해보려는 목적.

## 구현 중 요소

- **Gap Buffer** — 텍스트 에디터 전형의 구조. 커서 위치 변경·삽입을 amortized O(1) 로.
- **동적 배열** — realloc 타이밍·성장 전략(2배수)을 직접 다뤄보기
- **입력 루프** — 콘솔 raw input, 키 이벤트 처리
- **파일 I/O** — 이진 모드/텍스트 모드 차이, BOM 처리, 안전한 에러 복구

## 목표

- 라이브러리에 기대지 않고도 "텍스트 에디터" 같은 상태가 있는 프로그램을 설계할 수 있게
- `valgrind` / CRT debug heap 으로 leak 0 상태 유지
- 동일한 기능을 C++ 판과 비교하면서 설계 트레이드오프 이해
