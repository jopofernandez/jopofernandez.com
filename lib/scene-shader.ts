// Fondo vivo: dibuja la ilustración de la escena con un shader WebGL que la mantiene siempre en movimiento.
// Capas: hervor de línea (8 fps, como animación a mano) + flujo lento, rayado que se desplaza dentro de la tinta,
// vapor del café en curvas de tinta, luz de lámpara que recorre la mesa, grano, trama Bayer (dither) y duotono.
// La cámara (traslación y escala en px CSS) es la misma que usan las piezas del DOM, así todo queda alineado.

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;      // tamaño del canvas en px reales
uniform float uDpr;
uniform vec3 uCam;      // tx, ty, escala (px CSS)
uniform vec2 uImg;      // tamaño de la escena en coordenadas de imagen
uniform float uTime;
uniform vec2 uCup;      // superficie del café (coordenadas de imagen)
uniform float uReady;   // 0 hasta que carga la textura
uniform vec3 uInk;
uniform vec3 uPaper;

float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }

void main() {
  vec2 css = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 img = (css - uCam.xy) / uCam.z;
  float t = uTime;

  // hervor de línea (cuadros escalonados) + flujo lento: el dibujo "respira"
  float st = floor(t * 8.0);
  vec2 boil = vec2(noise(img * 0.035 + st * 1.7), noise(img * 0.035 - st * 2.3 + 11.0)) - 0.5;
  vec2 flow = vec2(noise(img * 0.004 + vec2(t * 0.06, 0.0)), noise(img * 0.004 + vec2(0.0, t * 0.06) + 5.0)) - 0.5;
  vec2 p = img + boil * 1.1 + flow * 3.0;

  float lum = 0.87;
  if (uReady > 0.5) lum = texture2D(uTex, clamp(p / uImg, 0.0, 1.0)).r;
  // bordes de la imagen fundidos con el papel (sirve para cualquier proporción de pantalla)
  float edge = smoothstep(0.0, 160.0, min(min(p.x, uImg.x - p.x), min(p.y, uImg.y - p.y)));
  lum = mix(0.87, lum, edge);

  // rayado vivo: líneas finas que se desplazan dentro de las zonas entintadas
  float ink = 1.0 - smoothstep(0.25, 0.72, lum);
  float hatch = sin((p.x + p.y) * 0.55 - t * 2.0) * 0.5 + 0.5;
  lum -= ink * hatch * 0.05;

  // vapor: curvas de tinta que suben desde el café
  vec2 sp = p - uCup;
  if (sp.y < 10.0 && sp.y > -360.0 && abs(sp.x) < 220.0) {
    float h = -sp.y;
    float w = 46.0 + h * 0.22;
    float drift = (fbm(vec2(h * 0.006, t * 0.15)) - 0.5) * 120.0 * (h / 360.0);
    float colm = exp(-pow((sp.x - drift) / w, 2.0)) * smoothstep(0.0, 50.0, h) * (1.0 - smoothstep(170.0, 350.0, h));
    float n = fbm(vec2((sp.x - drift) * 0.011, sp.y * 0.007 + t * 0.35)) + (sp.x - drift) * 0.0016;
    float band = abs(fract(n * 5.0) - 0.5);
    float lines = 1.0 - smoothstep(0.035, 0.085, band);
    lum -= colm * lines * 0.42;
  }

  // luz de lámpara que recorre la mesa muy despacio
  vec2 lp = uImg * vec2(0.5, 0.48) + vec2(sin(t * 0.07) * 420.0, cos(t * 0.053) * 170.0);
  float light = exp(-dot(p - lp, p - lp) / (1000.0 * 1000.0));
  lum *= 0.93 + 0.09 * light;

  // grano animado
  lum += (hash(floor(css) + fract(t * 7.0) * 91.0) - 0.5) * 0.03;

  float k = pow(clamp((lum - 0.07) / (0.85 - 0.07), 0.0, 1.0), 1.1);
  // trama Bayer 4x4 en celdas de 2 px CSS, 3 niveles: de lejos es el dibujo, de cerca son puntos.
  // El papel liso queda limpio: solo se traman las zonas dibujadas.
  float b = bayer4(floor(css / 2.0));
  k = k > 0.9 ? 1.0 : floor(k * 2.0 + b) / 2.0;
  gl_FragColor = vec4(mix(uInk, uPaper, k), 1.0);
}`;

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

export class SceneShader {
  private gl: WebGLRenderingContext;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private cam = { tx: 0, ty: 0, s: 1 };
  private ready = 0;
  private raf = 0;
  private t0 = performance.now();
  private frozenAt: number | null = null;
  private dpr = 1;

  constructor(private canvas: HTMLCanvasElement, src: string, opts: { img: [number, number]; cup: [number, number]; ink: string; paper: string }) {
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, powerPreference: "high-performance" });
    if (!gl) throw new Error("WebGL no disponible");
    this.gl = gl;
    const sh = (type: number, code: string) => {
      const s = gl.createShader(type)!; gl.shaderSource(s, code); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(prog, "a"); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    for (const n of ["uTex", "uRes", "uDpr", "uCam", "uImg", "uTime", "uCup", "uReady", "uInk", "uPaper"]) this.u[n] = gl.getUniformLocation(prog, n);
    gl.uniform2f(this.u.uImg, opts.img[0], opts.img[1]);
    gl.uniform2f(this.u.uCup, opts.cup[0], opts.cup[1]);
    gl.uniform1i(this.u.uTex, 0);
    this.setColors(opts.ink, opts.paper);

    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, image);
      this.ready = 1;
      this.draw();
    };
    image.src = src;
    this.resize();
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    // tamaño real del canvas en pantalla (en iOS 100vh no coincide con la altura visible mientras se ve la barra)
    const w = Math.round((this.canvas.clientWidth || innerWidth) * this.dpr), h = Math.round((this.canvas.clientHeight || innerHeight) * this.dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
    this.gl.viewport(0, 0, w, h);
    this.draw();
  }

  /** colores del duotono (tema claro u oscuro) */
  setColors(ink: string, paper: string) {
    this.gl.uniform3fv(this.u.uInk, hex(ink)); this.gl.uniform3fv(this.u.uPaper, hex(paper));
    this.draw();
  }

  setCamera(tx: number, ty: number, s: number) { this.cam = { tx, ty, s }; if (this.frozenAt !== null) this.draw(); }

  /** movimiento reducido: congela el tiempo (la escena queda quieta pero sigue la cámara) */
  setMotion(on: boolean) {
    if (on && this.frozenAt !== null) { this.t0 = performance.now() - this.frozenAt * 1000; this.frozenAt = null; this.start(); }
    if (!on && this.frozenAt === null) { this.frozenAt = (performance.now() - this.t0) / 1000; this.stop(); this.draw(); }
  }

  start() {
    if (this.raf || this.frozenAt !== null) return;
    const loop = () => { this.draw(); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }
  stop() { cancelAnimationFrame(this.raf); this.raf = 0; }

  private draw() {
    const gl = this.gl, u = this.u;
    gl.uniform2f(u.uRes, this.canvas.width, this.canvas.height);
    gl.uniform1f(u.uDpr, this.dpr);
    gl.uniform3f(u.uCam, this.cam.tx, this.cam.ty, this.cam.s);
    gl.uniform1f(u.uTime, this.frozenAt ?? (performance.now() - this.t0) / 1000);
    gl.uniform1f(u.uReady, this.ready);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  destroy() { this.stop(); this.gl.getExtension("WEBGL_lose_context")?.loseContext(); }
}
