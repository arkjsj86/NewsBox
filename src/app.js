const DISPLAY_TIMEZONE = "Asia/Seoul";

const TEAM_LOGO_MAP = {
  DNS: "./src/assets/teams/dns.svg",
  T1:  "./src/assets/teams/t1.svg",
  HLE: "./src/assets/teams/hle.svg",
  BFX: "./src/assets/teams/bfx.svg",
  NS:  "./src/assets/teams/ns.svg",
  DRX: "./src/assets/teams/drx.svg",
  DK:  "./src/assets/teams/dk.svg",
  GEN: "./src/assets/teams/gen.svg",
  BRO: "./src/assets/teams/bro.svg",
  KT:  "./src/assets/teams/kt.svg",
};
const DISPLAY_OFFSET_MS = 9 * 60 * 60 * 1000;
const REFRESH_INTERVAL_MS = 3 * 60 * 60 * 1000;
const REFRESH_SCHEDULE_LABEL = "3시간마다 정각";

const LCK_STANDINGS_FALLBACK = {
  leagueLabel: "LCK Split 2 2026",
  updatedLabel: "Week 2 기준",
  rows: [
    { rank: 1, code: "GEN", name: "Gen.G",                wins: 6, losses: 0, points: 6 },
    { rank: 2, code: "HLE", name: "Hanwha Life Esports",  wins: 5, losses: 1, points: 5 },
    { rank: 3, code: "T1",  name: "T1",                   wins: 4, losses: 2, points: 4 },
    { rank: 4, code: "DK",  name: "Dplus KIA",            wins: 4, losses: 2, points: 4 },
    { rank: 5, code: "KT",  name: "KT Rolster",           wins: 3, losses: 3, points: 3 },
    { rank: 6, code: "BFX", name: "BNK FEARX",            wins: 3, losses: 3, points: 3 },
    { rank: 7, code: "DRX", name: "Kiwoom DRX",           wins: 2, losses: 4, points: 2 },
    { rank: 8, code: "NS",  name: "Nongshim RedForce",    wins: 2, losses: 4, points: 2 },
    { rank: 9, code: "BRO", name: "Hanjin BRION",         wins: 1, losses: 5, points: 1 },
    { rank: 10,code: "DNS", name: "DN Soopers",           wins: 0, losses: 6, points: 0 },
  ],
};

const AI_PANEL_GROUPS = [
  {
    label: "대화형",
    items: [
      { name: "ChatGPT", badge: "CG", accent: "#3dd6a3" },
      { name: "Claude", badge: "CL", accent: "#f2a25c" },
      { name: "Gemini", badge: "GM", accent: "#6aa6ff" },
    ],
  },
  {
    label: "코딩",
    items: [
      { name: "GitHub Copilot", badge: "GC", accent: "#8ea0ff" },
      { name: "Cursor", badge: "CU", accent: "#94a3b8" },
      { name: "Codex", badge: "CX", accent: "#4fd1c5" },
    ],
  },
  {
    label: "이미지",
    items: [
      { name: "Midjourney", badge: "MJ", accent: "#e7a56f" },
      { name: "DALL-E", badge: "DE", accent: "#ffd166" },
      { name: "Stable Diffusion", badge: "SD", accent: "#b39bff" },
    ],
  },
  {
    label: "영상",
    items: [
      { name: "Sora", badge: "SO", accent: "#ff8a80" },
      { name: "Runway", badge: "RW", accent: "#7cc8ff" },
      { name: "Pika", badge: "PK", accent: "#b4f06f" },
    ],
  },
  {
    label: "오디오",
    items: [
      { name: "ElevenLabs", badge: "EL", accent: "#cbd5e1" },
      { name: "Whisper", badge: "WH", accent: "#8ec5ff" },
      { name: "Suno", badge: "SN", accent: "#ff9dbb" },
    ],
  },
];

const ENTERTAINMENT_TRENDS_FALLBACK = {
  tab: "entertainment",
  type: "trend-ranking",
  source: "Google Trends KR",
  sourceMode: "fallback",
  sourceUrl: "https://trends.google.com/trending/rss?geo=KR",
  title: "연예 화제 1~10위",
  updatedLabel: "Google Trends 기준",
  title: "Hot Issue",
  updatedLabel: "Google Trends KR",
  lastUpdatedAt: "2026-04-10T03:00:00Z",
  rankingLimit: 10,
  itemCount: 10,
  items: [
    {
      rank: 1,
      issueKey: "옥주현-한남더힐-매입",
      issueTitle: "옥주현 한남더힐 매입",
      articleCount: 4,
      relatedArticles: [
        { title: "옥주현 한남더힐 매입", source: "스포츠경향", url: "https://trends.google.com/trending/rss?geo=KR" },
      ],
      representativeArticle: {
        title: "옥주현 한남더힐 매입",
        source: "스포츠경향",
        url: "https://trends.google.com/trending/rss?geo=KR",
        publishedAt: "2026-04-10T02:40:00Z",
      },
      title: "옥주현 한남더힐 매입",
      source: "스포츠경향",
      url: "https://trends.google.com/trending/rss?geo=KR",
    },
    {
      rank: 2,
      issueKey: "변우석-광고-몸값",
      issueTitle: "변우석 광고 몸값 화제",
      articleCount: 3,
      relatedArticles: [
        { title: "변우석 광고 몸값 화제", source: "세계일보", url: "https://trends.google.com/trending/rss?geo=KR" },
      ],
      representativeArticle: {
        title: "변우석 광고 몸값 화제",
        source: "세계일보",
        url: "https://trends.google.com/trending/rss?geo=KR",
        publishedAt: "2026-04-10T02:10:00Z",
      },
      title: "변우석 광고 몸값 화제",
      source: "세계일보",
      url: "https://trends.google.com/trending/rss?geo=KR",
    },
    {
      rank: 3,
      issueKey: "첸백시-전속계약",
      issueTitle: "첸백시 전속계약 해지 통보",
      articleCount: 2,
      relatedArticles: [
        { title: "첸백시 전속계약 해지 통보", source: "Daum", url: "https://trends.google.com/trending/rss?geo=KR" },
      ],
      representativeArticle: {
        title: "첸백시 전속계약 해지 통보",
        source: "Daum",
        url: "https://trends.google.com/trending/rss?geo=KR",
        publishedAt: "2026-04-10T01:40:00Z",
      },
      title: "첸백시 전속계약 해지 통보",
      source: "Daum",
      url: "https://trends.google.com/trending/rss?geo=KR",
    },
    {
      rank: 4,
      issueKey: "백현-inb100-계약",
      issueTitle: "백현 INB100 계약 이슈",
      articleCount: 2,
      relatedArticles: [
        { title: "백현 INB100 계약 이슈", source: "뉴시스", url: "https://trends.google.com/trending/rss?geo=KR" },
      ],
      representativeArticle: {
        title: "백현 INB100 계약 이슈",
        source: "뉴시스",
        url: "https://trends.google.com/trending/rss?geo=KR",
        publishedAt: "2026-04-10T01:15:00Z",
      },
      title: "백현 INB100 계약 이슈",
      source: "뉴시스",
      url: "https://trends.google.com/trending/rss?geo=KR",
    },
    {
      rank: 5,
      issueKey: "연예계-부동산-매입",
      issueTitle: "연예계 부동산 매입 이슈",
      articleCount: 2,
      relatedArticles: [
        { title: "연예계 부동산 매입 이슈", source: "조선일보", url: "https://trends.google.com/trending/rss?geo=KR" },
      ],
      representativeArticle: {
        title: "연예계 부동산 매입 이슈",
        source: "조선일보",
        url: "https://trends.google.com/trending/rss?geo=KR",
        publishedAt: "2026-04-10T00:50:00Z",
      },
      title: "연예계 부동산 매입 이슈",
      source: "조선일보",
      url: "https://trends.google.com/trending/rss?geo=KR",
    },
    {
      rank: 6,
      issueKey: "아이돌-소속사-계약",
      issueTitle: "아이돌 소속사 계약 흐름",
      articleCount: 2,
      relatedArticles: [
        { title: "아이돌 소속사 계약 흐름", source: "NewsBox Sample", url: "https://trends.google.com/trending/rss?geo=KR" },
      ],
      representativeArticle: {
        title: "아이돌 소속사 계약 흐름",
        source: "NewsBox Sample",
        url: "https://trends.google.com/trending/rss?geo=KR",
        publishedAt: "2026-04-10T00:20:00Z",
      },
      title: "아이돌 소속사 계약 흐름",
      source: "NewsBox Sample",
      url: "https://trends.google.com/trending/rss?geo=KR",
    },
    {
      rank: 7,
      issueKey: "배우-화보-광고",
      issueTitle: "배우 화보·광고 화제성",
      articleCount: 2,
      relatedArticles: [
        { title: "배우 화보·광고 화제성", source: "NewsBox Sample", url: "https://trends.google.com/trending/rss?geo=KR" },
      ],
      representativeArticle: {
        title: "배우 화보·광고 화제성",
        source: "NewsBox Sample",
        url: "https://trends.google.com/trending/rss?geo=KR",
        publishedAt: "2026-04-09T23:50:00Z",
      },
      title: "배우 화보·광고 화제성",
      source: "NewsBox Sample",
      url: "https://trends.google.com/trending/rss?geo=KR",
    },
    {
      rank: 8,
      issueKey: "방송-드라마-키워드",
      issueTitle: "방송·드라마 키워드 집계",
      articleCount: 1,
      relatedArticles: [
        { title: "방송·드라마 키워드 집계", source: "NewsBox Sample", url: "https://trends.google.com/trending/rss?geo=KR" },
      ],
      representativeArticle: {
        title: "방송·드라마 키워드 집계",
        source: "NewsBox Sample",
        url: "https://trends.google.com/trending/rss?geo=KR",
        publishedAt: "2026-04-09T23:20:00Z",
      },
      title: "방송·드라마 키워드 집계",
      source: "NewsBox Sample",
      url: "https://trends.google.com/trending/rss?geo=KR",
    },
    {
      rank: 9,
      issueKey: "음악-공연-뉴스",
      issueTitle: "음악·공연 뉴스 신호",
      articleCount: 1,
      relatedArticles: [
        { title: "음악·공연 뉴스 신호", source: "NewsBox Sample", url: "https://trends.google.com/trending/rss?geo=KR" },
      ],
      representativeArticle: {
        title: "음악·공연 뉴스 신호",
        source: "NewsBox Sample",
        url: "https://trends.google.com/trending/rss?geo=KR",
        publishedAt: "2026-04-09T22:55:00Z",
      },
      title: "음악·공연 뉴스 신호",
      source: "NewsBox Sample",
      url: "https://trends.google.com/trending/rss?geo=KR",
    },
    {
      rank: 10,
      issueKey: "다음-연예-트렌드",
      issueTitle: "다음 연예 트렌드 수집 중",
      articleCount: 1,
      relatedArticles: [
        { title: "다음 연예 트렌드 수집 중", source: "Google Trends", url: "https://trends.google.com/trending/rss?geo=KR" },
      ],
      representativeArticle: {
        title: "다음 연예 트렌드 수집 중",
        source: "Google Trends",
        url: "https://trends.google.com/trending/rss?geo=KR",
        publishedAt: "2026-04-09T22:20:00Z",
      },
      title: "다음 연예 트렌드 수집 중",
      source: "Google Trends",
      url: "https://trends.google.com/trending/rss?geo=KR",
    },
  ],
};

const UNITY_SPOTLIGHT_FALLBACK = {
  tab: "unity",
  type: "release-and-videos",
  source: "Unity Releases + Unity Korea YouTube",
  sourceMode: "fallback",
  lastUpdatedAt: "2026-04-13T00:00:00.000Z",
  title: "Unity Latest Release",
  description: "최신 Unity 릴리스와 Unity Korea 공식 채널 영상을 함께 보여줍니다.",
  release: {
    title: "Unity Latest Release",
    familyLabel: "Unity 6.3",
    version: "6000.3.13f1",
    releasedAt: "2026-04-08T00:00:00.000Z",
    releaseNotesUrl: "https://unity.com/releases/editor/whats-new/6000.3.13f1",
    linkLabel: "릴리스 노트",
  },
  videoCount: 2,
  videos: [
    {
      id: "aDQcdeps73c",
      title: "조용하지만 강력한 유니티 6.4 업데이트",
      url: "https://www.youtube.com/watch?v=aDQcdeps73c",
      publishedAt: "2026-04-08T03:02:47.000Z",
      thumbnailUrl: "https://i2.ytimg.com/vi/aDQcdeps73c/hqdefault.jpg",
    },
    {
      id: "H7aVy48mAVU",
      title: "Unity Roadshow 2026 – 세션 3. 유니티 메모리와 가비지 컬렉터 딥다이브",
      url: "https://www.youtube.com/watch?v=H7aVy48mAVU",
      publishedAt: "2026-04-07T02:03:25.000Z",
      thumbnailUrl: "https://i1.ytimg.com/vi/H7aVy48mAVU/hqdefault.jpg",
    },
  ],
  releaseSourceUrl: "https://unity.com/releases/editor/latest",
  videosSourceUrl: "https://www.youtube.com/feeds/videos.xml?channel_id=UCQArZVLg7Omzg4cBReJTS3w",
  channelUrl: "https://www.youtube.com/channel/UCQArZVLg7Omzg4cBReJTS3w",
  channelName: "Unity Korea",
};

const GAME_SPOTLIGHT_FALLBACK = {
  tab: "game",
  type: "free-games-and-issues",
  source: "Epic Games Store + Ruliweb BEST 뉴스 + Inven 주요뉴스",
  sourceMode: "fallback",
  lastUpdatedAt: "2026-04-13T00:00:00.000Z",
  title: "에픽게임즈 이주의 무료게임",
  description: "Epic Games Store KR 무료 배포와 루리웹·인벤 인기 게임 이슈를 함께 보여줍니다.",
  sourceUrl: "https://store.epicgames.com/ko/free-games",
  itemCount: 2,
  offers: [
    {
      id: "9f67865fcf0749a58f4d35827473266f",
      title: "토막: 지구를 지켜라 리제네레이션",
      seller: "NETMARBLE MONSTER",
      url: "https://store.epicgames.com/ko/p/tomak-save-the-earth-regeneration-c1207c",
      imageUrl:
        "https://cdn1.epicgames.com/spt-assets/603c0097f96047c38bc199331b5cf95b/tomak--save-the-earth-regeneration-l1n5k.png",
      originalPriceLabel: "₩9,200",
      freeUntil: "2026-04-16T15:00:00.000Z",
    },
    {
      id: "bc9b3091841840ad974ff525873d48c1",
      title: "Prop Sumo",
      seller: "Barrel Roll Games GmbH & Co. KG",
      url: "https://store.epicgames.com/ko/p/propsumo-ca8bd7",
      imageUrl:
        "https://cdn1.epicgames.com/spt-assets/a965174568cb492ca3ebbe7a95886261/propsumo-jc5go.png",
      originalPriceLabel: "₩10,200",
      freeUntil: "2026-04-16T15:00:00.000Z",
    },
  ],
  issues: {
    ruliweb: {
      label: "루리웹 BEST 뉴스",
      source: "Ruliweb BEST 뉴스",
      sourceUrl: "https://bbs.ruliweb.com/best",
      items: [
        {
          title: "하운드13, '드래곤소드 : 어웨이크닝' 스팀 페이지 및 7월 발매 공개",
          url: "https://bbs.ruliweb.com/news/read/223350",
          meta: "댓글 51",
        },
        {
          title: "익숙함을 깨는 힘, ‘니케’가 여전히 기대되는 이유 — 정재성·주종현 디렉터 인터뷰",
          url: "https://bbs.ruliweb.com/news/read/223198",
          meta: "댓글 37",
        },
        {
          title: "㈜엔씨, 유튜브 채널 '영래기' 운영자에 대한 법적 대응 진행",
          url: "https://bbs.ruliweb.com/news/read/223178",
          meta: "댓글 46",
        },
        {
          title: "몬스터와 함께 DIVE, '몬길 : 스타 다이브' 첫 번째 쇼케이스",
          url: "https://bbs.ruliweb.com/news/read/223241",
          meta: "댓글 23",
        },
        {
          title: "넷마블, 계열사 ‘코웨이’ 주식 1,500억원 규모 장내 매수 추진",
          url: "https://bbs.ruliweb.com/news/read/223160",
          meta: "댓글 4",
        },
      ],
    },
    inven: {
      label: "인벤 주요뉴스",
      source: "Inven 주요뉴스",
      sourceUrl: "https://www.inven.co.kr/webzine/news/?hotnews=1",
      items: [
        {
          title: "‘명일방주: 엔드필드’ 대규모 업데이트, ‘봄날의 새벽’ 공개",
          url: "https://www.inven.co.kr/webzine/news/?news=315363",
          meta: "명일방주: 엔드필드 · 2시간 전",
        },
        {
          title: "카오스 제로 나이트메어, 18일 반주년 쇼케이스 영상 공개",
          url: "https://www.inven.co.kr/webzine/news/?news=315361",
          meta: "카오스 제로 나이트메어 · 2시간 전",
        },
        {
          title: "로지텍, 공식 앰배서더 '로지텍 G 히어로즈' 1기 모집",
          url: "https://www.inven.co.kr/webzine/news/?news=315360",
          meta: "2시간 전",
        },
        {
          title: "스틸시리즈, 에어록스 3 Gen 2 런칭 기념 매달 '에임 마스터 대회' 개최",
          url: "https://www.inven.co.kr/webzine/news/?news=315359",
          meta: "2시간 전",
        },
        {
          title: "토치라이트: 인피니트, SS12 루나리아 프리뷰 공개",
          url: "https://www.inven.co.kr/webzine/news/?news=315356",
          meta: "토치라이트 인피니트 · 3시간 전",
        },
      ],
    },
  },
};

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
    key: "esports",
    label: "e스포츠",
    kicker: "Competitive Play & Schedule",
    description: "LCK, MSI, Worlds 일정과 e스포츠 기사를 한 흐름으로 확인하는 탭",
    heroLead: "LCK 일정이 우선 표시되고, 국제전 기간에는 MSI와 Worlds 스포트라이트로 자연스럽게 전환됩니다.",
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
    version: "0.7.0-fallback",
    sourceMode: "fallback",
    sourceProvider: "sample",
    contentLocale: "ko-KR",
    lastUpdatedAt: "2026-04-09T15:00:00Z",
    tabCount: 5,
    totalArticleCount: 5,
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
    esports: {
      tab: "esports",
      label: "e스포츠",
      lastUpdatedAt: "2026-04-10T03:00:00Z",
      articleCount: 1,
      articles: [
        {
          id: "esports-fallback-1",
          title: "샘플: e스포츠 탭은 경기 일정 스포트라이트와 기사 리스트를 함께 보여줍니다",
          url: "https://example.com/newsbox/esports-fallback-1",
          source: "Sample Esports Wire",
          publishedAt: "2026-04-10T02:20:00Z",
          summary: "일정 데이터와 기사 카드가 동시에 로딩되지 않더라도 e스포츠 탭 전용 레이아웃이 무너지지 않도록 준비한 예비 기사입니다.",
          tab: "esports",
        },
      ],
    },
    },
  spotlights: {
    game: GAME_SPOTLIGHT_FALLBACK,
    entertainment: ENTERTAINMENT_TRENDS_FALLBACK,
    unity: UNITY_SPOTLIGHT_FALLBACK,
    esports: {
      tab: "esports",
      type: "league-schedule",
      source: "LoL Esports",
      sourceMode: "fallback",
      lastUpdatedAt: "2026-04-10T03:00:00Z",
      activeLeagueKey: "lck",
      activeLeagueLabel: "LCK",
      title: "경기 일정",
      description:
        "LCK 일정이 우선 표시되고, 리그 일정이 비는 기간에는 MSI와 Worlds 일정으로 자동 전환됩니다.",
      sourceUrl: "https://lolesports.com/en-US/leagues/lck",
      selectionRule: "LCK 우선 · 국제전 자동 전환",
      primaryTournamentName: "Split 2 2026",
      primaryBlockName: "Week 2",
      matchCount: 4,
      matches: [
        {
          id: "esports-match-fallback-1",
          leagueKey: "lck",
          leagueLabel: "LCK",
          tournamentName: "Split 2 2026",
          blockName: "Week 2",
          startTime: "2026-04-10T08:00:00Z",
          state: "unstarted",
          matchType: "Bo3",
          teams: [
            { name: "DN SOOPers", code: "DNS" },
            { name: "T1", code: "T1" },
          ],
          sourceUrl: "https://lolesports.com/en-US/leagues/lck",
        },
        {
          id: "esports-match-fallback-2",
          leagueKey: "lck",
          leagueLabel: "LCK",
          tournamentName: "Split 2 2026",
          blockName: "Week 2",
          startTime: "2026-04-10T10:00:00Z",
          state: "unstarted",
          matchType: "Bo3",
          teams: [
            { name: "Hanwha Life Esports", code: "HLE" },
            { name: "BNK FEARX", code: "BFX" },
          ],
          sourceUrl: "https://lolesports.com/en-US/leagues/lck",
        },
        {
          id: "esports-match-fallback-3",
          leagueKey: "lck",
          leagueLabel: "LCK",
          tournamentName: "Split 2 2026",
          blockName: "Week 2",
          startTime: "2026-04-11T08:00:00Z",
          state: "unstarted",
          matchType: "Bo3",
          teams: [
            { name: "NONGSHIM RED FORCE", code: "NS" },
            { name: "KIWOOM DRX", code: "DRX" },
          ],
          sourceUrl: "https://lolesports.com/en-US/leagues/lck",
        },
        {
          id: "esports-match-fallback-4",
          leagueKey: "lck",
          leagueLabel: "LCK",
          tournamentName: "Split 2 2026",
          blockName: "Week 2",
          startTime: "2026-04-11T10:00:00Z",
          state: "unstarted",
          matchType: "Bo3",
          teams: [
            { name: "Dplus KIA", code: "DK" },
            { name: "Gen.G Esports", code: "GEN" },
          ],
          sourceUrl: "https://lolesports.com/en-US/leagues/lck",
        },
      ],
    },
  },
};

const state = {
  metadata: null,
  datasets: new Map(),
  spotlights: new Map(),
  standings: null,
  activeTab: getValidTabKey(window.location.hash.replace("#", "")) || "ai",
  activeGameTab: "epic",
  activeEsportsTab: "standings",
  activeUnityTab: "release",
  isFallback: false,
  isLoading: false,
  clockTimer: null,
  marqueeTimer: null,
  marqueeIndex: 0,
};

const elements = {
  tabList: document.querySelector("#tabList"),
  heroTitle: document.querySelector("#heroTitle"),
  sectionKicker: document.querySelector("#sectionKicker"),
  sectionTitle: document.querySelector("#sectionTitle"),
  sectionDescription: document.querySelector("#sectionDescription"),
  heroSummary: document.querySelector("#heroSummary"),
  heroSchedule: document.querySelector("#heroSchedule"),
  heroScheduleList: document.querySelector("#heroScheduleList"),
  heroPanel: document.querySelector("#heroPanel"),
  heroPanelDefault: document.querySelector("#heroPanelDefault"),
  heroPanelAi: document.querySelector("#heroPanelAi"),
  aiPanelView: document.querySelector("#aiPanelView"),
  heroPanelEntertainment: document.querySelector("#heroPanelEntertainment"),
  entertainmentPanelView: document.querySelector("#entertainmentPanelView"),
  heroPanelGame: document.querySelector("#heroPanelGame"),
  gamePanelView: document.querySelector("#gamePanelView"),
  heroPanelEsports: document.querySelector("#heroPanelEsports"),
  esportsPanelView: document.querySelector("#esportsPanelView"),
  heroPanelUnity: document.querySelector("#heroPanelUnity"),
  unityPanelView: document.querySelector("#unityPanelView"),
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

  document.querySelectorAll('[data-esports-tab]').forEach((button) => {
    button.addEventListener("click", () => {
      const next = button.dataset.esportsTab;
      if (!next || next === state.activeEsportsTab) return;
      state.activeEsportsTab = next;
      renderEsportsPanel();
    });
  });

  document.querySelectorAll('[data-unity-tab]').forEach((button) => {
    button.addEventListener("click", () => {
      const next = button.dataset.unityTab;
      if (!next || next === state.activeUnityTab) return;
      state.activeUnityTab = next;
      renderUnityPanel(state.spotlights.get("unity") ?? UNITY_SPOTLIGHT_FALLBACK);
    });
  });

  document.querySelectorAll('[data-game-tab]').forEach((button) => {
    button.addEventListener("click", () => {
      const next = button.dataset.gameTab;
      if (!next || next === state.activeGameTab) return;
      state.activeGameTab = next;
      renderGamePanel(
        state.spotlights.get("game") ?? GAME_SPOTLIGHT_FALLBACK,
        getSortedArticles((state.datasets.get("game") ?? {}).articles ?? [])[0] ?? null,
        (state.datasets.get("game") ?? {}).articleCount ?? (state.datasets.get("game")?.articles?.length ?? 0),
      );
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
  const isEsportsTab = activeConfig.key === "esports";
  const isGameTab = activeConfig.key === "game";
  const isEntertainmentTab = activeConfig.key === "entertainment";
  const isUnityTab = activeConfig.key === "unity";
  const esportsSpotlight = isEsportsTab ? state.spotlights.get("esports") ?? null : null;
  const gameSpotlight = isGameTab
    ? state.spotlights.get("game") ?? GAME_SPOTLIGHT_FALLBACK
    : null;
  const entertainmentSpotlight = isEntertainmentTab
    ? state.spotlights.get("entertainment") ?? ENTERTAINMENT_TRENDS_FALLBACK
    : null;
  const unitySpotlight = isUnityTab
    ? state.spotlights.get("unity") ?? UNITY_SPOTLIGHT_FALLBACK
    : null;
  const spotlightArticle = isEsportsTab ? null : articles[0] ?? null;
  const feedArticles = isEsportsTab ? articles : spotlightArticle ? articles.slice(1) : articles;
  const totalArticles = getTotalArticleCount();
  const visibleArticles = isEsportsTab
    ? feedArticles.length
    : spotlightArticle
      ? feedArticles.length + 1
      : feedArticles.length;
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

  if (isEsportsTab) {
    applyEsportsHeroContent(activeConfig, esportsSpotlight, feedArticles.length, lastUpdatedAt);
  } else {
    stopMarquee();
    applyHeroContent(activeConfig, spotlightArticle, articles.length, lastUpdatedAt, {
      gameSpotlight,
      entertainmentSpotlight,
      unitySpotlight,
    });
  }
  setStatus(getStatusMessage());
  renderTabs();
  renderArticles(feedArticles, activeConfig.label);
}

function applyHeroContent(activeConfig, spotlightArticle, articleCount, lastUpdatedAt, panelSpotlights = {}) {
  const gameSpotlight = panelSpotlights.gameSpotlight ?? null;
  const entertainmentSpotlight = panelSpotlights.entertainmentSpotlight ?? null;
  const unitySpotlight = panelSpotlights.unitySpotlight ?? null;

  elements.heroSchedule.hidden = true;
  elements.heroScheduleList.replaceChildren();
  elements.heroPanel.classList.remove("is-esports");
  elements.heroPanel.classList.toggle("is-ai", activeConfig.key === "ai");
  elements.heroPanel.classList.toggle("is-game", activeConfig.key === "game");
  elements.heroPanel.classList.toggle("is-entertainment", activeConfig.key === "entertainment");
  elements.heroPanel.classList.toggle("is-unity", activeConfig.key === "unity");

  if (activeConfig.key === "ai") {
    renderAiPanel();
  }

  if (activeConfig.key === "entertainment") {
    renderEntertainmentPanel(entertainmentSpotlight);
  }

  if (activeConfig.key === "game") {
    renderGamePanel(gameSpotlight, spotlightArticle, articleCount);
  }

  if (activeConfig.key === "unity") {
    renderUnityPanel(unitySpotlight);
  }

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
    150,
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

function applyEsportsHeroContent(activeConfig, spotlight, articleCount, lastUpdatedAt) {
  const matches = getSortedMatches(spotlight?.matches ?? []);

  elements.heroSchedule.hidden = false;
  renderHeroSchedule(matches);
  elements.heroTitle.textContent = spotlight?.title || "경기 일정";
  elements.sectionDescription.textContent = "";
  elements.heroSummary.textContent = "";

  elements.heroPanel.classList.remove("is-ai");
  elements.heroPanel.classList.remove("is-game");
  elements.heroPanel.classList.remove("is-entertainment");
  elements.heroPanel.classList.remove("is-unity");
  elements.heroPanel.classList.add("is-esports");
  renderEsportsPanel();

  elements.spotlightLink.href = spotlight?.sourceUrl || "#articleFeed";
  elements.spotlightLink.target = spotlight?.sourceUrl ? "_blank" : "_self";
  if (spotlight?.sourceUrl) {
    elements.spotlightLink.rel = "noreferrer";
  } else {
    elements.spotlightLink.removeAttribute("rel");
  }
  elements.spotlightLink.textContent = "공식 일정 보기";
}

function renderAiPanel() {
  const view = elements.aiPanelView;
  if (!view) return;

  view.replaceChildren();

  const header = document.createElement("header");
  header.className = "ai-panel__header";
  header.innerHTML = `
    <p class="ai-panel__eyebrow">AI landscape</p>
    <h2 class="ai-panel__title">분야별 대표 AI</h2>
    <p class="ai-panel__body">
      AI 기사와 함께 자주 거론되는 대표 서비스를 종류별로 가볍게 묶었습니다.
    </p>
  `;

  const groups = document.createElement("div");
  groups.className = "ai-panel__groups";

  AI_PANEL_GROUPS.forEach((group) => {
    const section = document.createElement("section");
    section.className = "ai-panel__group";

    const heading = document.createElement("div");
    heading.className = "ai-panel__group-head";
    heading.innerHTML = `
      <p class="ai-panel__group-label">${group.label}</p>
      <span class="ai-panel__group-count">${group.items.length}</span>
    `;

    const list = document.createElement("div");
    list.className = "ai-panel__tool-list";

    group.items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "ai-panel__tool";
      card.style.setProperty("--ai-tool-accent", item.accent);
      card.innerHTML = `
        <span class="ai-panel__tool-icon" aria-hidden="true">${item.badge}</span>
        <span class="ai-panel__tool-name">${item.name}</span>
      `;
      list.append(card);
    });

    section.append(heading, list);
    groups.append(section);
  });

  const footer = document.createElement("p");
  footer.className = "ai-panel__footer";
  footer.textContent = "대표 서비스 기준 · 실시간 인기 순위는 아닙니다.";

  view.append(header, groups, footer);
}

function renderGamePanel(spotlight, spotlightArticle, articleCount) {
  const view = elements.gamePanelView;
  if (!view) return;

  view.replaceChildren();

  if (state.activeGameTab === "issue") {
    renderGameIssuePanel(view, spotlight);
  } else {
    renderEpicFreeGamesPanel(view, spotlight);
  }

  syncGameTabButtons();
}

function syncGameTabButtons() {
  const buttons = document.querySelectorAll("[data-game-tab]");
  buttons.forEach((button) => {
    const isActive = button.dataset.gameTab === state.activeGameTab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

function renderEpicFreeGamesPanel(view, spotlight) {
  const offers = getGameOffers(spotlight);
  const shell = document.createElement("section");
  shell.className = "game-freebies";

  const header = document.createElement("header");
  header.className = "game-freebies__header";

  const heading = document.createElement("div");
  heading.className = "game-freebies__heading";

  const eyebrow = document.createElement("p");
  eyebrow.className = "game-freebies__eyebrow";
  eyebrow.textContent = "Epic Games Store KR";

  const meta = document.createElement("p");
  meta.className = "game-freebies__meta";
  meta.textContent = getSpotlightUpdatedAtText(spotlight);

  heading.append(eyebrow, meta);

  const sourceLink = document.createElement("a");
  sourceLink.className = "game-freebies__link";
  sourceLink.href = spotlight?.sourceUrl || GAME_SPOTLIGHT_FALLBACK.sourceUrl;
  sourceLink.target = "_blank";
  sourceLink.rel = "noreferrer";
  sourceLink.textContent = "공식 페이지";

  header.append(heading, sourceLink);

  const grid = document.createElement("div");
  grid.className = "game-freebies__grid";

  offers.forEach((offer) => {
    const card = document.createElement("a");
    card.className = "game-freebies__card";
    card.href = offer.url;
    card.target = "_blank";
    card.rel = "noreferrer";

    const thumb = document.createElement("span");
    thumb.className = "game-freebies__thumb";

    const image = document.createElement("img");
    image.src = offer.imageUrl;
    image.alt = offer.title;
    image.loading = "lazy";
    thumb.append(image);

    const copy = document.createElement("span");
    copy.className = "game-freebies__copy";

    const seller = document.createElement("span");
    seller.className = "game-freebies__seller";
    seller.textContent = offer.seller || "Epic Games Store";

    const offerTitle = document.createElement("strong");
    offerTitle.className = "game-freebies__card-title";
    offerTitle.textContent = offer.title;

    const price = document.createElement("span");
    price.className = "game-freebies__price";
    price.textContent = `정가 ${offer.originalPriceLabel || "확인 중"}`;

    const deadline = document.createElement("span");
    deadline.className = "game-freebies__deadline";
    deadline.textContent = formatGameFreeUntil(offer.freeUntil);

    copy.append(seller, offerTitle, price, deadline);
    card.append(thumb, copy);
    grid.append(card);
  });

  shell.append(header, grid);
  view.append(shell);
}

function renderGameIssuePanel(view, spotlight) {
  const sources = getGameIssueSources(spotlight);
  const shell = document.createElement("section");
  shell.className = "game-issue";

  const sourceGrid = document.createElement("div");
  sourceGrid.className = "game-issue__sources";

  sources.forEach((source) => {
    const section = document.createElement("section");
    section.className = "game-issue__source";

    const head = document.createElement("div");
    head.className = "game-issue__source-head";

    const title = document.createElement("h3");
    title.className = "game-issue__source-title";
    title.textContent = source.label;

    const link = document.createElement("a");
    link.className = "game-issue__source-link";
    link.href = source.sourceUrl;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "바로가기";

    head.append(title, link);

    const list = document.createElement("ol");
    list.className = "game-issue__list";

    source.items.forEach((item, index) => {
      const listItem = document.createElement("li");
      listItem.className = "game-issue__item";

      const itemLink = document.createElement("a");
      itemLink.className = "game-issue__item-link";
      itemLink.href = item.url || source.sourceUrl;
      itemLink.target = "_blank";
      itemLink.rel = "noreferrer";

      const rank = document.createElement("span");
      rank.className = "game-issue__rank";
      rank.textContent = String(index + 1);

      const copy = document.createElement("span");
      copy.className = "game-issue__copy";

      const itemTitle = document.createElement("span");
      itemTitle.className = "game-issue__item-title";
      itemTitle.textContent = item.title;

      const meta = document.createElement("span");
      meta.className = "game-issue__item-meta";
      meta.textContent = item.meta || source.source;

      copy.append(itemTitle, meta);
      itemLink.append(rank, copy);
      listItem.append(itemLink);
      list.append(listItem);
    });

    section.append(head, list);
    sourceGrid.append(section);
  });

  shell.append(sourceGrid);
  view.append(shell);
}

function renderEntertainmentPanel(spotlight) {
  const view = elements.entertainmentPanelView;
  if (!view) return;

  view.replaceChildren();

  const rankingLimit = spotlight?.rankingLimit ?? 10;
  const liveItems = Array.isArray(spotlight?.items) ? spotlight.items : [];
  const fallbackItems = state.isFallback ? ENTERTAINMENT_TRENDS_FALLBACK.items : [];
  const items = liveItems.length > 0 ? liveItems : fallbackItems;
  const sourceLabel = getEntertainmentSourceLabel(spotlight);

  const header = document.createElement("header");
  header.className = "entertainment-panel__header";
  header.innerHTML = `
    <div class="entertainment-panel__title-row">
      <h2 class="entertainment-panel__title">${spotlight?.title ?? "연예 화제 1~10위"}</h2>
      <p class="entertainment-panel__updated-time">${getSpotlightUpdatedAtText(spotlight)}</p>
    </div>
  `;

  const titleElement = header.querySelector(".entertainment-panel__title");
  if (titleElement) {
    titleElement.textContent = spotlight?.title ?? "Hot Issue";
  }

  const titleRow = header.querySelector(".entertainment-panel__title-row");
  const updatedTimeElement = header.querySelector(".entertainment-panel__updated-time");
  if (titleRow && updatedTimeElement) {
    const meta = document.createElement("div");
    meta.className = "entertainment-panel__meta";

    const source = document.createElement("p");
    source.className = "entertainment-panel__source";
    source.textContent = sourceLabel;

    meta.append(source, updatedTimeElement);
    titleRow.append(meta);
  }

  const list = document.createElement("div");
  list.className = "entertainment-panel__list";

  for (let index = 0; index < rankingLimit; index += 1) {
    const item = items[index] ?? null;
    const representativeArticle = getEntertainmentRepresentativeArticle(item);
    const issueUrl = representativeArticle?.url || item?.url || null;
    const issueCount = getEntertainmentIssueCount(item);
    const row = document.createElement(issueUrl ? "a" : "div");
    row.className = `entertainment-panel__row${item ? "" : " entertainment-panel__row--empty"}`;
    row.setAttribute("role", "listitem");

    if (issueUrl) {
      row.href = issueUrl;
      row.target = "_blank";
      row.rel = "noreferrer";
    }

    const displayRank = item?.rank ?? index + 1;
    const countLabel = issueCount ? `${issueCount}건` : "-";
    const metaLabel = item
      ? [
          representativeArticle?.source || item.source || "Google Trends",
          representativeArticle?.publishedAt
            ? formatRelativeTime(representativeArticle.publishedAt)
            : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : "다음 연예 이슈 수집 중";

    row.innerHTML = `
      <span class="entertainment-panel__rank">${displayRank}</span>
      <span class="entertainment-panel__copy">
        <strong class="entertainment-panel__item-title">${getEntertainmentIssueTitle(item) || "수집 중"}</strong>
        <span class="entertainment-panel__item-meta">${metaLabel}</span>
      </span>
      <span class="entertainment-panel__traffic">${countLabel}</span>
    `;

    list.append(row);
  }

  view.append(header, list);
}

function renderUnityPanel(spotlight) {
  const view = elements.unityPanelView;
  if (!view) return;

  view.replaceChildren();

  if (state.activeUnityTab === "hidden") {
    renderUnityHiddenPanel(view);
  } else {
    renderUnityReleasePanel(view, spotlight);
  }

  syncUnityTabButtons();
}

function syncUnityTabButtons() {
  const buttons = document.querySelectorAll("[data-unity-tab]");
  buttons.forEach((button) => {
    const isActive = button.dataset.unityTab === state.activeUnityTab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

function renderUnityReleasePanel(view, spotlight) {
  const release = getUnityRelease(spotlight);
  const videos = getUnityVideos(spotlight);
  const channelName = spotlight?.channelName ?? UNITY_SPOTLIGHT_FALLBACK.channelName ?? "Unity Korea";
  const releaseDateLabel = release.releasedAt
    ? `발표일 ${formatDateOnly(release.releasedAt)}`
    : "발표일 확인 중";

  const shell = document.createElement("section");
  shell.className = "unity-release";

  const hero = document.createElement("header");
  hero.className = "unity-release__hero";
  const eyebrow = document.createElement("p");
  eyebrow.className = "unity-release__eyebrow";
  eyebrow.textContent = release.title ?? "Unity Latest Release";

  const titleRow = document.createElement("div");
  titleRow.className = "unity-release__title-row";

  const version = document.createElement("h2");
  version.className = "unity-release__version";
  version.textContent = release.version ?? "업데이트 확인 중";

  const family = document.createElement("span");
  family.className = "unity-release__family";
  family.textContent = release.familyLabel ?? "Unity Editor";

  titleRow.append(version, family);

  const meta = document.createElement("div");
  meta.className = "unity-release__meta";

  const date = document.createElement("span");
  date.className = "unity-release__date";
  date.textContent = releaseDateLabel;

  const notesLink = document.createElement("a");
  notesLink.className = "unity-release__link";
  notesLink.href = release.releaseNotesUrl || "https://unity.com/releases/editor/latest";
  notesLink.target = "_blank";
  notesLink.rel = "noreferrer";
  notesLink.textContent = release.linkLabel ?? "릴리스 노트";

  meta.append(date, notesLink);
  hero.append(eyebrow, titleRow, meta);

  const divider = document.createElement("div");
  divider.className = "unity-release__divider";
  divider.setAttribute("aria-hidden", "true");

  const videoSection = document.createElement("section");
  videoSection.className = "unity-release__videos";

  const videoHeader = document.createElement("header");
  videoHeader.className = "unity-release__videos-head";
  const videoHeadingGroup = document.createElement("div");
  videoHeadingGroup.className = "unity-release__videos-heading";

  const videoTitleRow = document.createElement("div");
  videoTitleRow.className = "unity-release__videos-title-row";

  const videoKicker = document.createElement("p");
  videoKicker.className = "unity-release__videos-kicker";
  videoKicker.textContent = `${channelName} YouTube`;

  const videoCount = document.createElement("span");
  videoCount.className = "unity-release__videos-count";
  videoCount.textContent = `최신영상 ${videos.length}개`;

  videoTitleRow.append(videoKicker, videoCount);
  videoHeadingGroup.append(videoTitleRow);

  const channelLink = document.createElement("a");
  channelLink.className = "unity-release__videos-link";
  channelLink.href = spotlight?.channelUrl || UNITY_SPOTLIGHT_FALLBACK.channelUrl;
  channelLink.target = "_blank";
  channelLink.rel = "noreferrer";
  channelLink.textContent = "공식 채널";

  videoHeader.append(videoHeadingGroup, channelLink);

  const grid = document.createElement("div");
  grid.className = "unity-video-grid";

  videos.forEach((video) => {
    const card = document.createElement("a");
    card.className = "unity-video-card";
    card.href = video.url;
    card.target = "_blank";
    card.rel = "noreferrer";

    const thumb = document.createElement("span");
    thumb.className = "unity-video-card__thumb";

    const image = document.createElement("img");
    image.src = video.thumbnailUrl;
    image.alt = video.title;
    image.loading = "lazy";
    thumb.append(image);

    const copy = document.createElement("span");
    copy.className = "unity-video-card__copy";

    const title = document.createElement("strong");
    title.className = "unity-video-card__title";
    title.textContent = video.title;

    const metaLabel = document.createElement("span");
    metaLabel.className = "unity-video-card__meta";
    metaLabel.textContent = formatRelativeTime(video.publishedAt);

    copy.append(title, metaLabel);
    card.append(thumb, copy);
    grid.append(card);
  });

  videoSection.append(videoHeader, grid);
  shell.append(hero, divider, videoSection);
  view.append(shell);
}

function renderUnityHiddenPanel(view) {
  const card = document.createElement("a");
  card.className = "unity-hidden";
  card.href = "https://www.unrealengine.com/";
  card.target = "_blank";
  card.rel = "noreferrer";
  card.setAttribute("aria-label", "Unreal Engine 공식 사이트 열기");
  card.innerHTML = `
    <span class="unity-hidden__eyebrow">Hidden</span>
    <span class="unity-hidden__mark" aria-hidden="true">
      <span class="unity-hidden__mark-letter">U</span>
    </span>
    <strong class="unity-hidden__title">Unreal Engine</strong>
    <span class="unity-hidden__body">클릭하면 공식 사이트로 이동합니다</span>
  `;

  view.append(card);
}

function getUnityRelease(spotlight) {
  return {
    ...UNITY_SPOTLIGHT_FALLBACK.release,
    ...(spotlight?.release ?? {}),
  };
}

function getGameOffers(spotlight) {
  const liveOffers = Array.isArray(spotlight?.offers) ? spotlight.offers : [];
  const fallbackOffers = GAME_SPOTLIGHT_FALLBACK.offers;
  const items = liveOffers.length > 0 ? liveOffers : fallbackOffers;
  return items.slice(0, 4);
}

function getGameIssueSources(spotlight) {
  const fallback = GAME_SPOTLIGHT_FALLBACK.issues;
  const liveIssues = spotlight?.issues ?? {};
  const sourceOrder = ["ruliweb", "inven"];

  return sourceOrder.map((key) => {
    const liveSource = liveIssues?.[key] ?? {};
    const fallbackSource = fallback[key];
    const items = Array.isArray(liveSource?.items) && liveSource.items.length > 0
      ? liveSource.items
      : fallbackSource.items;

    return {
      label: liveSource?.label || fallbackSource.label,
      source: liveSource?.source || fallbackSource.source,
      sourceUrl: liveSource?.sourceUrl || fallbackSource.sourceUrl,
      items: items.slice(0, 5),
    };
  });
}

function getUnityVideos(spotlight) {
  const liveVideos = Array.isArray(spotlight?.videos) ? spotlight.videos : [];
  const fallbackVideos = UNITY_SPOTLIGHT_FALLBACK.videos;
  const items = liveVideos.length > 0 ? liveVideos : fallbackVideos;
  return items.slice(0, 2);
}

function renderEsportsPanel() {
  stopMarquee();

  const standings = state.standings ?? LCK_STANDINGS_FALLBACK;
  const offSeason = Boolean(state.standings?.isOffSeason);
  const hasRows = Array.isArray(standings.rows) && standings.rows.length > 0;
  const forceMarquee = state.activeEsportsTab === "marquee";

  if (forceMarquee || offSeason || !hasRows) {
    renderLckMarquee(standings);
  } else {
    renderLckTable(standings);
  }

  syncEsportsTabButtons();
}

function syncEsportsTabButtons() {
  const buttons = document.querySelectorAll('[data-esports-tab]');
  buttons.forEach((button) => {
    const isActive = button.dataset.esportsTab === state.activeEsportsTab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

function renderLckTable(standings) {
  const view = elements.esportsPanelView;
  view.replaceChildren();

  const header = document.createElement("header");
  header.className = "lck-standings__header";
  header.innerHTML = `
    <p class="lck-standings__league">${standings.leagueLabel}</p>
    <div class="lck-standings__meta">
      <p class="lck-standings__updated">${standings.updatedLabel ?? "공식 데이터 기준"}</p>
      <p class="lck-standings__updated-time">${getStandingsUpdatedAtText(standings)}</p>
    </div>
  `;

  const table = document.createElement("div");
  table.className = "lck-standings";
  table.setAttribute("role", "table");
  table.setAttribute("aria-label", `${standings.leagueLabel} 순위`);

  const thead = document.createElement("div");
  thead.className = "lck-standings__row lck-standings__row--head";
  thead.setAttribute("role", "row");
  thead.innerHTML = `
    <span class="lck-standings__cell lck-standings__cell--rank" role="columnheader">#</span>
    <span class="lck-standings__cell lck-standings__cell--team" role="columnheader">팀</span>
    <span class="lck-standings__cell lck-standings__cell--record" role="columnheader">승-패</span>
    <span class="lck-standings__cell lck-standings__cell--points" role="columnheader">승점</span>
  `;
  table.append(thead);

  standings.rows.forEach((row) => {
    const logo = TEAM_LOGO_MAP[row.code] ?? row.image ?? null;

    const line = document.createElement("div");
    line.className = "lck-standings__row";
    line.setAttribute("role", "row");
    line.innerHTML = `
      <span class="lck-standings__cell lck-standings__cell--rank" role="cell">${row.rank}</span>
      <span class="lck-standings__cell lck-standings__cell--team" role="cell">
        ${
          logo
            ? `<span class="lck-standings__logo"><img src="${logo}" alt="${row.code}" loading="lazy" /></span>`
            : `<span class="lck-standings__logo lck-standings__logo--text">${row.code}</span>`
        }
        <span class="lck-standings__code">${row.code}</span>
      </span>
      <span class="lck-standings__cell lck-standings__cell--record" role="cell">${row.wins}-${row.losses}</span>
      <span class="lck-standings__cell lck-standings__cell--points" role="cell">${row.points}</span>
    `;
    table.append(line);
  });

  view.append(header, table);
}

function renderLckMarquee(standings) {
  const view = elements.esportsPanelView;
  view.replaceChildren();

  const header = document.createElement("header");
  header.className = "lck-standings__header";
  header.innerHTML = `
    <p class="lck-standings__league">${standings.leagueLabel ?? "LCK"}</p>
    <div class="lck-standings__meta">
      <p class="lck-standings__updated">${standings.updatedLabel ?? "팀 라인업 미리보기"}</p>
      <p class="lck-standings__updated-time">${getStandingsUpdatedAtText(standings)}</p>
    </div>
  `;

  const marquee = document.createElement("div");
  marquee.className = "lck-marquee";
  marquee.setAttribute("aria-label", "LCK 팀 라인업");

  const stage = document.createElement("div");
  stage.className = "lck-marquee__stage";
  marquee.append(stage);

  const rows = Array.isArray(standings.rows) && standings.rows.length > 0
    ? standings.rows
    : LCK_STANDINGS_FALLBACK.rows;

  if (rows.length === 0) {
    view.append(header, marquee);
    return;
  }

  state.marqueeIndex = 0;
  view.append(header, marquee);
  showMarqueeFrame(stage, rows, 0);

  if (rows.length > 1) {
    state.marqueeTimer = window.setInterval(() => {
      state.marqueeIndex = (state.marqueeIndex + 1) % rows.length;
      showMarqueeFrame(stage, rows, state.marqueeIndex);
    }, 2400);
  }
}

function showMarqueeFrame(stage, rows, index) {
  const row = rows[index];
  if (!row) return;
  const logo = TEAM_LOGO_MAP[row.code] ?? row.image ?? null;

  const frame = document.createElement("div");
  frame.className = "lck-marquee__frame";
  frame.innerHTML = logo
    ? `<img class="lck-marquee__logo" src="${logo}" alt="${row.name ?? row.code}" loading="lazy" />`
    : `<span class="lck-marquee__logo lck-marquee__logo--text">${row.code}</span>`;

  stage.replaceChildren(frame);
  requestAnimationFrame(() => frame.classList.add("is-shown"));
}

function stopMarquee() {
  if (state.marqueeTimer) {
    window.clearInterval(state.marqueeTimer);
    state.marqueeTimer = null;
  }
}

function renderHeroSchedule(matches) {
  elements.heroScheduleList.replaceChildren();

  if (matches.length === 0) {
    const emptyCard = document.createElement("article");
    emptyCard.className = "hero-match hero-match--empty";
    emptyCard.innerHTML = `
      <h3 class="hero-match__title">일정 데이터를 준비하고 있습니다</h3>
      <p class="hero-match__hint">
        공식 LoL Esports 일정 데이터를 읽어오지 못해도 레이아웃은 유지됩니다.
        다음 갱신 주기에서 다시 시도합니다.
      </p>
    `;
    elements.heroScheduleList.append(emptyCard);
    return;
  }

  const fragment = document.createDocumentFragment();

  matches.forEach((match) => {
    const card = document.createElement("article");
    card.className = `hero-match${isLiveMatch(match) ? " hero-match--live" : ""}`;

    const codes = document.createElement("div");
    codes.className = "hero-match__codes";
    codes.append(
      createTeamCodeBadge(match.teams?.[0]),
      createTeamCodeBadge(match.teams?.[1]),
    );

    const content = document.createElement("div");
    content.className = "hero-match__content";

    const title = document.createElement("h3");
    title.className = "hero-match__title";
    const [leftTeam, rightTeam] = match.teams ?? [];
    if (leftTeam?.imageUrl || rightTeam?.imageUrl) {
      title.classList.add("hero-match__title--logos");
      title.append(
        createTeamTitleLogo(leftTeam),
        createVsSeparator(),
        createTeamTitleLogo(rightTeam),
      );
    } else {
      title.textContent = buildMatchTitle(match);
    }

    const meta = document.createElement("p");
    meta.className = "hero-match__meta";
    meta.textContent = buildMatchMeta(match);

    content.append(title, meta);

    const timebox = document.createElement("div");
    timebox.className = "hero-match__timebox";

    const time = document.createElement("strong");
    time.className = "hero-match__time";
    time.textContent = isLiveMatch(match)
      ? "LIVE"
      : formatMatchTime(match.startTime);

    const day = document.createElement("span");
    day.className = "hero-match__day";
    day.textContent = formatMatchDay(match.startTime);

    timebox.append(time, day);
    card.append(codes, content, timebox);
    fragment.append(card);
  });

  elements.heroScheduleList.append(fragment);
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
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        window.location.hash = tab.key;
        window.scrollTo({ top: 0, behavior: "smooth" });
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

function createTeamCodeBadge(team) {
  const badge = document.createElement("span");
  badge.className = "hero-match__code";
  badge.textContent = team?.code || "TBD";
  badge.title = team?.name || "팀 정보 준비 중";
  return badge;
}

function createTeamTitleLogo(team) {
  const wrap = document.createElement("span");
  wrap.className = "hero-match__title-team";

  const src = TEAM_LOGO_MAP[team?.code] ?? team?.imageUrl ?? null;

  if (src) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = team?.name || team?.code || "TBD";
    img.className = "hero-match__title-img";
    img.addEventListener("error", () => {
      img.replaceWith(document.createTextNode(team?.code || "TBD"));
    });
    wrap.append(img);
  } else {
    wrap.textContent = team?.code || "TBD";
  }

  return wrap;
}

function createVsSeparator() {
  const span = document.createElement("span");
  span.className = "hero-match__vs";
  span.textContent = "vs";
  return span;
}

function buildMatchTitle(match) {
  const [leftTeam, rightTeam] = match.teams ?? [];
  return `${leftTeam?.name ?? "TBD"} vs ${rightTeam?.name ?? "TBD"}`;
}

function buildMatchMeta(match) {
  return [
    match.leagueLabel,
    match.tournamentName,
    match.blockName,
    match.matchType,
  ]
    .filter(Boolean)
    .join(" · ");
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

function getEntertainmentIssueTitle(item) {
  return item?.issueTitle || item?.title || item?.trendTitle || "";
}

function getEntertainmentRepresentativeArticle(item) {
  if (item?.representativeArticle) {
    return item.representativeArticle;
  }

  if (!item) {
    return null;
  }

  return {
    title: item.title || item.issueTitle || item.trendTitle || "",
    source: item.source || null,
    url: item.url || null,
    publishedAt: item.publishedAt || null,
  };
}

function getEntertainmentSourceLabel(spotlight) {
  const source = spotlight?.source || ENTERTAINMENT_TRENDS_FALLBACK.source;
  return `출처: ${source || "Google Trends KR"}`;
}

function getEntertainmentIssueCount(item) {
  const articleCount = Number(item?.articleCount);

  if (Number.isFinite(articleCount) && articleCount > 0) {
    return articleCount;
  }

  if (Array.isArray(item?.relatedArticles) && item.relatedArticles.length > 0) {
    return item.relatedArticles.length;
  }

  return null;
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
  if (activeConfig.key === "esports") {
    if (articleCount === 0) {
      return `공식 LoL Esports 일정 스포트라이트는 유지되고 있으며, e스포츠 기사 수집은 다음 주기를 기다리는 중입니다.`;
    }

    return `${activeConfig.description} ${REFRESH_SCHEDULE_LABEL} 갱신되며, 상단 일정 스포트라이트 아래에 기사 ${articleCount}건을 이어서 읽을 수 있습니다.`;
  }

  if (activeConfig.key === "entertainment") {
    const trendCount = state.spotlights.get("entertainment")?.itemCount ?? 0;
    return `${activeConfig.description} ${REFRESH_SCHEDULE_LABEL} 갱신되며, 우측 패널에서 Google Trends 연예 이슈 Top ${Math.max(10, trendCount || 10)}을 함께 볼 수 있습니다.`;
  }

  if (activeConfig.key === "game") {
    const freeGameCount = state.spotlights.get("game")?.itemCount ?? GAME_SPOTLIGHT_FALLBACK.itemCount;
    return `${activeConfig.description} ${REFRESH_SCHEDULE_LABEL} 갱신되며, 우측 패널에서 에픽 무료게임 ${Math.max(2, freeGameCount || 2)}개와 루리웹·인벤 게임 이슈를 함께 볼 수 있습니다.`;
  }

  if (activeConfig.key === "unity") {
    const videoCount = state.spotlights.get("unity")?.videoCount ?? UNITY_SPOTLIGHT_FALLBACK.videoCount;
    return `${activeConfig.description} ${REFRESH_SCHEDULE_LABEL} 갱신되며, 우측 패널에서 최신 릴리스와 Unity Korea 영상 ${Math.max(2, videoCount || 2)}개를 함께 볼 수 있습니다.`;
  }

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

  if (state.activeTab === "esports") {
    return `정적 JSON 기사와 공식 LoL Esports 일정 데이터를 함께 사용해 e스포츠 탭을 구성했습니다. 데이터는 ${REFRESH_SCHEDULE_LABEL} 갱신됩니다.`;
  }

  if (state.activeTab === "entertainment") {
    return `정적 JSON 기사와 Google Trends 연예 이슈 랭킹을 함께 사용해 연예 탭을 구성했습니다. 데이터는 ${REFRESH_SCHEDULE_LABEL} 갱신됩니다.`;
  }

  if (state.activeTab === "game") {
    return `정적 JSON 기사와 Epic Games Store 무료게임, 루리웹·인벤 게임 이슈 데이터를 함께 사용해 게임 탭을 구성했습니다. 데이터는 ${REFRESH_SCHEDULE_LABEL} 갱신됩니다.`;
  }

  if (state.activeTab === "unity") {
    return `정적 JSON 기사와 Unity 공식 릴리스·Unity Korea YouTube 데이터를 함께 사용해 Unity 탭을 구성했습니다. 데이터는 ${REFRESH_SCHEDULE_LABEL} 갱신됩니다.`;
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
    state.spotlights.has("entertainment") ? "연예 트렌드 연동" : null,
    state.spotlights.has("game") ? "에픽 무료게임·게임 이슈 연동" : null,
    state.spotlights.has("esports") ? "e스포츠 일정 연동" : null,
    state.spotlights.has("unity") ? "Unity 릴리스·Unity Korea 영상 연동" : null,
    `탭당 최대 ${articleLimit}건`,
    `갱신 ${REFRESH_SCHEDULE_LABEL}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

function getSortedArticles(articles = []) {
  return [...articles].sort(
    (left, right) => new Date(right.publishedAt) - new Date(left.publishedAt),
  );
}

function getSortedMatches(matches = []) {
  return [...matches].sort(
    (left, right) => new Date(left.startTime) - new Date(right.startTime),
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

function getStandingsUpdatedAtText(standings) {
  const updatedAt = standings?.lastUpdatedAt ?? standings?.fetchedAt ?? null;
  return updatedAt ? `최종 갱신 ${formatDateTime(updatedAt)}` : "최종 갱신 없음";
}

function getSpotlightUpdatedAtText(spotlight) {
  const updatedAt = spotlight?.lastUpdatedAt ?? spotlight?.fetchedAt ?? null;
  return updatedAt ? `최종 갱신 ${formatDateTime(updatedAt)}` : "최종 갱신 없음";
}

function formatDateOnly(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "날짜 확인 중";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: DISPLAY_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

function formatGameFreeUntil(value) {
  if (!value) {
    return "무료 종료 시각 확인 중";
  }

  return `무료 종료 ${formatDateTime(value)}`;
}

function formatClockTime(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: DISPLAY_TIMEZONE,
  }).format(new Date(value));
}

function formatMatchTime(value) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: DISPLAY_TIMEZONE,
  }).format(new Date(value));
}

function formatMatchDay(value) {
  const target = new Date(value);
  const targetParts = getTimeZoneDateParts(target);
  const todayParts = getTimeZoneDateParts(new Date());
  const targetDayStart = Date.UTC(
    targetParts.year,
    targetParts.month - 1,
    targetParts.day,
  );
  const todayDayStart = Date.UTC(
    todayParts.year,
    todayParts.month - 1,
    todayParts.day,
  );
  const diffDays = Math.round(
    (targetDayStart - todayDayStart) / (24 * 60 * 60 * 1000),
  );

  if (diffDays === 0) {
    return "오늘";
  }

  if (diffDays === 1) {
    return "내일";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    timeZone: DISPLAY_TIMEZONE,
  }).format(target);
}

function isLiveMatch(match) {
  return ["inprogress", "started", "live"].includes(
    String(match?.state || "").toLowerCase(),
  );
}

function getTimeZoneDateParts(value) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: DISPLAY_TIMEZONE,
  }).formatToParts(value);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value ?? 0),
    month: Number(parts.find((part) => part.type === "month")?.value ?? 1),
    day: Number(parts.find((part) => part.type === "day")?.value ?? 1),
  };
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
    const { metadata, datasets, spotlights, standings } = await loadJsonData(Date.now());
    state.metadata = metadata;
    state.datasets = datasets;
    state.spotlights = spotlights;
    state.standings = standings;
    state.isFallback = false;
  } catch (error) {
    console.warn("NewsBox 데이터 파일을 읽지 못해 fallback 데이터를 사용합니다.", error);
    state.metadata = FALLBACK_DATA.metadata;
    state.datasets = new Map(Object.entries(FALLBACK_DATA.tabs));
    state.spotlights = new Map(Object.entries(FALLBACK_DATA.spotlights ?? {}));
    state.standings = null;
    state.isFallback = true;
  } finally {
    state.isLoading = false;
    ensureHash();
    render();
  }
}

async function loadJsonData(cacheBust) {
  const metadataUrl = new URL("../data/metadata.json", import.meta.url);
  const [
    metadata,
    entertainmentSpotlightPayload,
    gameSpotlightPayload,
    esportsSpotlightPayload,
    unitySpotlightPayload,
    standingsPayload,
  ] = await Promise.all([
    fetchJson(metadataUrl, cacheBust),
    fetchOptionalJson(new URL("../data/spotlights/entertainment.json", import.meta.url), cacheBust),
    fetchOptionalJson(new URL("../data/spotlights/game.json", import.meta.url), cacheBust),
    fetchOptionalJson(new URL("../data/spotlights/esports.json", import.meta.url), cacheBust),
    fetchOptionalJson(new URL("../data/spotlights/unity.json", import.meta.url), cacheBust),
    fetchOptionalJson(new URL("../data/spotlights/lck-standings.json", import.meta.url), cacheBust),
  ]);
  const datasets = await Promise.all(
    TAB_CONFIG.map(async (tab) => {
      const datasetUrl = new URL(`../data/tabs/${tab.key}.json`, import.meta.url);
      const dataset = await fetchJson(datasetUrl, cacheBust);
      return [tab.key, dataset];
    }),
  );

  const spotlights = new Map();
  if (entertainmentSpotlightPayload) {
    spotlights.set("entertainment", entertainmentSpotlightPayload);
  }
  if (gameSpotlightPayload) {
    spotlights.set("game", gameSpotlightPayload);
  }
  if (esportsSpotlightPayload) {
    spotlights.set("esports", esportsSpotlightPayload);
  }
  if (unitySpotlightPayload) {
    spotlights.set("unity", unitySpotlightPayload);
  }

  return { metadata, datasets: new Map(datasets), spotlights, standings: standingsPayload };
}

async function fetchOptionalJson(url, cacheBust) {
  try {
    return await fetchJson(url, cacheBust);
  } catch {
    return null;
  }
}
