import { existsSync, readFileSync } from "node:fs";

export const EPIC_FREE_GAMES_SOURCE = "Epic Games Store";
export const EPIC_FREE_GAMES_PAGE_URL = "https://store.epicgames.com/ko/free-games";
export const EPIC_FREE_GAMES_API_URL =
  "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=ko&country=KR&allowCountries=KR";
export const RULIWEB_ISSUES_SOURCE = "Ruliweb BEST 뉴스";
export const RULIWEB_ISSUES_URL = "https://bbs.ruliweb.com/best";
export const INVEN_ISSUES_SOURCE = "Inven 주요뉴스";
export const INVEN_ISSUES_URL = "https://www.inven.co.kr/webzine/news/?hotnews=1";

const ISSUE_LIMIT = 5;
const USER_AGENT = "NewsBoxBot/0.8 (+https://arkjsj86.github.io/NewsBox/)";

const FALLBACK_OFFERS = [
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
];

const FALLBACK_ISSUES = {
  ruliweb: {
    label: "루리웹 BEST 뉴스",
    source: RULIWEB_ISSUES_SOURCE,
    sourceUrl: RULIWEB_ISSUES_URL,
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
    source: INVEN_ISSUES_SOURCE,
    sourceUrl: INVEN_ISSUES_URL,
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
};

export async function buildGameSpotlight({
  generatedAt,
  timeoutMs,
  existingSpotlightPath,
}) {
  const existingSpotlight =
    readExistingSpotlight(existingSpotlightPath) ?? buildFallbackGameSpotlight(generatedAt);
  let offers = normalizeOfferList(existingSpotlight.offers);
  let issues = normalizeIssues(existingSpotlight.issues);
  const fetchedSources = [];

  try {
    offers = await fetchEpicFreeGames(timeoutMs);
    fetchedSources.push({
      key: "epic-free-games",
      source: EPIC_FREE_GAMES_SOURCE,
      ok: true,
      itemCount: offers.length,
    });
  } catch (error) {
    fetchedSources.push({
      key: "epic-free-games",
      source: EPIC_FREE_GAMES_SOURCE,
      ok: false,
      error: normalizeText(error.message),
    });
    console.warn(`[newsbox] Failed to fetch Epic free games: ${error.message}`);
  }

  try {
    issues = {
      ruliweb: await fetchRuliwebIssues(timeoutMs),
      inven: await fetchInvenIssues(timeoutMs),
    };
    fetchedSources.push(
      {
        key: "ruliweb-issues",
        source: RULIWEB_ISSUES_SOURCE,
        ok: true,
        itemCount: issues.ruliweb.items.length,
      },
      {
        key: "inven-issues",
        source: INVEN_ISSUES_SOURCE,
        ok: true,
        itemCount: issues.inven.items.length,
      },
    );
  } catch (error) {
    fetchedSources.push({
      key: "game-issues",
      source: `${RULIWEB_ISSUES_SOURCE} + ${INVEN_ISSUES_SOURCE}`,
      ok: false,
      error: normalizeText(error.message),
    });
    console.warn(`[newsbox] Failed to fetch game issue lists: ${error.message}`);
  }

  return {
    tab: "game",
    type: "free-games-and-issues",
    source: `${EPIC_FREE_GAMES_SOURCE} + ${RULIWEB_ISSUES_SOURCE} + ${INVEN_ISSUES_SOURCE}`,
    sourceMode: "official-store-api+html",
    lastUpdatedAt: generatedAt,
    title: "에픽게임즈 이주의 무료게임",
    description: "Epic Games Store KR 무료 배포와 루리웹·인벤 인기 게임 이슈를 함께 보여줍니다.",
    sourceUrl: EPIC_FREE_GAMES_PAGE_URL,
    itemCount: offers.length,
    offers,
    issues,
    fetchedSources,
  };
}

async function fetchEpicFreeGames(timeoutMs) {
  const response = await fetch(EPIC_FREE_GAMES_API_URL, {
    headers: {
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.6",
      "User-Agent": USER_AGENT,
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = JSON.parse(stripBom(await response.text()));
  const elements = payload?.data?.Catalog?.searchStore?.elements;

  if (!Array.isArray(elements)) {
    throw new Error("Epic free games payload did not include catalog elements.");
  }

  const nowMs = Date.now();
  const offers = elements
    .map((entry) => normalizeEpicOffer(entry, nowMs))
    .filter(Boolean)
    .sort((left, right) => {
      const timeDelta = new Date(left.freeUntil) - new Date(right.freeUntil);
      if (timeDelta !== 0) return timeDelta;
      return left.title.localeCompare(right.title, "ko-KR");
    });

  if (offers.length === 0) {
    throw new Error("Epic free games payload did not contain active free games.");
  }

  return offers;
}

async function fetchRuliwebIssues(timeoutMs) {
  const response = await fetch(RULIWEB_ISSUES_URL, {
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.6",
      "User-Agent": USER_AGENT,
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Ruliweb HTTP ${response.status}`);
  }

  const html = stripBom(await response.text());
  const section = extractSection(html, '<strong class="title">BEST 뉴스</strong>', '<div class="adrr');
  const pattern =
    /<li class="list_item flex">\s*<a class="subject text_over" href="([^"]+)"[^>]*>(?:<strong>)?([\s\S]*?)(?:<\/strong>)?<\/a><span class="num_reply">\[(\d+)\]<\/span>/gi;
  const items = Array.from(section.matchAll(pattern), (match) => ({
    title: cleanText(match[2]),
    url: normalizeUrl(match[1], RULIWEB_ISSUES_URL),
    meta: `댓글 ${match[3]}`,
  }))
    .filter((item) => item.title && item.url)
    .slice(0, ISSUE_LIMIT);

  if (items.length === 0) {
    throw new Error("Ruliweb issue list did not return any usable items.");
  }

  return {
    label: FALLBACK_ISSUES.ruliweb.label,
    source: RULIWEB_ISSUES_SOURCE,
    sourceUrl: RULIWEB_ISSUES_URL,
    items,
  };
}

async function fetchInvenIssues(timeoutMs) {
  const response = await fetch("https://www.inven.co.kr/", {
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.6",
      "User-Agent": USER_AGENT,
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Inven HTTP ${response.status}`);
  }

  const html = stripBom(await response.text());
  const section = extractSection(html, "주요뉴스 더보기", '<div class="main-left ad-area">');
  const pattern =
    /<li class="news-item">\s*<a href="([^"]+)">[\s\S]*?<h2 class="news-title">([\s\S]*?)<\/h2>[\s\S]*?<span class="company-name">([\s\S]*?)<\/span>[\s\S]*?<span class="time">([\s\S]*?)<\/span>/gi;
  const items = Array.from(section.matchAll(pattern), (match) => {
    const company = cleanText(match[3]);
    const time = cleanText(match[4]);
    return {
      title: cleanText(match[2]),
      url: normalizeUrl(match[1], "https://www.inven.co.kr/"),
      meta: [company, time].filter(Boolean).join(" · ") || "인벤 주요뉴스",
    };
  })
    .filter((item) => item.title && item.url)
    .slice(0, ISSUE_LIMIT);

  if (items.length === 0) {
    throw new Error("Inven issue list did not return any usable items.");
  }

  return {
    label: FALLBACK_ISSUES.inven.label,
    source: INVEN_ISSUES_SOURCE,
    sourceUrl: INVEN_ISSUES_URL,
    items,
  };
}

function normalizeEpicOffer(entry, nowMs) {
  const activePromotion = getActivePromotion(entry?.promotions, nowMs);
  const categories = Array.isArray(entry?.categories)
    ? entry.categories.map((category) => normalizeText(category?.path))
    : [];
  const discountPrice = Number(entry?.price?.totalPrice?.discountPrice ?? -1);

  if (!activePromotion || !categories.includes("freegames") || discountPrice !== 0) {
    return null;
  }

  if (normalizeText(entry?.offerType) === "ADD_ON") {
    return null;
  }

  const title = normalizeText(entry?.title);
  const seller = normalizeText(entry?.seller?.name) || "Epic Games Store";
  const url = resolveOfferUrl(entry);
  const imageUrl = resolveOfferImage(entry);
  const originalPriceLabel =
    normalizeText(entry?.price?.totalPrice?.fmtPrice?.originalPrice) || "정가 확인 중";

  if (!title || !url || !imageUrl) {
    return null;
  }

  return {
    id: normalizeText(entry?.id) || title,
    title,
    seller,
    url,
    imageUrl,
    originalPriceLabel,
    freeUntil: activePromotion.endDate,
  };
}

function getActivePromotion(promotions, nowMs) {
  const groups = Array.isArray(promotions?.promotionalOffers) ? promotions.promotionalOffers : [];
  const windows = groups.flatMap((group) =>
    Array.isArray(group?.promotionalOffers) ? group.promotionalOffers : [],
  );

  return windows.find((window) => {
    const startMs = Date.parse(window?.startDate);
    const endMs = Date.parse(window?.endDate);
    return Number.isFinite(startMs) && Number.isFinite(endMs) && startMs <= nowMs && nowMs < endMs;
  }) ?? null;
}

function resolveOfferUrl(entry) {
  const mappedSlug =
    entry?.catalogNs?.mappings?.find((mapping) => normalizeText(mapping?.pageSlug))?.pageSlug ||
    entry?.offerMappings?.find((mapping) => normalizeText(mapping?.pageSlug))?.pageSlug;
  const productSlug = normalizeText(entry?.productSlug).replace(/\/home$/i, "");
  const pageSlug = normalizeText(mappedSlug) || productSlug || normalizeText(entry?.urlSlug);

  return pageSlug ? `https://store.epicgames.com/ko/p/${pageSlug}` : EPIC_FREE_GAMES_PAGE_URL;
}

function resolveOfferImage(entry) {
  const images = Array.isArray(entry?.keyImages) ? entry.keyImages : [];
  const preferredTypes = [
    "Thumbnail",
    "OfferImageTall",
    "OfferImageWide",
    "featuredMedia",
    "DieselStoreFrontWide",
  ];

  for (const type of preferredTypes) {
    const image = images.find((candidate) => normalizeText(candidate?.type) === type);
    if (normalizeText(image?.url)) {
      return image.url;
    }
  }

  return "";
}

function buildFallbackGameSpotlight(generatedAt) {
  return {
    tab: "game",
    type: "free-games-and-issues",
    source: `${EPIC_FREE_GAMES_SOURCE} + ${RULIWEB_ISSUES_SOURCE} + ${INVEN_ISSUES_SOURCE}`,
    sourceMode: "fallback",
    lastUpdatedAt: generatedAt,
    title: "에픽게임즈 이주의 무료게임",
    description: "Epic Games Store KR 무료 배포와 루리웹·인벤 인기 게임 이슈를 함께 보여줍니다.",
    sourceUrl: EPIC_FREE_GAMES_PAGE_URL,
    itemCount: FALLBACK_OFFERS.length,
    offers: FALLBACK_OFFERS.map((offer) => ({ ...offer })),
    issues: structuredClone(FALLBACK_ISSUES),
    fetchedSources: [],
  };
}

function readExistingSpotlight(existingSpotlightPath) {
  if (!existingSpotlightPath || !existsSync(existingSpotlightPath)) {
    return null;
  }

  try {
    const parsed = JSON.parse(readFileSync(existingSpotlightPath, "utf8"));
    const base = buildFallbackGameSpotlight(parsed.lastUpdatedAt || new Date().toISOString());
    return {
      ...base,
      ...parsed,
      offers: normalizeOfferList(parsed.offers),
      issues: normalizeIssues(parsed.issues),
    };
  } catch {
    return null;
  }
}

function normalizeOfferList(offers) {
  if (!Array.isArray(offers) || offers.length === 0) {
    return FALLBACK_OFFERS.map((offer) => ({ ...offer }));
  }

  return offers
    .map((offer) => ({
      id: normalizeText(offer?.id) || normalizeText(offer?.title),
      title: normalizeText(offer?.title),
      seller: normalizeText(offer?.seller) || "Epic Games Store",
      url: normalizeText(offer?.url) || EPIC_FREE_GAMES_PAGE_URL,
      imageUrl: normalizeText(offer?.imageUrl),
      originalPriceLabel: normalizeText(offer?.originalPriceLabel) || "정가 확인 중",
      freeUntil: parseDate(offer?.freeUntil),
    }))
    .filter((offer) => offer.title && offer.imageUrl);
}

function normalizeIssues(issues) {
  const result = {};

  for (const key of ["ruliweb", "inven"]) {
    const fallback = FALLBACK_ISSUES[key];
    const source = issues?.[key] ?? fallback;
    const items = Array.isArray(source?.items) ? source.items : fallback.items;

    result[key] = {
      label: normalizeText(source?.label) || fallback.label,
      source: normalizeText(source?.source) || fallback.source,
      sourceUrl: normalizeText(source?.sourceUrl) || fallback.sourceUrl,
      items: items
        .map((item) => ({
          title: cleanText(item?.title),
          url: normalizeText(item?.url) || fallback.sourceUrl,
          meta: cleanText(item?.meta) || "",
        }))
        .filter((item) => item.title && item.url)
        .slice(0, ISSUE_LIMIT),
    };

    if (result[key].items.length === 0) {
      result[key].items = fallback.items.map((item) => ({ ...item }));
    }
  }

  return result;
}

function extractSection(html, startToken, endToken) {
  const startIndex = html.indexOf(startToken);
  if (startIndex === -1) {
    throw new Error(`Could not find section start token: ${startToken}`);
  }

  const sliced = html.slice(startIndex);
  const endIndex = endToken ? sliced.indexOf(endToken) : -1;
  return endIndex === -1 ? sliced : sliced.slice(0, endIndex);
}

function normalizeUrl(url, baseUrl) {
  try {
    return new URL(normalizeText(url), baseUrl).toString();
  } catch {
    return "";
  }
}

function cleanText(value) {
  return normalizeText(
    decodeEntities(
      String(value ?? "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " "),
    ),
  );
}

function decodeEntities(value) {
  return String(value || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function parseDate(value) {
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : "";
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function stripBom(value) {
  return String(value || "").replace(/^\uFEFF/, "");
}
