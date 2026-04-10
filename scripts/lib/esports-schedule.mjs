import { existsSync, readFileSync } from "node:fs";

export const LOL_ESPORTS_SOURCE = "LoL Esports";

const KNOWN_TEAM_CODES = new Map([
  ["kiwoom drx", "DRX"],
  ["hanjin brion", "BRO"],
  ["hanwha life esports", "HLE"],
  ["dplus kia", "DK"],
  ["gen.g esports", "GEN"],
  ["nongshim red force", "NS"],
  ["bnk fearx", "BFX"],
  ["dn soopers", "DNS"],
]);

export async function buildEsportsSpotlight({
  leagues,
  generatedAt,
  nowMs,
  timeoutMs,
  requestDelayMs,
  matchLimit,
  activeWindowDays,
  liveGraceHours,
  existingSpotlightPath,
}) {
  const activeWindowMs = activeWindowDays * 24 * 60 * 60 * 1000;
  const liveGraceMs = liveGraceHours * 60 * 60 * 1000;
  const statuses = [];
  const schedules = [];

  for (const league of leagues) {
    try {
      const matches = await fetchLeagueMatches({
        league,
        nowMs,
        timeoutMs,
        liveGraceMs,
      });

      schedules.push({ league, matches });
      statuses.push({
        key: league.key,
        label: league.label,
        ok: true,
        matchCount: matches.length,
      });
    } catch (error) {
      statuses.push({
        key: league.key,
        label: league.label,
        ok: false,
        matchCount: 0,
        error: normalizeText(error.message),
      });
      console.warn(`[newsbox] Failed to fetch ${league.key} schedule: ${error.message}`);
    }

    if (requestDelayMs > 0) {
      await sleep(Math.min(requestDelayMs, 400));
    }
  }

  const selectedSchedule = selectSpotlightSchedule({
    schedules,
    nowMs,
    activeWindowMs,
    liveGraceMs,
  });

  if (!selectedSchedule) {
    return readExistingSpotlight(existingSpotlightPath) ?? buildFallbackEsportsSpotlight(generatedAt);
  }

  const matches = selectedSchedule.matches.slice(0, matchLimit).map(stripMatchMeta);
  const firstMatch = matches[0] ?? null;

  return {
    tab: "esports",
    type: "league-schedule",
    source: LOL_ESPORTS_SOURCE,
    sourceMode: "official-schedule",
    lastUpdatedAt: generatedAt,
    activeLeagueKey: selectedSchedule.league.key,
    activeLeagueLabel: selectedSchedule.league.label,
    title: "Upcoming Matches",
    description: buildSpotlightDescription(selectedSchedule.league),
    sourceUrl: selectedSchedule.league.url,
    selectionRule: "LCK 우선 · 일정이 비는 기간에는 MSI와 Worlds 자동 전환",
    primaryTournamentName: firstMatch?.tournamentName ?? selectedSchedule.league.label,
    primaryBlockName: firstMatch?.blockName ?? "",
    matchCount: matches.length,
    matches,
    fetchedLeagues: statuses,
  };
}

async function fetchLeagueMatches({ league, nowMs, timeoutMs, liveGraceMs }) {
  const response = await fetch(league.url, {
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,ko;q=0.6",
      "User-Agent": "NewsBoxBot/0.7 (+https://arkjsj86.github.io/NewsBox/)",
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();
  const events = extractLeagueEvents(html);

  return events
    .filter((event) => event?.type === "match")
    .filter((event) => normalizeText(event.league?.slug).toLowerCase() === league.key)
    .map((event) => normalizeLeagueMatch(event, league))
    .filter(Boolean)
    .filter((match) => isUsableScheduleMatch(match, nowMs, liveGraceMs))
    .sort((left, right) => left.startMs - right.startMs);
}

function extractLeagueEvents(html) {
  const marker = "\"esports\":{\"__typename\":\"EsportsData\",\"events\":[";
  const startIndex = html.indexOf(marker);

  if (startIndex < 0) {
    throw new Error("Official schedule data marker was not found.");
  }

  const arrayStart = startIndex + marker.length - 1;
  const arrayEnd = findMatchingBracket(html, arrayStart);
  const eventsJson = html.slice(arrayStart, arrayEnd + 1);
  return JSON.parse(eventsJson);
}

function findMatchingBracket(value, startIndex) {
  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let index = startIndex; index < value.length; index += 1) {
    const character = value[index];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (character === "\\") {
        isEscaped = true;
        continue;
      }

      if (character === "\"") {
        inString = false;
      }

      continue;
    }

    if (character === "\"") {
      inString = true;
      continue;
    }

    if (character === "[") {
      depth += 1;
      continue;
    }

    if (character === "]") {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  throw new Error("Could not determine the schedule array boundary.");
}

function normalizeLeagueMatch(event, league) {
  const startMs = new Date(event.startTime).getTime();
  const teams = Array.isArray(event.matchTeams) ? event.matchTeams.slice(0, 2) : [];

  if (!Number.isFinite(startMs) || teams.length < 2) {
    return null;
  }

  return {
    id: String(event.id),
    leagueKey: league.key,
    leagueLabel: normalizeText(event.league?.name) || league.label,
    tournamentName: normalizeText(event.tournament?.name) || `${league.label} Schedule`,
    blockName: normalizeText(event.blockName) || "Schedule",
    startTime: new Date(startMs).toISOString(),
    startMs,
    state: normalizeScheduleState(event.match?.state || event.state),
    matchType: buildMatchTypeLabel(event.match?.strategy),
    teams: teams.map(normalizeMatchTeam),
    sourceUrl: league.url,
  };
}

function normalizeMatchTeam(team) {
  const name = normalizeText(team?.name) || "TBD";
  const code =
    KNOWN_TEAM_CODES.get(name.toLowerCase()) ||
    normalizeText(team?.code) ||
    deriveTeamCode(name);
  return { name, code: code.slice(0, 4).toUpperCase() };
}

function selectSpotlightSchedule({ schedules, nowMs, activeWindowMs, liveGraceMs }) {
  const byPriority = [...schedules]
    .filter((schedule) => schedule.matches.length > 0)
    .sort((left, right) => left.league.priority - right.league.priority);

  const activeSchedule = byPriority.find((schedule) =>
    schedule.matches.some((match) =>
      isWithinScheduleWindow(match, nowMs, activeWindowMs, liveGraceMs),
    ),
  );

  if (activeSchedule) {
    return activeSchedule;
  }

  return byPriority.sort((left, right) => {
    const leftFirst = left.matches[0]?.startMs ?? Number.POSITIVE_INFINITY;
    const rightFirst = right.matches[0]?.startMs ?? Number.POSITIVE_INFINITY;
    return leftFirst - rightFirst || left.league.priority - right.league.priority;
  })[0];
}

function isUsableScheduleMatch(match, nowMs, liveGraceMs) {
  return (
    Number.isFinite(match.startMs) &&
    !["completed", "cancelled", "postponed"].includes(match.state) &&
    (isLiveScheduleMatch(match) || match.startMs >= nowMs - liveGraceMs)
  );
}

function isWithinScheduleWindow(match, nowMs, activeWindowMs, liveGraceMs) {
  return (
    isLiveScheduleMatch(match) ||
    (match.startMs >= nowMs - liveGraceMs && match.startMs <= nowMs + activeWindowMs)
  );
}

function isLiveScheduleMatch(match) {
  return ["inprogress", "started", "live"].includes(match.state);
}

function buildSpotlightDescription(league) {
  if (league.key === "lck") {
    return "LCK 일정이 우선 표시되고, 리그 일정이 비는 기간에는 MSI와 Worlds 일정으로 자동 전환됩니다.";
  }

  return `지금은 ${league.label} 일정이 우선 노출되고 있으며, 경기 수가 많으면 목록 안에서 스크롤됩니다.`;
}

function stripMatchMeta(match) {
  return {
    id: match.id,
    leagueKey: match.leagueKey,
    leagueLabel: match.leagueLabel,
    tournamentName: match.tournamentName,
    blockName: match.blockName,
    startTime: match.startTime,
    state: match.state,
    matchType: match.matchType,
    teams: match.teams,
    sourceUrl: match.sourceUrl,
  };
}

function buildFallbackEsportsSpotlight(generatedAt) {
  return {
    tab: "esports",
    type: "league-schedule",
    source: LOL_ESPORTS_SOURCE,
    sourceMode: "fallback",
    lastUpdatedAt: generatedAt,
    activeLeagueKey: "lck",
    activeLeagueLabel: "LCK",
    title: "Upcoming Matches",
    description: "LCK 일정이 우선 표시되고, 리그 일정이 비는 기간에는 MSI와 Worlds 일정으로 자동 전환됩니다.",
    sourceUrl: "https://lolesports.com/en-US/leagues/lck",
    selectionRule: "LCK 우선 · 일정이 비는 기간에는 MSI와 Worlds 자동 전환",
    primaryTournamentName: "Schedule",
    primaryBlockName: "",
    matchCount: 0,
    matches: [],
    fetchedLeagues: [],
  };
}

function readExistingSpotlight(filePath) {
  if (!filePath || !existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function buildMatchTypeLabel(strategy) {
  if (!strategy?.count) {
    return "Match";
  }

  if (strategy.type === "bestOf") {
    return `Bo${strategy.count}`;
  }

  return `Best of ${strategy.count}`;
}

function normalizeScheduleState(value) {
  return normalizeText(value).toLowerCase() || "unstarted";
}

function deriveTeamCode(name) {
  const knownCode = KNOWN_TEAM_CODES.get(normalizeText(name).toLowerCase());

  if (knownCode) {
    return knownCode;
  }

  const parts = normalizeText(name)
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "TBD";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 3).toUpperCase();
  }

  return parts
    .slice(0, 3)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}
