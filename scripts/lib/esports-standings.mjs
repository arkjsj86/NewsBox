import { existsSync, readFileSync } from "node:fs";

export const LCK_STANDINGS_SOURCE = "LoL Esports";
export const LCK_STANDINGS_URL = "https://lolesports.com/en-US/leagues/lck";

export async function buildLckStandings({
  url = LCK_STANDINGS_URL,
  timeoutMs = 25000,
  generatedAt,
  existingPath,
  scheduleSpotlightPath,
}) {
  const isOffSeason = detectOffSeason(scheduleSpotlightPath);

  let html;
  try {
    html = await fetchLckLeaguePage(url, timeoutMs);
  } catch (error) {
    console.warn(`[newsbox] Failed to fetch LCK standings page: ${error.message}`);
    return readExistingStandings(existingPath) ?? buildFallbackStandings(generatedAt, isOffSeason);
  }

  const tournament = selectActiveLckTournament(html);

  if (!tournament) {
    console.warn("[newsbox] No LCK tournament found in standings page.");
    return readExistingStandings(existingPath) ?? buildFallbackStandings(generatedAt, isOffSeason);
  }

  const records = extractTournamentRecords(html, tournament.slug);

  if (records.length === 0) {
    console.warn(`[newsbox] No team records found for ${tournament.slug}.`);
    return readExistingStandings(existingPath) ?? buildFallbackStandings(generatedAt, isOffSeason);
  }

  const teamMeta = extractTeamMetadata(html);
  const rows = buildStandingRows(records, teamMeta);

  return {
    tab: "esports",
    type: "lck-standings",
    league: "lck",
    leagueLabel: buildLeagueLabel(tournament),
    tournamentSlug: tournament.slug,
    tournamentName: tournament.name,
    tournamentState: tournament.state,
    isOffSeason,
    fetchedAt: generatedAt,
    lastUpdatedAt: generatedAt,
    updatedLabel: buildUpdatedLabel(rows),
    source: LCK_STANDINGS_SOURCE,
    sourceUrl: url,
    rowCount: rows.length,
    rows,
  };
}

async function fetchLckLeaguePage(url, timeoutMs) {
  const response = await fetch(url, {
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

  return response.text();
}

function selectActiveLckTournament(html) {
  const tournRe = /\{"__typename":"Tournament","id":"(\d+)","name":"([^"]+)","slug":"([^"]+)","startTime":"([^"]+)","endTime":"([^"]+)","state":"(\w+)","league":\{"__typename":"League","id":"\d+","name":"([^"]+)"/g;
  const tournaments = [];
  const seen = new Set();
  let match;

  while ((match = tournRe.exec(html)) !== null) {
    if (match[7] !== "LCK") continue;
    if (seen.has(match[3])) continue;
    seen.add(match[3]);
    tournaments.push({
      id: match[1],
      name: match[2],
      slug: match[3],
      startTime: match[4],
      endTime: match[5],
      state: match[6],
      startMs: Date.parse(match[4]),
      endMs: Date.parse(match[5]),
    });
  }

  if (tournaments.length === 0) return null;

  const inProgress = tournaments
    .filter((t) => t.state === "inProgress")
    .sort((a, b) => b.startMs - a.startMs);
  if (inProgress.length > 0) return inProgress[0];

  const completed = tournaments
    .filter((t) => t.state === "completed")
    .sort((a, b) => b.endMs - a.endMs);
  if (completed.length > 0) return completed[0];

  return tournaments.sort((a, b) => b.startMs - a.startMs)[0];
}

function extractTournamentRecords(html, tournamentSlug) {
  const teamGprRe = /"__typename":"TeamGPR","id":"(\d+):[^"]+"/g;
  const positions = [];
  let m;
  while ((m = teamGprRe.exec(html)) !== null) {
    positions.push({ teamId: m[1], pos: m.index });
  }

  if (positions.length === 0) return [];

  const recordRe = new RegExp(
    `"__typename":"TeamTournamentRecord"[^}]*?"tournamentRecord":\\{"__typename":"WinLoss",(?:"wins":(\\d+),"losses":(\\d+)|"losses":(\\d+),"wins":(\\d+))\\},"tournament":\\{"__typename":"Tournament","id":"\\d+","name":"[^"]*","slug":"${tournamentSlug}"`,
  );

  const records = [];
  const seenTeams = new Set();

  for (let i = 0; i < positions.length; i += 1) {
    const start = positions[i].pos;
    const end = i + 1 < positions.length ? positions[i + 1].pos : start + 60000;
    const block = html.slice(start, end);
    const rm = block.match(recordRe);
    if (!rm) continue;
    const teamId = positions[i].teamId;
    if (seenTeams.has(teamId)) continue;
    seenTeams.add(teamId);
    const wins = Number(rm[1] ?? rm[4]);
    const losses = Number(rm[2] ?? rm[3]);
    if (!Number.isFinite(wins) || !Number.isFinite(losses)) continue;
    records.push({ teamId, wins, losses });
  }

  return records;
}

function extractTeamMetadata(html) {
  const teamRe = /"__typename":"Team","id":"(\d+)","code":"([^"]*)","image":"([^"]*)","slug":"([^"]*)","name":"([^"]*)"/g;
  const map = new Map();
  let m;
  while ((m = teamRe.exec(html)) !== null) {
    if (map.has(m[1])) continue;
    map.set(m[1], {
      id: m[1],
      code: m[2],
      image: m[3],
      slug: m[4],
      name: m[5],
    });
  }
  return map;
}

function buildStandingRows(records, teamMeta) {
  const enriched = records
    .map((rec) => {
      const meta = teamMeta.get(rec.teamId) ?? {};
      const code = (meta.code || "").toUpperCase().slice(0, 4) || "TBD";
      return {
        teamId: rec.teamId,
        code,
        name: meta.name || code,
        image: meta.image || "",
        wins: rec.wins,
        losses: rec.losses,
        played: rec.wins + rec.losses,
      };
    })
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (a.losses !== b.losses) return a.losses - b.losses;
      return a.name.localeCompare(b.name);
    });

  return enriched.map((row, index) => ({
    rank: index + 1,
    code: row.code,
    name: row.name,
    image: row.image,
    wins: row.wins,
    losses: row.losses,
    points: row.wins,
  }));
}

function buildLeagueLabel(tournament) {
  if (tournament.name && tournament.name.toLowerCase().includes("lck")) {
    return tournament.name;
  }
  return `LCK ${tournament.name}`.trim();
}

function buildUpdatedLabel(rows) {
  const totalPlayed = rows.reduce((sum, r) => sum + r.wins + r.losses, 0);
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
