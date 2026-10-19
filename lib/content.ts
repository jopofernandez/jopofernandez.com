// Contenido del portfolio en español (default) e inglés. Fuentes: CV,
// proyectos locales (Over The Board, Newsletter Radar, OneClick) y los artículos de globalesur.com/insights.
// Editar acá: la lógica de la escena no depende del texto. Ambos idiomas tienen las mismas secciones en el mismo orden.

import { STORY } from "./story";

export type Lang = "es" | "en";
export type Card = {
  meta: string;
  title: string;
  sum?: string;
  more?: (string | { label: string; href: string })[];
  tags?: string[];
  href?: string;
  /** fotos que se muestran en una tira debajo de la card */
  photos?: Photo[];
  /** card con las stats en vivo de chess.com */
  chesscom?: boolean;
  /** links visibles debajo de la card (videos, tiendas, posts) */
  links?: { label: string; href: string }[];
  /** lista de ítems propios (ej. Formación: cada estudio con su institución) */
  items?: { title: string; meta: string }[];
};
export type Photo = { src: string; thumb: string; w: number; h: number };
export type Section = { id: string; name: string; lede: string; cards: Card[]; story?: string[] };

export const PROFILE = {
  name: "Ezequiel Fernández",
  // nombre de la portada
  display: "Jopo Fernández",
  location: "Buenos Aires, AR",
  email: "ezequiel.fernandez.cuevas@gmail.com",
  linkedin: "https://www.linkedin.com/in/ezequiel-fc/",
  x: "https://x.com/jopofernandez",
};

const insightEn = (slug: string) => `https://globalesur.com/insights/${slug}`;
const insightEs = (slug: string) => `https://globalesur.com/es/insights/${slug}`;

/** textos de la interfaz */
export const UI = {
  es: {
    role: "Apasionado por la tecnología, el ajedrez y construir en equipo",
    cue: "Bajá para seguir la partida",
    sections: "Secciones",
    themeToLight: "Cambiar a tema claro", themeToDark: "Cambiar a tema oscuro",
    soundOn: "Activar sonido", soundOff: "Silenciar",
    musicOn: "Poner música", musicOff: "Pausar música",
    langSwitch: "English", langCode: "EN",
    line: "1.c4 Cf6 2.g3 g6 3.Ag2 Ag7 4.Cf3",
  },
  en: {
    role: "Passionate about technology, chess and building as a team",
    cue: "Scroll to continue the game",
    sections: "Sections",
    themeToLight: "Switch to light theme", themeToDark: "Switch to dark theme",
    soundOn: "Turn sound on", soundOff: "Turn sound off",
    musicOn: "Play music", musicOff: "Pause music",
    langSwitch: "Español", langCode: "ES",
    line: "1.c4 Nf6 2.g3 g6 3.Bg2 Bg7 4.Nf3",
  },
} as const;

const EN: Section[] = [
  {
    id: "about",
    name: "About",
    lede: "",
    cards: [],
    story: STORY.en,
  },
  {
    id: "experience",
    name: "Experience",
    lede: "",
    cards: [
      {
        meta: "global.esur · Since Oct 2026",
        title: "Head of Product & Business Development",
        sum: "Product strategy and growth for OneClick: monetization, onboarding and adoption across Latin America.",
        more: [
          "Positioning OneClick as the tool for long-tail licensing and a new digital channel for CMOs",
          "Advising the modernization of a 10+ year-old legacy CRM",
          "Business development across LatAm: outreach, demos, proposals and negotiation",
        ],
      },
      {
        meta: "global.esur · May 2024 to Oct 2026",
        title: "CEO",
        sum: "Helped double the customer base, enter new markets and develop new revenue streams.",
        more: [
          "Led a rebranding that strengthened positioning in the target market",
          "Drove product improvements that nearly doubled the flagship's NPS",
          "Moved delivery from quarterly deployments to multiple releases per week",
          "Led Product, Design and Engineering; drove AI adoption across the company",
        ],
      },
      {
        meta: "Mercado Libre · Jul 2021 to May 2024",
        title: "Product Fintech Supervisor",
        sum: "Credit card and credit line onboarding across the Mercado Libre and Mercado Pago ecosystem.",
        more: [
          "Designed and improved 20+ financial product acquisition journeys across Latin America",
          "Used company data, credit bureau queries and ML models to reduce friction and lift conversion",
          "Previously Senior Fintech Product Analyst (2021 to 2023)",
        ],
      },
      {
        meta: "Amalgama · Aug 2020 to Jul 2021",
        title: "Senior Product Owner",
        sum: "Digital products for U.S. clients: CRM solutions, ERPs and community platforms.",
      },
      {
        meta: "BBVA · Banco Comafi · 2015 to 2020",
        title: "Product Owner and earlier roles",
        sum: "Digital sales of financial products at BBVA; marketing and BI at Banco Comafi.",
        more: [
          "BBVA Product Owner: investment-product acquisition flows with less friction (2019 to 2020)",
          "BBVA Product Analyst: Investments, Personal & Mortgage Loans (2017 to 2018)",
          "Banco Comafi: Marketing Analyst, after starting as Business Intelligence intern (2015 to 2017)",
        ],
      },
      {
        meta: "Degree, courses and certifications",
        title: "Education",
        items: [
          { title: "B.A. in Marketing", meta: "UADE · 2014 to 2018 · GPA 7.5 out of 10 · Exchange at the Berlin School of Economics and Law (2017)" },
          { title: "Product Strategy", meta: "Reforge" },
          { title: "Advanced Certification in Blockchain", meta: "ITBA · 2022" },
          { title: "UX/UI Design", meta: "Coderhouse · 2020" },
        ],
      },
    ],
  },
  {
    id: "chess",
    name: "Chess",
    lede: "",
    cards: [
      { meta: "Chess.com · lajopeta", title: "My online chess", sum: "Current ratings and games played since I started.", href: "https://www.chess.com/member/lajopeta", chesscom: true },
      {
        meta: "May 12, 2026 · Aleph Hub, Buenos Aires",
        title: "Techess: an event for 30 people",
        sum: "The fourth tournament I've organized, and the biggest so far. Put together with Ain Ponce at Crecimiento, with applied-AI workshops.",
        href: "https://www.linkedin.com/posts/ezequiel-fc_as%C3%AD-fue-la-primera-edici%C3%B3n-de-techess-ugcPost-7460401440621010945-DaTW/",
        photos: [1, 2].map((n) => ({ src: `/assets/chess/techess-0${n}.webp`, thumb: `/assets/chess/techess-0${n}-s.webp`, w: 427, h: 240 })),
      },
    ],
  },
  {
    id: "projects",
    name: "Projects",
    lede: "",
    cards: [
      {
        meta: "global.esur",
        title: "OneClick",
        sum: "Self-service licensing for collective management organizations: a tool for long-tail licensing and a new digital channel for CMOs.",
        more: ["North Star: client collections", "Focus on monetization, onboarding and adoption across Latin America"],
        tags: ["Product strategy", "Growth", "LatAm"],
        links: [{ label: "Video", href: "https://youtu.be/8vIvJvBe_n4" }, { label: "Landing page", href: "https://www.linkedin.com/posts/ezequiel-fc_sigue-sorprendi%C3%A9ndome-las-cosas-que-se-pueden-ugcPost-7477379952296747009-8IOu/" }],
      },
      {
        meta: "global.esur",
        title: "Radar",
        sum: "OneClick module to monitor activity and spot licensing opportunities.",
        links: [{ label: "Video (Spanish)", href: "https://youtu.be/dKOiN5cZ3JA" }],
      },
      {
        meta: "global.esur · Mobile app",
        title: "FIPCA Conecta",
        sum: "An app for professionals in the Ibero-American audiovisual industry, on Android and iOS.",
        links: [{ label: "LinkedIn post", href: "https://www.linkedin.com/posts/ezequiel-fc_mam%C3%A1-llegu%C3%A9-ayer-tuvimos-la-hermosa-ugcPost-7382051775283011584-ILT7/" }, { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.daniel.fernandez.globalesur.fipca&hl=es_AR" }, { label: "App Store", href: "https://apps.apple.com/us/app/fipca-conecta/id6740435537" }],
      },
      {
        meta: "global.esur · Insights",
        title: "Newsletter",
        sum: "Insights on technology and collective rights management, written for decision-makers at CMOs. 22 articles since January 2026, in English, Spanish and Portuguese.",
        more: [
          { label: "Attribution models: how they apply to copyright and related rights", href: insightEn("attribution-models-copyright") },
          { label: "GEMA launches PLAI, a first step in the right direction", href: insightEn("gema-plai-first-step-right-direction") },
          { label: "All insights", href: "https://globalesur.com/insights" },
        ],
        tags: ["Content", "Research", "CMOs"],
      },
    ],
  },
  {
    id: "travel",
    name: "Travel",
    lede: "",
    cards: [],
  },
  {
    id: "contact",
    name: "Contact",
    lede: "",
    cards: [
      { meta: "Email", title: PROFILE.email, href: `mailto:${PROFILE.email}` },
      { meta: "Network", title: "LinkedIn", sum: "linkedin.com/in/ezequiel-fc", href: PROFILE.linkedin },
      { meta: "Social", title: "X", sum: "x.com/jopofernandez", href: PROFILE.x },
    ],
  },
];

const ES: Section[] = [
  {
    id: "about",
    name: "Sobre mí",
    lede: "",
    cards: [],
    story: STORY.es,
  },
  {
    id: "experience",
    name: "Experiencia",
    lede: "",
    cards: [
      {
        meta: "global.esur · Desde oct 2026",
        title: "Head of Product & Business Development",
        sum: "Estrategia de producto y crecimiento de OneClick: monetización, onboarding y adopción en Latinoamérica.",
        more: [
          "Posicionar OneClick como la herramienta para licenciar el long tail y un nuevo canal digital para las sociedades de gestión colectiva",
          "Asesoro la modernización de un CRM legacy de más de 10 años",
          "Desarrollo de negocio en LatAm: prospección, demos, propuestas y negociación",
        ],
      },
      {
        meta: "global.esur · May 2024 a oct 2026",
        title: "CEO",
        sum: "Ayudé a duplicar la base de clientes, entrar en nuevos mercados y desarrollar nuevas fuentes de ingresos.",
        more: [
          "Lideré un rebranding que fortaleció el posicionamiento en el mercado objetivo",
          "Impulsé mejoras de producto que casi duplicaron el NPS del producto principal",
          "Pasamos de deploys trimestrales a varios releases por semana",
          "Lideré Producto, Diseño e Ingeniería e impulsé la adopción de IA en toda la empresa",
        ],
      },
      {
        meta: "Mercado Libre · Jul 2021 a may 2024",
        title: "Product Fintech Supervisor",
        sum: "Onboarding de tarjetas de crédito y líneas de crédito en el ecosistema de Mercado Libre y Mercado Pago.",
        more: [
          "Diseñé y mejoré más de 20 flujos de adquisición de productos financieros en Latinoamérica",
          "Usé datos propios, consultas a burós de crédito y modelos de ML para reducir fricción y mejorar la conversión",
          "Antes, Senior Fintech Product Analyst (2021 a 2023)",
        ],
      },
      {
        meta: "Amalgama · Ago 2020 a jul 2021",
        title: "Senior Product Owner",
        sum: "Productos digitales para clientes de EE. UU.: soluciones de CRM, ERPs y plataformas para comunidades.",
      },
      {
        meta: "BBVA · Banco Comafi · 2015 a 2020",
        title: "Product Owner y roles anteriores",
        sum: "Venta digital de productos financieros en BBVA; marketing y BI en Banco Comafi.",
        more: [
          "Product Owner en BBVA: flujos de adquisición de inversiones con menos fricción (2019 a 2020)",
          "Product Analyst en BBVA: Inversiones, Préstamos Personales e Hipotecarios (2017 a 2018)",
          "Banco Comafi: Marketing Analyst, después de empezar como pasante de Business Intelligence (2015 a 2017)",
        ],
      },
      {
        meta: "Carrera, cursos y certificaciones",
        title: "Formación",
        items: [
          { title: "Licenciatura en Marketing", meta: "UADE · 2014 a 2018 · Promedio 7,5 sobre 10 · Intercambio en la Berlin School of Economics and Law (2017)" },
          { title: "Product Strategy", meta: "Reforge" },
          { title: "Certificación Avanzada en Blockchain", meta: "ITBA · 2022" },
          { title: "Diseño UX/UI", meta: "Coderhouse · 2020" },
        ],
      },
    ],
  },
  {
    id: "chess",
    name: "Ajedrez",
    lede: "",
    cards: [
      { meta: "Chess.com · lajopeta", title: "Mi ajedrez online", sum: "Rating actual y partidas jugadas desde que empecé.", href: "https://www.chess.com/member/lajopeta", chesscom: true },
      {
        meta: "12 de mayo de 2026 · Aleph Hub, Buenos Aires",
        title: "Techess: un evento para 30 personas",
        sum: "Mi cuarto torneo organizado y el más grande hasta ahora. Lo armamos junto a Ain Ponce en Crecimiento, con workshops de IA aplicada.",
        href: "https://www.linkedin.com/posts/ezequiel-fc_as%C3%AD-fue-la-primera-edici%C3%B3n-de-techess-ugcPost-7460401440621010945-DaTW/",
        photos: [1, 2].map((n) => ({ src: `/assets/chess/techess-0${n}.webp`, thumb: `/assets/chess/techess-0${n}-s.webp`, w: 427, h: 240 })),
      },
    ],
  },
  {
    id: "projects",
    name: "Proyectos",
    lede: "",
    cards: [
      {
        meta: "global.esur",
        title: "OneClick",
        sum: "Licenciamiento autoservicio para sociedades de gestión colectiva: una herramienta para el long tail y un nuevo canal digital.",
        more: ["North Star: la recaudación de los clientes", "Foco en monetización, onboarding y adopción en Latinoamérica"],
        tags: ["Estrategia de producto", "Growth", "LatAm"],
        links: [{ label: "Video", href: "https://youtu.be/Vc5kOh0ZpA4" }, { label: "Landing web", href: "https://www.linkedin.com/posts/ezequiel-fc_sigue-sorprendi%C3%A9ndome-las-cosas-que-se-pueden-ugcPost-7477379952296747009-8IOu/" }],
      },
      {
        meta: "global.esur",
        title: "Radar",
        sum: "Módulo de OneClick para monitorear la actividad y detectar oportunidades de licenciamiento.",
        links: [{ label: "Video", href: "https://youtu.be/dKOiN5cZ3JA" }],
      },
      {
        meta: "global.esur · App móvil",
        title: "FIPCA Conecta",
        sum: "App para profesionales de la industria audiovisual iberoamericana, en Android e iOS.",
        links: [{ label: "Post en LinkedIn", href: "https://www.linkedin.com/posts/ezequiel-fc_mam%C3%A1-llegu%C3%A9-ayer-tuvimos-la-hermosa-ugcPost-7382051775283011584-ILT7/" }, { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.daniel.fernandez.globalesur.fipca&hl=es_AR" }, { label: "App Store", href: "https://apps.apple.com/us/app/fipca-conecta/id6740435537" }],
      },
      {
        meta: "global.esur · Insights",
        title: "Newsletter",
        sum: "Insights sobre tecnología y gestión colectiva de derechos, para quienes deciden en las sociedades de gestión. 22 artículos desde enero de 2026, en español, inglés y portugués.",
        more: [
          { label: "Modelos de atribución: usos en derechos de autor y conexos", href: insightEs("modelos-atribucion-derechos-autor") },
          { label: "GEMA lanza PLAI, un primer paso en la dirección correcta", href: insightEs("gema-plai-primer-paso-direccion-correcta") },
          { label: "Todos los insights", href: "https://globalesur.com/es/insights" },
        ],
        tags: ["Contenido", "Research", "Sociedades de gestión"],
      },
    ],
  },
  {
    id: "travel",
    name: "Viajes",
    lede: "",
    cards: [],
  },
  {
    id: "contact",
    name: "Contacto",
    lede: "",
    cards: [
      { meta: "Email", title: PROFILE.email, href: `mailto:${PROFILE.email}` },
      { meta: "Red", title: "LinkedIn", sum: "linkedin.com/in/ezequiel-fc", href: PROFILE.linkedin },
      { meta: "Redes", title: "X", sum: "x.com/jopofernandez", href: PROFILE.x },
    ],
  },
];

export const SECTIONS: Record<Lang, Section[]> = { es: ES, en: EN };
/** ids de las secciones (iguales en ambos idiomas; se usan en la URL) */
export const SECTION_IDS = ES.map((s) => s.id);

// Una jugada por sección: Apertura Inglesa vs esquema de India de Rey (fianchetto doble).
// 1.c4 Nf6 2.g3 g6 3.Bg2 Bg7 4.Nf3 O-O 5.O-O: el enroque mueve dos piezas.
export type Ply = { san: string; moves: [string, string][] };
export const PLIES: Ply[] = [
  { san: "c4", moves: [["c2", "c4"]] },
  { san: "Nf6", moves: [["g8", "f6"]] },
  { san: "g3", moves: [["g2", "g3"]] },
  { san: "g6", moves: [["g7", "g6"]] },
  { san: "Bg2", moves: [["f1", "g2"]] },
  { san: "Bg7", moves: [["f8", "g7"]] },
  { san: "Nf3", moves: [["g1", "f3"]] },
];
export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
