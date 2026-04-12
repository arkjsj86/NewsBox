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

const SOURCE_LABEL_TERMS = new Set(
  uniqueTerms([
    ...ENTERTAINMENT_SOURCE_TERMS,
    "세계일보",
    "조선일보",
    "중앙일보",
    "동아일보",
    "한겨레",
    "경향신문",
    "문화일보",
    "국민일보",
    "서울신문",
    "한국일보",
    "매일경제",
    "한국경제",
    "서울경제",
    "아시아경제",
    "헤럴드경제",
    "머니투데이",
    "파이낸셜뉴스",
    "전자신문",
    "이데일리",
    "연합뉴스",
    "연합뉴스tv",
    "뉴시스",
    "뉴스1",
    "노컷뉴스",
    "뉴스핌",
    "ytn",
    "kbs",
    "mbc",
    "sbs",
    "jtbc",
    "tvn",
    "ena",
    "채널a",
    "mbn",
    "daum",
    "naver",
  ]),
);

const SOURCE_LABEL_SUFFIXES = uniqueTerms([
  "일보",
  "신문",
  "뉴스",
  "경제",
  "방송",
  "tv",
  "데일리",
  "투데이",
  "저널",
  "타임즈",
  "미디어",
]);

const NON_SOURCE_LABEL_TERMS = new Set(
  uniqueTerms([
    "단독",
    "속보",
    "영상",
    "포토",
    "사진",
    "인터뷰",
    "종합",
    "공식",
    "르포",
    "기획",
    "특집",
  ]),
);

const GENERIC_ISSUE_TITLE_TERMS = new Set(
  uniqueTerms([
    "연예",
    "연예 이슈",
    "연예 화제",
    "뉴스",
    "기사",
    "관련 기사",
    "핫이슈",
    "속보",
    "종합",
    "포토",
    "사진",
    "영상",
    "공식",
  ]),
);

const PERSON_NAME_CONTEXT_TERMS = [
  "배우",
  "가수",
  "아이돌",
  "방송인",
  "연기자",
  "개그맨",
  "개그우먼",
  "모델",
  "트롯퀸",
  "트로트가수",
  "트로트 가수",
  "미코",
  "미코 출신",
  "뮤지컬배우",
  "뮤지컬 배우",
];

const PERSON_NAME_EXCLUDED_TERMS = new Set(
  uniqueTerms([
    ...NOISE_TITLE_TERMS,
    ...ENTERTAINMENT_TITLE_TERMS,
    ...ENTERTAINMENT_SOFT_TITLE_TERMS,
    ...SOURCE_LABEL_TERMS,
    ...GENERIC_ISSUE_TITLE_TERMS,
    "한남더힐",
    "한남더힐아파트",
    "전국노래자랑",
    "카타르",
    "신부",
    "영수증",
    "몸값",
    "보고타",
    "월드컵",
    "의성군",
  ]),
);

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
    const currentItems = await fetchEntertainmentTrendIssues({
      feedUrl,
      timeoutMs,
      generatedAt,
      referenceArticles,
    });
    const mergedHistory = mergeHistory({
      previous: readHistory(existingSpotlightPath),
      current: currentItems,
      nowMs,
      retentionMs: historyRetentionHours * 60 * 60 * 1000,
    });
    const history = mergeHistory({
      previous: [],
      current: mergedHistory,
      nowMs,
      retentionMs: historyRetentionHours * 60 * 60 * 1000,
    });
    const rankedItems = buildCurrentRankedItems(currentItems, rankingLimit);

    return {
      tab: "entertainment",
      type: "trend-ranking",
      source: "Google Trends KR",
      sourceMode: "trending-rss",
      sourceUrl: feedUrl,
      title: "연예 화제 1~10위",
      updatedLabel: "Google Trends 기준",
      description: "Google Trends 한국 인기 검색어와 연예 기사 신호를 합쳐 3시간마다 다시 계산합니다.",
      title: "Hot Issue",
      updatedLabel: "Google Trends KR",
      description: "Google Trends KR 실시간 이슈를 3시간마다 정각에 다시 불러옵니다.",
      lastUpdatedAt: generatedAt,
      rankingLimit,
      historyRetentionHours,
      itemCount: rankedItems.length,
      items: rankedItems,
      history,
    };
  } catch (error) {
    console.warn(`[newsbox] Failed to build entertainment spotlight: ${error.message}`);
    return readExistingSpotlight(existingSpotlightPath) ?? buildFallbackEntertainmentSpotlight(generatedAt, rankingLimit, historyRetentionHours);
  }
}

async function fetchEntertainmentTrendIssues({
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
  const issues = [];

  for (const trend of trends) {
    const relatedArticles = dedupeArticlesInFeedOrder(
      trend.newsItems.map((newsItem, index) => ({
        id: createStableId(newsItem.url || `${trend.title}:${newsItem.title}`),
        title: normalizeText(newsItem.title),
        source: normalizeText(newsItem.source) || GOOGLE_TRENDS_SOURCE,
        url: newsItem.url || trend.link || feedUrl,
        publishedAt: newsItem.publishedAt || trend.publishedAt || generatedAt,
        relevanceScore: Math.max(1, trend.newsItems.length - index),
      })),
    );
    if (relatedArticles.length === 0) continue;

    const previewArticles = relatedArticles.slice(0, MAX_NEWS_ITEMS_PER_TREND);
    const relatedTitles = relatedArticles.map((article) => article.title);
    const issueHint = resolveIssueTitle(
      trend.title,
      ...relatedTitles,
    );
    const representativeArticle = normalizeArticleRecord(
      previewArticles[0] ?? {
        title: trend.title,
        source: GOOGLE_TRENDS_SOURCE,
        url: trend.link || feedUrl,
        publishedAt: trend.publishedAt || generatedAt,
      },
    );
    const issueTitle = resolveIssueTitle(
      trend.title,
      issueHint,
      representativeArticle?.title,
      ...relatedTitles,
    );

    issues.push(
      applyRepresentativeAliases({
        id: createStableId(issueTitle),
        issueKey: normalizeKey(issueTitle),
        issueTitle,
        trendTitle: issueTitle,
        approxTraffic: trend.approxTraffic,
        trafficScore: parseApproxTraffic(trend.approxTraffic),
        relevanceScore: Math.max(relatedArticles.length, 1),
        articleCount: relatedArticles.length,
        relatedArticles: previewArticles,
        representativeArticle,
        publishedAt: representativeArticle?.publishedAt || trend.publishedAt || generatedAt,
        firstSeenAt: generatedAt,
        lastSeenAt: generatedAt,
      }),
    );
  }

  return issues;
}

function dedupeArticlesInFeedOrder(articles = []) {
  const unique = new Map();

  for (const rawArticle of articles) {
    const article = normalizeArticleRecord(rawArticle);
    if (!article.title && !article.url) continue;

    const key = article.url || normalizeKey(article.title);
    if (!unique.has(key)) {
      unique.set(key, article);
    }
  }

  return [...unique.values()];
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
  const trendTitle = normalizeHeadlineCandidate(trend.title);
  const newsTitle = normalizeHeadlineCandidate(newsItem.title);
  const combinedText = normalizeText(`${trendTitle} ${newsTitle}`).toLowerCase();
  const sourceText = normalizeText(newsItem.source).toLowerCase();
  const urlText = normalizeText(newsItem.url).toLowerCase();

  const titleSignal = countTerms(combinedText, ENTERTAINMENT_TITLE_TERMS);
  const softTitleSignal = countTerms(combinedText, ENTERTAINMENT_SOFT_TITLE_TERMS);
  const sourceSignal = countTerms(sourceText, ENTERTAINMENT_SOURCE_TERMS);
  const urlSignal = countTerms(urlText, ENTERTAINMENT_URL_HINTS);
  const referenceSignal = countReferenceMatches(combinedText, referenceTerms);
  const noiseSignal = countTerms(combinedText, NOISE_TITLE_TERMS);
  const personTrendSignal = isLikelyPersonTrend(trendTitle) && softTitleSignal > 0 ? 1 : 0;
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
    const tokens = tokenize(normalizeHeadlineCandidate(article?.title));
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

  for (const rawItem of [...previous, ...current]) {
    const item = normalizeIssueRecord(rawItem);
    const key = item.issueKey;
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, item);
      continue;
    }

    const mergedArticles = mergeRelatedArticles(existing.relatedArticles, item.relatedArticles);
    const issueHint = existing.issueTitle || item.issueTitle || item.trendTitle || item.title;
    const representativeArticle = pickRepresentativeArticle([
      ...(mergedArticles || []),
      existing.representativeArticle,
      item.representativeArticle,
    ], issueHint);
    const isItemNewer =
      new Date(item.lastSeenAt || item.publishedAt || 0) >
      new Date(existing.lastSeenAt || existing.publishedAt || 0);

    merged.set(
      key,
      applyRepresentativeAliases({
        ...existing,
        issueTitle: existing.issueTitle || item.issueTitle,
        trendTitle: isItemNewer ? item.trendTitle || item.issueTitle : existing.trendTitle,
        approxTraffic:
          (item.trafficScore ?? 0) >= (existing.trafficScore ?? 0)
            ? item.approxTraffic
            : existing.approxTraffic,
        trafficScore: Math.max(existing.trafficScore ?? 0, item.trafficScore ?? 0),
        relevanceScore: Math.max(existing.relevanceScore ?? 0, item.relevanceScore ?? 0),
        articleCount: mergedArticles.length,
        relatedArticles: mergedArticles,
        representativeArticle,
        publishedAt:
          representativeArticle?.publishedAt ||
          existing.publishedAt ||
          item.publishedAt,
        firstSeenAt: minDateValue(
          existing.firstSeenAt || existing.lastSeenAt || existing.publishedAt,
          item.firstSeenAt || item.lastSeenAt || item.publishedAt,
        ),
        lastSeenAt: maxDateValue(
          existing.lastSeenAt || existing.publishedAt,
          item.lastSeenAt || item.publishedAt,
        ),
      }),
    );
  }

  return [...merged.values()]
    .filter((item) => nowMs - new Date(item.lastSeenAt || item.publishedAt).getTime() <= retentionMs)
    .sort((left, right) => {
      const trafficGap = (right.trafficScore ?? 0) - (left.trafficScore ?? 0);
      if (trafficGap !== 0) return trafficGap;
      const relevanceGap = (right.relevanceScore ?? 0) - (left.relevanceScore ?? 0);
      if (relevanceGap !== 0) return relevanceGap;
      const articleCountGap = (right.articleCount ?? 0) - (left.articleCount ?? 0);
      if (articleCountGap !== 0) return articleCountGap;
      return new Date(right.lastSeenAt || right.publishedAt) - new Date(left.lastSeenAt || left.publishedAt);
    })
    .slice(0, 40);
}

function buildRankedItems(history, rankingLimit) {
  const rankedItems = [];

  for (const rawItem of history) {
    const item = normalizeIssueRecord(rawItem);
    const issueCategory = classifyEntertainmentIssue(item);
    if (issueCategory === "C") continue;
    const normalizedIssueTitle = normalizeText(item.issueTitle).toLowerCase();
    const relatedArticles = Array.isArray(item.relatedArticles) ? item.relatedArticles : [];
    const titleMatchedArticles = normalizedIssueTitle
      ? relatedArticles.filter((article) =>
          normalizeText(article?.title).toLowerCase().includes(normalizedIssueTitle),
        )
      : [];
    const representativeArticle = titleMatchedArticles.length > 0
      ? pickRepresentativeArticle(titleMatchedArticles, item.issueTitle)
      : pickRepresentativeArticle(
          [
            ...relatedArticles,
            item.representativeArticle,
          ],
          item.issueTitle,
        );

    rankedItems.push({
      ...item,
      source: representativeArticle.source || item.source || GOOGLE_TRENDS_SOURCE,
      url: representativeArticle.url || item.url || GOOGLE_TRENDS_KR_RSS_URL,
      representativeArticle,
      issueCategory,
      isHot: issueCategory === "B",
      rank: rankedItems.length + 1,
    });

    if (rankedItems.length >= rankingLimit) {
      break;
    }
  }

  return rankedItems;
}

function buildCurrentRankedItems(items, rankingLimit) {
  return items
    .slice(0, rankingLimit)
    .map((rawItem, index) => {
      const item = normalizeIssueRecord(rawItem);
      const relatedArticles = Array.isArray(item.relatedArticles) ? item.relatedArticles : [];
      const representativeArticle = normalizeArticleRecord(
        item.representativeArticle ?? relatedArticles[0] ?? item,
      );

      return {
        ...item,
        source: representativeArticle.source || item.source || GOOGLE_TRENDS_SOURCE,
        url: representativeArticle.url || item.url || GOOGLE_TRENDS_KR_RSS_URL,
        representativeArticle,
        rank: index + 1,
      };
    });
}

function dedupeIssues(items) {
  const unique = new Map();

  for (const item of items) {
    const key = item.issueKey || normalizeKey(item.issueTitle || item.trendTitle || item.title);
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

function normalizeIssueRecord(item) {
  const relatedArticles = mergeRelatedArticles(
    [],
    Array.isArray(item.relatedArticles) && item.relatedArticles.length > 0
      ? item.relatedArticles
      : item.representativeArticle?.title
        ? [item.representativeArticle]
        : [],
  );
  const relatedArticleTitles = relatedArticles.map((article) => article.title);
  const preliminaryIssueTitle = resolveIssueTitle(
    item.issueTitle,
    item.trendTitle,
    item.title,
    item.representativeArticle?.title,
    ...relatedArticleTitles,
  );
  const issueTitle = resolveIssueTitle(
    preliminaryIssueTitle,
    item.representativeArticle?.title,
    ...relatedArticleTitles,
  );
  const representativeArticle = pickRepresentativeArticle(
    [
      ...relatedArticles,
      item.representativeArticle,
      item,
    ],
    issueTitle,
  );

  return applyRepresentativeAliases({
    ...item,
    id: item.id || createStableId(issueTitle || representativeArticle.title || representativeArticle.url),
    issueKey: normalizeKey(issueTitle || representativeArticle.title),
    issueTitle: issueTitle || representativeArticle.title || "연예 이슈",
    trendTitle: normalizeText(item.trendTitle || issueTitle || representativeArticle.title || "연예 이슈"),
    approxTraffic: item.approxTraffic || "-",
    trafficScore: item.trafficScore ?? parseApproxTraffic(item.approxTraffic),
    relevanceScore: item.relevanceScore ?? representativeArticle.relevanceScore ?? 0,
    articleCount: item.articleCount ?? relatedArticles.length,
    relatedArticles,
    representativeArticle: pickRepresentativeArticle([
      ...relatedArticles,
      item.representativeArticle,
    ]),
    publishedAt:
      item.publishedAt ||
      representativeArticle.publishedAt ||
      item.lastSeenAt ||
      item.firstSeenAt ||
      "",
    firstSeenAt:
      item.firstSeenAt ||
      item.lastSeenAt ||
      representativeArticle.publishedAt ||
      "",
    lastSeenAt:
      item.lastSeenAt ||
      item.publishedAt ||
      representativeArticle.publishedAt ||
      "",
  });
}

function classifyEntertainmentIssue(item) {
  const representativeArticle = normalizeArticleRecord(
    item?.representativeArticle ?? item,
  );
  const issueTitle = normalizeHeadlineCandidate(
    item?.issueTitle || item?.trendTitle || item?.title,
  );
  const representativeTitle = normalizeHeadlineCandidate(representativeArticle.title);
  const primaryTitle = issueTitle || representativeTitle;

  if (
    isRemovableIssueHeadline(primaryTitle) &&
    isRemovableIssueHeadline(representativeTitle)
  ) {
    return "C";
  }

  const titleText = normalizeText(`${issueTitle} ${representativeTitle}`).toLowerCase();
  const sourceText = normalizeText(representativeArticle.source).toLowerCase();
  const urlText = normalizeText(representativeArticle.url).toLowerCase();

  const hardTitleSignal = countTerms(titleText, ENTERTAINMENT_TITLE_TERMS);
  const softTitleSignal = countTerms(titleText, ENTERTAINMENT_SOFT_TITLE_TERMS);
  const sourceSignal = countTerms(sourceText, ENTERTAINMENT_SOURCE_TERMS);
  const urlSignal = countTerms(urlText, ENTERTAINMENT_URL_HINTS);

  if (
    sourceSignal > 0 ||
    urlSignal > 0 ||
    hardTitleSignal > 0 ||
    (softTitleSignal > 0 && (sourceSignal > 0 || urlSignal > 0))
  ) {
    return "A";
  }

  return "B";
}

function applyRepresentativeAliases(item) {
  const relatedArticles = Array.isArray(item.relatedArticles) ? item.relatedArticles : [];
  const relatedArticleTitles = relatedArticles.map((article) => article?.title);
  const preliminaryIssueTitle = resolveIssueTitle(
    item.issueTitle,
    item.trendTitle,
    item.title,
    item.representativeArticle?.title,
    ...relatedArticleTitles,
  );
  const issueTitle = resolveIssueTitle(
    preliminaryIssueTitle,
    item.representativeArticle?.title,
    ...relatedArticleTitles,
  );
  const representativeArticle = pickRepresentativeArticle(
    [
      ...relatedArticles,
      item.representativeArticle,
      item,
    ],
    issueTitle,
  );

  return {
    ...item,
    issueTitle,
    title: issueTitle || representativeArticle.title,
    source: representativeArticle.source || item.source || GOOGLE_TRENDS_SOURCE,
    url: representativeArticle.url || item.url || GOOGLE_TRENDS_KR_RSS_URL,
    publishedAt: item.publishedAt || representativeArticle.publishedAt || "",
    articleCount:
      item.articleCount ??
      (Array.isArray(item.relatedArticles) ? item.relatedArticles.length : 0),
    representativeArticle,
  };
}

function mergeRelatedArticles(left = [], right = []) {
  const merged = new Map();

  for (const rawArticle of [...left, ...right]) {
    const article = normalizeArticleRecord(rawArticle);
    if (!article.title && !article.url) continue;

    const key = article.url || normalizeKey(article.title);
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, article);
      continue;
    }

    if (compareArticlePriority(article, existing) > 0) {
      merged.set(key, article);
    }
  }

  return [...merged.values()]
    .sort((leftArticle, rightArticle) => compareArticlePriority(rightArticle, leftArticle))
    .slice(0, 6);
}

function pickRepresentativeArticle(articles = [], issueHint = "") {
  const normalizedArticles = articles
    .map((article) => normalizeArticleRecord(article))
    .filter((article) => article.title || article.url);

  if (normalizedArticles.length === 0) {
    return normalizeArticleRecord(null);
  }

  const normalizedHint = compactIssueTitle(issueHint).toLowerCase();
  const matchedArticles = normalizedHint
    ? normalizedArticles.filter((article) =>
        normalizeText(article.title).toLowerCase().includes(normalizedHint),
      )
    : [];
  const detailedMatchedArticles = matchedArticles.filter(
    (article) => normalizeText(article.title).toLowerCase() !== normalizedHint,
  );
  const candidateArticles =
    detailedMatchedArticles.length > 0
      ? detailedMatchedArticles
      : matchedArticles.length > 0
        ? matchedArticles
        : normalizedArticles;

  return [...candidateArticles].sort((left, right) => compareArticlePriority(right, left, issueHint))[0];
}

function compareArticlePriority(left, right, issueHint = "") {
  return getArticlePriorityScore(left, issueHint) - getArticlePriorityScore(right, issueHint);
}

function getArticlePriorityScore(article, issueHint = "") {
  const titleText = normalizeText(article?.title).toLowerCase();
  const sourceText = normalizeText(article?.source).toLowerCase();
  const urlText = normalizeText(article?.url).toLowerCase();

  return (
    (article?.relevanceScore ?? 0) * 100 +
    getIssueHintMatchScore(titleText, issueHint) * 120 +
    countTerms(titleText, ENTERTAINMENT_TITLE_TERMS) * 20 +
    countTerms(titleText, ENTERTAINMENT_SOFT_TITLE_TERMS) * 10 +
    countTerms(sourceText, ENTERTAINMENT_SOURCE_TERMS) * 25 +
    countTerms(urlText, ENTERTAINMENT_URL_HINTS) * 25 +
    new Date(article?.publishedAt || 0).getTime() / 1_000_000_000_000
  );
}

function normalizeArticleRecord(article) {
  if (!article) {
    return {
      title: "",
      source: GOOGLE_TRENDS_SOURCE,
      url: "",
      publishedAt: "",
      relevanceScore: 0,
    };
  }

  return {
    title: normalizeHeadlineCandidate(article.title),
    source: normalizeText(article.source) || GOOGLE_TRENDS_SOURCE,
    url: article.url || "",
    publishedAt: article.publishedAt || "",
    relevanceScore: article.relevanceScore ?? 0,
  };
}

function minDateValue(left, right) {
  const leftDate = new Date(left || 0);
  const rightDate = new Date(right || 0);

  if (Number.isNaN(leftDate.getTime())) return right || "";
  if (Number.isNaN(rightDate.getTime())) return left || "";
  return leftDate <= rightDate ? left : right;
}

function maxDateValue(left, right) {
  const leftDate = new Date(left || 0);
  const rightDate = new Date(right || 0);

  if (Number.isNaN(leftDate.getTime())) return right || "";
  if (Number.isNaN(rightDate.getTime())) return left || "";
  return leftDate >= rightDate ? left : right;
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
    source: "Google Trends KR",
    sourceMode: "trending-rss",
    sourceUrl: GOOGLE_TRENDS_KR_RSS_URL,
    title: "연예 화제 1~10위",
    updatedLabel: "Google Trends 기준",
    description: "Google Trends 연예 이슈 랭킹을 준비하는 중입니다.",
    title: "Hot Issue",
    updatedLabel: "Google Trends KR",
    description: "Google Trends KR 실시간 이슈를 불러오는 중입니다.",
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

function getIssueHintMatchScore(titleText, issueHint) {
  const normalizedHint = normalizeText(issueHint).toLowerCase();
  if (!normalizedHint) return 0;

  let score = 0;
  if (titleText.includes(normalizedHint)) {
    score += 10;
  }

  const compactHint = extractCompactIssueKeyword(normalizedHint).toLowerCase();
  if (compactHint && compactHint !== normalizedHint && titleText.includes(compactHint)) {
    score += 6;
  }

  return score;
}

function isRemovableIssueHeadline(value) {
  const normalized = normalizeHeadlineCandidate(value);
  if (!normalized) return true;

  const lowered = normalized.toLowerCase();
  if (looksLikeSourceLabel(lowered)) return true;
  if (GENERIC_ISSUE_TITLE_TERMS.has(lowered)) return true;
  if (!/[가-힣a-z0-9]/i.test(normalized)) return true;
  if (normalized.length <= 1) return true;

  return false;
}

function resolveIssueTitle(...candidates) {
  const flattenedCandidates = flattenTitleCandidates(candidates);
  const personIssueTitle = resolvePersonIssueTitle(flattenedCandidates);
  if (personIssueTitle) {
    return personIssueTitle;
  }

  for (const candidate of flattenedCandidates) {
    const normalized = compactIssueTitle(candidate);
    if (normalized) {
      return normalized;
    }
  }

  return "연예 이슈";
}

function flattenTitleCandidates(candidates) {
  return candidates.flatMap((candidate) =>
    Array.isArray(candidate) ? flattenTitleCandidates(candidate) : [candidate],
  );
}

function resolvePersonIssueTitle(candidates) {
  const scores = new Map();
  const flattenedCandidates = flattenTitleCandidates(candidates);

  flattenedCandidates.forEach((candidate, index) => {
    const normalized = normalizeHeadlineCandidate(candidate);
    if (!normalized) return;

    const baseWeight = Math.max(1, flattenedCandidates.length - index);
    if (isLikelyPersonName(normalized)) {
      addPersonNameScore(scores, normalized, 24 + baseWeight * 2);
    }

    for (const [name, score] of extractPersonNameCandidates(normalized)) {
      addPersonNameScore(scores, name, score + baseWeight);
    }
  });

  return [...scores.entries()]
    .sort((left, right) => {
      const scoreGap = right[1] - left[1];
      if (scoreGap !== 0) return scoreGap;

      const lengthGap =
        right[0].replace(/\s+/g, "").length - left[0].replace(/\s+/g, "").length;
      if (lengthGap !== 0) return lengthGap;

      return left[0].localeCompare(right[0], "ko");
    })
    .map(([name]) => name)[0] || "";
}

function extractPersonNameCandidates(value) {
  const normalized = normalizeHeadlineCandidate(value);
  if (!normalized) return [];

  const scores = new Map();
  const personNamePattern = "[\\uAC00-\\uD7A3]{2,4}(?:\\s+[\\uAC00-\\uD7A3]{2,4})?";
  const escapedContextTerms = PERSON_NAME_CONTEXT_TERMS.map(escapeRegExp).filter(Boolean);

  const addMatches = (pattern, score) => {
    for (const match of normalized.matchAll(pattern)) {
      addPersonNameScore(scores, match[1], score);
    }
  };

  if (escapedContextTerms.length > 0) {
    addMatches(
      new RegExp(
        `(?:${escapedContextTerms.join("|")})\\s+(${personNamePattern})`,
        "gu",
      ),
      20,
    );
  }

  addMatches(
    new RegExp(
      `(?:^|[^\\uAC00-\\uD7A3])(${personNamePattern})(?=\\s*(?:,|·|ㆍ|:|;|!|\\?))`,
      "gu",
    ),
    16,
  );

  addMatches(
    new RegExp(
      `(?:^|[^\\uAC00-\\uD7A3])(${personNamePattern})(?=(?:이|가|은|는|을|를|의|과|와|에게|한테|씨|군|양|님)\\s)`,
      "gu",
    ),
    14,
  );

  addMatches(
    new RegExp(
      `(?:^|[^\\uAC00-\\uD7A3])(${personNamePattern})(?=\\s*[·ㆍ])`,
      "gu",
    ),
    12,
  );

  if (isLikelyPersonName(normalized)) {
    addPersonNameScore(scores, normalized, 18);
  }

  return [...scores.entries()];
}

function addPersonNameScore(scores, rawName, score) {
  const normalized = normalizeText(rawName);
  if (!isLikelyPersonName(normalized)) return;

  scores.set(normalized, (scores.get(normalized) ?? 0) + score);
}

function isLikelyPersonName(value) {
  const normalized = normalizeText(value);
  if (!normalized) return false;

  const lowered = normalized.toLowerCase();
  const compact = lowered.replace(/\s+/g, "");

  if (looksLikeSourceLabel(lowered)) return false;
  if (PERSON_NAME_EXCLUDED_TERMS.has(lowered) || PERSON_NAME_EXCLUDED_TERMS.has(compact)) {
    return false;
  }

  if (!/^[\uAC00-\uD7A3]{2,4}(?:\s+[\uAC00-\uD7A3]{2,4})?$/u.test(normalized)) {
    return false;
  }

  return compact.length >= 2 && compact.length <= 7;
}

function compactIssueTitle(value) {
  const normalized = normalizeHeadlineCandidate(value);
  if (!normalized) return "";
  if (normalized.length <= 14) return normalized;

  return extractCompactIssueKeyword(normalized) || normalized;
}

function extractCompactIssueKeyword(value) {
  const normalized = normalizeHeadlineCandidate(value);
  if (!normalized) return "";

  const patterns = [
    /(?:^|[\s"'“”‘’\[\(…,:])([가-힣]{2,4})(?:이|가|은|는|을|를|의)(?=[\s"'“”‘’\]\)…,:]|$)/u,
    /(?:^|[\s"'“”‘’\[\(…,:])([가-힣]{2,4})(?=,|·|ㆍ|…)/u,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match?.[1] && !looksLikeSourceLabel(match[1])) {
      return match[1];
    }
  }

  return "";
}

function normalizeHeadlineCandidate(value) {
  let text = normalizeText(value);
  if (!text) return "";

  let previous = "";
  while (text && text !== previous) {
    previous = text;
    text = stripLeadingSourceLabel(text);
    text = stripTrailingSourceLabel(text);
    text = normalizeText(text);
  }

  return looksLikeSourceLabel(text) ? "" : text;
}

function stripLeadingSourceLabel(value) {
  const bracketMatch = value.match(/^[\[\(\{<【〔「『〈《]\s*([^\]\)\}>】〕」』〉》]+?)\s*[\]\)\}>】〕」』〉》]\s*(.+)$/u);
  if (bracketMatch && looksLikeSourceLabel(bracketMatch[1])) {
    return bracketMatch[2];
  }

  const prefixedMatch = value.match(/^(.{2,20}?)\s*[\|:\/·\-]\s*(.+)$/u);
  if (prefixedMatch && looksLikeSourceLabel(prefixedMatch[1])) {
    return prefixedMatch[2];
  }

  return value;
}

function stripTrailingSourceLabel(value) {
  const suffixedMatch = value.match(/^(.+?)\s*[\|·\-]\s*(.{2,20}?)$/u);
  if (suffixedMatch && looksLikeSourceLabel(suffixedMatch[2])) {
    return suffixedMatch[1];
  }

  return value;
}

function looksLikeSourceLabel(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (!normalized || NON_SOURCE_LABEL_TERMS.has(normalized)) {
    return false;
  }

  if (SOURCE_LABEL_TERMS.has(normalized)) {
    return true;
  }

  return SOURCE_LABEL_SUFFIXES.some((suffix) => normalized.endsWith(suffix));
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
