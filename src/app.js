const DISPLAY_TIMEZONE = "Asia/Seoul";
const DISPLAY_OFFSET_MS = 9 * 60 * 60 * 1000;
const REFRESH_INTERVAL_MS = 3 * 60 * 60 * 1000;
const REFRESH_SCHEDULE_LABEL = "3시간마다 정각";

const TAB_CONFIG = [
  {
    key: "ai",
    label: "AI",
    kicker: "Artificial Intelligence",
    description: "생성형 AI, 모델, 인프라, 업계 흐름을 빠르게 확인하는 탭",
    heroLead: "한국어 AI 기사 흐름을 차분하게 읽을 수 있는 큐레이션 탭입니다.",
  },
  {
    key: "game",
    label: "게임",
    kicker: "Play, Build & Business",
    description: "게임 출시, 업데이트, 개발, 산업 이슈를 한 번에 모아보는 탭",
    heroLead: "출시와 운영, 개발과 산업 이슈가 한 흐름 안에서 자연스럽게 이어집니다.",
  },
  {
    key: "entertainment",
    label: "연예",
    kicker: "Stars, Shows & OTT",
    description: "배우, 아이돌, 드라마, 영화, 방송, OTT 화제를 모아보는 탭",
    heroLead: "드라마, 영화, 음악, 방송 소식을 부드러운 에디토리얼 톤으로 정리합니다.",
  },
  {
    key: "unity",
    label: "Unity",
    kicker: "Engine & Ecosystem",
    description: "Unity 엔진과 생태계 변화, 정책, 툴 업데이트를 모아보는 탭",
    heroLead: "Unity 관련 공지, 생태계 변화, 개발 도구 흐름을 한 자리에서 확인합니다.",
  },
];

const FALLBACK_DATA = {
  metadata: {
    version: "0.6.0-fallback",
    sourceMode: "fallback",
    sourceProvider: "sample",
    contentLocale: "ko-KR",
    lastUpdatedAt: "2026-04-09T15:00:00Z",
    tabCount: 4,
    totalArticleCount: 4,
    requestConfig: {
      articleLimitPerTab: 30,
    },
    feedCount: 0,
    successfulFeedCount: 0,
  },
  tabs: {
    ai: {
      tab: "ai",
      label: "AI",
      lastUpdatedAt: "2026-04-09T15:00:00Z",
      articleCount: 1,
      articles: [
        {
          id: "ai-fallback-1",
          title: "샘플: 한국어 AI 큐레이션 레이아웃이 정상적으로 렌더링되는지 확인하는 기사",
          url: "https://example.com/newsbox/ai-fallback-1",
          source: "Sample AI Desk",
          publishedAt: "2026-04-09T14:20:00Z",
          summary: "JSON 로딩에 실패해도 NewsBox의 새 에디토리얼 레이아웃은 유지되도록 내장 샘플 데이터를 준비해 둡니다.",
          tab: "ai",
        },
      ],
    },
    unity: {
      tab: "unity",
      label: "Unity",
      lastUpdatedAt: "2026-04-09T15:00:00Z",
      articleCount: 1,
      articles: [
        {
          id: "unity-fallback-1",
          title: "샘플: Unity 정책과 툴 업데이트 카드가 비어 보이지 않도록 유지하는 대체 기사",
          url: "https://example.com/newsbox/unity-fallback-1",
          source: "Sample Engine Watch",
          publishedAt: "2026-04-09T13:40:00Z",
          summary: "실제 RSS를 읽지 못해도 탭 전환과 레이아웃, 스포트라이트 카드가 모두 살아 있도록 구성한 예비 데이터입니다.",
          tab: "unity",
        },
      ],
    },
    game: {
      tab: "game",
      label: "게임",
      lastUpdatedAt: "2026-04-09T15:00:00Z",
      articleCount: 1,
      articles: [
        {
          id: "game-fallback-1",
          title: "샘플: 게임 탭은 출시와 운영, 산업 이슈를 한 화면에 이어서 보여줍니다",
          url: "https://example.com/newsbox/game-fallback-1",
          source: "Sample Game Desk",
          publishedAt: "2026-04-09T12:50:00Z",
          summary: "카드 비율이 다양한 벤토형 레이아웃에서도 제목과 요약이 안정적으로 읽히는지 확인하기 위한 샘플 기사입니다.",
          tab: "game",
        },
      ],
    },
    entertainment: {
      tab: "entertainment",
      label: "연예",
      lastUpdatedAt: "2026-04-09T15:00:00Z",
      articleCount: 1,
      articles: [
        {
          id: "entertainment-fallback-1",
          title: "샘플: 연예 탭은 방송과 영화, 음악, OTT 이슈를 차분하게 이어서 보여줍니다",
          url: "https://example.com/newsbox/entertainment-fallback-1",
          source: "Sample Entertainment Wire",
          publishedAt: "2026-04-09T11:20:00Z",
          summary: "연예 데이터가 비어 있어도 전체 페이지가 무너지지 않도록, 최소 1건의 하이라이트 기사로 레이아웃을 유지합니다.",
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
  clockTimer: null,
};

const elements = {
  tabList: document.querySelector("#tabList"),
  heroTitle: document.querySelector("#heroTitle"),
  sectionKicker: document.querySelector("#sectionKicker"),
  sectionTitle: document.querySelector("#sectionTitle"),
  sectionDescription: document.querySelector("#sectionDescription"),
  heroSummary: document.querySelector("#heroSummary"),
  heroPanelHeadline: document.querySelector("#heroPanelHeadline"),
  heroPanelBody: document.querySelector("#heroPanelBody"),
  heroPanelSource: document.querySelector("#heroPanelSource"),
  heroPanelTime: document.querySelector("#heroPanelTime"),
  spotlightLink: document.querySelector("#spotlightLink"),
  jumpToFeedButton: document.querySelector("#jumpToFeedButton"),
  currentTimeLabel: document.querySelector("#currentTimeLabel"),
  lastUpdatedLabel: document.querySelector("#lastUpdatedLabel"),
  nextUpdateLabel: document.querySelector("#nextUpdateLabel"),
  articleList: document.querySelector("#articleList"),
  emptyState: document.querySelector("#emptyState"),
  statusLabel: document.querySelector("#statusLabel"),
  dataMetaLabel: document.querySelector("#dataMetaLabel"),
  totalArticlesStat: document.querySelector("#totalArticlesStat"),
  visibleArticlesStat: document.querySelector("#visibleArticlesStat"),
  dataModeStat: document.querySelector("#dataModeStat"),
  feedEyebrow: document.querySelector("#feedEyebrow"),
  feedDescription: document.querySelector("#feedDescription"),
};

initialize();

async function initialize() {
  bindEvents();
  ensureHash();
  renderTabs();
  startClock();
  await refreshData({ isInitialLoad: true });
}

function bindEvents() {
  window.addEventListener("hashchange", () => {
    const nextTab = getValidTabKey(window.location.hash.replace("#", "")) || "ai";

    if (nextTab !== state.activeTab) {
      state.activeTab = nextTab;
    }

    render();
  });

  elements.jumpToFeedButton.addEventListener("click", () => {
    document.querySelector("#articleFeed")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

function startClock() {
  updateCurrentTime();

  if (state.clockTimer) {
    window.clearInterval(state.clockTimer);
  }

  state.clockTimer = window.setInterval(() => {
    updateCurrentTime();
  }, 30_000);
}

function updateCurrentTime() {
  elements.currentTimeLabel.textContent = formatClockTime(new Date());

  if (state.metadata?.lastUpdatedAt) {
    elements.nextUpdateLabel.textContent = formatDateTime(
      getNextScheduledUpdate(new Date()),
    );
  }
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
    label: activeConfig.label,
    lastUpdatedAt: state.metadata?.lastUpdatedAt,
    articleCount: 0,
    articles: [],
  };
  const articles = getSortedArticles(dataset.articles);
  const spotlightArticle = articles[0] ?? null;
  const feedArticles = spotlightArticle ? articles.slice(1) : articles;
  const totalArticles = getTotalArticleCount();
  const visibleArticles = spotlightArticle ? feedArticles.length + 1 : feedArticles.length;
  const lastUpdatedAt = dataset.lastUpdatedAt ?? state.metadata?.lastUpdatedAt;
  const nextUpdateAt = getNextScheduledUpdate(new Date());

  document.title = `NewsBox | ${activeConfig.label}`;

  elements.sectionKicker.textContent = activeConfig.kicker;
  elements.feedEyebrow.textContent = activeConfig.kicker;
  elements.sectionTitle.textContent = `${activeConfig.label} Feed`;
  elements.sectionDescription.textContent = activeConfig.description;
  elements.feedDescription.textContent = buildFeedDescription(activeConfig, articles.length);
  elements.lastUpdatedLabel.textContent = formatDateTime(lastUpdatedAt);
  elements.nextUpdateLabel.textContent = formatDateTime(nextUpdateAt);
  elements.totalArticlesStat.textContent = `${totalArticles}건`;
  elements.visibleArticlesStat.textContent = `${visibleArticles}건`;
  elements.dataModeStat.textContent = getDataModeLabel();
  elements.dataMetaLabel.textContent = buildMetaLine();

  applyHeroContent(activeConfig, spotlightArticle, articles.length, lastUpdatedAt);
  setStatus(getStatusMessage());
  renderTabs();
  renderArticles(feedArticles, activeConfig.label);
}

function applyHeroContent(activeConfig, spotlightArticle, articleCount, lastUpdatedAt) {
  if (!spotlightArticle) {
    elements.heroTitle.textContent = `${activeConfig.label} 탭을 준비하고 있습니다`;
    elements.heroSummary.textContent = activeConfig.heroLead;
    elements.heroPanelHeadline.textContent = `${activeConfig.label} 기사 흐름을 기다리는 중입니다`;
    elements.heroPanelBody.textContent =
      `${REFRESH_SCHEDULE_LABEL} 갱신되며, 다음 수집 주기에 새 기사가 들어오면 이 영역에 가장 중요한 하이라이트가 표시됩니다.`;
    elements.heroPanelSource.textContent = "RSS 큐레이션";
    elements.heroPanelTime.textContent = formatDateTime(lastUpdatedAt);
    elements.spotlightLink.href = "#articleFeed";
    elements.spotlightLink.target = "_self";
    elements.spotlightLink.removeAttribute("rel");
    elements.spotlightLink.textContent = "기사 리스트 보기";
    return;
  }

  elements.heroTitle.textContent = spotlightArticle.title;
  elements.heroSummary.textContent = truncateText(
    spotlightArticle.summary || activeConfig.heroLead,
    220,
  );
  elements.heroPanelHeadline.textContent = `${activeConfig.label} 탭에서 ${articleCount}건을 큐레이션했습니다`;
  elements.heroPanelBody.textContent = buildHeroPanelBody(
    activeConfig,
    spotlightArticle,
    articleCount,
  );
  elements.heroPanelSource.textContent = spotlightArticle.source || "RSS 큐레이션";
  elements.heroPanelTime.textContent = formatRelativeTime(spotlightArticle.publishedAt);
  elements.spotlightLink.href = spotlightArticle.url || "#articleFeed";
  elements.spotlightLink.target = spotlightArticle.url ? "_blank" : "_self";
  if (spotlightArticle.url) {
    elements.spotlightLink.rel = "noreferrer";
  } else {
    elements.spotlightLink.removeAttribute("rel");
  }
  elements.spotlightLink.textContent = "원문 보기";
}

function renderTabs() {
  elements.tabList.replaceChildren(
    ...TAB_CONFIG.map((tab) => {
      const button = document.createElement("button");
      const articleCount = state.datasets.get(tab.key)?.articles?.length ?? 0;

      button.type = "button";
      button.className = "tab-button";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(tab.key === state.activeTab));
      button.setAttribute("aria-controls", "articleList");
      button.dataset.tabKey = tab.key;
      button.innerHTML = `
        <span class="tab-button__label">${tab.label}</span>
        <span class="tab-button__count">${articleCount}</span>
      `;

      button.addEventListener("click", () => {
        if (tab.key === state.activeTab) {
          document.querySelector("#articleFeed")?.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        window.location.hash = tab.key;
        document.querySelector("#articleFeed")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  articles.forEach((article, index) => {
    const variant = getArticleVariant(index);
    const card = document.createElement("article");

    card.className = `article-card article-card--${variant}`;

    const header = document.createElement("div");
    header.className = "article-card__header";
    header.innerHTML = `
      <span class="article-card__pill">${getCardPillLabel(index)}</span>
      <span class="article-card__time">${formatRelativeTime(article.publishedAt)}</span>
    `;

    const title = document.createElement("h3");
    title.className = "article-card__title";
    title.textContent = truncateText(article.title, getTitleLimit(variant));

    const summary = document.createElement("p");
    summary.className = "article-card__summary";
    summary.textContent = getCardSummary(article.summary, variant);

    const footer = document.createElement("div");
    footer.className = "article-card__footer";

    const source = document.createElement("span");
    source.className = "article-card__source";
    source.textContent = article.source || "RSS";

    const tag = document.createElement("span");
    tag.className = "article-card__tag";
    tag.textContent = currentLabel;

    const link = document.createElement("a");
    link.className = "article-card__link";
    link.href = article.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "원문 보기";

    footer.append(source, tag, link);

    card.append(header);

    if (variant === "lead") {
      const accent = document.createElement("div");
      accent.className = "article-card__accent";
      accent.setAttribute("aria-hidden", "true");
      card.append(accent);
    }

    card.append(title, summary, footer);
    fragment.append(card);
  });

  elements.articleList.append(fragment);
}

function getArticleVariant(index) {
  if (index === 0) {
    return "lead";
  }

  if (index === 1 || index === 2) {
    return "support";
  }

  if (index === 3) {
    return "spot";
  }

  return "compact";
}

function getCardPillLabel(index) {
  if (index === 0) {
    return "Top Story";
  }

  if (index === 1 || index === 2) {
    return "Feature";
  }

  if (index === 3) {
    return "Editor Pick";
  }

  return "Update";
}

function getCardSummary(summary, variant) {
  const fallback = "요약 정보가 아직 준비되지 않아 제목 중심으로 확인할 수 있습니다.";
  const base = summary || fallback;
  const maxLength = {
    lead: 170,
    support: 120,
    spot: 110,
    compact: 84,
  }[variant];

  return truncateText(base, maxLength);
}

function getTitleLimit(variant) {
  return {
    lead: 88,
    support: 68,
    spot: 60,
    compact: 56,
  }[variant];
}

function buildHeroPanelBody(activeConfig, spotlightArticle, articleCount) {
  const summary = truncateText(
    spotlightArticle.summary || activeConfig.heroLead,
    128,
  );

  return `${summary} 현재 ${activeConfig.label} 탭에는 ${articleCount}건이 연결돼 있고 ${REFRESH_SCHEDULE_LABEL} 새 데이터로 갱신됩니다.`;
}

function buildFeedDescription(activeConfig, articleCount) {
  if (articleCount === 0) {
    return `${activeConfig.description} ${REFRESH_SCHEDULE_LABEL} 갱신되며 다음 주기에서 새 기사를 기다리는 중입니다.`;
  }

  return `${activeConfig.description} ${REFRESH_SCHEDULE_LABEL} 갱신되며, 상단 스포트라이트 1건과 이어지는 큐레이션 카드로 최근 흐름을 빠르게 훑어볼 수 있습니다.`;
}

function getStatusMessage() {
  if (state.isLoading) {
    return `${REFRESH_SCHEDULE_LABEL} 갱신되는 데이터 파일을 불러오는 중입니다.`;
  }

  if (state.isFallback) {
    return `실제 JSON을 읽지 못해 내장 샘플 데이터로 화면을 유지하고 있습니다. 운영 데이터는 ${REFRESH_SCHEDULE_LABEL} 갱신됩니다.`;
  }

  return `정적 JSON과 RSS 수집 결과를 바탕으로 탭별 기사를 새 레이아웃에 맞춰 렌더링했습니다. 데이터는 ${REFRESH_SCHEDULE_LABEL} 갱신됩니다.`;
}

function getDataModeLabel() {
  if (state.isFallback) {
    return "Fallback";
  }

  switch (state.metadata?.sourceMode) {
    case "korean-rss":
      return "Korean RSS";
    case "official-rss":
      return "Official RSS";
    default:
      return state.metadata?.sourceMode ?? "JSON";
  }
}

function buildMetaLine() {
  const successfulFeedCount = state.metadata?.successfulFeedCount ?? 0;
  const feedCount = state.metadata?.feedCount ?? 0;
  const articleLimit =
    state.metadata?.requestConfig?.articleLimitPerTab ??
    FALLBACK_DATA.metadata.requestConfig.articleLimitPerTab;

  return [
    `버전 ${state.metadata?.version ?? "-"}`,
    `탭 ${state.metadata?.tabCount ?? TAB_CONFIG.length}개`,
    `피드 ${successfulFeedCount}/${feedCount} 성공`,
    `탭당 최대 ${articleLimit}건`,
    `갱신 ${REFRESH_SCHEDULE_LABEL}`,
  ].join(" · ");
}

function getSortedArticles(articles = []) {
  return [...articles].sort(
    (left, right) => new Date(right.publishedAt) - new Date(left.publishedAt),
  );
}

function getTotalArticleCount() {
  return (
    state.metadata?.totalArticleCount ??
    Array.from(state.datasets.values()).reduce((count, dataset) => {
      return count + (dataset.articles?.length ?? 0);
    }, 0)
  );
}

async function fetchJson(url, cacheBust) {
  const requestUrl = new URL(url);

  if (cacheBust) {
    requestUrl.searchParams.set("ts", String(cacheBust));
  }

  const response = await fetch(requestUrl, { cache: "no-store" });

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

function getNextScheduledUpdate(reference) {
  const hoursInBlock = REFRESH_INTERVAL_MS / (60 * 60 * 1000);
  const kstTimestamp = reference.getTime() + DISPLAY_OFFSET_MS;
  const currentHourBlock = Math.floor(kstTimestamp / (60 * 60 * 1000));
  const nextHourBlock =
    Math.floor(currentHourBlock / hoursInBlock + 1) * hoursInBlock;

  return new Date(nextHourBlock * 60 * 60 * 1000 - DISPLAY_OFFSET_MS);
}

function formatDateTime(value) {
  if (!value) {
    return "갱신 시각 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: DISPLAY_TIMEZONE,
  }).format(new Date(value));
}

function formatClockTime(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: DISPLAY_TIMEZONE,
  }).format(new Date(value));
}

function formatRelativeTime(value) {
  if (!value) {
    return "시간 정보 없음";
  }

  const target = new Date(value).getTime();
  const now = Date.now();
  const diffMinutes = Math.round((target - now) / 60_000);
  const rtf = new Intl.RelativeTimeFormat("ko-KR", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, "day");
}

function truncateText(value, maxLength) {
  if (!value) {
    return "";
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function setStatus(message) {
  elements.statusLabel.textContent = message;
}

async function refreshData({ isInitialLoad = false } = {}) {
  state.isLoading = true;
  setStatus(
    isInitialLoad
      ? `${REFRESH_SCHEDULE_LABEL} 갱신되는 초기 데이터를 불러오는 중입니다.`
      : `${REFRESH_SCHEDULE_LABEL} 갱신되는 데이터 파일을 불러오는 중입니다.`,
  );

  try {
    const { metadata, datasets } = await loadJsonData(Date.now());
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

async function loadJsonData(cacheBust) {
  const metadataUrl = new URL("../data/metadata.json", import.meta.url);
  const metadata = await fetchJson(metadataUrl, cacheBust);
  const datasets = await Promise.all(
    TAB_CONFIG.map(async (tab) => {
      const datasetUrl = new URL(`../data/tabs/${tab.key}.json`, import.meta.url);
      const dataset = await fetchJson(datasetUrl, cacheBust);
      return [tab.key, dataset];
    }),
  );

  return { metadata, datasets: new Map(datasets) };
}
