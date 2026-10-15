// Sonido real de piezas de ajedrez: grabaciones CC0 (Freesound) recortadas en golpes individuales.
//   apoyar: 9 tomas distintas de piezas de madera sobre tablero (se elige una diferente cada vez)
//   levantar: roce real de una dama al moverla, muy bajo
// Fuentes: simone_ds "chess pieces.wav" (#366065) y Alnotreally "Chess piece setting 1" (#801349), ambas CC0.
// El AudioContext se crea recién con un gesto del usuario (política de autoplay de los navegadores).

export type SoundKind = "lift" | "place";

const BASE = "/assets/sound";
const PLACE_FILES = Array.from({ length: 9 }, (_, i) => `place-${i + 1}.wav`);

export class ChessSound {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private place: AudioBuffer[] = [];
  private lift: AudioBuffer | null = null;
  private last = -1;
  private raw: Promise<ArrayBuffer[]>;
  muted = false;

  constructor() {
    // se descargan de entrada (~350 KB) y se decodifican al habilitar el audio
    this.raw = Promise.all([...PLACE_FILES, "lift.wav"].map((f) => fetch(`${BASE}/${f}`).then((r) => r.arrayBuffer())));
  }

  /** Llamar desde un gesto del usuario (click / tecla). */
  unlock() {
    if (this.ctx) { if (this.ctx.state === "suspended") void this.ctx.resume(); return; }
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const out = ctx.createGain();
    out.gain.value = 0.9;
    out.connect(ctx.destination);
    this.ctx = ctx; this.out = out;
    void this.raw.then(async (bufs) => {
      const decoded = await Promise.all(bufs.map((b) => ctx.decodeAudioData(b.slice(0))));
      this.lift = decoded.pop() ?? null;
      this.place = decoded;
    }).catch(() => {});
  }

  /** @param pan -1 (izquierda) a 1 (derecha) según la casilla; @param weight piezas pesadas (>1) suenan un poco más graves */
  play(kind: SoundKind, { pan = 0, weight = 1 } = {}) {
    const ctx = this.ctx, out = this.out;
    if (this.muted || !ctx || !out || ctx.state !== "running") return;
    let buf: AudioBuffer | null, gain: number;
    if (kind === "lift") { buf = this.lift; gain = 0.5; }
    else {
      if (!this.place.length) return;
      let i = Math.floor(Math.random() * this.place.length);
      if (i === this.last) i = (i + 1) % this.place.length; // nunca la misma toma dos veces seguidas
      this.last = i; buf = this.place[i]; gain = 0.85 + Math.random() * 0.3;
    }
    if (!buf) return;
    const src = ctx.createBufferSource(), g = ctx.createGain(), p = ctx.createStereoPanner();
    src.buffer = buf;
    src.playbackRate.value = (1 / Math.sqrt(weight)) * (0.97 + Math.random() * 0.06);
    g.gain.value = gain;
    p.pan.value = Math.max(-0.5, Math.min(0.5, pan * 0.5));
    src.connect(g).connect(p).connect(out);
    src.start();
  }
}
