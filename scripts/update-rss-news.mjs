import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
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
const FEED_TIMEOUT_MS = clampNumber(process.env.NEWSBOX_FEED_TIMEOUT_MS, 15000, 5000, 30000);
const TAB_PRIORITY = ["unity", "game-industry", "game-development", "ai", "game-general"];

const TABS = [
  ["ai", "AI", "생성형 AI, 인프라, 정책, 투자 흐름을 빠르게 확인하는 탭", [["artificial intelligence", 6], ["generative ai", 6], [" ai ", 2], ["llm", 4], ["openai", 5], ["anthropic", 4], ["gemini", 4], ["copilot", 3], ["inference", 3], ["reasoning", 2], ["training", 2], ["nvidia", 2]]],
  ["unity", "Unity", "Unity 엔진과 생태계 변화, 정책, 툴 업데이트를 모아보는 탭", [["unity", 8], ["unity 6", 6], ["asset store", 5], ["package manager", 3], ["unity technologies", 5], ["netcode", 2], ["cinemachine", 2], ["urp", 2], ["hdrp", 2], ["render pipeline", 3]]],
  ["game-industry", "게임 산업", "게임사 실적, 투자, 퍼블리싱, 규제 같은 산업 중심 뉴스를 다루는 탭", [["publisher", 4], ["revenue", 5], ["earnings", 5], ["acquisition", 6], ["acquire", 5], ["merger", 5], ["investment", 4], ["funding", 4], ["layoff", 6], ["regulation", 5], ["publishing", 4], ["market", 3], ["business", 3], ["ceo", 2], ["strategy", 2]]],
  ["game-development", "게임 개발", "게임 제작 기술, 파이프라인, 최적화, 툴링에 집중하는 탭", [["game development", 6], ["gamedev", 6], ["developer", 2], ["devs", 2], ["design", 3], ["writing", 2], ["game engine", 5], ["rendering", 4], ["pipeline", 4], ["optimization", 5], ["tools", 3], ["workflow", 3], ["graphics", 3], ["shader", 4], ["postmortem", 4], ["sdk", 3], ["physics", 2], ["qa", 3]]],
  ["game-general", "게임 일반", "신작, 업데이트, 이벤트, 대중적 화제를 확인하는 탭", [["release date", 5], ["release", 4], ["trailer", 4], ["announcement", 3], ["update", 4], ["esports", 4], ["patch", 3], ["launch", 4], ["available now", 4], ["season", 3], ["event", 2], ["playstation", 2], ["xbox", 2], ["nintendo", 2], ["steam", 2], ["ps5", 2], ["game pass", 3], ["switch", 2]]],
].map(([key, label, description, terms]) => ({ key, label, description, terms }));

const FEEDS = [
  ["openai-news", "OpenAI News", "https://openai.com/news/rss.xml", ["ai"]],
  ["google-ai-blog", "Google AI Blog", "https://blog.google/innovation-and-ai/technology/ai/rss/", ["ai"]],
  ["techcrunch-ai", "TechCrunch AI", "https://techcrunch.com/category/artificial-intelligence/feed/", ["ai"]],
  ["unity-blog", "Unity Blog", "https://unity.com/blog/rss", ["unity", "game-development"]],
  ["game-developer", "Game Developer", "https://www.gamedeveloper.com/rss.xml", ["game-development", "game-industry"]],
  ["techcrunch-gaming", "TechCrunch Gaming", "https://techcrunch.com/category/gaming/feed/", ["game-industry", "game-general"]],
  ["polygon", "Polygon", "https://www.polygon.com/feed/", ["game-general"]],
  ["playstation-blog", "PlayStation.Blog", "https://blog.playstation.com/feed/", ["game-general"]],
  ["xbox-wire", "Xbox Wire", "https://news.xbox.com/en-us/feed/", ["game-general"]],
].map(([key, source, url, hints]) => ({ key, source, url, hints }));

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
    throw new Error("No RSS or Atom feeds could be fetched successfully.");
  }

  const perTab = new Map(TABS.map((tab) => [tab.key, []]));

  for (const article of dedupe(candidates).map(classifyArticle).filter(Boolean)) {
    if (perTab.has(article.tab)) {
      perTab.get(article.tab).push(article);
    }
  }

  mkdirSync(TABS_DIR, { recursive: true });

  let totalArticleCount = 0;

  for (const tab of TABS) {
    const articles = (perTab.get(tab.key) ?? [])
      .sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt))
      .slice(0, ARTICLE_LIMIT_PER_TAB);

    totalArticleCount += articles.length;
    writeJson(resolve(TABS_DIR, `${tab.key}.json`), { tab: tab.key, label: tab.label, description: tab.description, sourceMode: "official-rss", lastUpdatedAt: GENERATED_AT, articleCount: articles.length, articles });
  }

  writeJson(resolve(DATA_DIR, "metadata.json"), {
    version: "0.3.0-live",
    sourceMode: "official-rss",
    sourceProvider: "rss",
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

  console.log(`NewsBox data updated successfully with ${totalArticleCount} articles from ${successfulFeeds.length}/${FEEDS.length} feeds.`);
}

async function fetchFeed(feed) {
  const response = await fetch(feed.url, {
    headers: {
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      "User-Agent": "NewsBoxBot/0.3 (+https://arkjsj86.github.io/NewsBox/)",
    },
    signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const xml = stripBom(await response.text());
  const entries = parseFeed(xml, feed);
  return entries.map((entry, index) => normalizeArticle(entry, feed, index)).filter((article) => article.title && article.url && NOW_MS - new Date(article.publishedAt).getTime() <= LOOKBACK_MS).slice(0, MAX_ITEMS_PER_FEED);
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
  const text = ` ${article.title} ${article.summary} ${getUrlPathText(article.url)} `.toLowerCase();
  let bestTab = article.primaryHint || article.hints[0] || "game-general";
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const tab of TABS) {
    let score = article.primaryHint === tab.key ? 5 : 0;
    if (article.hints?.has?.(tab.key) || article.hints?.includes?.(tab.key)) score += 3;
    if (tab.key === "game-general") score += 1;
    for (const [term, weight] of tab.terms) score += countTerm(text, term) * weight;
    if (score > bestScore || (score === bestScore && compareTabPriority(tab.key, bestTab) < 0)) {
      bestScore = score;
      bestTab = tab.key;
    }
  }

  return { id: article.id, title: article.title, url: article.url, source: article.source, publishedAt: article.publishedAt, summary: article.summary, tab: bestTab };
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

function createStableId(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
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
