"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/content";
import voices from "@/lib/data/story-audio.json";

type Voice = { src: string; duration: number; anchors: [number, number][] };
const VOICE = voices as unknown as Record<Lang, Voice>;

const TXT = {
  es: { all: "Mostrar todo", listen: "¿Te lo leo?", pause: "Pausar", resume: "Seguir", speed: "Velocidad de la voz:" },
  en: { all: "Show all", listen: "Want me to read it?", pause: "Pause", resume: "Resume", speed: "Voice speed:" },
};

const RATES = [1, 1.25, 1.5, 2];

// ritmo de lectura: ~38 letras por segundo, con pausas en la puntuación y entre párrafos
const CPS = 38;
const pause = (ch: string, endOfParagraph: boolean) =>
  endOfParagraph ? 480 : /[.!?]/.test(ch) ? 260 : /[,;:]/.test(ch) ? 90 : 1000 / CPS;

/**
 * Hasta qué letra llegó la voz en el segundo t. Las anclas (letra, segundo) marcan dónde empieza y termina
 * cada oración en la grabación: se calcularon alineando las oraciones con las pausas del audio.
 */
function charAt(v: Voice, t: number, total: number) {
  const a = v.anchors;
  if (t <= a[0][1]) return 0;
  for (let k = 1; k < a.length; k++) {
    const [c1, t1] = a[k];
    if (t <= t1) { const [c0, t0] = a[k - 1]; return c1 === c0 || t1 === t0 ? c0 : Math.round(c0 + ((c1 - c0) * (t - t0)) / (t1 - t0)); }
  }
  return total;
}

/**
 * "Sobre mí" escrito letra por letra, acompañando la lectura: avanza solo mientras la sección está en pantalla
 * y la línea que se está escribiendo se ve (si queda por debajo del borde, espera a que bajes).
 * Con la voz sonando, la escritura sigue a la voz: se apura si quedó atrás y espera si va adelantada.
 * La card crece a medida que se escribe, desde un alto mínimo intermedio. Los lectores de pantalla leen
 * el texto completo de una (copia oculta).
 */
export default function Story({ paragraphs, lang }: { paragraphs: string[]; lang: Lang }) {
  const t = TXT[lang];
  const total = paragraphs.reduce((n, p) => n + p.length, 0);
  const [n, setN] = useState(total); // HTML estático: texto completo
  const [voice, setVoice] = useState<"idle" | "playing" | "paused">("idle");
  // velocidad de la voz: 1x → 1.25x → 1.5x → 2x → 1x (la escritura sigue igual, porque se guía por el tiempo del audio)
  const [rate, setRate] = useState(1);
  const rateRef = useRef(1);
  const nextRate = () => {
    const r = RATES[(RATES.indexOf(rateRef.current) + 1) % RATES.length];
    rateRef.current = r;
    setRate(r);
    if (audioRef.current) audioRef.current.playbackRate = r;
  };
  const boxRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // el loop lee siempre el valor actual (si cambia el idioma a mitad de camino, arranca de cero sin saltos)
  const nRef = useRef(n);
  nRef.current = n;
  const done = n >= total;

  // cada vez que llega un texto (primera carga o cambio de idioma) se escribe de cero, salvo movimiento reducido.
  // Ojo: el HTML estático está en español y, si el navegador está en inglés, el idioma cambia apenas monta.
  useEffect(() => {
    setN(matchMedia("(prefers-reduced-motion: reduce)").matches ? total : 0);
  }, [paragraphs, total]);

  // la voz es por idioma: al cambiar de idioma (o salir) se corta
  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (a) { a.pause(); a.removeAttribute("src"); a.load(); }
      audioRef.current = null;
      setVoice("idle");
      dispatchEvent(new CustomEvent("pc-voice", { detail: false }));
    };
  }, [lang]);

  const toggleVoice = () => {
    let a = audioRef.current;
    if (!a) {
      a = new Audio(VOICE[lang].src);
      a.preload = "auto";
      a.playbackRate = rateRef.current;
      a.addEventListener("play", () => { setVoice("playing"); dispatchEvent(new CustomEvent("pc-voice", { detail: true })); });
      a.addEventListener("pause", () => { if (!a!.ended) setVoice("paused"); dispatchEvent(new CustomEvent("pc-voice", { detail: false })); });
      a.addEventListener("ended", () => { setVoice("idle"); a!.currentTime = 0; dispatchEvent(new CustomEvent("pc-voice", { detail: false })); });
      audioRef.current = a;
    }
    if (a.paused) void a.play().catch(() => setVoice("idle")); else a.pause();
  };

  useEffect(() => {
    if (done) return;
    let timer = 0;
    // dónde termina cada párrafo, para la pausa entre párrafos
    const ends = new Set<number>(); let acc = 0;
    for (const p of paragraphs) { acc += p.length; ends.add(acc); }
    const flat = paragraphs.join("");
    const set = (i: number) => { nRef.current = i; setN(i); };
    const tick = () => {
      // con la voz sonando, la escritura va a la par de la voz
      const a = audioRef.current;
      if (a && !a.paused) {
        const target = charAt(VOICE[lang], a.currentTime, total), d = target - nRef.current;
        if (d > 30) set(Math.min(total, nRef.current + 6));
        else if (d > 0) set(nRef.current + 1);
        if (nRef.current < total) timer = window.setTimeout(tick, d > 0 ? 25 : 60);
        return;
      }
      const caret = caretRef.current?.getBoundingClientRect();
      // si bajó más rápido de lo que se escribe (la línea quedó arriba de la pantalla), avance rápido hasta alcanzarlo
      if (caret && caret.bottom < 0) { set(Math.min(total, nRef.current + 9)); if (nRef.current < total) timer = window.setTimeout(tick, 16); return; }
      const box = boxRef.current!.getBoundingClientRect();
      const inView = box.top < innerHeight && box.bottom > 0;
      const visible = inView && !document.hidden && !document.documentElement.classList.contains("loading")
        && (!caret || (caret.bottom < innerHeight - 24 && caret.top > 0));
      if (!visible) { timer = window.setTimeout(tick, 200); return; }
      const i = Math.min(total, nRef.current + 1);
      set(i);
      if (i < total) timer = window.setTimeout(tick, pause(flat[i - 1], ends.has(i)));
    };
    timer = window.setTimeout(tick, 400);
    return () => clearTimeout(timer);
    // solo se rearma al empezar o al terminar; n avanza adentro del loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, paragraphs, total]);

  let offset = 0;
  return (
    <div className="story" ref={boxRef}>
      {/* solo lo ya escrito ocupa lugar: la card crece con el texto (desde un alto mínimo, en CSS) */}
      <div className="story-text" aria-hidden="true">
        {paragraphs.map((p, k) => {
          const shown = Math.max(0, Math.min(p.length, n - offset));
          const active = !done && n >= offset && shown < p.length;
          offset += p.length;
          if (!shown && !active) return null;
          return (
            <p key={k}>
              {p.slice(0, shown)}
              {active && <span className="caret" ref={caretRef} />}
            </p>
          );
        })}
      </div>
      <div className="sr-only">{paragraphs.map((p, k) => <p key={k}>{p}</p>)}</div>
      {/* barra fija abajo mientras se lee: voz, velocidad y mostrar todo */}
      <div className="story-bar">
        <button className="story-listen" data-state={voice} onClick={toggleVoice} aria-pressed={voice === "playing"}>
          {voice === "playing" ? <span className="eq" aria-hidden="true"><i /><i /><i /></span> : <IconVoice />}
          {voice === "playing" ? t.pause : voice === "paused" ? t.resume : t.listen}
        </button>
        <button className="story-rate" onClick={nextRate} aria-label={`${t.speed} ${rate}x`}>{rate}x</button>
        {!done && <button className="story-all" onClick={() => setN(total)}>{t.all} ↓</button>}
      </div>
    </div>
  );
}

const IconVoice = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.2L12 5.6v12.8l-4.8-3.9H4z" fill="currentColor" /><path d="M15.5 8.8a4.5 4.5 0 0 1 0 6.4M18 6.4a8 8 0 0 1 0 11.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
);
