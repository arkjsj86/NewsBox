import { existsSync, readFileSync } from "node:fs";

export const UNITY_RELEASE_SOURCE = "Unity Releases";
export const UNITY_YOUTUBE_SOURCE = "Unity YouTube";
export const UNITY_EDITOR_LATEST_URL = "https://unity.com/releases/editor/latest";
export const UNITY_YOUTUBE_RSS_URL = "https://www.youtube.com/feeds/videos.xml?user=Unity3D";

const DEFAULT_VIDEO_LIMIT = 4;
const DEFAULT_CHANNEL_URL = "https://www.youtube.com/channel/UCG08EqOAXJk_YXPDsAvReSg";

const FALLBACK_RELEASE = {
  title: "Unity Latest Release",
  familyLabel: "Unity 6.3",
  version: "6000.3.13f1",
  releasedAt: "2026-04-08T00:00:00.000Z",
  releaseNotesUrl: "https://unity.com/releases/editor/whats-new/6000.3.13f1",
  linkLabel: "릴리스 노트",
};

const FALLBACK_VIDEOS = [
  {
    id: "gR4At6mDAAM",
    title: "Lighting In Unity in 10 Minutes/1 Hour/1 Day | Clocked",
    url: "https://www.youtube.com/watch?v=gR4At6mDAAM",
    publishedAt: "2026-04-09T17:36:19.000Z",
    thumbnailUrl: "https://i4.ytimg.com/vi/gR4At6mDAAM/hqdefault.jpg",
  },
  {
    id: "2qJGlu4Thlw",
    title: "Migrating to Render Graph: the Render Graph viewer",
    url: "https://www.youtube.com/watch?v=2qJGlu4Thlw",
    publishedAt: "2026-04-09T16:49:48.000Z",
    thumbnailUrl: "https://i3.ytimg.com/vi/2qJGlu4Thlw/hqdefault.jpg",
  },
  {
    id: "85u_eV-qfX8",
    title: "Learn Showcase: Get Started with Shader Graph",
    url: "https://www.youtube.com/watch?v=85u_eV-qfX8",
    publishedAt: "2026-04-09T01:41:06.000Z",
    thumbnailUrl: "https://i1.ytimg.com/vi/85u_eV-qfX8/hqdefault.jpg",
  },
  {
    id: "dv-fv_M4rew",
    title: "Unity Studio - Importing Assets",
    url: "https://www.youtube.com/watch?v=dv-fv_M4rew",
    publishedAt: "2026-04-08T16:25:19.000Z",
    thumbnailUrl: "https://i1.ytimg.com/vi/dv-fv_M4rew/hqdefault.jpg",
  },
];

export async function buildUnitySpotlight({
  generatedAt,
  timeoutMs,
  existingSpotlightPath,
  videoLimit = DEFAULT_VIDEO_LIMIT,
}) {
  const resolvedVideoLimit = clampVideoLimit(videoLimit);
  const existingSpotlight =
    readExistingSpotlight(existingSpotlightPath) ?? buildFallbackUnitySpotlight(generatedAt);

  let release = existingSpotlight.release ?? FALLBACK_RELEASE;
  let videos = normalizeVideoList(existingSpotlight.videos, resolvedVideoLimit);
  const fetchedSources = [];

  try {
    release = await fetchLatestRelease(timeoutMs);
    fetchedSources.push({
      key: "release",
      source: UNITY_RELEASE_SOURCE,
      ok: true,
      version: release.version,
    });
  } catch (error) {
    fetchedSources.push({
      key: "release",
      source: UNITY_RELEASE_SOURCE,
      ok: false,
      error: normalizeText(error.message),
    });
    console.warn(`[newsbox] Failed to fetch Unity release notes: ${error.message}`);
  }

  try {
    videos = await fetchLatestVideos(timeoutMs, resolvedVideoLimit);
    fetchedSources.push({
      key: "youtube",
      source: UNITY_YOUTUBE_SOURCE,
      ok: true,
      itemCount: videos.length,
    });
  } catch (error) {
    fetchedSources.push({
      key: "youtube",
      source: UNITY_YOUTUBE_SOURCE,
      ok: false,
      error: normalizeText(error.message),
    });
    console.warn(`[newsbox] Failed to fetch Unity YouTube RSS: ${error.message}`);
  }

  return {
    tab: "unity",
    type: "release-and-videos",
    source: `${UNITY_RELEASE_SOURCE} + ${UNITY_YOUTUBE_SOURCE}`,
    sourceMode: "official-release+youtube-rss",
    lastUpdatedAt: generatedAt,
    title: "Unity Latest Release",
    description: "최신 Unity 릴리스와 Unity 공식 유튜브 영상을 함께 보여줍니다.",
    release,
    videoCount: videos.length,
    videos,
    releaseSourceUrl: UNITY_EDITOR_LATEST_URL,
    videosSourceUrl: UNITY_YOUTUBE_RSS_URL,
    channelUrl: DEFAULT_CHANNEL_URL,
    fetchedSources,
  };
}

async function fetchLatestRelease(timeoutMs) {
  const response = await fetch(UNITY_EDITOR_LATEST_URL, {
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,ko;q=0.6",
      "User-Agent": "NewsBoxBot/0.8 (+https://arkjsj86.github.io/NewsBox/)",
    },
    signal: AbortSignal.timeout(timeoutMs),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = stripBom(await response.text());
  const version =
    normalizeText(firstMatch(html, /<title>\s*Unity\s+([^<]+?)\s*<\/title>/i)) ||
    normalizeText(firstMatch(html, /<meta property="og:title" content="Unity\s+([^"]+)"/i));
  const releasedLabel = normalizeText(
    firstMatch(html, /Released on\s+([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4})/i),
  );
  const releaseNotesUrl =
    normalizeText(firstMatch(html, /<link rel="canonical" href="([^"]+)"/i)) ||
    response.url ||
    UNITY_EDITOR_LATEST_URL;

  if (!version) {
    throw new Error("Could not determine the latest Unity version.");
  }

  return {
    title: "Unity Latest Release",
    familyLabel: deriveFamilyLabel(version),
    version,
    releasedAt: parseReleaseDate(releasedLabel),
    releaseNotesUrl,
    linkLabel: "릴리스 노트",
  };
}

async function fetchLatestVideos(timeoutMs, videoLimit) {
  const response = await fetch(UNITY_YOUTUBE_RSS_URL, {
    headers: {
      Accept: "application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,ko;q=0.6",
      "User-Agent": "NewsBoxBot/0.8 (+https://arkjsj86.github.io/NewsBox/)",
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const xml = stripBom(await response.text());
  const entries = matchBlocks(xml, "entry")
    .map(normalizeVideoEntry)
    .filter(Boolean)
    .slice(0, videoLimit);

  if (entries.length === 0) {
    throw new Error("Unity YouTube RSS did not return any usable videos.");
  }

  return entries;
}

function normalizeVideoEntry(block) {
  const videoId = normalizeText(readTag(block, ["yt:videoId"]));
  const title = cleanText(readTag(block, ["title", "media:title"]));
  const publishedAt = parseFeedDate(readTag(block, ["published", "updated"]));
  const url = readAlternateLink(block) || buildVideoUrl(videoId);
  const thumbnailUrl = readMediaThumbnail(block) || buildThumbnailUrl(videoId);

  if (!videoId || !title || !url) {
    return null;
  }

  return {
    id: videoId,
    title,
    url,
    publishedAt,
    thumbnailUrl,
  };
}

function buildFallbackUnitySpotlight(generatedAt) {
  return {
    tab: "unity",
    type: "release-and-videos",
    source: `${UNITY_RELEASE_SOURCE} + ${UNITY_YOUTUBE_SOURCE}`,
    sourceMode: "fallback",
    lastUpdatedAt: generatedAt,
    title: "Unity Latest Release",
    description: "최신 Unity 릴리스와 Unity 공식 유튜브 영상을 함께 보여줍니다.",
    release: { ...FALLBACK_RELEASE },
    videoCount: FALLBACK_VIDEOS.length,
    videos: FALLBACK_VIDEOS.map((video) => ({ ...video })),
    releaseSourceUrl: UNITY_EDITOR_LATEST_URL,
    videosSourceUrl: UNITY_YOUTUBE_RSS_URL,
    channelUrl: DEFAULT_CHANNEL_URL,
    fetchedSources: [],
  };
}

function normalizeVideoList(videos, videoLimit) {
  const fallbackVideos = FALLBACK_VIDEOS.slice(0, videoLimit).map((video) => ({ ...video }));

  if (!Array.isArray(videos) || videos.length === 0) {
    return fallbackVideos;
  }

  return videos
    .filter((video) => video?.title && video?.url)
    .slice(0, videoLimit)
    .map((video) => ({
      id: normalizeText(video.id) || normalizeText(video.url),
      title: normalizeText(video.title),
      url: normalizeText(video.url),
      publishedAt: parseFeedDate(video.publishedAt),
      thumbnailUrl: normalizeText(video.thumbnailUrl) || buildThumbnailUrl(video.id),
    }));
}

function readExistingSpotlight(existingSpotlightPath) {
  if (!existingSpotlightPath || !existsSync(existingSpotlightPath)) {
    return null;
  }

  try {
    const parsed = JSON.parse(readFileSync(existingSpotlightPath, "utf8"));
    const base = buildFallbackUnitySpotlight(parsed.lastUpdatedAt || new Date().toISOString());
    return {
      ...base,
      ...parsed,
      release: {
        ...base.release,
        ...(parsed.release ?? {}),
      },
      videos: normalizeVideoList(parsed.videos, DEFAULT_VIDEO_LIMIT),
    };
  } catch {
    return null;
  }
}

function readAlternateLink(block) {
  const links = Array.from(block.matchAll(/<link\b([^>]*)\/?>/gi), (match) => match[1] || "");
  for (const attributes of links) {
    const rel = readAttr(attributes, "rel");
    const href = readAttr(attributes, "href");
    if (href && (!rel || rel === "alternate")) {
      return href;
    }
  }
  return "";
}

function readMediaThumbnail(block) {
  const match = block.match(/<media:thumbnail\b([^>]*)\/?>/i);
  return match ? readAttr(match[1], "url") : "";
}

function readTag(block, tagNames) {
  for (const tagName of tagNames) {
    const match = block.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)</${tagName}>`, "i"));
    if (match) {
      return match[1];
    }
  }
  return "";
}

function matchBlocks(xml, tagName) {
  const pattern = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)</${tagName}>`, "gi");
  return Array.from(xml.matchAll(pattern), (match) => match[0]);
}

function readAttr(attributes, key) {
  const match = String(attributes || "").match(new RegExp(`${key}=(["'])(.*?)\\1`, "i"));
  return match ? match[2] : "";
}

function cleanText(value) {
  return normalizeText(decodeEntities(stripHtml(cleanXml(value))));
}

function cleanXml(value) {
  return String(value || "")
    .replace(/^<!\[CDATA\[/i, "")
    .replace(/\]\]>$/i, "")
    .trim();
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

function parseFeedDate(value) {
  const cleaned = normalizeText(cleanXml(value));
  const parsed = new Date(cleaned);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : new Date().toISOString();
}

function parseReleaseDate(value) {
  const cleaned = normalizeText(value);
  const parsed = new Date(`${cleaned} UTC`);
  return cleaned && Number.isFinite(parsed.getTime())
    ? parsed.toISOString()
    : FALLBACK_RELEASE.releasedAt;
}

function deriveFamilyLabel(version) {
  const match = String(version || "").match(/^6000\.(\d+)/);
  if (match) {
    return `Unity 6.${match[1]}`;
  }
  return "Unity Editor";
}

function buildThumbnailUrl(videoId) {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "";
}

function buildVideoUrl(videoId) {
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : DEFAULT_CHANNEL_URL;
}

function firstMatch(value, pattern) {
  const match = String(value || "").match(pattern);
  return match ? match[1] : "";
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stripBom(value) {
  return String(value || "").replace(/^\uFEFF/, "");
}

function clampVideoLimit(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_VIDEO_LIMIT;
  }
  return Math.min(6, Math.max(2, Math.trunc(parsed)));
}
