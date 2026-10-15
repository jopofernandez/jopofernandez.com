// Sirve el build estático (out/) tal como quedaría publicado. Uso: node scripts/serve-out.mjs
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "out");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".txt": "text/plain", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".ico": "image/x-icon", ".wav": "audio/wav", ".mp3": "audio/mpeg" };
const PORT = Number(process.env.PORT ?? 5182);

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path.endsWith("/")) path += "index.html";
  const rel = normalize(path).replace(/^[\\/]+/, "");
  if (rel.includes("..")) { res.writeHead(404); return res.end(); }
  for (const candidate of [rel, `${rel}.html`]) {
    try {
      const body = await readFile(join(OUT, candidate));
      res.writeHead(200, { "Content-Type": TYPES[extname(candidate)] ?? "application/octet-stream" });
      return res.end(body);
    } catch {}
  }
  res.writeHead(404); res.end("not found");
}).listen(PORT, () => console.log(`http://localhost:${PORT}/`));
