"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChessScene, type Side } from "@/lib/chess-scene";
import { ChessSound } from "@/lib/chess-sound";
import { Music, MUSIC_SRC } from "@/lib/music";
import { SceneShader } from "@/lib/scene-shader";
import { PROFILE, SECTIONS, SECTION_IDS, UI, type Card, type Lang } from "@/lib/content";
import board from "@/lib/data/board.json";
import TravelMap from "./TravelMap";
import ChessCom from "./ChessCom";
import Story from "./Story";

const MUTE_KEY = "pc-muted";
const THEME_KEY = "pc-theme-v2";
const LANG_KEY = "pc-lang";
const MUSIC_KEY = "pc-music-v2";
/** idioma: lo elegido antes; si no, el del navegador (inglés solo si el navegador está en inglés); por defecto español */
const detectLang = (): Lang => {
  try { const s = localStorage.getItem(LANG_KEY); if (s === "es" || s === "en") return s; } catch {}
  for (const l of navigator.languages ?? [navigator.language]) {
    if (/^es\b/i.test(l)) return "es";
    if (/^en\b/i.test(l)) return "en";
  }
  return "es";
};
type Theme = "dark" | "light";
// oscuro por defecto; el script de app/layout.tsx aplica la clase "light" antes de pintar si el visitante eligió claro
const THEMES = { light: { ink: "#163428", paper: "#eee9dc" }, dark: { ink: "#dfe9e1", paper: "#0f1c17" } };
const currentTheme = (): Theme => (document.documentElement.classList.contains("light") ? "light" : "dark");

export default function Portfolio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const handBlackRef = useRef<HTMLImageElement>(null);
  const handWhiteRef = useRef<HTMLImageElement>(null);
  const sceneRef = useRef<ChessScene | null>(null);
  const soundRef = useRef<ChessSound | null>(null);
  const shaderRef = useRef<SceneShader | null>(null);
  const musicRef = useRef<Music | null>(null);
  const activeRef = useRef(-2);
  const readyRef = useRef<Promise<void>>(Promise.resolve());

  const [active, setActive] = useState(-1); // -1 = portada
  const [turn, setTurn] = useState<Side>("white");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [muted, setMuted] = useState(false);
  const [reduce, setReduce] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLang] = useState<Lang>("es");
  const [hasMusic, setHasMusic] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const t = UI[lang], sections = SECTIONS[lang];

  // idioma: el HTML se genera en español; al montar se ajusta al navegador o a la elección guardada
  useEffect(() => { const l = detectLang(); setLang(l); document.documentElement.lang = l; }, []);
  const toggleLang = () => {
    const next: Lang = lang === "es" ? "en" : "es";
    setLang(next);
    document.documentElement.lang = next;
    try { localStorage.setItem(LANG_KEY, next); } catch {}
  };

  // Montaje: shader de fondo + escena de piezas + sonido
  useEffect(() => {
    const th = currentTheme();
    setTheme(th);
    const scene = new ChessScene({ stage: stageRef.current!, layer: layerRef.current!, hands: { black: handBlackRef.current!, white: handWhiteRef.current! } }, th === "dark" ? "dark" : "green");
    sceneRef.current = scene;
    let shader: SceneShader | null = null;
    try {
      shader = new SceneShader(canvasRef.current!, "/assets/scene.webp", { img: board.size as [number, number], cup: board.cup as [number, number], ...THEMES[th] });
    } catch { /* sin WebGL: queda el papel liso y las piezas igual se ven */ }
    shaderRef.current = shader;
    scene.onCamera = (tx, ty, s) => shader?.setCamera(tx, ty, s);
    scene.onTurn = setTurn;

    const sound = new ChessSound();
    soundRef.current = sound;
    try { sound.muted = localStorage.getItem(MUTE_KEY) === "1"; } catch {}
    setMuted(sound.muted);
    scene.onSound = (kind, info) => sound.play(kind, info);
    const music = new Music();
    musicRef.current = music;
    // encendida por defecto: los navegadores no dejan sonar audio sin interacción, así que arranca con el primer toque o tecla
    let wantsMusic = true;
    try { wantsMusic = localStorage.getItem(MUSIC_KEY) !== "0"; } catch {}
    fetch(MUSIC_SRC, { method: "HEAD" }).then((r) => setHasMusic(r.ok)).catch(() => {});
    const unlock = (e: Event) => {
      sound.unlock();
      // si el primer toque es el propio botón de música, que decida el botón (si no, se prende y se apaga en el mismo click)
      const onMusicBtn = (e.target as Element | null)?.closest?.("[data-music]");
      if (wantsMusic && !onMusicBtn) void music.play().then(() => setMusicOn(music.playing));
      wantsMusic = false;
    };
    addEventListener("pointerdown", unlock);
    addEventListener("keydown", unlock);
    // la voz de "Sobre mí" avisa cuando habla, para bajar la música
    const onVoice = (e: Event) => music.duck((e as CustomEvent<boolean>).detail);
    addEventListener("pc-voice", onVoice);

    // movimiento reducido: jugadas instantáneas, sin manos y escena quieta
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => { scene.reduce = mq.matches; shader?.setMotion(!mq.matches); setReduce(mq.matches); };
    applyMotion();
    mq.addEventListener("change", applyMotion);

    scene.camera(-1, true);
    shader?.start();
    // todo aparece junto: textura del shader + sprites de piezas y manos
    readyRef.current = Promise.all([shader?.loaded, scene.loaded()]).then(() => {
      performance.mark("scene-ready");
      document.documentElement.classList.remove("loading");
    });
    const onVis = () => { music.setHidden(document.hidden); return document.hidden ? shader?.stop() : !mq.matches && shader?.start(); };
    document.addEventListener("visibilitychange", onVis);
    const onResize = () => { shader?.resize(); scene.camera(activeRef.current < -1 ? -1 : activeRef.current, true); };
    addEventListener("resize", onResize);

    return () => {
      removeEventListener("pointerdown", unlock); removeEventListener("keydown", unlock); removeEventListener("resize", onResize); removeEventListener("pc-voice", onVoice);
      mq.removeEventListener("change", applyMotion); document.removeEventListener("visibilitychange", onVis);
      shader?.destroy(); scene.destroy(); music.destroy(); sceneRef.current = null;
    };
  }, []);

  // La sección que llega al centro de la pantalla juega su jugada
  useEffect(() => {
    const blocks = [...document.querySelectorAll<HTMLElement>("[data-i]")];
    let raf = 0;
    const check = () => {
      raf = 0;
      const line = innerHeight * 0.62;
      let i = -1;
      for (const b of blocks) if (b.getBoundingClientRect().top < line) i = +b.dataset.i!;
      if (i !== activeRef.current) {
        activeRef.current = i;
        setActive(i);
        const scene = sceneRef.current;
        // la portada juega 1.c4 apenas carga; cada sección, la jugada siguiente
        if (scene) { scene.camera(i); scene.goTo(i + 1); }
        history.replaceState(null, "", `${location.pathname}${location.search}${i < 0 ? "" : `#${SECTION_IDS[i]}`}`);
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    addEventListener("scroll", onScroll, { passive: true });
    // deep link: ir directo a la sección del hash
    const start = SECTION_IDS.findIndex((id) => `#${id}` === location.hash);
    if (start >= 0) {
      const scene = sceneRef.current;
      if (scene) scene.goTo(start, { instant: true });
      document.getElementById(SECTION_IDS[start])?.scrollIntoView({ block: "center" });
    }
    // la primera jugada arranca cuando la escena ya está a la vista
    let t = 0, alive = true;
    void readyRef.current.then(() => { if (alive) t = window.setTimeout(check, 700); });
    return () => { alive = false; removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const goTo = useCallback((i: number) => {
    const el = i < 0 ? document.getElementById("top") : document.getElementById(SECTION_IDS[i]);
    el?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: i < 0 ? "start" : "center" });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).matches("input, textarea")) return;
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(Math.min(SECTION_IDS.length - 1, activeRef.current + 1)); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(Math.max(-1, activeRef.current - 1)); }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [goTo]);

  // En mobile el menú es horizontal: mantener visible la sección activa
  useEffect(() => {
    document.querySelector('.nav button[aria-current="true"]')?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active]);

  // tema claro / oscuro: shader, sprites y variables CSS; se recuerda la elección
  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("light", next === "light");
    shaderRef.current?.setColors(THEMES[next].ink, THEMES[next].paper);
    sceneRef.current?.setPalette(next === "dark" ? "dark" : "green");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEMES[next].paper);
    try { localStorage.setItem(THEME_KEY, next); } catch {}
  };

  const toggleMusic = async () => {
    const m = musicRef.current; if (!m) return;
    if (m.playing) m.pause(); else await m.play();
    setMusicOn(m.playing);
    try { localStorage.setItem(MUSIC_KEY, m.playing ? "1" : "0"); } catch {}
  };

  const toggleSound = () => {
    const s = soundRef.current; if (!s) return;
    s.muted = !s.muted; setMuted(s.muted);
    try { localStorage.setItem(MUTE_KEY, s.muted ? "1" : "0"); } catch {}
  };

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="5" style={{ stroke: "var(--ink)", strokeWidth: 2.1 }} />
          </pattern>
          <pattern id="hatch-accent" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="5" style={{ stroke: "var(--accent-line)", strokeWidth: 2.1 }} />
          </pattern>
        </defs>
      </svg>

      {/* Fondo: shader de la escena + piezas, manos y reloj alineados con la misma cámara */}
      <canvas className="bg" ref={canvasRef} aria-hidden="true" />
      <div className="progress" style={{ transform: `scaleX(${(active + 1) / SECTION_IDS.length})` }} aria-hidden="true" />
      <div className="scene" aria-hidden="true">
        <div className="stage" ref={stageRef}>
          <ChessClock turn={turn} paused={reduce} />
          <div ref={layerRef} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hand" ref={handBlackRef} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hand" ref={handWhiteRef} alt="" />
        </div>
      </div>

      <header className="top">
        <span className="where"><IconPin />{PROFILE.location}</span>
        <nav aria-label={t.sections}>
          <ol className="nav">
            {sections.map((sec, i) => (
              <li key={sec.id}><button aria-current={i === active} onClick={() => goTo(i)}>{sec.name}</button></li>
            ))}
          </ol>
        </nav>
        <div className="tools">
        <button className="ico lang" onClick={toggleLang} aria-label={t.langSwitch} title={t.langSwitch} lang={lang === "es" ? "en" : "es"}>{t.langCode}</button>
        <button className="ico" onClick={toggleTheme} aria-label={theme === "dark" ? t.themeToLight : t.themeToDark} title={theme === "dark" ? t.themeToLight : t.themeToDark}>
          {theme === "dark" ? <IconSun /> : <IconMoon />}
        </button>
        {hasMusic && (
          <button className="ico" data-music onClick={toggleMusic} aria-pressed={musicOn} aria-label={musicOn ? t.musicOff : t.musicOn} title={musicOn ? t.musicOff : t.musicOn}>
            <IconMusic />
          </button>
        )}
        <button className="ico" onClick={toggleSound} aria-pressed={!muted} aria-label={muted ? t.soundOn : t.soundOff} title={muted ? t.soundOn : t.soundOff}>
          {muted ? <IconSoundOff /> : <IconSoundOn />}
        </button>
        </div>
      </header>

      <nav className="corner" aria-label="Social">
        <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn"><IconLinkedIn /></a>
        <a href={PROFILE.x} target="_blank" rel="noreferrer" aria-label="X" title="X"><IconX /></a>
      </nav>

      <main>
        <section id="top" className="hero">
          <div className="hero-copy">
            <h1>{PROFILE.display}</h1>
            <p className="role">{t.role}</p>
            <button className="cue" onClick={() => goTo(0)}>{t.cue} <span aria-hidden="true">↓</span></button>
          </div>
        </section>

        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="block" data-i={i}>
            <div className="panel">
              {s.id === "contact" && <span className="mark" aria-hidden="true" />}
              <h2>{s.name}</h2>
              {s.lede && <p className="lede">{s.lede}</p>}
              {s.story && <Story paragraphs={s.story} lang={lang} />}
              {s.id === "travel" && <TravelMap lang={lang} />}
              {s.cards.length > 0 && <div className="rows">
                {s.cards.map((c, k) => {
                  if (c.chesscom) return <ChessCom key={k} c={c} lang={lang} />;
                  return <Row key={k} c={c} open={!!open[`${i}-${k}`]} toggle={() => setOpen((o) => ({ ...o, [`${i}-${k}`]: !o[`${i}-${k}`] }))} />;
                })}
              </div>}
              {s.id === "contact" && (
                <div className="social">
                  <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><IconLinkedIn /></a>
                  <a href={PROFILE.x} target="_blank" rel="noreferrer" aria-label="X"><IconX /></a>
                  <a href={`mailto:${PROFILE.email}`} aria-label="Email"><IconMail /></a>
                </div>
              )}
            </div>
          </section>
        ))}
        <footer className="foot">{t.line}</footer>
      </main>

    </>
  );
}

function Row({ c, open, toggle }: { c: Card; open: boolean; toggle: () => void }) {
  const body = (
    <>
      <span className="meta">{c.meta}</span>
      <span className="title">{c.title}</span>
      {c.sum && <span className="sum">{c.sum}</span>}
    </>
  );
  // lo que va debajo de la card, siempre visible: ítems, links y fotos
  const extras = (c.items || c.links || c.photos) && (
    <>
      {c.items && (
        <ul className="items">
          {c.items.map((it) => <li key={it.title}><span className="it-title">{it.title}</span><span className="it-meta">{it.meta}</span></li>)}
        </ul>
      )}
      {c.links && (
        <div className="links">
          {c.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label} <span aria-hidden="true">↗</span></a>)}
        </div>
      )}
      {c.photos && (
        <div className="strip">
          {c.photos.map((ph, n) => (
            <a key={ph.src} href={ph.src} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ph.thumb} width={ph.w} height={ph.h} alt={`${c.title} ${n + 1}`} loading="lazy" decoding="async" />
            </a>
          ))}
        </div>
      )}
    </>
  );
  if (c.href) {
    const external = c.href.startsWith("http");
    const a = (
      <a className="row" href={c.href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
        {body}<span className="tog" aria-hidden="true">↗</span>
      </a>
    );
    return extras ? <div className="row-wrap">{a}{extras}</div> : a;
  }
  const has = !!(c.more || c.tags);
  if (!has) return extras ? <div className="row-wrap"><div className="row">{body}</div>{extras}</div> : <div className="row">{body}</div>;
  return (
    <div className="row-wrap" data-open={open}>
      <button className="row" aria-expanded={open} onClick={toggle}>{body}<span className="tog" aria-hidden="true">+</span></button>
      {extras}
      <div className="more"><div>
        {c.more && <ul>{c.more.map((m) => typeof m === "string" ? <li key={m}>{m}</li> : <li key={m.href}><a href={m.href} target="_blank" rel="noreferrer">{m.label} ↗</a></li>)}</ul>}
        {c.tags && <div className="tags">{c.tags.map((t) => <span key={t}>{t}</span>)}</div>}
      </div></div>
    </div>
  );
}

/** Reloj de ajedrez sobre la ilustración: corre el reloj del bando que tiene que mover (izquierda = blancas). */
function ChessClock({ turn, paused }: { turn: Side; paused: boolean }) {
  const { left, right, r } = board.clock as { left: number[]; right: number[]; r: number };
  const dial = (c: number[], running: boolean, seed: number) => {
    const play = running && !paused ? "running" : "paused";
    const hand = (len: number, w: number, dur: string, timing: string, start: number, cls?: string) => (
      <g style={{ transformBox: "view-box", transformOrigin: `${c[0]}px ${c[1]}px`, animation: `clock-spin ${dur} ${timing} infinite`, animationPlayState: play, animationDelay: `-${start}s` }}>
        <line className={cls} x1={c[0]} y1={c[1] + len * 0.18} x2={c[0]} y2={c[1] - len} strokeWidth={w} />
      </g>
    );
    return (
      <g>
        {hand(r * 0.55, 5, "3600s", "linear", 3600 * seed)}
        {hand(r * 0.82, 2.6, "60s", "steps(60)", 60 * ((seed * 7) % 1), "sec")}
        <circle cx={c[0]} cy={c[1]} r={4.5} className="cap" />
      </g>
    );
  };
  return (
    <svg className="clock" viewBox={`0 0 ${board.size[0]} ${board.size[1]}`} width={board.size[0]} height={board.size[1]}>
      {dial(left, turn === "white", 0.37)}
      {dial(right, turn === "black", 0.61)}
    </svg>
  );
}

const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24"><path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 7v8h2.5v-8H7Zm1.25-4a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8ZM11 10v8h2.5v-4.2c0-1.1.6-1.8 1.5-1.8s1.5.6 1.5 1.8V18H19v-4.8c0-2.3-1.3-3.4-3-3.4-1.2 0-2 .5-2.5 1.2V10H11Z" /></svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24"><path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.9 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" /></svg>
);
const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="m4 6 8 7 8-7" /></svg>
);
const IconSoundOn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor" stroke="none" /><path d="M15.5 9.2a4 4 0 0 1 0 5.6M18 7a7 7 0 0 1 0 10" /></svg>
);
const IconSoundOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" fill="currentColor" stroke="none" /><path d="m16 9.5 5 5m0-5-5 5" /></svg>
);
const IconSun = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" /></svg>
);
const IconMoon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" /></svg>
);
const IconMusic = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5.5l11-2V16" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></svg>
);
const IconPin = () => (
  <svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" /></svg>
);
