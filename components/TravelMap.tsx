"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Lang } from "@/lib/content";
import { PLACES, type Place } from "@/lib/travel";
import photosById from "@/lib/data/travel-photos.json";

type Photo = { src: string; thumb: string; w: number; h: number };
const PHOTOS = photosById as Record<string, Photo[]>;

// Máscara de tierra (equirectangular, blanco = tierra), generada con scripts/travel-mask.mjs
const MASK = { src: "/assets/travel/land.png", lat0: 84, lat1: -60 };
const RAD = Math.PI / 180;
// Mercator en "grados": x = longitud, y = merc(latitud)
const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2)) / RAD;
const unmerc = (y: number) => (2 * Math.atan(Math.exp(y * RAD)) - Math.PI / 2) / RAD;

const STEP = 5;   // separación de la grilla de puntos (px CSS)
const DOT = 1.7;  // tamaño de cada punto

type View = { x: number; y: number; k: number }; // centro proyectado + px CSS por grado
type Shot = { place: Place; photo: Photo };
type Group = { key: string; shots: Shot[]; x: number; y: number };

const proj = (p: Place) => ({ x: p.lon, y: merc(p.lat) });
const SHOTS: Shot[] = PLACES.flatMap((place) => (PHOTOS[place.id] ?? []).map((photo) => ({ place, photo })));
const BARE = PLACES.filter((p) => !PHOTOS[p.id]?.length); // lugares sin foto: un punto chico, sin interacción

const TXT = {
  es: { map: "Mapa de viajes", open: (n: number) => (n === 1 ? "Ver la foto" : `Ver ${n} fotos`), close: "Cerrar", prev: "Anterior", next: "Siguiente" },
  en: { map: "Travel map", open: (n: number) => (n === 1 ? "See the photo" : `See ${n} photos`), close: "Close", prev: "Previous", next: "Next" },
};

/** encuadre con los lugares que tienen foto, con margen para las miniaturas */
function fit(w: number, h: number): View {
  const pts = (SHOTS.length ? SHOTS.map((s) => s.place) : PLACES).map(proj);
  const x0 = Math.min(...pts.map((p) => p.x)), x1 = Math.max(...pts.map((p) => p.x));
  const y0 = Math.min(...pts.map((p) => p.y)), y1 = Math.max(...pts.map((p) => p.y));
  const k = Math.min((w * 0.8) / (x1 - x0), (h * 0.74) / (y1 - y0));
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, k };
}

/** agrupa las fotos que en pantalla quedarían encimadas (como el mapa de Fotos) */
function group(view: View, w: number, h: number, size: number): Group[] {
  const out: Group[] = [];
  for (const s of SHOTS) {
    const q = proj(s.place), x = w / 2 + (q.x - view.x) * view.k, y = h / 2 - (q.y - view.y) * view.k;
    const g = out.find((o) => Math.hypot(o.x - x, o.y - y) < size * 0.85);
    if (g) { g.shots.push(s); g.x += (x - g.x) / g.shots.length; g.y += (y - g.y) / g.shots.length; }
    else out.push({ key: s.place.id, shots: [s], x, y });
  }
  return out.map((g) => ({ ...g, key: g.shots.map((s) => s.place.id).join("|") }));
}

export default function TravelMap({ lang }: { lang: Lang }) {
  const t = TXT[lang];
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mask = useRef<{ data: Uint8Array; w: number; h: number } | null>(null);
  const view = useRef<View>({ x: 0, y: 0, k: 1 });
  const size = useRef({ w: 0, h: 0 });
  const [groups, setGroups] = useState<Group[]>([]);
  const [bare, setBare] = useState<{ id: string; x: number; y: number }[]>([]);
  const [open, setOpen] = useState<{ shots: Shot[]; from: DOMRect } | null>(null);

  // grilla de puntos: cada punto de pantalla se prende si cae sobre tierra
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

  // tamaño, encuadre y grupos según el ancho disponible
  useEffect(() => {
    const box = boxRef.current!, cv = canvasRef.current!;
    const resize = () => {
      const w = box.clientWidth, h = box.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
      size.current = { w, h };
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      view.current = fit(w, h);
      const thumb = w < 480 ? 38 : 46;
      setGroups(group(view.current, w, h, thumb));
      setBare(BARE.map((p) => { const q = proj(p); return { id: p.id, x: w / 2 + (q.x - view.current.x) * view.current.k, y: h / 2 - (q.y - view.current.y) * view.current.k }; }));
      draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    resize();
    return () => ro.disconnect();
  }, [draw]);

  // máscara de tierra (una vez) y redibujo al cambiar de tema
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
      draw();
    };
    img.src = MASK.src;
    const mo = new MutationObserver(() => draw());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => { alive = false; mo.disconnect(); };
  }, [draw]);

  return (
    <div className="tm">
      {/* duotono de las miniaturas: la luminancia de la foto pasa a tinta/papel del tema */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="duo-light" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
          <feComponentTransfer><feFuncR type="table" tableValues="0.086 0.933" /><feFuncG type="table" tableValues="0.204 0.914" /><feFuncB type="table" tableValues="0.157 0.863" /></feComponentTransfer>
        </filter>
        <filter id="duo-dark" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
          <feComponentTransfer><feFuncR type="table" tableValues="0.059 0.875" /><feFuncG type="table" tableValues="0.11 0.914" /><feFuncB type="table" tableValues="0.09 0.882" /></feComponentTransfer>
        </filter>
      </svg>
      <div className="tm-map" ref={boxRef} role="group" aria-label={t.map}>
        <canvas ref={canvasRef} aria-hidden="true" />
        {bare.map((b) => <i key={b.id} className="tm-dot" style={{ transform: `translate(${b.x}px, ${b.y}px)` }} />)}
        {groups.map((g) => (
          <button
            key={g.key}
            className="tm-ph"
            data-n={Math.min(g.shots.length, 3)}
            style={{ transform: `translate(${g.x}px, ${g.y}px)` }}
            aria-label={t.open(g.shots.length)}
            onClick={(e) => setOpen({ shots: g.shots, from: (e.currentTarget.querySelector(".ph[data-depth='0']") as HTMLElement).getBoundingClientRect() })}
          >
            {g.shots.slice(0, 3).reverse().map((s, i, arr) => (
              <span key={s.place.id} className="ph" data-depth={arr.length - 1 - i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="duo" src={s.photo.thumb} alt="" loading="lazy" decoding="async" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="col" src={s.photo.thumb} alt="" loading="lazy" decoding="async" />
              </span>
            ))}
            {g.shots.length > 1 && <b className="count">{g.shots.length}</b>}
          </button>
        ))}
      </div>
      {/* el visor va al body: la card tiene backdrop-filter y un position: fixed adentro quedaría atado a ella */}
      {open && createPortal(<Viewer shots={open.shots} from={open.from} lang={lang} onClose={() => setOpen(null)} />, document.body)}
    </div>
  );
}

/** Foto a pantalla completa: crece desde la miniatura y se pasan las del grupo como un carrusel. */
function Viewer({ shots, from, lang, onClose }: { shots: Shot[]; from: DOMRect; lang: Lang; onClose: () => void }) {
  const t = TXT[lang];
  const [i, setI] = useState(0);
  const imgRef = useRef<HTMLDivElement>(null);
  const touch = useRef<number | null>(null);
  const n = shots.length, s = shots[i];
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  // tamaño final: la foto entera dentro del 86% × 80% de la ventana
  const ratio = s.photo.w / s.photo.h;
  const maxW = Math.min(innerWidth * 0.86, 1100), maxH = innerHeight * 0.8;
  const fw = Math.min(maxW, maxH * ratio), fh = fw / ratio;

  // zoom de entrada: de la miniatura a su lugar final (FLIP)
  useLayoutEffect(() => {
    const el = imgRef.current; if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const to = el.getBoundingClientRect();
    const sx = from.width / to.width, sy = from.height / to.height;
    const dx = from.left + from.width / 2 - (to.left + to.width / 2), dy = from.top + from.height / 2 - (to.top + to.height / 2);
    el.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, borderRadius: "8px" }, { transform: "none", borderRadius: "12px" }], { duration: 480, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // teclado (antes que el de la página, que usa ← → para cambiar de sección) y scroll bloqueado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else return;
      e.preventDefault(); e.stopImmediatePropagation();
    };
    addEventListener("keydown", onKey, true);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { removeEventListener("keydown", onKey, true); document.documentElement.style.overflow = prev; };
  }, [go, onClose]);

  return (
    <div className="tm-view" role="dialog" aria-modal="true" onClick={onClose}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { if (touch.current === null) return; const d = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(d) > 40) go(d < 0 ? 1 : -1); }}>
      <div className="tm-photo" ref={imgRef} style={{ width: fw, height: fh, backgroundImage: `url(${s.photo.thumb})` }} onClick={(e) => { e.stopPropagation(); if (n > 1) go(1); }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={s.photo.src} src={s.photo.src} alt={`${s.place.name[lang]}, ${s.place.country[lang]}`} onLoad={(e) => e.currentTarget.classList.add("in")} />
      </div>
      {n > 1 && (
        <>
          <button className="tm-nav prev" aria-label={t.prev} onClick={(e) => { e.stopPropagation(); go(-1); }}>←</button>
          <button className="tm-nav next" aria-label={t.next} onClick={(e) => { e.stopPropagation(); go(1); }}>→</button>
          <div className="tm-dots" aria-hidden="true">{shots.map((x, k) => <i key={x.place.id} className={k === i ? "on" : ""} />)}</div>
        </>
      )}
      <button className="tm-close" aria-label={t.close} onClick={onClose}>×</button>
    </div>
  );
}
