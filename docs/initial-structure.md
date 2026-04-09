# NewsBox 초기 구조 제안

> 이 문서는 프로젝트 초기에 정리한 5탭 구조 제안 기록이다.
> 현재 운영 중인 실제 구조는 `AI / Unity / 게임 / 연예` 4개 탭이며, 최신 기준은 `README.md`와 `docs/tab-classification.md`를 따른다.

## 목표

이 문서는 NewsBox를 GitHub 리포지토리 중심으로 운영하기 위한 초기 구조를 제안한다.

핵심 방향은 다음과 같다.

- 웹 화면은 가볍고 단순하게 유지한다.
- 뉴스 데이터 수집과 갱신은 배치 작업으로 분리한다.
- 저장 결과는 정적 파일로 만들어 사이트에서 바로 읽는다.
- 이후 기술 스택이 바뀌어도 데이터 구조와 운영 흐름은 크게 흔들리지 않게 설계한다.

## 권장 운영 방식

초기 버전은 아래 흐름을 추천한다.

1. GitHub Actions가 3시간마다 실행된다.
2. 뉴스 수집 스크립트가 공개 RSS/Atom 피드에서 원본 데이터를 가져온다.
3. 중복 제거와 탭 분류를 수행한다.
4. 결과를 JSON 파일로 저장한다.
5. 웹 사이트는 해당 JSON 파일을 읽어 화면에 노출한다.

이 구조는 "정적 사이트 + 주기적 데이터 갱신" 모델에 가깝다.

## 권장 저장소 구조

```text
NewsBox/
  .gitignore
  package.json
  dist/
  index.html
  .github/
    workflows/
      README.md
      deploy-pages.yml
      update-news.yml
  data/
    tabs/
      ai.json
      unity.json
      game-industry.json
      game-development.json
      game-general.json
    metadata.json
  docs/
    tab-classification.md
    initial-structure.md
  scripts/
    README.md
    build-pages.mjs
    serve.mjs
    update-news.mjs
  src/
    app.js
    styles.css
```

## 폴더 역할

### `package.json`

로컬 미리보기와 기본 스크립트 실행 진입점을 제공한다.

예상 역할:

- 로컬 실행 명령 정의
- 정적 배포 빌드 명령 정의
- 추후 스크립트 실행 명령 추가

### `index.html`

GitHub Pages에서 바로 진입할 수 있는 초기 진입 파일이다.

예상 역할:

- 전체 레이아웃 뼈대 제공
- 탭 UI를 위한 컨테이너 제공
- `src/app.js`, `src/styles.css` 연결

### `.github/workflows`

정기 갱신 자동화를 담당한다.

현재는 GitHub Pages 배포 워크플로와 3시간 단위 RSS/Atom 뉴스 갱신 워크플로를 포함한다.

### `data`

사이트가 직접 읽는 정적 데이터 영역이다.

예상 역할:

- 탭별 뉴스 JSON 저장
- 마지막 갱신 시각 저장
- 기사 개수, 버전 등 메타데이터 저장

### `docs`

프로젝트의 기준 문서를 둔다.

예상 역할:

- 탭 분류 기준
- 구조 설계
- 추후 기능 명세

### `scripts`

데이터 수집과 가공 로직을 담는다.

현재는 로컬 미리보기 서버, Pages 빌드 스크립트, 실제 RSS/Atom 뉴스 수집 스크립트를 포함한다.

### `src`

웹 화면을 구성하는 정적 프론트엔드 자산 영역이다.

예상 역할:

- 탭 UI 동작
- 뉴스 리스트 렌더링
- 마지막 갱신 시각 표시
- 빈 상태 및 오류 상태 처리
- 스타일 정의

## 화면 구조 제안

초기 화면은 아래 정도로 단순하게 시작하는 것을 추천한다.

- 상단 프로젝트 제목
- 5개 탭 네비게이션
- 마지막 갱신 시각
- 현재 탭의 기사 리스트
- 기사 카드 내 제목, 출처, 발행시각, 링크

초기 버전에서는 아래 요소만 있어도 충분하다.

- 기본 탭 진입
- 탭 전환
- 최신순 정렬
- 외부 기사 링크 열기

## 데이터 파일 형식 제안

### `data/metadata.json`

예시 필드:

- `lastUpdatedAt`
- `tabCount`
- `version`

### `data/tabs/ai.json`

예시 필드:

- `tab`
- `lastUpdatedAt`
- `articles`

### 기사 객체 예시

```json
{
  "id": "stable-article-id",
  "title": "Example title",
  "url": "https://example.com/article",
  "source": "Example Media",
  "publishedAt": "2026-04-09T12:00:00Z",
  "summary": "Short summary text",
  "tab": "ai"
}
```

## 탭 키 제안

내부 데이터에서는 아래 영문 키를 쓰는 것이 관리하기 쉽다.

- `ai`
- `unity`
- `game-industry`
- `game-development`
- `game-general`

화면에서는 이 값을 아래처럼 매핑한다.

- `ai` -> `AI`
- `unity` -> `Unity`
- `game-industry` -> `게임 산업`
- `game-development` -> `게임 개발`
- `game-general` -> `게임 일반`

## 초기 기술 방향 제안

아직 프레임워크를 확정하지 않았다면, 첫 버전은 HTML/CSS/JavaScript 기반의 단순 구조로 시작하는 것이 가장 가볍다.

이유는 다음과 같다.

- GitHub 호스팅에 잘 맞는다.
- 구조가 단순해 빠르게 MVP를 만들 수 있다.
- 이후 필요할 때 React나 다른 프레임워크로 옮기기 쉽다.

## 초기 구현 우선순위

1. 5개 탭 고정 UI 만들기
2. 탭별 JSON 파일 구조 만들기
3. 더미 데이터로 화면 연결하기
4. 수집 스크립트 기본 형태 만들기
5. GitHub Actions로 정기 갱신 연결하기
6. 중복 제거 규칙 고도화하기

## 결정이 필요한 항목

다음 단계에서 확정하면 좋다.

- 뉴스 수집 소스 후보
- 기사 요약을 직접 만들지 여부
- 같은 기사를 어떤 기준으로 중복 처리할지
- GitHub Actions 결과를 자동 커밋할지 배포 산출물만 갱신할지
- 초기 화면을 순수 정적으로 할지 간단한 번들러를 쓸지
