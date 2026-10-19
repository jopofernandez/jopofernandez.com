"use client";

import { useEffect, useState } from "react";
import type { Side } from "@/lib/chess-scene";
import board from "@/lib/data/board.json";

// Reloj de ajedrez digital sobre la ilustración: un display de 7 segmentos proyectado sobre la pantalla del reloj
// dibujado (esquinas medidas en la escena, en board.json). 10 minutos por lado; corre el del bando que mueve
// (izquierda = blancas) y un punto lima marca cuál está corriendo.

const START = 10 * 60;
const W = 300, H = 58; // espacio propio del display; se proyecta sobre las 4 esquinas de la pantalla

/** homografía del rectángulo W×H a un cuadrilátero (TL, TR, BR, BL), como matrix3d de CSS */
function quadMatrix(q: number[][]) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2;
  const sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (sx * dy2 - dx2 * sy) / den, h = (dx1 * sy - sx * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3, d = y1 - y0 + g * y1, e = y3 - y0 + h * y3;
  return `matrix3d(${a / W},${d / W},0,${g / W},${b / H},${e / H},0,${h / H},0,0,1,0,${x0},${y0},0,1)`;
}
const MATRIX = quadMatrix((board.clock as { lcd: number[][] }).lcd);

// segmentos a–g de un dígito (ancho 20, alto 38) y qué segmentos prende cada número
const SEG: Record<string, string> = {
  a: "3,0 17,0 14,3 6,3", b: "18,1 20,3 20,17 18,19 16,17 16,4", c: "18,19 20,21 20,35 18,37 16,34 16,21",
  d: "3,38 17,38 14,35 6,35", e: "2,19 4,21 4,34 2,37 0,35 0,21", f: "2,1 4,4 4,17 2,19 0,17 0,3", g: "3,19 6,17 14,17 17,19 14,21 6,21",
};
const ON = ["abcdef", "bc", "abged", "abgcd", "fgbc", "afgcd", "afgedc", "abc", "abcdefg", "abfgcd"];

function Digit({ n, x }: { n: number | null; x: number }) {
  return (
    <g transform={`translate(${x} 10)`}>
      {Object.entries(SEG).map(([k, pts]) => (
        <polygon key={k} points={pts} className={n !== null && ON[n].includes(k) ? "on" : "off"} />
      ))}
    </g>
  );
}

function Time({ s, x, running }: { s: number; x: number; running: boolean }) {
  const m = Math.floor(s / 60), sec = s % 60;
  // "10:00" / " 9:59": el primer dígito se apaga si es cero, como en un reloj real
  const ds = [m >= 10 ? Math.floor(m / 10) : null, m % 10, Math.floor(sec / 10), sec % 10];
  return (
    <g>
      <Digit n={ds[0]} x={x} />
      <Digit n={ds[1]} x={x + 25} />
      <g className={running && s > 0 ? "colon blink" : "colon"}>
        <rect x={x + 49} y={20} width={3.4} height={3.4} />
        <rect x={x + 49} y={35} width={3.4} height={3.4} />
      </g>
      <Digit n={ds[2]} x={x + 57} />
      <Digit n={ds[3]} x={x + 82} />
    </g>
  );
}

export default function ChessClock({ turn, paused }: { turn: Side; paused: boolean }) {
  const [t, setT] = useState({ white: START, black: START });

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setT((v) => ({ ...v, [turn]: Math.max(0, v[turn] - 1) })), 1000);
    return () => clearInterval(id);
  }, [turn, paused]);

  return (
    <div className="lcd" style={{ width: W, height: H, transform: MATRIX }} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <Time s={t.white} x={22} running={turn === "white"} />
        <line x1={W / 2} y1={10} x2={W / 2} y2={48} className="div" />
        <Time s={t.black} x={W / 2 + 22} running={turn === "black"} />
        <circle cx={turn === "white" ? 12 : W / 2 + 12} cy={14} r={3.2} className="run" />
      </svg>
    </div>
  );
}
