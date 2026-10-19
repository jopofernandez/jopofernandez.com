// Música de fondo: "Midnight Amber Room" (Open Lo-Fi, CC0 / dominio público, github.com/btahir/open-lofi).
// Arranca apagada y se carga recién al primer play. Loop sin cortes: se recortan la intro y el final más bajos
// y cada vuelta se superpone con la siguiente con un fundido cruzado de igual potencia.

export const MUSIC_SRC = "/assets/music/lofi.mp3";
const DUCK = 0.25;   // la música queda al 25% mientras habla la voz
const VOLUME = 0.2;  // bien por debajo del sonido de las piezas (~9 dB menos que en la página de prueba)
const XF = 3;        // segundos de fundido cruzado entre vueltas

const curve = (n: number, f: (x: number) => number) => Float32Array.from({ length: n }, (_, i) => f(i / (n - 1)));
const FADE_IN = curve(64, (x) => Math.sin((x * Math.PI) / 2));
const FADE_OUT = curve(64, (x) => Math.cos((x * Math.PI) / 2));

/**
 * Tramo del tema que se repite: deja afuera la intro y el final cuando están bastante más bajos que el cuerpo
 * (entradas o fundidos), para que el reinicio del loop no tenga un bache de volumen.
 */
function loopRegion(buf: AudioBuffer) {
  const d = buf.getChannelData(0), sr = buf.sampleRate, win = Math.round(sr * 0.05);
  const env: number[] = [];
  for (let i = 0; i + win <= d.length; i += win) { let s = 0; for (let j = 0; j < win; j++) s += d[i + j] ** 2; env.push(Math.sqrt(s / win)); }
  const sorted = [...env].sort((a, b) => a - b), median = sorted[Math.floor(sorted.length / 2)];
  // energía suavizada (1 s) para no cortar en un silencio entre golpes
  const smooth = env.map((_, i) => { const a = env.slice(Math.max(0, i - 10), i + 10); return a.reduce((x, y) => x + y, 0) / a.length; });
  const thr = median * 0.6;
  const first = smooth.findIndex((v) => v > thr);
  let last = smooth.length - 1; while (last > 0 && smooth[last] <= thr) last--;
  const start = Math.max(0, (first - 4) * 0.05), end = Math.min(buf.duration, (last + 6) * 0.05);
  // si el recorte dejara muy poco tema, usar el tema entero
  return end - start > 60 ? { start, end } : { start: 0, end: buf.duration };
}

export class Music {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  // segundo control de volumen: baja la música mientras suena la voz de "Sobre mí"
  private duckNode: GainNode | null = null;
  private ducked = false;
  private buf: AudioBuffer | null = null;
  private region = { start: 0, end: 0 };
  private loading: Promise<void> | null = null;
  private nextAt = 0;
  private tick = 0;
  playing = false;

  private async load() {
    if (this.buf) return;
    this.loading ??= fetch(MUSIC_SRC).then((r) => r.arrayBuffer()).then((b) => this.ctx!.decodeAudioData(b)).then((b) => { this.buf = b; this.region = loopRegion(b); });
    await this.loading;
  }

  /** Llamar desde un gesto del usuario. */
  async play() {
    if (this.playing) return;
    this.playing = true;
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.duckNode = this.ctx.createGain();
      this.duckNode.gain.value = this.ducked ? DUCK : 1;
      this.master.connect(this.duckNode).connect(this.ctx.destination);
    }
    const ctx = this.ctx, master = this.master!;
    await ctx.resume();
    try { await this.load(); } catch { this.playing = false; return; }
    if (!this.playing) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(VOLUME, now + 2.5);
    if (!this.tick) {
      this.startLoop(now + 0.05, false);
      // agenda la vuelta siguiente un poco antes de que haga falta
      this.tick = window.setInterval(() => {
        if (this.playing && this.ctx && this.ctx.currentTime > this.nextAt - 1.5) this.startLoop(Math.max(this.nextAt, this.ctx.currentTime + 0.05), true);
      }, 400);
    }
  }

  private startLoop(when: number, fadeIn: boolean) {
    const ctx = this.ctx!, buf = this.buf!;
    const src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = buf;
    if (fadeIn) g.gain.setValueCurveAtTime(FADE_IN, when, XF); else g.gain.setValueAtTime(1, when);
    const { start, end: stopAt } = this.region;
    const end = when + (stopAt - start);
    g.gain.setValueCurveAtTime(FADE_OUT, end - XF, XF);
    src.connect(g).connect(this.master!);
    src.start(when, start);
    src.stop(end + 0.05);
    this.nextAt = end - XF;
  }

  pause() {
    if (!this.playing || !this.ctx || !this.master) { this.playing = false; return; }
    this.playing = false;
    const ctx = this.ctx, g = this.master.gain, now = ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0, now + 0.8);
    window.setTimeout(() => { if (!this.playing) void ctx.suspend(); }, 900);
  }

  /** baja (o devuelve) el volumen de la música mientras habla la voz */
  duck(on: boolean) {
    this.ducked = on;
    if (!this.ctx || !this.duckNode) return;
    const g = this.duckNode.gain, now = this.ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(on ? DUCK : 1, now + (on ? 0.4 : 1.5));
  }

  /** pestaña oculta: suspende sin perder la posición; al volver, sigue si estaba sonando */
  setHidden(hidden: boolean) {
    if (!this.ctx) return;
    if (hidden) void this.ctx.suspend();
    else if (this.playing) void this.ctx.resume();
  }

  destroy() { clearInterval(this.tick); void this.ctx?.close(); }
}
