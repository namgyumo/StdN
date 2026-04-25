---
title: 'RPG Project'
summary: '클래스·스마트포인터 기반 텍스트 RPG 게임 — C++ OOP 핵심 개념 직접 구현.'
status: 'done'
stack: ['C++']
repo: 'https://github.com/namgyumo/RPG-project-25.08'
startedAt: 2025-08-01
featured: false
order: 30
---

## 개요

C++의 OOP 핵심 개념을 직접 손으로 구현하며 익히기 위해 만든 텍스트 RPG 게임.
클래스 설계, 상속, 스마트포인터(unique_ptr / shared_ptr) 활용, 가상 함수 등을 게임 컨텍스트에서 실제로 사용해봤다.

## 핵심 구현 포인트

- 캐릭터 클래스 계층: Character 기반 클래스에서 Warrior / Mage / Archer 파생
- 스마트포인터로 객체 수명 관리 (메모리 누수 제로 목표)
- 전투 시스템: 턴제, 스킬 쿨다운, 데미지 계산
- 인벤토리 / 아이템 시스템

## 배운 것

가상 함수와 다형성이 실제 코드에서 어떻게 동작하는지, RAII 패턴의 중요성, 클래스 설계 시 책임 분리의 중요성을 체감했다.
