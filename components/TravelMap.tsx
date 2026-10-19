"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "@/lib/content";
import { PLACES, type Place } from "@/lib/travel";
import photosById from "@/lib/data/travel-photos.json";

type Photo = { src: string; thumb: string; w: number; h: number };
const PHOTOS = photosById as Record<string, Photo[]>;

// Máscara de tierra (equirectangular, blanco = tierra), generada con scripts/travel-mask.mjs
const MASK = { src: "/assets/travel/land.png", lat0: 84, lat1: -60 };
const RAD = Math.PI / 180;
// Mercator en "grados": x = longitud, y = merc(latitud). Europa y el Cono Sur se ven con su forma de siempre.
const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2)) / RAD;
const unmerc = (y: number) => (2 * Math.atan(Math.exp(y * RAD)) - Math.PI / 2) / RAD;

type View = { x: number; y: number; k: number }; // centro proyectado + px CSS por grado
type Cluster = { key: string; ids: string[] };

const STEP = 5;      // separación de la grilla de puntos (px CSS): fija en pantalla, el mapa se mueve debajo
const DOT = 1.7;     // tamaño de cada punto
const R = 20;        // distancia (px) por debajo de la cual los pines se agrupan
const K_MAX = 220;   // zoom máximo (px por grado)
const PIN_ZOOM = 16; // zoom mínimo al elegir un lugar

const proj = (p: Place) => ({ x: p.lon, y: merc(p.lat) });
const byId = Object.fromEntries(PLACES.map((p) => [p.id, p]));

const TXT = {
  es: { hint: "Tocá un pin para ver las fotos.", world: "Mundo", soon: "Fotos en camino.", places: (n: number) => `${n} lugares`, map: "Mapa de viajes" },
  en: { hint: "Tap a pin to see the photos.", world: "World", soon: "Photos coming soon.", places: (n: number) => `${n} places`, map: "Travel map" },
};

/** encuadre que contiene todos los puntos dados, con margen */
function fit(ids: string[], w: number, h: number, pad = 0.18, minSpan = 6): View {
  const pts = ids.map((id) => proj(byId[id]));
  let x0 = Math.min(...pts.map((p) => p.x)), x1 = Math.max(...pts.map((p) => p.x));
  let y0 = Math.min(...pts.map((p) => p.y)), y1 = Math.max(...pts.map((p) => p.y));
  const sx = Math.max(x1 - x0, minSpan), sy = Math.max(y1 - y0, minSpan * 0.6);
  const k = Math.min(K_MAX, (w * (1 - pad * 2)) / sx, (h * (1 - pad * 2)) / sy);
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, k };
}

/** agrupa los pines que en este zoom quedarían a menos de R px */
function cluster(view: View): Cluster[] {
  const out: { ids: string[]; x: number; y: number }[] = [];
  for (const p of PLACES) {
    const q = proj(p), sx = q.x * view.k, sy = -q.y * view.k;
    const c = out.find((o) => Math.hypot(o.x - sx, o.y - sy) < R);
    if (c) { c.ids.push(p.id); c.x += (sx - c.x) / c.ids.length; c.y += (sy - c.y) / c.ids.length; }
    else out.push({ ids: [p.id], x: sx, y: sy });
  }
  return out.map((c) => ({ key: c.ids.join("|"), ids: c.ids }));
}

export default function TravelMap({ lang }: { lang: Lang }) {
  const t = TXT[lang];
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pinsRef = useRef<HTMLDivElement>(null);
  const mask = useRef<{ data: Uint8Array; w: number; h: number } | null>(null);
  const view = useRef<View>({ x: 0, y: 0, k: 1 });
  const home = useRef<View>({ x: 0, y: 0, k: 1 });
  const size = useRef({ w: 0, h: 0 });
  const anim = useRef(0);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const zoomedRef = useRef(false);
  useEffect(() => { zoomedRef.current = zoomed; }, [zoomed]);

  // dibuja la grilla de puntos: cada punto de pantalla se prende si cae sobre tierra
  const draw = useCallback(() => {
    const cv = canvasRef.current, m = mask.current; if (!cv) return;
    const { w, h } = size.current, v = view.current, dpr = Math.min(devicePixelRatio || 1, 2);
    const ctx = cv.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (!m) return;
    ctx.fillStyle = getComputedStyle(cv).color;
    const span = MASK.lat0 - MASK.lat1;
    for (let sy = STEP / 2; sy < h; sy += STEP) {
      const lat = unmerc(v.y - (sy - h / 2) / v.k);
      if (lat > MASK.lat0 || lat < MASK.lat1) continue;
      const row = Math.min(m.h - 1, Math.floor(((MASK.lat0 - lat) / span) * m.h)) * m.w;
      for (let sx = STEP / 2; sx < w; sx += STEP) {
        let lon = v.x + (sx - w / 2) / v.k;
        lon = ((((lon + 180) % 360) + 360) % 360) - 180;
        if (m.data[row + Math.floor(((lon + 180) / 360) * m.w)]) ctx.fillRect(sx - DOT / 2, sy - DOT / 2, DOT, DOT);
      }
    }
  }, []);

  // ubica cada pin (o grupo) en pantalla según la vista actual
  const place = useCallback(() => {
    const box = pinsRef.current; if (!box) return;
    const { w, h } = size.current, v = view.current;
    for (const el of box.querySelectorAll<HTMLElement>("[data-ids]")) {
      const ids = el.dataset.ids!.split("|");
      let x = 0, y = 0;
      for (const id of ids) { const q = proj(byId[id]); x += q.x; y += q.y; }
      x /= ids.length; y /= ids.length;
      const px = w / 2 + (x - v.x) * v.k, py = h / 2 - (y - v.y) * v.k;
      el.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
      el.style.visibility = px < -20 || px > w + 20 || py < -20 || py > h + 20 ? "hidden" : "";
    }
  }, []);

  const frame = useCallback(() => { draw(); place(); }, [draw, place]);

  // va a una vista con una transición suave (zoom en escala logarítmica para que no "salte")
  const goTo = useCallback((to: View, instant = false) => {
    cancelAnimationFrame(anim.current);
    setClusters(cluster(to));
    const from = { ...view.current };
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (instant || reduce) { view.current = to; requestAnimationFrame(frame); return; }
    const t0 = performance.now(), D = 900;
    const tick = () => {
      const q = Math.min(1, (performance.now() - t0) / D), e = q < 0.5 ? 4 * q * q * q : 1 - (-2 * q + 2) ** 3 / 2;
      const k = Math.exp(Math.log(from.k) + (Math.log(to.k) - Math.log(from.k)) * e);
      view.current = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, k };
      frame();
      if (q < 1) anim.current = requestAnimationFrame(tick);
    };
    anim.current = requestAnimationFrame(tick);
  }, [frame]);

  // tamaño del mapa (y encuadre inicial con todos los lugares)
  useEffect(() => {
    const box = boxRef.current!, cv = canvasRef.current!;
    const resize = () => {
      const w = box.clientWidth, h = box.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
      size.current = { w, h };
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      home.current = fit(PLACES.map((p) => p.id), w, h, 0.08, 40);
      if (!zoomedRef.current) goTo(home.current, true); else frame();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    resize();
    return () => { ro.disconnect(); cancelAnimationFrame(anim.current); };
  }, [goTo, frame]);

  // carga la máscara de tierra (una vez) y la pasa a un byte por píxel
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onload = () => {
      if (!alive) return;
      const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
      const g = c.getContext("2d")!; g.drawImage(img, 0, 0);
      const px = g.getImageData(0, 0, img.width, img.height).data, data = new Uint8Array(img.width * img.height);
      for (let i = 0; i < data.length; i++) data[i] = px[i * 4] > 127 ? 1 : 0;
      mask.current = { data, w: img.width, h: img.height };
      frame();
    };
    img.src = MASK.src;
    // el color de los puntos sigue al tema
    const mo = new MutationObserver(() => draw());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => { alive = false; mo.disconnect(); };
  }, [frame, draw]);

  // los pines recién creados se ubican antes de pintarse
  useEffect(() => { place(); }, [clusters, place]);

  const open = (c: Cluster) => {
    const { w, h } = size.current;
    if (c.ids.length > 1) {
      setSelected(null);
      setZoomed(true);
      goTo(fit(c.ids, w, h, 0.2, 1.2));
      return;
    }
    const q = proj(byId[c.ids[0]]);
    setSelected(c.ids[0]);
    setZoomed(true);
    goTo({ x: q.x, y: q.y, k: Math.min(K_MAX, Math.max(view.current.k, PIN_ZOOM)) });
  };
  const reset = () => { setSelected(null); setZoomed(false); goTo(home.current); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && zoomedRef.current) reset(); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  const sel = selected ? byId[selected] : null;
  const photos = useMemo(() => (selected ? PHOTOS[selected] ?? [] : []), [selected]);

  return (
    <div className="tm">
      <div className="tm-map" ref={boxRef} role="group" aria-label={t.map}>
        <canvas ref={canvasRef} aria-hidden="true" />
        <div className="tm-pins" ref={pinsRef}>
          {clusters.map((c) => {
            const one = c.ids.length === 1 ? byId[c.ids[0]] : null;
            const label = one ? `${one.name[lang]}, ${one.country[lang]}` : `${t.places(c.ids.length)}: ${c.ids.map((id) => byId[id].name[lang]).join(", ")}`;
            return (
              <button key={c.key} data-ids={c.key} className={`tm-pin${one ? "" : " cl"}`} aria-label={label} aria-pressed={one ? selected === one.id : undefined} onClick={() => open(c)}>
                <i>{one ? null : c.ids.length}</i>
                {one && <span className="lb">{one.name[lang]}</span>}
              </button>
            );
          })}
        </div>
        {zoomed && <button className="tm-reset" onClick={reset}>← {t.world}</button>}
      </div>
      <div className="tm-info" aria-live="polite">
        {sel ? (
          <>
            <div className="tm-head">
              <span className="title">{sel.name[lang]}</span>
              <span className="meta">{sel.country[lang]}{sel.years ? ` · ${sel.years.join(", ")}` : ""}</span>
            </div>
            {photos.length ? (
              <div className="tm-strip">
                {photos.map((p, i) => (
                  <a key={p.src} href={p.src} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumb} width={p.w} height={p.h} alt={`${sel.name[lang]} ${i + 1}`} loading="lazy" decoding="async" />
                  </a>
                ))}
              </div>
            ) : <p className="tm-hint">{t.soon}</p>}
          </>
        ) : <p className="tm-hint">{t.hint}</p>}
      </div>
    </div>
  );
}
