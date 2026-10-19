"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/content";

const TXT = { es: { all: "Mostrar todo" }, en: { all: "Show all" } };

// ritmo de lectura: ~38 letras por segundo, con pausas en la puntuación y entre párrafos
const CPS = 38;
const pause = (ch: string, endOfParagraph: boolean) =>
  endOfParagraph ? 480 : /[.!?]/.test(ch) ? 260 : /[,;:]/.test(ch) ? 90 : 1000 / CPS;

/**
 * "Sobre mí" escrito letra por letra, acompañando la lectura: avanza solo mientras la sección está en pantalla
 * y la línea que se está escribiendo se ve (si queda por debajo del borde, espera a que bajes).
 * El texto completo está siempre en el DOM (lo que falta, transparente), así la card no cambia de alto,
 * y los lectores de pantalla leen todo de una.
 */
export default function Story({ paragraphs, lang }: { paragraphs: string[]; lang: Lang }) {
  const total = paragraphs.reduce((n, p) => n + p.length, 0);
  const [n, setN] = useState(total); // HTML estático: texto completo
  const boxRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  // el loop lee siempre el valor actual (si cambia el idioma a mitad de camino, arranca de cero sin saltos)
  const nRef = useRef(n);
  nRef.current = n;
  const done = n >= total;

  // cada vez que llega un texto (primera carga o cambio de idioma) se escribe de cero, salvo movimiento reducido.
  // Ojo: el HTML estático está en español y, si el navegador está en inglés, el idioma cambia apenas monta.
  useEffect(() => {
    setN(matchMedia("(prefers-reduced-motion: reduce)").matches ? total : 0);
  }, [paragraphs, total]);

  useEffect(() => {
    if (done) return;
    let timer = 0;
    // dónde termina cada párrafo, para la pausa entre párrafos
    const ends = new Set<number>(); let acc = 0;
    for (const p of paragraphs) { acc += p.length; ends.add(acc); }
    const flat = paragraphs.join("");
    const tick = () => {
      const caret = caretRef.current?.getBoundingClientRect();
      // si bajó más rápido de lo que se escribe (la línea quedó arriba de la pantalla), avance rápido hasta alcanzarlo
      if (caret && caret.bottom < 0) { const i = Math.min(total, nRef.current + 9); nRef.current = i; setN(i); if (i < total) timer = window.setTimeout(tick, 16); return; }
      const box = boxRef.current!.getBoundingClientRect();
      const inView = box.top < innerHeight && box.bottom > 0;
      const visible = inView && !document.hidden && !document.documentElement.classList.contains("loading")
        && (!caret || (caret.bottom < innerHeight - 24 && caret.top > 0));
      if (!visible) { timer = window.setTimeout(tick, 200); return; }
      const i = Math.min(total, nRef.current + 1);
      nRef.current = i;
      setN(i);
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
      <div aria-hidden="true">
        {paragraphs.map((p, k) => {
          const shown = Math.max(0, Math.min(p.length, n - offset));
          const active = !done && n >= offset && shown < p.length;
          offset += p.length;
          return (
            <p key={k}>
              {p.slice(0, shown)}
              {active && <span className="caret" ref={caretRef} />}
              <span className="ghost">{p.slice(shown)}</span>
            </p>
          );
        })}
      </div>
      <div className="sr-only">{paragraphs.map((p, k) => <p key={k}>{p}</p>)}</div>
      {!done && <button className="story-all" onClick={() => setN(total)}>{TXT[lang].all} ↓</button>}
    </div>
  );
}
