# NewsBox

<p align="center">
  5개의 고정 탭으로 AI와 게임 분야 뉴스를 정리해 보여주는 큐레이션 웹 프로젝트
</p>

<p align="center">
  <a href="https://arkjsj86.github.io/NewsBox/">
    <img alt="Visit NewsBox" src="https://img.shields.io/badge/Live%20Site-Visit%20NewsBox-C14E2F?style=for-the-badge">
  </a>
</p>

<p align="center">
  <a href="https://arkjsj86.github.io/NewsBox/">https://arkjsj86.github.io/NewsBox/</a>
</p>

![NewsBox preview](./docs/assets/newsbox-preview.png)

## Overview

NewsBox는 `AI`, `Unity`, `게임 산업`, `게임 개발`, `게임 일반` 5개 탭을 중심으로 최신 뉴스를 한곳에서 빠르게 확인할 수 있도록 설계한 프로젝트다.

초기 버전은 자유 검색 대신 고정 탭 기반으로 범위를 분명히 잡고, 같은 내용의 기사 중복을 줄인 리스트를 보여주는 데 집중한다.

## Why NewsBox

- 탭 기반으로 관심 주제를 빠르게 전환할 수 있다.
- 같은 소식이 여러 매체에 반복 노출되는 문제를 줄이는 방향으로 설계한다.
- GitHub Pages 기반으로 가볍게 배포하고 확인할 수 있다.
- 이후 수집기와 자동 갱신 로직을 붙이기 쉬운 구조로 만들어져 있다.

## Current Scope

- 5개 주제 탭 기반 뉴스 탐색
- 탭별 뉴스 리스트 표시
- 정적 JSON 기반 렌더링
- GitHub Pages 배포
- 3시간 단위 자동 갱신 운영

## Tabs

- `AI`: 생성형 AI, 인프라, 정책, 투자 흐름
- `Unity`: Unity 엔진, 생태계, 정책, 툴링 변화
- `게임 산업`: 실적, 투자, 퍼블리싱, 규제, 시장 이슈
- `게임 개발`: 제작 기술, 파이프라인, 최적화, 툴링
- `게임 일반`: 신작, 업데이트, 이벤트, 대중적 화제

## Project Notes

- 현재 사이트는 샘플 JSON 데이터를 읽어 동작한다.
- 실제 뉴스 수집은 `GNews API` 기반으로 구현되어 있다.
- 탭별 검색 결과를 모은 뒤 전역 중복 제거와 대표 탭 재분류를 거쳐 `data` JSON을 갱신한다.
- 외형은 추후 Google Stitch 같은 도구를 활용해 리디자인할 수 있도록 분리된 구조를 유지하고 있다.

## Run Locally

1. 프로젝트 루트에서 `node scripts/serve.mjs`
2. 브라우저에서 `http://127.0.0.1:4173` 접속
3. 탭 전환과 기사 카드 렌더링 확인

실제 뉴스 데이터 갱신을 로컬에서 테스트하려면 `GNEWS_API_KEY` 환경 변수를 설정한 뒤 `node scripts/update-news.mjs`를 실행하면 된다.

## News Automation

- 스케줄 워크플로: [.github/workflows/update-news.yml](./.github/workflows/update-news.yml)
- 수집 스크립트: [scripts/update-news.mjs](./scripts/update-news.mjs)
- GitHub Actions 주기: `3시간마다 17분`
- 필요한 시크릿: `GNEWS_API_KEY`

워크플로는 3시간마다 뉴스를 수집하고 `data` 폴더가 바뀌면 `main`에 자동 커밋한다. 그 다음 Pages 배포 워크플로가 다시 실행되어 사이트가 갱신된다.

참고로 현재 구현은 5개 탭을 시간당 각각 조회하는 구조라서, 실제 운영에서는 충분한 요청 한도와 실시간 데이터 접근이 가능한 GNews 요금제를 쓰는 편이 안전하다.

## Deployment

- Live site: [https://arkjsj86.github.io/NewsBox/](https://arkjsj86.github.io/NewsBox/)
- Workflow: [.github/workflows/deploy-pages.yml](./.github/workflows/deploy-pages.yml)
- Build script: [scripts/build-pages.mjs](./scripts/build-pages.mjs)

## Docs

- 탭 분류 기준: [docs/tab-classification.md](./docs/tab-classification.md)
- 초기 구조 제안: [docs/initial-structure.md](./docs/initial-structure.md)

## One Line

NewsBox는 AI와 게임 관련 뉴스를 탭별로 모아 중복을 줄이고, 주기적으로 갱신해 보여주기 위한 뉴스 큐레이션 프로젝트다.
