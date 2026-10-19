import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-mono" });

const TITLE = "Jopo Fernández";
const DESCRIPTION = "Producto, tecnología y ajedrez. Mi recorrido como una partida que se juega mientras bajás: experiencia, proyectos, torneos y cómo contactarme.";

// Lo que se ve en la pestaña y al compartir el link (WhatsApp, LinkedIn, X, Slack…)
export const metadata: Metadata = {
  metadataBase: new URL("https://jopofernandez.com"),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: TITLE,
  authors: [{ name: "Ezequiel \"Jopo\" Fernández", url: "https://jopofernandez.com" }],
  alternates: { canonical: "/" },
  // logo JF: negro en pestañas claras, blanco en pestañas oscuras (sigue el tema del navegador)
  icons: {
    icon: [
      { url: "/icon-light.png", type: "image/png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark.png", type: "image/png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: TITLE,
    title: `${TITLE} - Producto, tecnología y ajedrez`,
    description: DESCRIPTION,
    locale: "es_AR",
    alternateLocale: ["en_US"],
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Logo JF sobre la ilustración de la partida de ajedrez" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@jopofernandez",
    title: `${TITLE} - Producto, tecnología y ajedrez`,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};
export const viewport: Viewport = { themeColor: "#eee9dc" };

// Claro por defecto. Si el visitante eligió oscuro, se aplica antes de pintar (sin destello).
// "loading": la página queda oculta hasta que la escena entera está lista y aparece toda junta (con tope de 5 s).
const THEME_SCRIPT = `var d=document.documentElement;d.classList.add("loading");setTimeout(function(){d.classList.remove("loading")},5000);try{if(localStorage.getItem("pc-theme-v2")==="dark"){document.documentElement.classList.remove("light");document.querySelector('meta[name="theme-color"]')?.setAttribute("content","#0f1c17")}}catch(e){}`;

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
