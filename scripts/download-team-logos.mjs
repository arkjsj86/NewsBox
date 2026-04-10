import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const OUT_DIR = resolve("src/assets/teams");
const SIZE = 64;

mkdirSync(OUT_DIR, { recursive: true });

// static.lolesports.com 공식 CDN — 코드 소문자로 저장
const TEAMS = [
  { code: "dns", url: "http://static.lolesports.com/teams/1767340467921_DN_SOOPerslogo_profile.webp" },
  { code: "t1",  url: "http://static.lolesports.com/teams/1592589079406_T1T1-02-SingleonDark.png" },
  { code: "hle", url: "http://static.lolesports.com/teams/hle-2021-white.png" },
  { code: "bfx", url: "http://static.lolesports.com/teams/1734691810721_BFXfullcolorfordarkbg.png" },
  { code: "ns",  url: "http://static.lolesports.com/teams/NSSingleonDark.png" },
  { code: "drx", url: "http://static.lolesports.com/teams/1774247803537_horizontal_EN_Wh.png" },
  { code: "dk",  url: "http://static.lolesports.com/teams/1673260049704_DPlusKIALOGO11.png" },
  { code: "gen", url: "http://static.lolesports.com/teams/1773829250929_GENGLOGO_GOLD.png" },
  { code: "bro", url: "http://static.lolesports.com/teams/1716454325887_Nowyprojekt.png" },
  { code: "kt",  url: "http://static.lolesports.com/teams/kt1_W.png" },
];

async function downloadAndResize({ code, url }) {
  const res = await fetch(url, {
    headers: { "User-Agent": "NewsBoxBot/0.7 (+https://arkjsj86.github.io/NewsBox/)" },
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  const outPath = resolve(OUT_DIR, `${code}.png`);

  await sharp(buffer)
    .resize(SIZE, SIZE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(outPath);

  console.log(`✓ ${code}.png`);
}

let failed = 0;
for (const team of TEAMS) {
  try {
    await downloadAndResize(team);
  } catch (err) {
    console.error(`✗ ${team.code}: ${err.message}`);
    failed++;
  }
}

console.log(`\n완료: ${TEAMS.length - failed}/${TEAMS.length} 성공`);
