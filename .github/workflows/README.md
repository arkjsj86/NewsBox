# workflows

이 폴더에는 GitHub Pages 배포와 3시간 단위 뉴스 갱신을 위한 GitHub Actions 워크플로 파일이 들어 있다.

현재 포함된 워크플로는 아래와 같다.

- `deploy-pages.yml`: `main` 브랜치 변경 시 GitHub Pages를 배포한다.
- `update-news.yml`: 3시간마다 공개 RSS/Atom 피드를 다시 읽어 뉴스 데이터를 갱신하고 변경 시 `main`에 커밋한다.
