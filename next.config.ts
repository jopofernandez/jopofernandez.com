import type { NextConfig } from "next";

// Sitio 100% estático: `next build` genera /out, que se puede subir a cualquier hosting.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  turbopack: { root: process.cwd() },
};

export default nextConfig;
