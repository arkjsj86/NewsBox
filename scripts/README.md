# scripts

이 폴더에는 뉴스 수집, 정규화, 중복 제거, 탭 분류, JSON 생성 스크립트가 들어 있다.

## 현재 포함된 스크립트

- `build-pages.mjs`: GitHub Pages 배포용 정적 산출물을 `dist` 폴더에 생성한다.
- `serve.mjs`: 로컬에서 정적 미리보기 서버를 실행한다.
- `update-news.mjs`: 이전 GNews API 기반 수집 스크립트다.
- `update-rss-news.mjs`: 한국어 RSS 피드에서 뉴스를 수집하고 중복을 줄여 `data` 폴더 JSON을 갱신한다.
