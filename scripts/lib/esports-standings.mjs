import { existsSync, readFileSync } from "node:fs";

export const LCK_STANDINGS_SOURCE = "LoL Esports";
export const LCK_STANDINGS_URL = "https://lolesports.com/en-US/leagues/lck";

const LOL_ESPORTS_API_BASE = "https://esports-api.lolesports.com/persisted/gw";
const LOL_ESPORTS_API_HL = "en-US";
const LOL_ESPORTS_API_KEY =
  process.env.NEWSBOX_LOL_ESPORTS_API_KEY?.trim() ||
  "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z";
const LCK_LEAGUE_ID = "98767991310872058";

const TEAM_CODE_ALIASES = new Map([
  ["kiwoom drx", "DRX"],
  ["krx", "DRX"],
]);

export async function buildLckStandings({
  url = LCK_STANDINGS_URL,
  timeoutMs = 25000,
  generatedAt,
  existingPath,
  scheduleSpotlightPath,
}) {
  const isOffSeason = detectOffSeason(scheduleSpotlightPath);
  const referenceMs = Number.isFinite(Date.parse(generatedAt))
    ? Date.parse(generatedAt)
    : Date.now();

  let selected;
  try {
    selected = await fetchCurrentLckStandings({ timeoutMs, referenceMs });
  } catch (error) {
    console.warn(`[newsbox] Failed to fetch structured LCK standings: ${error.message}`);
    return readExistingStandings(existingPath) ?? buildFallbackStandings(generatedAt, isOffSeason);
  }

  if (!selected || selected.rows.length === 0) {
    console.warn("[newsbox] Structured LCK standings response did not include ranking rows.");
    return readExistingStandings(existingPath) ?? buildFallbackStandings(generatedAt, isOffSeason);
  }

  return {
    tab: "esports",
    type: "lck-standings",
    league: "lck",
    leagueLabel: buildLeagueLabel(selected.standings),
    tournamentSlug: selected.tournament.slug,
    tournamentName: selected.standings.name || selected.tournament.slug,
    tournamentState: buildTournamentState(selected.tournament, referenceMs),
    isOffSeason,
    fetchedAt: generatedAt,
    lastUpdatedAt: generatedAt,
    updatedLabel: buildUpdatedLabel(selected.rows),
    source: LCK_STANDINGS_SOURCE,
    sourceUrl: url,
    rowCount: selected.rows.length,
    rows: selected.rows,
  };
}

async function fetchCurrentLckStandings({ timeoutMs, referenceMs }) {
  const tournaments = await fetchLckTournaments(timeoutMs);
  const candidates = rankTournamentCandidates(tournaments, referenceMs);
  let lastError = null;

  for (const tournament of candidates) {
    try {
      const standings = await fetchTournamentStandings(tournament.id, timeoutMs);
      const rows = extractStandingRows(standings);
      if (rows.length === 0) {
        lastError = new Error(`No ranking rows found for ${tournament.slug}.`);
        continue;
      }

      return { tournament, standings, rows };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("No LCK standings data could be resolved.");
}

async function fetchLckTournaments(timeoutMs) {
  const payload = await fetchApiJson("getTournamentsForLeague", { leagueId: LCK_LEAGUE_ID }, timeoutMs);
  const leagues = Array.isArray(payload?.data?.leagues) ? payload.data.leagues : [];
  const league =
    leagues.find((entry) => String(entry?.id) === LCK_LEAGUE_ID) ||
    leagues.find((entry) => normalizeText(entry?.slug).toLowerCase() === "lck") ||
    leagues[0] ||
    null;
  const tournaments = Array.isArray(league?.tournaments) ? league.tournaments : [];

  return tournaments
    .map((tournament) => normalizeTournament(tournament))
    .filter((tournament) => tournament && tournament.id);
}

function normalizeTournament(tournament) {
  if (!tournament?.id) return null;
  const startMs = parseDateOnly(tournament.startDate, false);
  const endMs = parseDateOnly(tournament.endDate, true);
  return {
    id: String(tournament.id),
    slug: normalizeText(tournament.slug),
    startDate: normalizeText(tournament.startDate),
    endDate: normalizeText(tournament.endDate),
    startMs,
    endMs,
  };
}

function parseDateOnly(value, isEndOfDay) {
  const normalized = normalizeText(value);
  if (!normalized) return Number.NaN;
  const suffix = isEndOfDay ? "T23:59:59.999Z" : "T00:00:00.000Z";
  return Date.parse(`${normalized}${suffix}`);
}

function rankTournamentCandidates(tournaments, referenceMs) {
  const active = tournaments
    .filter((tournament) => Number.isFinite(tournament.startMs) && Number.isFinite(tournament.endMs))
    .filter((tournament) => tournament.startMs <= referenceMs && referenceMs <= tournament.endMs)
    .sort((left, right) => right.startMs - left.startMs);

  const previous = tournaments
    .filter((tournament) => Number.isFinite(tournament.startMs) && tournament.startMs <= referenceMs)
    .sort((left, right) => right.startMs - left.startMs);

  const upcoming = tournaments
    .filter((tournament) => Number.isFinite(tournament.startMs) && tournament.startMs > referenceMs)
    .sort((left, right) => left.startMs - right.startMs);

  const ordered = [];
  const seen = new Set();

  for (const tournament of [...active, ...previous, ...upcoming]) {
    if (!tournament?.id || seen.has(tournament.id)) continue;
    seen.add(tournament.id);
    ordered.push(tournament);
  }

  return ordered;
}

async function fetchTournamentStandings(tournamentId, timeoutMs) {
  const payload = await fetchApiJson("getStandingsV3", { tournamentId }, timeoutMs);
  const standingsList = Array.isArray(payload?.data?.standings) ? payload.data.standings : [];
  const standings =
    standingsList.find((entry) => String(entry?.id) === String(tournamentId)) ||
    standingsList[0] ||
    null;

  if (!standings) {
    throw new Error(`Standings payload was empty for tournament ${tournamentId}.`);
  }

  return standings;
}

async function fetchApiJson(endpoint, params, timeoutMs) {
  const requestUrl = new URL(`${LOL_ESPORTS_API_BASE}/${endpoint}`);
  requestUrl.searchParams.set("hl", LOL_ESPORTS_API_HL);

  for (const [key, value] of Object.entries(params || {})) {
    if (Array.isArray(value)) {
      value.forEach((item) => requestUrl.searchParams.append(key, String(item)));
      continue;
    }
    requestUrl.searchParams.set(key, String(value));
  }

  const response = await fetch(requestUrl, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "en-US,en;q=0.9,ko;q=0.6",
      "User-Agent": "NewsBoxBot/0.7 (+https://arkjsj86.github.io/NewsBox/)",
      "x-api-key": LOL_ESPORTS_API_KEY,
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}${message ? ` ${normalizeText(message)}` : ""}`);
  }

  return response.json();
}

function extractStandingRows(standings) {
  const sections = Array.isArray(standings?.stages)
    ? standings.stages.flatMap((stage) => (Array.isArray(stage?.sections) ? stage.sections : []))
    : [];
  const section = sections.find((entry) => Array.isArray(entry?.rankings) && entry.rankings.length > 0);
  const rankings = Array.isArray(section?.rankings) ? section.rankings : [];
  const rows = [];

  for (const ranking of rankings) {
    const rank = Number(ranking?.ordinal);
    const teams = Array.isArray(ranking?.teams) ? ranking.teams : [];

    for (const team of teams) {
      const wins = Number(team?.record?.wins ?? 0);
      const losses = Number(team?.record?.losses ?? 0);
      const name = normalizeText(team?.name) || "TBD";
      const code = normalizeTeamCode(team?.code, name);

      rows.push({
        rank: Number.isFinite(rank) ? rank : rows.length + 1,
        code,
        name,
        image: normalizeText(team?.image),
        wins: Number.isFinite(wins) ? wins : 0,
        losses: Number.isFinite(losses) ? losses : 0,
        points: Number.isFinite(wins) ? wins : 0,
      });
    }
  }

  return rows;
}

function normalizeTeamCode(code, name) {
  const normalizedName = normalizeText(name).toLowerCase();
  if (TEAM_CODE_ALIASES.has(normalizedName)) {
    return TEAM_CODE_ALIASES.get(normalizedName);
  }

  const normalizedCode = normalizeText(code).toUpperCase();
  if (TEAM_CODE_ALIASES.has(normalizedCode.toLowerCase())) {
    return TEAM_CODE_ALIASES.get(normalizedCode.toLowerCase());
  }

  return normalizedCode.slice(0, 4) || "TBD";
}

function buildTournamentState(tournament, referenceMs) {
  if (Number.isFinite(tournament?.startMs) && referenceMs < tournament.startMs) {
    return "upcoming";
  }

  if (
    Number.isFinite(tournament?.startMs) &&
    Number.isFinite(tournament?.endMs) &&
    tournament.startMs <= referenceMs &&
    referenceMs <= tournament.endMs
  ) {
    return "inProgress";
  }

  return "completed";
}

function buildLeagueLabel(standings) {
  const label = normalizeText(standings?.name);
  if (!label) return "LCK";
  if (label.toLowerCase().includes("lck")) return label;
  return `LCK ${label}`.trim();
}

function buildUpdatedLabel(rows) {
  const totalPlayed = rows.reduce((sum, row) => sum + row.wins + row.losses, 0);
  if (totalPlayed === 0) return "시즌 시작 전";
  return "공식 데이터 기준";
}

function detectOffSeason(scheduleSpotlightPath) {
  if (!scheduleSpotlightPath || !existsSync(scheduleSpotlightPath)) return false;
  try {
    const data = JSON.parse(readFileSync(scheduleSpotlightPath, "utf8"));
    const fetched = Array.isArray(data.fetchedLeagues) ? data.fetchedLeagues : [];
    if (fetched.length === 0) return (data.matchCount ?? 0) === 0;
    return fetched.every((league) => (league?.matchCount ?? 0) === 0);
  } catch {
    return false;
  }
}

function readExistingStandings(filePath) {
  if (!filePath || !existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function buildFallbackStandings(generatedAt, isOffSeason) {
  return {
    tab: "esports",
    type: "lck-standings",
    league: "lck",
    leagueLabel: "LCK",
    tournamentSlug: "",
    tournamentName: "",
    tournamentState: "unknown",
    isOffSeason,
    fetchedAt: generatedAt,
    lastUpdatedAt: generatedAt,
    updatedLabel: "데이터 준비 중",
    source: LCK_STANDINGS_SOURCE,
    sourceUrl: LCK_STANDINGS_URL,
    rowCount: 0,
    rows: [],
  };
}
