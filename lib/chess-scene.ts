// Motor imperativo de la escena de fondo: tablero en perspectiva, piezas, sombras, manos y cámara.
// React solo le avisa la sección actual; la posición de la partida es función de esa sección.
import board from "./data/board.json";
import pieces from "./data/pieces.json";
import handsMeta from "./data/hands.json";
import { PLIES, START_FEN } from "./content";

type Sprite = { w: number; h: number; anchor: number[] };
export type Palette = "green" | "dark";
type Piece = {
  ch: string; name: string; el: HTMLDivElement; img: HTMLImageElement;
  svg: SVGSVGElement; e1: SVGEllipseElement; e2: SVGEllipseElement;
  moving: boolean; g: Geom;
};
type Geom = { k: number; w: number; h: number; x: number; y: number; left: number; top: number };

const PIECES = pieces as Record<string, Sprite>;
const HANDS = handsMeta as Record<string, Sprite>;
const Hm = board.homography as number[];
const P = (u: number, v: number): [number, number] => {
  const w = Hm[6] * u + Hm[7] * v + 1;
  return [(Hm[0] * u + Hm[1] * v + Hm[2]) / w, (Hm[3] * u + Hm[4] * v + Hm[5]) / w];
};
const sq = (s: string): [number, number] => ["abcdefgh".indexOf(s[0]) + 0.5, +s[1] - 0.5];
const localW = (u: number, v: number) => {
  const d = 0.5 / Math.SQRT2, a = P(u - d, v - d), b = P(u + d, v + d);
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
};
const KING_W = PIECES.wK.w, BASE = 0.8;
const kAt = (u: number, v: number) => (BASE * localW(u, v)) / KING_W;
const K_REF = kAt(4, 4);
const HAND_SCALE = 0.62;
const PINCH: Record<Side, [number, number]> = { black: [121, 765], white: [1195, 290] };
const OFF: Record<Side, [number, number]> = { black: [700, -660], white: [-320, 800] };
const LIFT = 40; // altura de levante (px de escena); el caballo salta un poco más
// dónde aprieta cada bando la palanca del reloj (px de escena, medido sobre la ilustración): blancas a la izquierda
const CLOCK_PRESS: Record<Side, [number, number]> = { white: [430, 297], black: [592, 259] };
const ZOOM = [1, 1.02, 1.04, 1.01, 1.04, 1.03, 1.02, 1.05, 1.02];
const NS = "http://www.w3.org/2000/svg";
// peso sonoro por pieza: las más pesadas suenan más graves
const WEIGHT: Record<string, number> = { k: 1.18, q: 1.15, r: 1.1, b: 1, n: 1, p: 0.86 };
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
// smootherstep: arranca y frena sin tirones (velocidad y aceleración nulas en los extremos)
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const smootherAcc = (t: number) => (60 * t * (1 - t) * (1 - 2 * t)) / 5.774; // aceleración normalizada a ±1
const frame = () => new Promise<number>(requestAnimationFrame);
const setAttrs = (el: Element, attrs: Record<string, string | number>) => { for (const [a, v] of Object.entries(attrs)) el.setAttribute(a, String(v)); };

export type SceneEls = { stage: HTMLDivElement; layer: HTMLDivElement; hands: Record<Side, HTMLImageElement> };
export type Side = "white" | "black";

export class ChessScene {
  private position: Record<string, Piece> = {};
  private ply = -1;
  private target = -1;
  private running = false;
  private destroyed = false;
  palette: Palette = "green";
  reduce = false;
  onPly?: (ply: number) => void;
  /** la cámara cambió (px CSS): el fondo del shader se dibuja con la misma transformación */
  onCamera?: (tx: number, ty: number, s: number) => void;
  /** de quién es el turno después de cada jugada (para el reloj de ajedrez) */
  onTurn?: (side: Side) => void;
  private cam = { tx: 0, ty: 0, s: 1 };
  private camRaf = 0;
  /** sonido: se llama al levantar y al apoyar cada pieza (pan -1..1 según su x en el tablero; weight según la pieza) */
  onSound?: (kind: "lift" | "place" | "clock", info: { pan: number; weight: number }) => void;

  constructor(private els: SceneEls, initial: Palette = "green", private base = "/assets") {
    this.setPalette(initial);
    this.setup(START_FEN);
  }

  destroy() { this.destroyed = true; this.els.layer.replaceChildren(); }

  /** se resuelve cuando piezas y manos están decodificadas (con tope, porque decode() a veces no vuelve nunca) */
  loaded(timeout = 4000) {
    const imgs = [...Object.values(this.position).map((p) => p.img), this.els.hands.white, this.els.hands.black];
    const all = Promise.all(imgs.map((img) => img.decode().catch(() => {}))).then(() => {});
    return Promise.race([all, new Promise<void>((r) => setTimeout(r, timeout))]);
  }

  private src(path: string) { return `${this.base}/${this.palette}/${path}.webp`; }

  setPalette(p: Palette) {
    this.palette = p;
    for (const piece of Object.values(this.position)) { piece.img.src = this.src(`pieces/${this.file(piece)}`); this.rerender(piece); }
    for (const side of ["white", "black"] as Side[]) this.els.hands[side].src = this.src(`hands/hand-${side}`);
  }

  private makePiece(ch: string): Piece {
    const el = document.createElement("div"); el.className = "pc";
    const svg = document.createElementNS(NS, "svg");
    const e1 = document.createElementNS(NS, "ellipse"), e2 = document.createElementNS(NS, "ellipse");
    e1.setAttribute("fill", "url(#hatch)"); e2.setAttribute("fill", "url(#hatch)");
    svg.append(e1, e2);
    const img = new Image(); img.alt = ""; img.decoding = "async"; img.draggable = false;
    el.append(svg, img); this.els.layer.append(el);
    const name = (ch === ch.toUpperCase() ? "w" : "b") + ch.toUpperCase();
    img.src = this.src(`pieces/${this.file({ name })}`);
    return { ch, name, el, img, svg, e1, e2, moving: false, g: { k: 0, w: 0, h: 0, x: 0, y: 0, left: 0, top: 0 } };
  }

  /**
   * Sprite que se muestra para una pieza. En el tema oscuro el dibujo está en negativo: el sprite "negro"
   * invertido se ve claro, así que se intercambian para que las blancas se vean claras y las negras oscuras.
   */
  private file(p: { name: string }) { return this.palette === "dark" ? (p.name[0] === "w" ? "b" : "w") + p.name[1] : p.name; }

  /** vuelve a dibujar una pieza quieta en su casilla (al cambiar de sprite cambian levemente tamaño y ancla) */
  private rerender(p: Piece) {
    const s = Object.keys(this.position).find((k) => this.position[k] === p);
    if (s && !p.moving) this.render(p, ...sq(s));
  }

  private render(p: Piece, u: number, v: number, lift = 0, tilt = 0) {
    const m = PIECES[this.file(p)], k = kAt(u, v), [x, y] = P(u, v), w = m.w * k, h = m.h * k;
    p.el.style.transform = `translate(${x}px, ${y}px)`;
    p.el.style.zIndex = String(p.moving ? 5000 : Math.round(y));
    Object.assign(p.img.style, {
      width: `${w}px`, height: `${h}px`, left: `${-m.anchor[0] * k}px`, top: `${-m.anchor[1] * k - lift}px`,
      // la pieza colgada de los dedos pivota desde la cabeza
      transformOrigin: "50% 12%", transform: tilt ? `rotate(${tilt.toFixed(2)}deg)` : "",
    });
    // sombra rayada hacia abajo-derecha (luz desde arriba-izquierda); se achica al levantar la pieza
    const f = Math.min(1, lift / LIFT), len = h * 0.55 * (1 - 0.4 * f), cx = len * 0.55, cy = len * 0.22;
    p.svg.style.opacity = String(0.75 - 0.42 * f);
    setAttrs(p.e1, { cx: 3, cy: 2, rx: w * 0.5, ry: w * 0.17 });
    setAttrs(p.e2, { cx, cy, rx: len * 0.6, ry: w * 0.16, transform: `rotate(18 ${cx} ${cy})` });
    p.g = { k, w, h, x, y, left: x - m.anchor[0] * k, top: y - m.anchor[1] * k - lift };
  }

  /**
   * Ubica la mano con la pinza sobre la cabeza de la pieza.
   * `h` = presencia (0 fuera de cuadro, 1 en la pieza, ya con su curva de easing aplicada);
   * la mano llega en curva (no en línea recta), con un leve giro y un `dy` para el gesto de apretar/soltar.
   */
  private placeHand(side: Side, g: Geom, h: number, rot = 0, dy = 0) {
    this.placeHandAt(side, g.left + g.w / 2, g.top + g.h * 0.12 + dy, g.k, h, rot);
  }

  /** igual que placeHand, pero con los dedos en un punto cualquiera de la escena (para tocar el reloj) */
  private placeHandAt(side: Side, gx: number, gy: number, k: number, h: number, rot = 0) {
    const el = this.els.hands[side], hm = HANDS[`hand-${side}`], s = HAND_SCALE * (k / K_REF);
    const [ox, oy] = OFF[side], len = Math.hypot(ox, oy);
    const away = 1 - h, bulge = Math.sin(Math.PI * away) * 70; // desvío perpendicular de la trayectoria
    const px = (-oy / len) * bulge, py = (ox / len) * bulge;
    const [cx, cy] = PINCH[side];
    el.style.width = `${hm.w * s}px`;
    el.style.transformOrigin = `${cx * s}px ${cy * s}px`;
    el.style.transform = `translate(${gx - cx * s + ox * away + px}px, ${gy - cy * s + oy * away + py}px) rotate(${(rot + away * (side === "black" ? -9 : 9)).toFixed(2)}deg)`;
    el.style.opacity = String(Math.min(1, h * 4));
  }

  private setup(fen: string) {
    this.els.layer.replaceChildren();
    this.position = {};
    fen.split("/").forEach((row, r) => {
      let f = 0;
      for (const ch of row) {
        if (/\d/.test(ch)) { f += +ch; continue; }
        const s = "abcdefgh"[f] + (8 - r), p = this.makePiece(ch);
        this.position[s] = p; this.render(p, ...sq(s)); f++;
      }
    });
  }

  private applyInstant(from: string, to: string) {
    const p = this.position[from]; if (!p) return;
    delete this.position[from]; this.position[to] = p; this.render(p, ...sq(to));
  }

  /** @param press al terminar, la misma mano toca el reloj (y recién ahí cambia el turno). Devuelve si lo tocó. */
  private async animateMove(from: string, to: string, speed = 1, press = false): Promise<boolean> {
    const p = this.position[from];
    if (!p) return false;
    const soundInfo = (u: number, v: number) => ({ pan: P(u, v)[0] / 768 - 1, weight: WEIGHT[p.ch.toLowerCase()] ?? 1 });
    if (this.reduce) { this.applyInstant(from, to); this.onSound?.("place", soundInfo(...sq(to))); return false; }
    const side: Side = p.ch === p.ch.toUpperCase() ? "white" : "black";
    const [fu, fv] = sq(from), [tu, tv] = sq(to);
    const dist = Math.hypot(tu - fu, tv - fv); // en casillas
    const knight = p.ch.toLowerCase() === "n";
    // Línea de tiempo continua: las fases se superponen como en un gesto real (ms, escaladas por speed)
    const ms = (n: number) => n / speed;
    const A = ms(640);                                    // la mano llega a la pieza (perfil de jerk mínimo)
    const lift0 = A + ms(70), L = ms(210);                // toma y levanta
    const travel = ms(Math.min(980, Math.max(440, 300 + 150 * dist)));
    const tr0 = lift0 + L * 0.45, tr1 = tr0 + travel;     // empieza a viajar mientras sube
    const D = ms(260), low0 = tr1 - D * 0.55;             // baja mientras termina de llegar
    const rel = low0 + D + ms(90);                        // apoya, suelta
    // con reloj: después de soltar, la mano viaja en arco a la palanca, aprieta (clac + cambio de turno) y se va
    const C0 = rel + ms(40), CT = ms(620), C1 = C0 + CT;  // viaje al reloj
    const PRESS = ms(200), click = C1 + ms(70);                // apretar
    const X = ms(560), out0 = press ? C1 + PRESS : rel, end = out0 + X; // la mano se retira
    const liftH = LIFT + (knight ? 18 : 0) + Math.min(22, 5 * dist);
    const arc = 6 + 4 * dist + (knight ? 14 : 0);
    const dxScreen = P(tu, tv)[0] - P(fu, fv)[0];
    const swing = 7 * Math.max(-1, Math.min(1, dxScreen / 160)); // grados máximos de balanceo
    const pulse = (t: number, a: number, b: number) => { const q = clamp01((t - a) / (b - a)); return Math.sin(Math.PI * q) ** 2; };
    let lifted = false, placed = false, clicked = false;
    const side0 = side;
    const [kx, ky] = CLOCK_PRESS[side0], kClock = kAt(...sq("a8"));
    p.el.classList.add("moving");
    p.moving = true;
    const t0 = performance.now();
    for (;;) {
      if (this.destroyed) return false;
      const t = performance.now() - t0;
      if (!lifted && t >= lift0) { lifted = true; this.onSound?.("lift", soundInfo(fu, fv)); }
      if (!placed && t >= low0 + D) { placed = true; this.onSound?.("place", soundInfo(tu, tv)); }
      const s = clamp01((t - tr0) / travel), e = smoother(s);
      const u = fu + (tu - fu) * e, v = fv + (tv - fv) * e;
      // todas las curvas arrancan y terminan con velocidad cero: sin tirones entre fases
      const up = smoother(clamp01((t - lift0) / L)), down = 1 - easeInOutQuad(clamp01((t - low0) / D));
      const lift = liftH * up * down + arc * 4 * e * (1 - e);
      // péndulo: la pieza se atrasa al acelerar y se adelanta al frenar; amortiguado al apoyar
      const tilt = -smootherAcc(s) * swing * down;
      // presencia de la mano: alcance humano = jerk mínimo (acelera y frena suave, sin arranques bruscos)
      const h = t < out0 ? smoother(clamp01(t / A)) : 1 - smoother(clamp01((t - out0) / X));
      // pequeño gesto de apretar al tomar y al apoyar
      const dy = 3 * pulse(t, A - ms(40), lift0 + ms(60)) + 3 * pulse(t, low0 + D * 0.6, rel);
      this.render(p, u, v, lift, tilt);
      if (press && t >= C0) {
        // de la cabeza de la pieza a la palanca, con una curva hacia arriba; al llegar baja un poco para apretar
        const q = smoother(clamp01((t - C0) / CT));
        const fx = p.g.left + p.g.w / 2, fy = p.g.top + p.g.h * 0.12;
        const k = p.g.k + (kClock - p.g.k) * q;
        const ax = fx + (kx - fx) * q, ay = fy + (ky - fy) * q - Math.sin(Math.PI * q) * 70 + 7 * pulse(t, C1 - ms(30), C1 + PRESS);
        if (!clicked && t >= click) { clicked = true; this.onSound?.("clock", { pan: -0.4, weight: 1 }); this.onTurn?.(side0 === "white" ? "black" : "white"); }
        this.placeHandAt(side, ax, ay, k, h, 0);
      } else this.placeHand(side, p.g, h, tilt * 0.35, dy);
      if (t >= end) break;
      await frame();
    }
    this.els.hands[side].style.opacity = "0";
    p.moving = false;
    p.el.classList.remove("moving");
    delete this.position[from]; this.position[to] = p;
    this.render(p, tu, tv);
    return clicked;
  }

  private async step(instant: boolean, speed = 1) {
    const fwd = this.target > this.ply;
    const ply = fwd ? PLIES[this.ply + 1] : PLIES[this.ply];
    // hacia atrás se deshace en orden inverso (en el enroque: primero la torre, después el rey)
    const moves = fwd ? ply.moves : [...ply.moves].reverse().map(([a, b]) => [b, a] as [string, string]);
    // hacia adelante y animada, la última pieza que se mueve (en el enroque, la torre) termina tocando el reloj
    let pressed = false;
    for (const [i, [a, b]] of moves.entries()) {
      if (instant) this.applyInstant(a, b);
      else pressed = await this.animateMove(a, b, i > 0 ? speed * 1.5 : speed, fwd && i === moves.length - 1);
    }
    this.ply += fwd ? 1 : -1;
    this.onPly?.(this.ply);
    if (!pressed) this.onTurn?.(this.ply % 2 === 0 ? "black" : "white");
  }

  /** Lleva la partida a la posición de la sección `i`. Saltos largos: todo al instante menos la última jugada. */
  async goTo(i: number, { instant = false } = {}) {
    this.target = i;
    if (instant) { while (this.ply !== this.target) await this.step(true); return; }
    if (this.running) return;
    this.running = true;
    while (this.ply !== this.target && !this.destroyed) {
      const dist = Math.abs(this.target - this.ply);
      if (dist > 2) { while (Math.abs(this.target - this.ply) > 1) await this.step(true); continue; }
      await this.step(false, dist > 1 ? 1.7 : 1);
    }
    this.running = false;
  }

  /**
   * Encuadre: la escena ocupa toda la pantalla con el tablero al centro.
   * i = -1 es la portada (escena completa); en cada sección la cámara se acerca un poco hacia la jugada.
   */
  camera(i: number, instant = false) {
    // misma caja fija que el canvas del shader, para que piezas y dibujo midan igual
    const box = this.els.stage.parentElement;
    const vw = box?.clientWidth || innerWidth, vh = box?.clientHeight || innerHeight;
    const [W, H] = board.size;
    const cover = Math.max(vw / W, vh / H);
    // que el tablero (con las piezas de atrás) siempre entre entero; fuera de la imagen el shader funde con el papel
    const base = Math.min(cover, vh / 1180, vw / 1600);
    // portada: un poco más lejos, para dejar aire abajo para el nombre
    const zoom = i < 0 ? 0.86 : (vw < 821 ? 1.04 : 1.1) * ZOOM[i % ZOOM.length];
    const s = base * zoom;
    const c = P(4, 4);
    let fx = c[0], fy = c[1] - 40;
    if (i >= 0) {
      // la sección i juega la jugada i + 1 (la 1.c4 se juega sola en la portada)
      const [from, to] = PLIES[i + 1].moves[0];
      const [mu, mv] = sq(from), [nu, nv] = sq(to);
      const mid = P((mu + nu) / 2, (mv + nv) / 2);
      fx += (mid[0] - fx) * 0.3; fy += (mid[1] - fy) * 0.3;
    }
    const target = { tx: vw / 2 - fx * s, ty: vh * (i < 0 ? 0.43 : 0.5) - fy * s, s };
    cancelAnimationFrame(this.camRaf);
    if (instant || this.reduce) { this.applyCam(target); return; }
    const from = { ...this.cam }, t0 = performance.now(), D = 1400;
    const tick = () => {
      const q = Math.min(1, (performance.now() - t0) / D), e = q < 0.5 ? 4 * q * q * q : 1 - (-2 * q + 2) ** 3 / 2;
      this.applyCam({ tx: from.tx + (target.tx - from.tx) * e, ty: from.ty + (target.ty - from.ty) * e, s: from.s + (target.s - from.s) * e });
      if (q < 1 && !this.destroyed) this.camRaf = requestAnimationFrame(tick);
    };
    this.camRaf = requestAnimationFrame(tick);
  }

  private applyCam(c: { tx: number; ty: number; s: number }) {
    this.cam = c;
    this.els.stage.style.transform = `translate(${c.tx}px, ${c.ty}px) scale(${c.s})`;
    this.onCamera?.(c.tx, c.ty, c.s);
  }

  get currentPly() { return this.ply; }
}
