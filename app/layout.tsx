import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Ezequiel Fernández — Liderazgo de producto",
  description: "Líder de producto en Buenos Aires. Estrategia de producto, productos digitales y desarrollo de negocio en Latinoamérica.",
};
export const viewport: Viewport = { themeColor: "#0f1c17" };

// Oscuro por defecto. Si el visitante eligió claro, se aplica antes de pintar (sin destello).
const THEME_SCRIPT = `try{if(localStorage.getItem("pc-theme")==="light")document.documentElement.classList.add("light")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
