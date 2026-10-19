"use client";

import { useEffect, useState } from "react";
import type { Card, Lang } from "@/lib/content";
import snapshot from "@/lib/data/chess-stats.json";
import { IconArrow } from "./icons";

type Stats = typeof snapshot;

const TXT = {
  es: { rapid: "Rapid", blitz: "Blitz", puzzles: "Puzzles (máx.)", games: "Partidas", since: "desde", locale: "es-AR" },
  en: { rapid: "Rapid", blitz: "Blitz", puzzles: "Puzzles (peak)", games: "Games", since: "since", locale: "en-US" },
};

/**
 * Card de chess.com: arranca con el snapshot del último build (scripts/chess-stats.mjs) y lo refresca en vivo
 * desde la API pública (tiene CORS abierto). Si la API falla, queda el snapshot.
 */
export default function ChessCom({ c, lang }: { c: Card; lang: Lang }) {
  const t = TXT[lang];
  const [s, setS] = useState<Stats>(snapshot);

  useEffect(() => {
    const ctrl = new AbortController();
    const get = (p: string) => fetch(`https://api.chess.com/pub/player/${snapshot.username}${p}`, { signal: ctrl.signal }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)));
    Promise.all([get(""), get("/stats")])
      .then(([profile, stats]) => {
        const games = ["chess_daily", "chess_rapid", "chess_blitz", "chess_bullet"].reduce((n, k) => { const r = stats[k]?.record; return n + (r ? r.win + r.loss + r.draw : 0); }, 0);
        setS({
          username: profile.username, url: profile.url, joined: profile.joined,
          rapid: stats.chess_rapid?.last?.rating ?? snapshot.rapid,
          blitz: stats.chess_blitz?.last?.rating ?? snapshot.blitz,
          puzzles: stats.tactics?.highest?.rating ?? snapshot.puzzles,
          games: games || snapshot.games,
        });
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  const nf = new Intl.NumberFormat(t.locale);
  const since = new Date(s.joined * 1000).toLocaleDateString(t.locale, { month: "short", year: "numeric" });
  const stats = [
    // los ratings se escriben sin separador de miles (1532); la cantidad de partidas sí lo lleva
    { v: s.rapid, l: t.rapid, n: false },
    { v: s.blitz, l: t.blitz, n: false },
    { v: s.puzzles, l: t.puzzles, n: false },
    { v: s.games, l: `${t.games} ${t.since} ${since}`, n: true },
  ];

  return (
    <a className="row chesscom" href={c.href} target="_blank" rel="noreferrer">
      <span className="meta">{c.meta}</span>
      <span className="title">{c.title}</span>
      <span className="sum">{c.sum}</span>
      <span className="stats">
        {stats.map((x) => (
          <span key={x.l} className="stat"><b>{x.v == null ? "-" : x.n ? nf.format(x.v) : x.v}</b><span>{x.l}</span></span>
        ))}
      </span>
      <span className="tog" aria-hidden="true"><IconArrow /></span>
    </a>
  );
}
