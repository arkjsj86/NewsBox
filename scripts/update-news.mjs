import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT_DIR = resolve(process.cwd());
const DATA_DIR = resolve(ROOT_DIR, "data");
const TABS_DIR = resolve(DATA_DIR, "tabs");
const GENERATED_AT = new Date().toISOString();

const API_KEY = process.env.GNEWS_API_KEY?.trim();
const GNEWS_LANG = process.env.NEWSBOX_GNEWS_LANG?.trim() || "en";
const GNEWS_COUNTRY = process.env.NEWSBOX_GNEWS_COUNTRY?.trim() || "";
const LOOKBACK_HOURS = clampNumber(process.env.NEWSBOX_LOOKBACK_HOURS, 72, 24, 168);
const MAX_PER_TAB = clampNumber(process.env.NEWSBOX_GNEWS_MAX_PER_TAB, 10, 1, 25);
const ARTICLE_LIMIT_PER_TAB = clampNumber(process.env.NEWSBOX_ARTICLE_LIMIT_PER_TAB, 8, 1, 20);
const REQUEST_DELAY_MS = clampNumber(process.env.NEWSBOX_REQUEST_DELAY_MS, 1200, 0, 5000);

const TAB_PRIORITY = [
  "unity",
  "game-industry",
  "game-development",
  "ai",
  "game-general",
];

const TAB_CONFIG = [
  {
    key: "ai",
    label: "AI",
    description: "생성형 AI, 인프라, 정책, 투자 흐름을 빠르게 확인하는 탭",
    query: '("artificial intelligence" OR "generative AI" OR OpenAI OR Anthropic OR ChatGPT OR LLM)',
    rules: [
      { pattern: /\bartificial intelligence\b/gi, weight: 6 },
      { pattern: /\bgenerative ai\b/gi, weight: 6 },
      { pattern: /\bai\b/gi, weight: 2 },
      { pattern: /\bllm\b/gi, weight: 4 },
      { pattern: /\bchatgpt\b/gi, weight: 5 },
      { pattern: /\bopenai\b/gi, weight: 5 },
      { pattern: /\banthropic\b/gi, weight: 4 },
      { pattern: /\bgemini\b/gi, weight: 3 },
      { pattern: /\bcopilot\b/gi, weight: 3 },
      { pattern: /\bmachine learning\b/gi, weight: 3 },
      { pattern: /\bmodel\b/gi, weight: 1 },
      { pattern: /\binference\b/gi, weight: 2 },
      { pattern: /\bnpu\b/gi, weight: 2 },
      { pattern: /\bai chip\b/gi, weight: 3 },
      { pattern: /\bnvidia\b/gi, weight: 2 },
    ],
  },
  {
    key: "unity",
    label: "Unity",
    description: "Unity 엔진과 생태계 변화, 정책, 툴 업데이트를 모아보는 탭",
    query: '(Unity OR "Unity Engine" OR "Unity 6" OR "Asset Store")',
    rules: [
      { pattern: /\bunity\b/gi, weight: 8 },
      { pattern: /\bunity 6\b/gi, weight: 6 },
      { pattern: /\basset store\b/gi, weight: 5 },
      { pattern: /\bpackage manager\b/gi, weight: 3 },
      { pattern: /\bunity technologies\b/gi, weight: 5 },
      { pattern: /\burp\b/gi, weight: 2 },
      { pattern: /\bhdrp\b/gi, weight: 2 },
      { pattern: /\bscriptable render pipeline\b/gi, weight: 3 },
    ],
  },
  {
    key: "game-industry",
    label: "게임 산업",
    description: "게임사 실적, 투자, 퍼블리싱, 규제 같은 산업 중심 뉴스를 다루는 탭",
    query:
      '((gaming OR "video game") AND (publisher OR studio OR revenue OR earnings OR acquisition OR layoffs OR regulation))',
    rules: [
      { pattern: /\bgaming\b/gi, weight: 1 },
      { pattern: /\bvideo game\b/gi, weight: 1 },
      { pattern: /\bpublisher\b/gi, weight: 4 },
      { pattern: /\bstudio\b/gi, weight: 2 },
      { pattern: /\brevenue\b/gi, weight: 5 },
      { pattern: /\bearnings\b/gi, weight: 5 },
      { pattern: /\bacquisition\b/gi, weight: 6 },
      { pattern: /\bmerger\b/gi, weight: 5 },
      { pattern: /\binvestment\b/gi, weight: 4 },
      { pattern: /\blayoffs?\b/gi, weight: 6 },
      { pattern: /\bregulation\b/gi, weight: 5 },
      { pattern: /\bpublishing\b/gi, weight: 4 },
      { pattern: /\bmarket\b/gi, weight: 3 },
      { pattern: /\bunion\b/gi, weight: 3 },
      { pattern: /\bquarter\b/gi, weight: 2 },
      { pattern: /\bceo\b/gi, weight: 2 },
    ],
  },
  {
    key: "game-development",
    label: "게임 개발",
    description: "게임 제작 기술, 파이프라인, 최적화, 툴링에 집중하는 탭",
    query:
      '(("game development" OR gamedev OR "game engine") AND (rendering OR pipeline OR optimization OR tools OR developer))',
    rules: [
      { pattern: /\bgame development\b/gi, weight: 6 },
      { pattern: /\bgamedev\b/gi, weight: 6 },
      { pattern: /\bdeveloper\b/gi, weight: 2 },
      { pattern: /\bdevelopment\b/gi, weight: 2 },
      { pattern: /\bgame engine\b/gi, weight: 5 },
      { pattern: /\brendering\b/gi, weight: 4 },
      { pattern: /\bpipeline\b/gi, weight: 4 },
      { pattern: /\boptimization\b/gi, weight: 5 },
      { pattern: /\btools?\b/gi, weight: 3 },
      { pattern: /\bworkflow\b/gi, weight: 3 },
      { pattern: /\bshader\b/gi, weight: 4 },
      { pattern: /\bpostmortem\b/gi, weight: 4 },
      { pattern: /\bbuild\b/gi, weight: 2 },
      { pattern: /\bqa\b/gi, weight: 3 },
    ],
  },
  {
    key: "game-general",
    label: "게임 일반",
    description: "신작, 업데이트, 이벤트, 대중적 화제를 확인하는 탭",
    query:
      '((gaming OR "video game") AND (release OR trailer OR update OR esports OR patch OR launch))',
    rules: [
      { pattern: /\bgaming\b/gi, weight: 1 },
      { pattern: /\bvideo game\b/gi, weight: 1 },
      { pattern: /\brelease\b/gi, weight: 4 },
      { pattern: /\btrailer\b/gi, weight: 4 },
      { pattern: /\bupdate\b/gi, weight: 4 },
      { pattern: /\besports\b/gi, weight: 4 },
      { pattern: /\bpatch\b/gi, weight: 3 },
      { pattern: /\blaunch\b/gi, weight: 4 },
      { pattern: /\bseason\b/gi, weight: 3 },
      { pattern: /\bevent\b/gi, weight: 2 },
      { pattern: /\bcommunity\b/gi, weight: 2 },
      { pattern: /\bplaystation\b/gi, weight: 2 },
      { pattern: /\bxbox\b/gi, weight: 2 },
      { pattern: /\bnintendo\b/gi, weight: 2 },
      { pattern: /\bsteam\b/gi, weight: 2 },
    ],
  },
];

await main();

async function main() {
  if (!API_KEY) {
    throw new Error(
      "Missing GNEWS_API_KEY. Add it as an environment variable locally or as a GitHub Actions repository secret.",
    );
  }

  const candidates = [];

  for (const tab of TAB_CONFIG) {
    const response = await fetchTabArticles(tab);
    candidates.push(...response);

    if (REQUEST_DELAY_MS > 0) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  const groupedArticles = groupArticles(candidates);
  const classifiedArticles = groupedArticles.map(classifyArticle).filter(Boolean);

  const perTab = new Map(TAB_CONFIG.map((tab) => [tab.key, []]));

  for (const article of classifiedArticles) {
    if (!perTab.has(article.tab)) {
      continue;
    }

    perTab.get(article.tab).push(article);
  }

  for (const [tabKey, articles] of perTab.entries()) {
    articles.sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt));
    perTab.set(tabKey, articles.slice(0, ARTICLE_LIMIT_PER_TAB));
  }

  mkdirSync(TABS_DIR, { recursive: true });

  let totalArticleCount = 0;

  for (const tab of TAB_CONFIG) {
    const articles = perTab.get(tab.key) ?? [];
    totalArticleCount += articles.length;

    writeJson(resolve(TABS_DIR, `${tab.key}.json`), {
      tab: tab.key,
      label: tab.label,
      description: tab.description,
      sourceMode: "gnews-api",
      lastUpdatedAt: GENERATED_AT,
      articleCount: articles.length,
      articles,
    });
  }

  writeJson(resolve(DATA_DIR, "metadata.json"), {
    version: "0.2.0-live",
    sourceMode: "gnews-api",
    sourceProvider: "gnews",
    lastUpdatedAt: GENERATED_AT,
    tabCount: TAB_CONFIG.length,
    totalArticleCount,
    availableTabs: TAB_CONFIG.map((tab) => tab.key),
    requestConfig: {
      lang: GNEWS_LANG,
      country: GNEWS_COUNTRY || null,
      maxPerTab: MAX_PER_TAB,
      lookbackHours: LOOKBACK_HOURS,
    },
  });

  console.log(`NewsBox data updated successfully with ${totalArticleCount} articles.`);
}

async function fetchTabArticles(tab) {
  const endpoint = new URL("https://gnews.io/api/v4/search");
  const fromDate = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000).toISOString();

  endpoint.searchParams.set("q", tab.query);
  endpoint.searchParams.set("lang", GNEWS_LANG);
  endpoint.searchParams.set("max", String(MAX_PER_TAB));
  endpoint.searchParams.set("from", fromDate);
  endpoint.searchParams.set("sortby", "publishedAt");
  endpoint.searchParams.set("in", "title,description");
  endpoint.searchParams.set("nullable", "description,image");
  endpoint.searchParams.set("apikey", API_KEY);

  if (GNEWS_COUNTRY) {
    endpoint.searchParams.set("country", GNEWS_COUNTRY);
  }

  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      "User-Agent": "NewsBoxBot/0.2",
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorText = formatApiError(payload);
    throw new Error(
      `GNews request failed for ${tab.key} with HTTP ${response.status}. ${errorText}`,
    );
  }

  return (payload.articles ?? []).map((article, index) => normalizeArticle(article, tab, index));
}

function normalizeArticle(article, tab, index) {
  const normalizedUrl = normalizeUrl(article.url);
  const title = normalizeText(article.title);
  const description = summarizeText(article.description || article.content || "");
  const publishedAt = article.publishedAt || GENERATED_AT;
  const source = normalizeText(article.source?.name || "Unknown Source");

  return {
    id: createStableId(normalizedUrl || `${tab.key}:${title}:${publishedAt}`),
    title,
    summary: description,
    url: normalizedUrl || article.url,
    publishedAt,
    source,
    tabHint: tab.key,
    searchRank: index + 1,
    sourceUrl: article.source?.url || null,
  };
}

function groupArticles(candidates) {
  const grouped = new Map();

  for (const candidate of candidates) {
    const key = candidate.url ? `url:${candidate.url}` : `title:${normalizeTitle(candidate.title)}`;
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        ...candidate,
        matchedTabs: new Set([candidate.tabHint]),
      });
      continue;
    }

    existing.matchedTabs.add(candidate.tabHint);

    if ((candidate.summary?.length ?? 0) > (existing.summary?.length ?? 0)) {
      existing.summary = candidate.summary;
    }

    if (new Date(candidate.publishedAt) > new Date(existing.publishedAt)) {
      existing.publishedAt = candidate.publishedAt;
    }

    if (candidate.searchRank < existing.searchRank) {
      existing.searchRank = candidate.searchRank;
      existing.tabHint = candidate.tabHint;
    }
  }

  return Array.from(grouped.values());
}

function classifyArticle(article) {
  const articleText = `${article.title} ${article.summary} ${article.source}`.toLowerCase();

  let bestTab = article.tabHint;
  let bestScore = -1;

  for (const tab of TAB_CONFIG) {
    const score = scoreArticleForTab(articleText, article, tab);

    if (score > bestScore) {
      bestScore = score;
      bestTab = tab.key;
      continue;
    }

    if (score === bestScore && compareTabPriority(tab.key, bestTab) < 0) {
      bestTab = tab.key;
    }
  }

  return {
    id: article.id,
    title: article.title,
    url: article.url,
    source: article.source,
    publishedAt: article.publishedAt,
    summary: article.summary,
    tab: bestTab,
  };
}

function scoreArticleForTab(articleText, article, tab) {
  let score = 0;

  if (article.tabHint === tab.key) {
    score += 6;
  }

  if (article.matchedTabs?.has(tab.key)) {
    score += 3;
  }

  if (tab.key === "game-general") {
    score += 1;
  }

  for (const rule of tab.rules) {
    score += countMatches(articleText, rule.pattern) * rule.weight;
  }

  return score;
}

function compareTabPriority(left, right) {
  return TAB_PRIORITY.indexOf(left) - TAB_PRIORITY.indexOf(right);
}

function normalizeUrl(urlValue) {
  if (!urlValue) {
    return "";
  }

  try {
    const url = new URL(urlValue);
    const blockedParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gclid",
      "fbclid",
      "mc_cid",
      "mc_eid",
      "ocid",
      "guccounter",
      "guce_referrer",
      "guce_referrer_sig",
      "ref",
      "ref_src",
    ];

    for (const param of blockedParams) {
      url.searchParams.delete(param);
    }

    url.hash = "";
    return url.toString();
  } catch {
    return urlValue.trim();
  }
}

function normalizeTitle(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\[\+\d+ chars\]$/i, "")
    .trim();
}

function summarizeText(value) {
  const cleaned = normalizeText(value);

  if (!cleaned) {
    return "요약이 아직 준비되지 않았습니다.";
  }

  if (cleaned.length <= 220) {
    return cleaned;
  }

  return `${cleaned.slice(0, 217).trimEnd()}...`;
}

function countMatches(text, pattern) {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

function createStableId(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function formatApiError(payload) {
  if (!payload) {
    return "The API returned a non-JSON error response.";
  }

  if (Array.isArray(payload.errors)) {
    return payload.errors.join(" ");
  }

  if (payload.errors && typeof payload.errors === "object") {
    return Object.values(payload.errors).join(" ");
  }

  return "The API returned an unknown error.";
}

function writeJson(filePath, payload) {
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function clampNumber(rawValue, fallbackValue, minValue, maxValue) {
  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue)) {
    return fallbackValue;
  }

  return Math.min(maxValue, Math.max(minValue, parsedValue));
}
