import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildLckStandings, LCK_STANDINGS_URL } from "./lib/esports-standings.mjs";

const ROOT_DIR = resolve(process.cwd());
const DATA_DIR = resolve(ROOT_DIR, "data");
const SPOTLIGHTS_DIR = resolve(DATA_DIR, "spotlights");
const GENERATED_AT = new Date().toISOString();
const FETCH_TIMEOUT_MS = clampNumber(process.env.NEWSBOX_FEED_TIMEOUT_MS, 25000, 5000, 30000);
const STANDINGS_PATH = resolve(SPOTLIGHTS_DIR, "lck-standings.json");
const SCHEDULE_PATH = resolve(SPOTLIGHTS_DIR, "esports.json");

async function main() {
  mkdirSync(SPOTLIGHTS_DIR, { recursive: true });

  const standings = await buildLckStandings({
    url: LCK_STANDINGS_URL,
    timeoutMs: FETCH_TIMEOUT_MS,
    generatedAt: GENERATED_AT,
    existingPath: STANDINGS_PATH,
    scheduleSpotlightPath: SCHEDULE_PATH,
  });

  writeJson(STANDINGS_PATH, standings);

  const summary = `${standings.tournamentName || "(no tournament)"} · ${standings.rowCount} teams · offSeason=${standings.isOffSeason}`;
  console.log(`NewsBox LCK standings updated: ${summary}`);
}

function writeJson(filePath, payload) {
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function clampNumber(rawValue, fallbackValue, minValue, maxValue) {
  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue)) return fallbackValue;
  return Math.min(maxValue, Math.max(minValue, parsedValue));
}

main().catch((error) => {
  console.error(`[newsbox] update-esports-standings failed: ${error.message}`);
  process.exitCode = 1;
});
