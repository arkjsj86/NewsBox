import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

export const GOOGLE_TRENDS_SOURCE = "Google Trends";
export const GOOGLE_TRENDS_KR_RSS_URL = "https://trends.google.com/trending/rss?geo=KR";

const DEFAULT_RANKING_LIMIT = 10;
const DEFAULT_RETENTION_HOURS = 48;
const MAX_NEWS_ITEMS_PER_TREND = 3;

const ENTERTAINMENT_TITLE_TERMS = uniqueTerms([
  "연예",
  "엔터",
  "드라마",
  "영화",
  "배우",
  "가수",
  "아이돌",
  "컴백",
  "데뷔",
  "예능",
  "ost",
  "앨범",
  "뮤직비디오",
  "콘서트",
  "뮤지컬",
  "팬미팅",
  "넷플릭스",
  "디즈니",
  "티빙",
  "웨이브",
  "쿠팡플레이",
  "공개",
  "개봉",
  "방영",
  "소속사",
  "전속계약",
  "계약해지",
]);

const ENTERTAINMENT_SOFT_TITLE_TERMS = uniqueTerms([
  "근황",
  "임신",
  "결혼",
  "열애",
  "이혼",
  "복귀",
  "출연",
  "주연",
  "무대",
  "시청률",
  "촬영",
  "화보",
  "팬",
  "팬덤",
  "미코",
  "모델",
  "모델료",
  "몸값",
  "태명",
  "걸그룹",
  "보이그룹",
  "오디션",
  "트로트",
]);

const ENTERTAINMENT_SOURCE_TERMS = uniqueTerms([
  "연예",
  "엔터",
  "entertain",
  "스타뉴스",
  "뉴스엔",
  "텐아시아",
  "마이데일리",
  "디스패치",
  "dispatch",
  "osen",
  "조이뉴스24",
  "tv리포트",
  "헤럴드pop",
  "엑스포츠뉴스",
  "일간스포츠",
  "스포츠조선",
  "스포츠동아",
  "스포츠경향",
  "스포츠월드",
  "스타투데이",
]);

const ENTERTAINMENT_URL_HINTS = uniqueTerms([
  "/entertain",
  "/entertainments/",
  "/celebrity/",
  "/star/",
  "/ent/article/",
  "/kpop/",
  "/k-culture/",
  "/culture-life/k-culture/",
  "/drama/",
  "/movie/",
  "/music/",
  "/broadcast/",
  "/showbiz/",
]);

const NOISE_TITLE_TERMS = uniqueTerms([
  "축구",
  "야구",
  "농구",
  "배구",
  "골프",
  "선수",
  "감독",
  "홈런",
  "세이브",
  "투수",
  "타자",
  "경기",
  "연패",
  "연승",
  "승격",
  "fc",
  "kia",
  "한화",
  "drx",
  "lck",
  "msi",
  "worlds",
  "e스포츠",
  "esports",
  "국민연금",
  "보험료",
  "체포",
  "학대",
  "정책",
  "지원",
  "협약",
  "제주시",
]);

const REFERENCE_STOPWORDS = new Set(
  uniqueTerms([
    "연예",
    "엔터",
    "드라마",
    "영화",
    "배우",
    "가수",
    "아이돌",
    "컴백",
    "데뷔",
    "예능",
    "ost",
    "앨범",
    "콘서트",
    "뮤지컬",
    "공개",
    "방영",
    "개봉",
    "소속사",
    "전속계약",
    "단독",
    "공식",
    "인터뷰",
    "화보",
    "티저",
    "신곡",
    "신작",
    "첫방",
    "최신",
    "뉴스",
    "기사",
    "오늘",
    "이번",
    "관련",
  ]),
);

export async function buildEntertainmentSpotlight({
  generatedAt,
  nowMs = Date.now(),
  timeoutMs = 25_000,
  existingSpotlightPath,
  referenceArticles = [],
  rankingLimit = DEFAULT_RANKING_LIMIT,
  historyRetentionHours = DEFAULT_RETENTION_HOURS,
  feedUrl = GOOGLE_TRENDS_KR_RSS_URL,
} = {}) {
  try {
    const currentItems = await fetchEntertainmentTrendNews({
      feedUrl,
      timeoutMs,
      generatedAt,
      referenceArticles,
    });
    const history = mergeHistory({
      previous: readHistory(existingSpotlightPath),
      current: currentItems,
      nowMs,
      retentionMs: historyRetentionHours * 60 * 60 * 1000,
    });

    return {
      tab: "entertainment",
      type: "trend-ranking",
      source: GOOGLE_TRENDS_SOURCE,
      sourceMode: "trending-rss",
      sourceUrl: feedUrl,
      title: "연예 화제 1~10위",
      updatedLabel: "Google Trends 기준",
      description: "Google Trends 한국 인기 검색어와 연예 기사 신호를 합쳐 3시간마다 다시 계산합니다.",
      lastUpdatedAt: generatedAt,
      rankingLimit,
      historyRetentionHours,
      itemCount: Math.min(history.length, rankingLimit),
      items: buildRankedItems(history, rankingLimit),
      history,
    };
  } catch (error) {
    console.warn(`[newsbox] Failed to build entertainment spotlight: ${error.message}`);
    return readExistingSpotlight(existingSpotlightPath) ?? buildFallbackEntertainmentSpotlight(generatedAt, rankingLimit, historyRetentionHours);
  }
}

async function fetchEntertainmentTrendNews({
  feedUrl,
  timeoutMs,
  generatedAt,
  referenceArticles,
}) {
  const response = await fetch(feedUrl, {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.6",
      "User-Agent": "NewsBoxBot/0.4 (+https://arkjsj86.github.io/NewsBox/)",
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Google Trends RSS HTTP ${response.status}`);
  }

  const xml = stripBom(await response.text());
  const trends = parseTrendingFeed(xml, feedUrl);
  const referenceTerms = buildReferenceTerms(referenceArticles);
  const candidates = [];

  for (const trend of trends) {
    for (const newsItem of trend.newsItems.slice(0, MAX_NEWS_ITEMS_PER_TREND)) {
      const evaluation = evaluateEntertainmentNews(newsItem, trend, referenceTerms);
      if (!evaluation.isEntertainment) continue;

      candidates.push({
        id: createStableId(newsItem.url || `${trend.title}:${newsItem.title}`),
        title: normalizeText(newsItem.title),
        source: normalizeText(newsItem.source) || GOOGLE_TRENDS_SOURCE,
        url: newsItem.url || trend.link || feedUrl,
        trendTitle: trend.title,
        approxTraffic: trend.approxTraffic,
        trafficScore: parseApproxTraffic(trend.approxTraffic),
        relevanceScore: evaluation.relevanceScore,
        publishedAt: newsItem.publishedAt || trend.publishedAt || generatedAt,
        firstSeenAt: generatedAt,
        lastSeenAt: generatedAt,
      });
    }
  }

  return dedupeCandidates(candidates);
}

function parseTrendingFeed(xml, feedUrl) {
  const items = matchBlocks(xml, "item");
  if (items.length === 0) {
    throw new Error("Unsupported Google Trends RSS format");
  }

  return items.map((block) => ({
    title: cleanText(readTag(block, ["title"])),
    link: resolveLink(readTag(block, ["link"]), feedUrl),
    approxTraffic: normalizeText(cleanXml(readTag(block, ["ht:approx_traffic"]))),
    publishedAt: parseDate(readTag(block, ["pubDate"])),
    newsItems: matchBlocks(block, "ht:news_item").map((newsBlock) => ({
      title: cleanText(readTag(newsBlock, ["ht:news_item_title"])),
      url: resolveLink(readTag(newsBlock, ["ht:news_item_url"]), feedUrl),
      source: cleanText(readTag(newsBlock, ["ht:news_item_source"])),
      publishedAt: parseDate(readTag(newsBlock, ["pubDate"])),
    })),
  }));
}

function evaluateEntertainmentNews(newsItem, trend, referenceTerms) {
  const combinedText = normalizeText(`${trend.title} ${newsItem.title}`).toLowerCase();
  const sourceText = normalizeText(newsItem.source).toLowerCase();
  const urlText = normalizeText(newsItem.url).toLowerCase();

  const titleSignal = countTerms(combinedText, ENTERTAINMENT_TITLE_TERMS);
  const softTitleSignal = countTerms(combinedText, ENTERTAINMENT_SOFT_TITLE_TERMS);
  const sourceSignal = countTerms(sourceText, ENTERTAINMENT_SOURCE_TERMS);
  const urlSignal = countTerms(urlText, ENTERTAINMENT_URL_HINTS);
  const referenceSignal = countReferenceMatches(combinedText, referenceTerms);
  const noiseSignal = countTerms(combinedText, NOISE_TITLE_TERMS);
  const personTrendSignal = isLikelyPersonTrend(trend.title) && softTitleSignal > 0 ? 1 : 0;
  const hasStrongSignal = sourceSignal > 0 || urlSignal > 0 || titleSignal > 0 || referenceSignal > 0;

  const relevanceScore =
    titleSignal * 2 +
    softTitleSignal +
    sourceSignal * 4 +
    urlSignal * 4 +
    referenceSignal * 3 +
    personTrendSignal * 2 -
    noiseSignal * 3;

  const isEntertainment =
    relevanceScore >= 3 &&
    (hasStrongSignal || softTitleSignal >= 2 || personTrendSignal > 0) &&
    (noiseSignal === 0 || relevanceScore >= noiseSignal + 3);

  return { isEntertainment, relevanceScore };
}

function isLikelyPersonTrend(value) {
  const normalized = normalizeText(value).toLowerCase();
  return /^[가-힣]{2,4}$/.test(normalized);
}

function buildReferenceTerms(referenceArticles) {
  const scores = new Map();

  for (const article of referenceArticles) {
    const tokens = tokenize(article?.title);
    for (const token of tokens) {
      scores.set(token, (scores.get(token) ?? 0) + 1);
    }
  }

  return new Set(
    [...scores.entries()]
      .sort((left, right) => right[1] - left[1] || right[0].length - left[0].length)
      .slice(0, 80)
      .map(([token]) => token),
  );
}

function tokenize(value) {
  return normalizeText(value)
    .toLowerCase()
    .split(/[^\p{L}\p{N}+#]+/u)
    .filter((token) => token.length >= 2 && token.length <= 20)
    .filter((token) => !/^\d+$/.test(token))
    .filter((token) => !REFERENCE_STOPWORDS.has(token));
}

function countReferenceMatches(text, referenceTerms) {
  let score = 0;
  for (const token of referenceTerms) {
    if (token && text.includes(token)) score += 1;
  }
  return score;
}

function parseApproxTraffic(value) {
  const cleaned = normalizeText(value).replace(/\+/g, "").replace(/,/g, "");
  const match = cleaned.match(/^(\d+(?:\.\d+)?)(천|만|억)?$/);
  if (!match) return 0;

  const amount = Number(match[1]);
  const unit = match[2] || "";
  const multiplier =
    unit === "천" ? 1_000 :
    unit === "만" ? 10_000 :
    unit === "억" ? 100_000_000 :
    1;

  return Math.round(amount * multiplier);
}

function mergeHistory({ previous, current, nowMs, retentionMs }) {
  const merged = new Map();

  for (const item of [...previous, ...current]) {
    const key = normalizeKey(item.title);
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, { ...item });
      continue;
    }

    existing.firstSeenAt =
      new Date(item.firstSeenAt || item.lastSeenAt || item.publishedAt) <
      new Date(existing.firstSeenAt || existing.lastSeenAt || existing.publishedAt)
        ? item.firstSeenAt || item.lastSeenAt || item.publishedAt
        : existing.firstSeenAt;
    if (new Date(item.lastSeenAt || item.publishedAt) > new Date(existing.lastSeenAt || existing.publishedAt)) {
      existing.lastSeenAt = item.lastSeenAt || item.publishedAt;
      existing.source = item.source;
      existing.url = item.url;
      existing.approxTraffic = item.approxTraffic;
      existing.publishedAt = item.publishedAt;
      existing.trendTitle = item.trendTitle;
    }
    if ((item.trafficScore ?? 0) >= (existing.trafficScore ?? 0)) {
      existing.trafficScore = item.trafficScore;
      existing.approxTraffic = item.approxTraffic;
    }
    existing.relevanceScore = Math.max(existing.relevanceScore ?? 0, item.relevanceScore ?? 0);
  }

  return [...merged.values()]
    .filter((item) => nowMs - new Date(item.lastSeenAt || item.publishedAt).getTime() <= retentionMs)
    .sort((left, right) => {
      const trafficGap = (right.trafficScore ?? 0) - (left.trafficScore ?? 0);
      if (trafficGap !== 0) return trafficGap;
      const relevanceGap = (right.relevanceScore ?? 0) - (left.relevanceScore ?? 0);
      if (relevanceGap !== 0) return relevanceGap;
      return new Date(right.lastSeenAt || right.publishedAt) - new Date(left.lastSeenAt || left.publishedAt);
    })
    .slice(0, 40);
}

function buildRankedItems(history, rankingLimit) {
  return history.slice(0, rankingLimit).map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}

function dedupeCandidates(items) {
  const unique = new Map();

  for (const item of items) {
    const key = normalizeKey(item.title);
    const existing = unique.get(key);

    if (!existing) {
      unique.set(key, item);
      continue;
    }

    if (
      (item.trafficScore ?? 0) > (existing.trafficScore ?? 0) ||
      ((item.trafficScore ?? 0) === (existing.trafficScore ?? 0) &&
        (item.relevanceScore ?? 0) > (existing.relevanceScore ?? 0))
    ) {
      unique.set(key, item);
    }
  }

  return [...unique.values()];
}

function readExistingSpotlight(filePath) {
  if (!filePath || !existsSync(filePath)) return null;

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function readHistory(filePath) {
  const existing = readExistingSpotlight(filePath);
  if (!existing) return [];
  if (Array.isArray(existing.history)) return existing.history;
  if (Array.isArray(existing.items)) {
    return existing.items.map((item) => ({
      ...item,
      firstSeenAt: item.firstSeenAt || item.lastSeenAt || item.publishedAt || existing.lastUpdatedAt,
      lastSeenAt: item.lastSeenAt || item.publishedAt || existing.lastUpdatedAt,
    }));
  }
  return [];
}

function buildFallbackEntertainmentSpotlight(generatedAt, rankingLimit, historyRetentionHours) {
  return {
    tab: "entertainment",
    type: "trend-ranking",
    source: GOOGLE_TRENDS_SOURCE,
    sourceMode: "trending-rss",
    sourceUrl: GOOGLE_TRENDS_KR_RSS_URL,
    title: "연예 화제 1~10위",
    updatedLabel: "Google Trends 기준",
    description: "Google Trends 연예 이슈 랭킹을 준비하는 중입니다.",
    lastUpdatedAt: generatedAt,
    rankingLimit,
    historyRetentionHours,
    itemCount: 0,
    items: [],
    history: [],
  };
}

function matchBlocks(xml, tagName) {
  const pattern = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)</${tagName}>`, "gi");
  return Array.from(xml.matchAll(pattern), (match) => match[0]);
}

function readTag(block, tagNames) {
  for (const tagName of tagNames) {
    const match = block.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)</${tagName}>`, "i"));
    if (match) return match[1];
  }
  return "";
}

function resolveLink(value, baseUrl) {
  const cleaned = normalizeText(cleanXml(value));
  if (!cleaned) return "";
  try {
    return new URL(cleaned, baseUrl).toString();
  } catch {
    return cleaned;
  }
}

function parseDate(value) {
  const cleaned = normalizeText(cleanXml(value));
  const parsed = new Date(cleaned);
  return !cleaned || Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function cleanText(value) {
  return normalizeText(stripHtml(decodeEntities(cleanXml(value))));
}

function cleanXml(value) {
  return String(value || "").replace(/^<!\[CDATA\[/i, "").replace(/\]\]>$/i, "").trim();
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

function stripHtml(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function stripBom(value) {
  return String(value || "").replace(/^\uFEFF/, "");
}

function normalizeKey(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function countTerms(text, terms) {
  return terms.reduce((total, term) => total + countTerm(text, term), 0);
}

function countTerm(text, term) {
  let count = 0;
  let index = -1;
  while ((index = text.indexOf(term, index + 1)) !== -1) count += 1;
  return count;
}

function createStableId(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function uniqueTerms(values) {
  return [...new Set(values.map((value) => String(value || "").toLowerCase()))];
}
