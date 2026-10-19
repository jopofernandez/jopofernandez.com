// Stats públicas de chess.com (sin API key) para la sección Ajedrez. Corre antes de cada build (prebuild):
// si la API no responde, deja el último snapshot y el build sigue. La web además las refresca en vivo.
import { writeFileSync } from "node:fs";

const USER = "lajopeta", OUT = "lib/data/chess-stats.json";
const get = (p) => fetch(`https://api.chess.com/pub/player/${USER}${p}`, { headers: { "User-Agent": "jopofernandez.com (github.com/jopofernandez)" } }).then((r) => { if (!r.ok) throw new Error(`${p} ${r.status}`); return r.json(); });

export function summarize(profile, stats) {
  const games = ["chess_daily", "chess_rapid", "chess_blitz", "chess_bullet"].reduce((n, k) => { const r = stats[k]?.record; return n + (r ? r.win + r.loss + r.draw : 0); }, 0);
  return {
    username: profile.username, url: profile.url, joined: profile.joined,
    rapid: stats.chess_rapid?.last?.rating ?? null,
    blitz: stats.chess_blitz?.last?.rating ?? null,
    puzzles: stats.tactics?.highest?.rating ?? null,
    games,
  };
}

try {
  const [profile, stats] = await Promise.all([get(""), get("/stats")]);
  const s = summarize(profile, stats);
  writeFileSync(OUT, JSON.stringify(s, null, 2) + "\n");
  console.log("chess.com", JSON.stringify(s));
} catch (e) {
  console.warn("chess.com no respondió, queda el snapshot anterior:", e.message);
}
