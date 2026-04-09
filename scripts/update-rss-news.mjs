import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT_DIR = resolve(process.cwd());
const DATA_DIR = resolve(ROOT_DIR, "data");
const TABS_DIR = resolve(DATA_DIR, "tabs");
const GENERATED_AT = new Date().toISOString();
const NOW_MS = Date.now();
const LOOKBACK_HOURS = clampNumber(process.env.NEWSBOX_LOOKBACK_HOURS, 336, 24, 720);
const LOOKBACK_MS = LOOKBACK_HOURS * 60 * 60 * 1000;
const MAX_ITEMS_PER_FEED = clampNumber(process.env.NEWSBOX_MAX_ITEMS_PER_FEED, 18, 3, 40);
const ARTICLE_LIMIT_PER_TAB = clampNumber(process.env.NEWSBOX_ARTICLE_LIMIT_PER_TAB, 8, 1, 20);
const REQUEST_DELAY_MS = clampNumber(process.env.NEWSBOX_REQUEST_DELAY_MS, 300, 0, 5000);
const FEED_TIMEOUT_MS = clampNumber(process.env.NEWSBOX_FEED_TIMEOUT_MS, 25000, 5000, 30000);
const TAB_PRIORITY = ["unity", "game", "entertainment", "ai"];

const TABS = [
  ["ai", "AI", "한국어 AI 뉴스와 업계 흐름을 빠르게 확인하는 탭", [["인공지능", 6], ["생성형", 5], [" ai ", 4], ["llm", 4], ["에이전트", 3], ["모델", 2], ["추론", 2], ["학습", 2], ["오픈ai", 4], ["openai", 4], ["클로드", 3], ["claude", 3], ["gemini", 3], ["딥러닝", 3], ["머신러닝", 3], ["멀티모달", 3], ["파운데이션 모델", 4], ["소버린 ai", 4], ["챗gpt", 4], ["gpt", 3]]],
  ["unity", "Unity", "Unity 엔진과 생태계 변화, 정책, 툴 업데이트를 모아보는 탭", [["유니티", 8], ["unity", 8], ["unity 6", 6], ["에셋 스토어", 5], ["asset store", 5], ["패키지 매니저", 3], ["package manager", 3], ["netcode", 2], ["cinemachine", 2], ["urp", 2], ["hdrp", 2], ["렌더 파이프라인", 3], ["render pipeline", 3]]],
  ["game", "게임", "게임 출시, 업데이트, 개발, 산업 이슈를 한 번에 모아보는 탭", [["게임", 6], ["게이밍", 4], ["게이머", 3], ["신작", 4], ["출시", 4], ["업데이트", 4], ["이벤트", 3], ["패치", 3], ["확장팩", 3], ["사전등록", 3], ["트레일러", 3], ["개발", 3], ["개발자", 3], ["개발사", 3], ["엔진", 4], ["파이프라인", 3], ["최적화", 3], ["렌더링", 3], ["그래픽", 3], ["셰이더", 3], ["sdk", 2], ["미들웨어", 2], ["프로토타입", 2], ["워크플로", 2], ["자동화", 2], ["퍼블리싱", 4], ["퍼블리셔", 4], ["실적", 3], ["매출", 3], ["영업이익", 3], ["투자", 3], ["인수", 4], ["합병", 4], ["규제", 4], ["서비스 종료", 4], ["mmorpg", 3], ["rpg", 3], ["fps", 3], ["tps", 2], ["e스포츠", 3], ["esports", 3], ["스팀", 2], ["steam", 2], ["콘솔", 2], ["모바일", 2], ["플레이스테이션", 2], ["엑스박스", 2], ["닌텐도", 2], ["ps5", 2], ["switch", 2]]],
  ["entertainment", "연예", "배우, 아이돌, 드라마, 영화, 방송, OTT 화제를 모아보는 탭", [["연예", 7], ["연예계", 6], ["방송", 4], ["예능", 4], ["드라마", 5], ["영화", 5], ["배우", 5], ["가수", 5], ["아이돌", 5], ["컴백", 4], ["데뷔", 4], ["종영", 3], ["방영", 3], ["시청률", 3], ["출연", 3], ["주연", 3], ["캐스팅", 4], ["소속사", 3], ["앨범", 4], ["싱글", 3], ["음원", 3], ["ost", 3], ["뮤직비디오", 4], ["콘서트", 4], ["팬미팅", 4], ["공연", 3], ["ott", 3], ["넷플릭스", 4], ["티빙", 3], ["웨이브", 3], ["디즈니+", 3], ["쿠팡플레이", 3], ["tvn", 3], ["jtbc", 3], ["mbc", 3], ["sbs", 3], ["kbs", 3], ["ena", 3], ["채널a", 3], ["하이브", 4], ["sm엔터테인먼트", 4], ["jyp", 4], ["yg", 4], ["어도어", 4], ["빌리프랩", 4], ["스타쉽", 4], ["플레디스", 4]]],
].map(([key, label, description, terms]) => ({ key, label, description, terms }));

const FEEDS = [
  ["itworld-kr", "ITWorld Korea", "https://www.itworld.co.kr/feed/", ["ai"]],
  ["etnews-games", "전자신문 게임", "http://rss.etnews.com/03104.xml", ["unity", "game"]],
  ["gameinsight-all", "게임인사이트", "https://cdn.gameinsight.co.kr/rss/gns_allArticle.xml", ["game"]],
  ["gameinsight-ai-blockchain", "게임인사이트 AI/블록체인", "https://cdn.gameinsight.co.kr/rss/gns_S1N8.xml", ["ai", "game"]],
  ["khgames-all", "경향게임스", "https://cdn.khgames.co.kr/rss/gn_rss_allArticle.xml", ["game"]],
  ["sportschosun-entertainment", "스포츠조선 연예", "https://www.sportschosun.com/rss/index_enter.htm", ["entertainment"]],
  ["newsis-entertainment", "뉴시스 연예", "https://www.newsis.com/RSS/entertain.xml", ["entertainment"]],
  ["sportsdonga-entertainment", "스포츠동아 엔터테인먼트", "https://rss.donga.com/sportsdonga/entertainment.xml", ["entertainment"]],
].map(([key, source, url, hints]) => ({ key, source, url, hints }));

const GAME_COMPANY_TERMS = [
  "넥슨",
  "크래프톤",
  "엔씨",
  "엔씨소프트",
  "넷마블",
  "카카오게임즈",
  "펄어비스",
  "네오위즈",
  "시프트업",
  "스마일게이트",
  "웹젠",
  "컴투스",
  "위메이드",
  "데브시스터즈",
  "넵튠",
  "액토즈",
  "라이온하트",
  "그라비티",
  "세가",
  "캡콤",
  "반다이남코",
  "에픽게임즈",
  "유비소프트",
];

const AI_SIGNAL_TERMS = uniqueTerms(["인공지능", "생성형", " ai ", "llm", "에이전트", "오픈ai", "openai", "클로드", "claude", "gemini", "딥러닝", "머신러닝", "멀티모달", "파운데이션 모델", "소버린 ai", "챗gpt", "gpt"]);
const AI_NEGATION_TERMS = uniqueTerms(["ai 없이", "ai 없는", "인공지능 없이", "인공지능 없는"]);
const GAME_COMPANY_SIGNAL_TERMS = uniqueTerms(GAME_COMPANY_TERMS.filter((term) => !["세가"].includes(term)));
const UNITY_SIGNAL_TERMS = uniqueTerms(["유니티", "unity", "unity 6", "에셋 스토어", "asset store", "패키지 매니저", "package manager", "netcode", "cinemachine", "urp", "hdrp", "렌더 파이프라인", "render pipeline"]);
const GAME_SIGNAL_TERMS = uniqueTerms(["게임", "게이밍", "게이머", "mmorpg", "rpg", "fps", "tps", "어드벤처", "시뮬레이션", "스팀", "steam", "콘솔", "playstation", "플레이스테이션", "엑스박스", "xbox", "닌텐도", "switch", "ps5", "모바일", "pc", "e스포츠", "esports", "인디게임", "신작", "업데이트", "패치", "이벤트", "확장팩", "퍼블리싱", "퍼블리셔", "개발사", "출시", ...GAME_COMPANY_SIGNAL_TERMS]);
const GAME_HARD_ANCHOR_TERMS = uniqueTerms(["게임", "게이밍", "mmorpg", "rpg", "fps", "tps", "어드벤처", "시뮬레이션", "스팀", "steam", "콘솔", "플레이스테이션", "엑스박스", "닌텐도", "switch", "ps5", "모바일", "e스포츠", "esports", "인디게임", "신작", "업데이트", "패치", "확장팩", "사전등록", "출시", "전투", "캐릭터", "퀘스트", "보스", "레이드", "스토어", ...GAME_COMPANY_SIGNAL_TERMS]);
const GAME_CORE_TERMS = uniqueTerms(["게임", "게이밍", "게이머", "mmorpg", "rpg", "fps", "tps", "어드벤처", "시뮬레이션", "스팀", "steam", "콘솔", "playstation", "플레이스테이션", "엑스박스", "xbox", "닌텐도", "switch", "ps5", "모바일", "e스포츠", "esports", "인디게임", "신작", "업데이트", "패치", "이벤트", "확장팩", "사전등록", "출시", "서버", "대회", ...GAME_COMPANY_SIGNAL_TERMS]);
const GAME_DEVELOPMENT_CORE_TERMS = uniqueTerms(["엔진", "파이프라인", "최적화", "그래픽", "셰이더", "shader", "렌더링", "rendering", "sdk", "미들웨어", "프로토타입", "워크플로", "workflow", "자동화", "에셋", "툴", "툴링", "프로그래밍", "코드", "유니티", "unity", "언리얼엔진", "언리얼", "netcode", "cinemachine", "urp", "hdrp"]);
const GAME_INDUSTRY_CORE_TERMS = uniqueTerms(["실적", "매출", "영업이익", "투자", "인수", "합병", "상장", "규제", "퍼블리싱", "퍼블리셔", "지분", "서비스 종료", "layoff", "ceo", "다운로드", "흥행", "공모전", "점유율", "매각", "조직", "경영", "브리핑", ...GAME_COMPANY_SIGNAL_TERMS]);
const ENTERTAINMENT_COMPANY_TERMS = uniqueTerms(["하이브", "sm", "sm엔터테인먼트", "jyp", "yg", "어도어", "빌리프랩", "스타쉽", "플레디스", "큐브", "rbw", "안테나", "판타지오", "울림", "미스틱스토리", "킹콩 by 스타쉽"]);
const ENTERTAINMENT_SIGNAL_TERMS = uniqueTerms([
  "연예",
  "연예계",
  "방송",
  "예능",
  "드라마",
  "영화",
  "배우",
  "가수",
  "아이돌",
  "컴백",
  "데뷔",
  "종영",
  "방영",
  "시청률",
  "출연",
  "주연",
  "캐스팅",
  "소속사",
  "앨범",
  "싱글",
  "음원",
  "ost",
  "뮤직비디오",
  "콘서트",
  "팬미팅",
  "공연",
  "보이그룹",
  "걸그룹",
  "솔로 아티스트",
  "넷플릭스",
  "티빙",
  "웨이브",
  "디즈니+",
  "쿠팡플레이",
  "ott",
  "tvn",
  "jtbc",
  "mbc",
  "sbs",
  "kbs",
  "ena",
  "채널a",
  ...ENTERTAINMENT_COMPANY_TERMS,
]);
const CRYPTO_NOISE_TERMS = uniqueTerms(["가상자산", "가상화폐", "암호화폐", "비트코인", "이더리움", "코인", "알트코인", "업비트", "빗썸", "거래소", "체결강도", "토큰", "에어드랍"]);

await main();

async function main() {
  const feedStatuses = [];
  const candidates = [];

  for (const feed of FEEDS) {
    try {
      const articles = await fetchFeed(feed);
      candidates.push(...articles);
      feedStatuses.push({ key: feed.key, source: feed.source, ok: true, itemCount: articles.length });
    } catch (error) {
      feedStatuses.push({ key: feed.key, source: feed.source, ok: false, itemCount: 0, error: normalizeText(error.message) });
      console.warn(`[newsbox] Failed to fetch ${feed.key}: ${error.message}`);
    }

    if (REQUEST_DELAY_MS > 0) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  const successfulFeeds = feedStatuses.filter((feed) => feed.ok);

  if (successfulFeeds.length === 0) {
    throw new Error("No Korean RSS or Atom feeds could be fetched successfully.");
  }

  const perTab = new Map(TABS.map((tab) => [tab.key, []]));

  for (const article of dedupe(candidates).map(classifyArticle).filter(Boolean)) {
    if (perTab.has(article.tab)) {
      perTab.get(article.tab).push(article);
    }
  }

  mkdirSync(TABS_DIR, { recursive: true });
  cleanupObsoleteTabFiles();

  let totalArticleCount = 0;

  for (const tab of TABS) {
    const articles = (perTab.get(tab.key) ?? [])
      .sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt))
      .slice(0, ARTICLE_LIMIT_PER_TAB);

    totalArticleCount += articles.length;
    writeJson(resolve(TABS_DIR, `${tab.key}.json`), {
      tab: tab.key,
      label: tab.label,
      description: tab.description,
      sourceMode: "korean-rss",
      contentLocale: "ko-KR",
      lastUpdatedAt: GENERATED_AT,
      articleCount: articles.length,
      articles,
    });
  }

  writeJson(resolve(DATA_DIR, "metadata.json"), {
    version: "0.5.0-live",
    sourceMode: "korean-rss",
    sourceProvider: "rss",
    contentLocale: "ko-KR",
    lastUpdatedAt: GENERATED_AT,
    tabCount: TABS.length,
    totalArticleCount,
    availableTabs: TABS.map((tab) => tab.key),
    requestConfig: { lookbackHours: LOOKBACK_HOURS, maxItemsPerFeed: MAX_ITEMS_PER_FEED, articleLimitPerTab: ARTICLE_LIMIT_PER_TAB, feedTimeoutMs: FEED_TIMEOUT_MS },
    feedCount: FEEDS.length,
    successfulFeedCount: successfulFeeds.length,
    failedFeedCount: feedStatuses.length - successfulFeeds.length,
    successfulFeeds: successfulFeeds.map((feed) => ({ key: feed.key, source: feed.source, itemCount: feed.itemCount })),
    failedFeeds: feedStatuses.filter((feed) => !feed.ok).map((feed) => ({ key: feed.key, source: feed.source, error: feed.error })),
  });

  console.log(`NewsBox data updated successfully with ${totalArticleCount} Korean articles from ${successfulFeeds.length}/${FEEDS.length} feeds.`);
}

async function fetchFeed(feed) {
  const response = await fetch(feed.url, {
    headers: {
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.6",
      "User-Agent": "NewsBoxBot/0.4 (+https://arkjsj86.github.io/NewsBox/)",
    },
    signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const xml = stripBom(await response.text());
  const entries = parseFeed(xml, feed);
  return entries
    .map((entry, index) => normalizeArticle(entry, feed, index))
    .filter((article) => article.title && article.url)
    .filter(isRecentArticle)
    .filter(isKoreanArticle)
    .filter(isRelevantArticle)
    .slice(0, MAX_ITEMS_PER_FEED);
}

function parseFeed(xml, feed) {
  const items = matchBlocks(xml, "item");

  if (items.length > 0) {
    return items.map((block) => ({
      title: cleanText(readTag(block, ["title"])),
      url: resolveLink(readTag(block, ["link"]), feed.url),
      publishedAt: parseDate(readTag(block, ["pubDate", "published", "updated"])),
      summary: cleanSummary(readTag(block, ["description", "content:encoded", "content", "summary"])),
    }));
  }

  const entries = matchBlocks(xml, "entry");
  if (entries.length > 0) {
    return entries.map((block) => ({
      title: cleanText(readTag(block, ["title"])),
      url: resolveLink(readAtomLink(block), feed.url),
      publishedAt: parseDate(readTag(block, ["updated", "published"])),
      summary: cleanSummary(readTag(block, ["summary", "content"])),
    }));
  }

  throw new Error("Unsupported feed format");
}

function normalizeArticle(entry, feed, index) {
  const url = normalizeUrl(entry.url);
  const title = normalizeText(entry.title);
  const publishedAt = entry.publishedAt || GENERATED_AT;

  return { id: createStableId(url || `${feed.key}:${title}:${publishedAt}`), title, summary: summarizeText(entry.summary || title), url: url || entry.url, publishedAt, source: feed.source, primaryHint: feed.hints.length === 1 ? feed.hints[0] : null, hints: [...feed.hints], rank: index + 1 };
}

function dedupe(candidates) {
  const grouped = new Map();

  for (const candidate of candidates) {
    const key = candidate.url ? `url:${candidate.url}` : `title:${normalizeTitle(candidate.title)}`;
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, { ...candidate, hints: new Set(candidate.hints) });
      continue;
    }

    for (const hint of candidate.hints) {
      existing.hints.add(hint);
    }
    if ((candidate.summary?.length ?? 0) > (existing.summary?.length ?? 0)) existing.summary = candidate.summary;
    if (new Date(candidate.publishedAt) > new Date(existing.publishedAt)) existing.publishedAt = candidate.publishedAt;
    if (candidate.rank < existing.rank) {
      existing.rank = candidate.rank;
      existing.primaryHint = candidate.primaryHint;
      existing.source = candidate.source;
    }
  }

  return Array.from(grouped.values());
}

function classifyArticle(article) {
  const text = buildSearchText(article);
  const scope = analyzeScope(buildContentText(article), article);
  let bestTab = article.primaryHint || defaultTabForScope(scope);
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const tab of TABS) {
    let score = article.primaryHint === tab.key ? 5 : 0;
    if (article.hints?.has?.(tab.key) || article.hints?.includes?.(tab.key)) score += 3;
    if (scope.hasAi && tab.key === "ai") score += 6;
    if (scope.hasUnity && tab.key === "unity") score += 8;
    if (scope.hasGame && tab.key === "game") score += 6;
    if (scope.hasEntertainment && tab.key === "entertainment") score += 6;
    if (!scope.hasAi && tab.key === "ai") score -= 1;
    if (!scope.hasUnity && tab.key === "unity") score -= 2;
    if (!scope.hasGame && tab.key === "game") score -= 2;
    if (!scope.hasEntertainment && tab.key === "entertainment") score -= 2;
    for (const [term, weight] of tab.terms) score += countTerm(text, term) * weight;
    if (score > bestScore || (score === bestScore && compareTabPriority(tab.key, bestTab) < 0)) {
      bestScore = score;
      bestTab = tab.key;
    }
  }

  if (bestTab === "unity" && !scope.hasUnity) {
    bestTab = scope.hasGame ? "game" : scope.hasEntertainment ? "entertainment" : "ai";
  }

  if (bestTab === "game" && !scope.hasGame) {
    bestTab = scope.hasUnity ? "unity" : scope.hasEntertainment ? "entertainment" : "ai";
  }

  if (bestTab === "entertainment" && !scope.hasEntertainment) {
    bestTab = scope.hasGame ? "game" : scope.hasUnity ? "unity" : "ai";
  }

  if (bestTab === "ai" && !scope.hasAi) {
    bestTab = scope.hasUnity ? "unity" : scope.hasGame ? "game" : "entertainment";
  }

  return { id: article.id, title: article.title, url: article.url, source: article.source, publishedAt: article.publishedAt, summary: article.summary, tab: bestTab };
}

function isRecentArticle(article) {
  const publishedMs = new Date(article.publishedAt).getTime();
  return Number.isFinite(publishedMs) && NOW_MS - publishedMs <= LOOKBACK_MS;
}

function isKoreanArticle(article) {
  const text = `${article.title} ${article.summary}`;
  const hangulCount = countPattern(text, /[가-힣ㄱ-ㅎㅏ-ㅣ]/g);
  const latinCount = countPattern(text, /[A-Za-z]/g);
  return hangulCount >= 3 && hangulCount >= Math.max(3, Math.floor(latinCount * 0.35));
}

function isRelevantArticle(article) {
  const text = buildContentText(article);
  const scope = analyzeScope(text, article);
  const fromAiFeed = getHintList(article).includes("ai");

  if (!scope.hasAi && !scope.hasUnity && !scope.hasGame && !scope.hasEntertainment) return false;
  if (fromAiFeed && !scope.hasAi && !scope.hasUnity) return false;
  if (scope.hasAiNegation && scope.aiSignalCount === 1 && !scope.hasUnity && !scope.hasGame && !scope.hasEntertainment) return false;
  if (scope.hasCryptoNoise && !scope.hasUnity && !scope.hasGame && !scope.hasEntertainment) return false;
  if (scope.hasCryptoNoise && !scope.hasUnity && scope.gameHardAnchorCount === 0 && scope.entertainmentSignalCount === 0) return false;
  if (scope.hasCryptoNoise && !scope.hasUnity && scope.gameCompanyCount === 0 && scope.gameDevelopmentCoreCount === 0 && scope.gameCoreCount < 2 && scope.entertainmentSignalCount === 0) return false;
  if (scope.hasCryptoNoise && scope.hasAi && !fromAiFeed && !scope.hasGame && !scope.hasEntertainment) return false;
  return true;
}

function analyzeScope(text, article) {
  const aiSignalCount = countTerms(text, AI_SIGNAL_TERMS);
  const unitySignalCount = countTerms(text, UNITY_SIGNAL_TERMS);
  const gameSignalCount = countTerms(text, GAME_SIGNAL_TERMS);
  const gameHardAnchorCount = countTerms(text, GAME_HARD_ANCHOR_TERMS);
  const gameCoreCount = countTerms(text, GAME_CORE_TERMS);
  const gameCompanyCount = countTerms(text, GAME_COMPANY_SIGNAL_TERMS);
  const gameDevelopmentCoreCount = countTerms(text, GAME_DEVELOPMENT_CORE_TERMS);
  const gameIndustryCoreCount = countTerms(text, GAME_INDUSTRY_CORE_TERMS);
  const entertainmentSignalCount = countTerms(text, ENTERTAINMENT_SIGNAL_TERMS);
  const cryptoNoiseCount = countTerms(text, CRYPTO_NOISE_TERMS);
  return {
    hasAi: aiSignalCount > 0,
    hasAiNegation: hasAnyTerm(text, AI_NEGATION_TERMS),
    hasUnity: unitySignalCount > 0,
    hasGame: gameSignalCount > 0 || gameHardAnchorCount > 0 || gameCoreCount > 0 || gameCompanyCount > 0 || gameDevelopmentCoreCount > 0 || gameIndustryCoreCount > 0,
    hasEntertainment: entertainmentSignalCount > 0,
    hasCryptoNoise: cryptoNoiseCount > 0,
    aiSignalCount,
    unitySignalCount,
    gameSignalCount,
    gameHardAnchorCount,
    gameCoreCount,
    gameCompanyCount,
    gameDevelopmentCoreCount,
    gameIndustryCoreCount,
    entertainmentSignalCount,
    cryptoNoiseCount,
  };
}

function defaultTabForScope(scope) {
  if (scope.hasUnity) return "unity";
  if (scope.hasGame) return "game";
  if (scope.hasEntertainment) return "entertainment";
  return "ai";
}

function hasAnyTerm(text, terms) {
  return terms.some((term) => countTerm(text, term) > 0);
}

function buildSearchText(article) {
  return ` ${article.title} ${article.summary} ${getUrlPathText(article.url)} `.toLowerCase();
}

function buildContentText(article) {
  return ` ${article.title} ${article.summary} `.toLowerCase();
}

function getHintList(article) {
  if (article.hints instanceof Set) return [...article.hints];
  return Array.isArray(article.hints) ? article.hints : [];
}

function compareTabPriority(left, right) {
  return TAB_PRIORITY.indexOf(left) - TAB_PRIORITY.indexOf(right);
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

function readAtomLink(block) {
  const tags = Array.from(block.matchAll(/<link\b([^>]*)\/?>/gi), (match) => match[1] || "");
  for (const attributes of tags) {
    const href = readAttr(attributes, "href");
    const rel = readAttr(attributes, "rel");
    if (href && (!rel || rel === "alternate")) return href;
  }
  return "";
}

function readAttr(attributes, key) {
  const match = attributes.match(new RegExp(`${key}=(["'])(.*?)\\1`, "i"));
  return match ? match[2] : "";
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

function getUrlPathText(value) {
  try {
    return new URL(value).pathname.replace(/[-_/]+/g, " ");
  } catch {
    return "";
  }
}

function parseDate(value) {
  const cleaned = normalizeText(cleanXml(value));
  const parsed = new Date(cleaned);
  return !cleaned || Number.isNaN(parsed.getTime()) ? GENERATED_AT : parsed.toISOString();
}

function cleanText(value) {
  return normalizeText(stripHtml(decodeEntities(cleanXml(value))));
}

function cleanSummary(value) {
  return normalizeText(stripHtml(decodeEntities(cleanXml(value))));
}

function cleanXml(value) {
  return String(value || "").replace(/^<!\[CDATA\[/i, "").replace(/\]\]>$/i, "").trim();
}

function decodeEntities(value) {
  return String(value || "").replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))).replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16))).replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, "\"").replace(/&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
}

function stripHtml(value) {
  return String(value || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<br\s*\/?>/gi, " ").replace(/<\/p>/gi, " ").replace(/<[^>]+>/g, " ");
}

function stripBom(value) {
  return String(value || "").replace(/^\uFEFF/, "");
}

function normalizeUrl(urlValue) {
  if (!urlValue) return "";
  try {
    const url = new URL(urlValue);
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "mc_cid", "mc_eid", "ocid", "ref", "ref_src"]) url.searchParams.delete(key);
    url.hash = "";
    if (!url.searchParams.toString()) url.search = "";
    return url.toString();
  } catch {
    return String(urlValue).trim();
  }
}

function normalizeTitle(value) {
  return normalizeText(value).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").replace(/\[\+\d+ chars\]$/i, "").trim();
}

function summarizeText(value) {
  const cleaned = normalizeText(value);
  if (!cleaned) return "요약이 아직 준비되지 않았습니다.";
  return cleaned.length <= 220 ? cleaned : `${cleaned.slice(0, 217).trimEnd()}...`;
}

function countTerm(text, term) {
  let count = 0;
  let index = -1;
  while ((index = text.indexOf(term, index + 1)) !== -1) count += 1;
  return count;
}

function countPattern(value, pattern) {
  return Array.from(String(value || "").matchAll(pattern)).length;
}

function countTerms(text, terms) {
  return terms.reduce((total, term) => total + countTerm(text, term), 0);
}

function createStableId(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function uniqueTerms(values) {
  return [...new Set(values.map((value) => value.toLowerCase()))];
}

function cleanupObsoleteTabFiles() {
  const activeFiles = new Set(TABS.map((tab) => `${tab.key}.json`));
  for (const entry of readdirSync(TABS_DIR, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    if (!activeFiles.has(entry.name)) {
      rmSync(resolve(TABS_DIR, entry.name), { force: true });
    }
  }
}

function writeJson(filePath, payload) {
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function clampNumber(rawValue, fallbackValue, minValue, maxValue) {
  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue)) return fallbackValue;
  return Math.min(maxValue, Math.max(minValue, parsedValue));
}
