# scripts

이 폴더에는 이후 뉴스 수집, 정규화, 중복 제거, 탭 분류, JSON 생성 스크립트를 추가한다.

초기 골격 단계에서는 화면과 데이터 구조를 먼저 고정하고, 다음 단계에서 실제 수집 로직을 붙일 예정이다.

## 현재 포함된 스크립트

- `build-pages.mjs`: GitHub Pages 배포용 정적 산출물을 `dist` 폴더에 생성한다.
- `serve.mjs`: 로컬에서 정적 미리보기 서버를 실행한다.
- `update-news.mjs`: GNews API에서 뉴스를 수집하고 중복을 줄여 `data` 폴더 JSON을 갱신한다.
