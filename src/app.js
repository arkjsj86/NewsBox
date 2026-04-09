const TAB_CONFIG = [
  {
    key: "ai",
    label: "AI",
    kicker: "Artificial Intelligence",
    description: "생성형 AI, 모델, 인프라, 업계 흐름을 빠르게 확인하는 탭",
  },
  {
    key: "unity",
    label: "Unity",
    kicker: "Engine & Ecosystem",
    description: "Unity 엔진과 생태계 변화, 정책, 툴 업데이트를 모아보는 탭",
  },
  {
    key: "game",
    label: "게임",
    kicker: "Play, Build & Business",
    description: "게임 출시, 업데이트, 개발, 산업 이슈를 한 번에 모아보는 탭",
  },
  {
    key: "entertainment",
    label: "연예",
    kicker: "Stars, Shows & OTT",
    description: "배우, 아이돌, 드라마, 영화, 방송, OTT 화제를 모아보는 탭",
  },
];

const FALLBACK_DATA = {
  metadata: {
    version: "0.5.0-sample",
    sourceMode: "fallback",
    lastUpdatedAt: "2026-04-09T05:00:00Z",
    tabCount: 4,
    totalArticleCount: 4,
  },
  tabs: {
    ai: {
      tab: "ai",
      lastUpdatedAt: "2026-04-09T05:00:00Z",
      articles: [
        {
          id: "ai-fallback-1",
          title: "샘플: 멀티모달 AI 서비스 경쟁이 기업 협업 도구로 확장되는 흐름",
          url: "https://example.com/newsbox/ai-fallback-1",
          source: "Sample AI Daily",
          publishedAt: "2026-04-09T04:20:00Z",
          summary: "초기 골격 확인용 샘플 기사입니다. 이후 실제 수집기로 대체될 자리입니다.",
          tab: "ai",
        },
      ],
    },
    unity: {
      tab: "unity",
      lastUpdatedAt: "2026-04-09T05:00:00Z",
      articles: [
        {
          id: "unity-fallback-1",
          title: "샘플: Unity 탭 데이터 연결 실패 시 보여주는 대체 기사",
          url: "https://example.com/newsbox/unity-fallback-1",
          source: "Sample Engine Watch",
          publishedAt: "2026-04-09T04:00:00Z",
          summary: "실제 JSON 파일을 읽지 못하면 이 데이터로 레이아웃과 탭 동작을 유지합니다.",
          tab: "unity",
        },
      ],
    },
    game: {
      tab: "game",
      lastUpdatedAt: "2026-04-09T05:00:00Z",
      articles: [
        {
          id: "game-fallback-1",
          title: "샘플: 게임 탭의 출시·개발·산업 이슈를 함께 보여주는 카드",
          url: "https://example.com/newsbox/game-fallback-1",
          source: "Sample Game Desk",
          publishedAt: "2026-04-09T03:40:00Z",
          summary: "세 갈래로 나뉘어 있던 게임 기사를 하나의 탭에서 읽는 새 구조를 점검하기 위한 샘플입니다.",
          tab: "game",
        },
      ],
    },
    entertainment: {
      tab: "entertainment",
      lastUpdatedAt: "2026-04-09T05:00:00Z",
      articles: [
        {
          id: "entertainment-fallback-1",
          title: "샘플: 연예 탭의 방송·드라마·음악 소식 대체 기사",
          url: "https://example.com/newsbox/entertainment-fallback-1",
          source: "Sample Entertainment Wire",
          publishedAt: "2026-04-09T02:55:00Z",
          summary: "연예 RSS 연결 전에도 네 번째 탭 레이아웃과 카드 스타일을 확인할 수 있게 두는 샘플입니다.",
          tab: "entertainment",
        },
      ],
    },
  },
};

const state = {
  metadata: null,
  datasets: new Map(),
  activeTab: getValidTabKey(window.location.hash.replace("#", "")) || "ai",
  isFallback: false,
  isLoading: false,
};

const elements = {
  tabList: document.querySelector("#tabList"),
  sectionKicker: document.querySelector("#sectionKicker"),
  sectionTitle: document.querySelector("#sectionTitle"),
  sectionDescription: document.querySelector("#sectionDescription"),
  articleList: document.querySelector("#articleList"),
  emptyState: document.querySelector("#emptyState"),
  lastUpdatedLabel: document.querySelector("#lastUpdatedLabel"),
  statusLabel: document.querySelector("#statusLabel"),
  dataMetaLabel: document.querySelector("#dataMetaLabel"),
  totalArticlesStat: document.querySelector("#totalArticlesStat"),
  visibleArticlesStat: document.querySelector("#visibleArticlesStat"),
  dataModeStat: document.querySelector("#dataModeStat"),
  refreshButton: document.querySelector("#refreshButton"),
};

initialize();

async function initialize() {
  bindEvents();
  renderTabs();
  await refreshData({ isInitialLoad: true });
}

function bindEvents() {
  window.addEventListener("hashchange", () => {
    const nextTab = getValidTabKey(window.location.hash.replace("#", "")) || "ai";

    if (nextTab !== state.activeTab) {
      state.activeTab = nextTab;
      render();
      return;
    }

    renderTabs();
  });

  elements.refreshButton.addEventListener("click", async () => {
    await refreshData({ manual: true });
  });
}

function ensureHash() {
  if (window.location.hash) {
    return;
  }

  const nextUrl = `${window.location.pathname}${window.location.search}#${state.activeTab}`;
  window.history.replaceState(null, "", nextUrl);
}

function render() {
  const activeConfig = TAB_CONFIG.find((tab) => tab.key === state.activeTab) ?? TAB_CONFIG[0];
  const dataset = state.datasets.get(activeConfig.key) ?? {
    tab: activeConfig.key,
    lastUpdatedAt: state.metadata?.lastUpdatedAt,
    articles: [],
  };
  const articles = [...(dataset.articles ?? [])].sort(
    (left, right) => new Date(right.publishedAt) - new Date(left.publishedAt),
  );
  const totalArticles =
    state.metadata?.totalArticleCount ??
    Array.from(state.datasets.values()).reduce(
      (count, current) => count + (current.articles?.length ?? 0),
      0,
    );

  document.title = `NewsBox | ${activeConfig.label}`;
  elements.sectionKicker.textContent = activeConfig.kicker;
  elements.sectionTitle.textContent = activeConfig.label;
  elements.sectionDescription.textContent = activeConfig.description;
  elements.lastUpdatedLabel.textContent = formatDateTime(
    dataset.lastUpdatedAt ?? state.metadata?.lastUpdatedAt,
  );
  elements.totalArticlesStat.textContent = `${totalArticles}건`;
  elements.visibleArticlesStat.textContent = `${articles.length}건`;
  elements.dataModeStat.textContent = state.isFallback
    ? "Fallback Sample"
    : state.metadata?.sourceMode ?? "JSON Connected";
  elements.dataMetaLabel.textContent = [
    `버전 ${state.metadata?.version ?? "-"}`,
    `데이터 모드 ${state.metadata?.sourceMode ?? (state.isFallback ? "fallback" : "json")}`,
    `탭 ${state.metadata?.tabCount ?? TAB_CONFIG.length}개`,
  ].join(" · ");

  setStatus(
    state.isLoading
      ? "데이터 파일을 읽는 중입니다."
      : state.isFallback
        ? "정적 JSON을 읽지 못해 내장 샘플 데이터로 화면을 유지하고 있습니다."
        : "정적 JSON 파일을 읽어 탭별 기사 목록을 렌더링했습니다.",
  );

  updateRefreshButton();
  renderTabs();
  renderArticles(articles, activeConfig.label);
}

function renderTabs() {
  elements.tabList.replaceChildren(
    ...TAB_CONFIG.map((tab) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tab-button";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(tab.key === state.activeTab));
      button.setAttribute("aria-controls", "articleList");
      button.dataset.tabKey = tab.key;
      const articleCount = state.datasets.get(tab.key)?.articles?.length ?? 0;
      button.innerHTML = `
        <span class="tab-button__row">
          <span class="tab-button__label">${tab.label}</span>
          <span class="tab-button__count">${articleCount}</span>
        </span>
        <span class="tab-button__description">${tab.description}</span>
      `;
      button.addEventListener("click", () => {
        if (tab.key === state.activeTab) {
          return;
        }

        window.location.hash = tab.key;
      });

      return button;
    }),
  );
}

function renderArticles(articles, currentLabel) {
  elements.articleList.replaceChildren();

  if (articles.length === 0) {
    elements.emptyState.hidden = false;
    return;
  }

  elements.emptyState.hidden = true;

  const fragment = document.createDocumentFragment();

  for (const article of articles) {
    const card = document.createElement("article");
    card.className = "article-card";

    const meta = document.createElement("div");
    meta.className = "article-card__meta";
    meta.innerHTML = `
      <span class="article-card__source">${article.source}</span>
      <span class="article-card__time">${formatDateTime(article.publishedAt)}</span>
      <span class="article-card__tag">${currentLabel}</span>
    `;

    const title = document.createElement("h3");
    title.className = "article-card__title";
    title.textContent = article.title;

    const summary = document.createElement("p");
    summary.className = "article-card__summary";
    summary.textContent = article.summary ?? "요약이 아직 준비되지 않았습니다.";

    const link = document.createElement("a");
    link.className = "article-card__link";
    link.href = article.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "원문 보기";

    card.append(meta, title, summary, link);
    fragment.append(card);
  }

  elements.articleList.append(fragment);
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

function getValidTabKey(tabKey) {
  if (!tabKey) {
    return null;
  }

  return TAB_CONFIG.some((tab) => tab.key === tabKey) ? tabKey : null;
}

function formatDateTime(value) {
  if (!value) {
    return "갱신 시각 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function setStatus(message) {
  elements.statusLabel.textContent = message;
}

async function refreshData({ manual = false, isInitialLoad = false } = {}) {
  state.isLoading = true;
  updateRefreshButton();
  setStatus(
    manual
      ? "데이터 파일을 다시 읽는 중입니다."
      : isInitialLoad
        ? "초기 데이터를 불러오는 중입니다."
        : "데이터 파일을 불러오는 중입니다.",
  );

  try {
    const { metadata, datasets } = await loadJsonData();
    state.metadata = metadata;
    state.datasets = datasets;
    state.isFallback = false;
  } catch (error) {
    console.warn("NewsBox 데이터 파일을 읽지 못해 fallback 데이터를 사용합니다.", error);
    state.metadata = FALLBACK_DATA.metadata;
    state.datasets = new Map(Object.entries(FALLBACK_DATA.tabs));
    state.isFallback = true;
  } finally {
    state.isLoading = false;
    ensureHash();
    render();
  }
}

async function loadJsonData() {
  const metadataUrl = new URL("../data/metadata.json", import.meta.url);
  const metadata = await fetchJson(metadataUrl);
  const datasets = await Promise.all(
    TAB_CONFIG.map(async (tab) => {
      const datasetUrl = new URL(`../data/tabs/${tab.key}.json`, import.meta.url);
      const dataset = await fetchJson(datasetUrl);
      return [tab.key, dataset];
    }),
  );

  return { metadata, datasets: new Map(datasets) };
}

function updateRefreshButton() {
  elements.refreshButton.disabled = state.isLoading;
  elements.refreshButton.textContent = state.isLoading
    ? "불러오는 중..."
    : "데이터 다시 읽기";
}
