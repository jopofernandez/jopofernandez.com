import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Ezequiel Fernández — Liderazgo de producto",
  description: "Líder de producto en Buenos Aires. Estrategia de producto, productos digitales y desarrollo de negocio en Latinoamérica.",
};
export const viewport: Viewport = { themeColor: "#eee9dc" };

// Claro por defecto. Si el visitante eligió oscuro, se aplica antes de pintar (sin destello).
const THEME_SCRIPT = `try{if(localStorage.getItem("pc-theme-v2")==="dark"){document.documentElement.classList.remove("light");document.querySelector('meta[name="theme-color"]')?.setAttribute("content","#0f1c17")}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`light ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
