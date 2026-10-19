// Contenido del portfolio en español (default) e inglés. Fuentes: CV,
// proyectos locales (Over The Board, Newsletter Radar, OneClick) y los artículos de globalesur.com/insights.
// Editar acá: la lógica de la escena no depende del texto. Ambos idiomas tienen las mismas secciones en el mismo orden.

export type Lang = "es" | "en";
export type Card = {
  meta: string;
  title: string;
  sum: string;
  more?: string[];
  tags?: string[];
  href?: string;
};
export type Section = { id: string; name: string; lede: string; cards: Card[] };

export const PROFILE = {
  name: "Ezequiel Fernández",
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
    role: "Liderazgo de producto · Estrategia de producto · Productos digitales",
    cue: "Bajá para seguir la partida",
    sections: "Secciones",
    themeToLight: "Cambiar a tema claro", themeToDark: "Cambiar a tema oscuro",
    soundOn: "Activar sonido", soundOff: "Silenciar",
    musicOn: "Poner música", musicOff: "Pausar música",
    langSwitch: "English", langCode: "EN",
    line: "1.c4 Cf6 2.g3 g6 3.Ag2 Ag7 4.Cf3 O-O 5.O-O d6",
  },
  en: {
    role: "Product Leadership · Product Strategy · Digital Products",
    cue: "Scroll to continue the game",
    sections: "Sections",
    themeToLight: "Switch to light theme", themeToDark: "Switch to dark theme",
    soundOn: "Turn sound on", soundOff: "Turn sound off",
    musicOn: "Play music", musicOff: "Pause music",
    langSwitch: "Español", langCode: "ES",
    line: "1.c4 Nf6 2.g3 g6 3.Bg2 Bg7 4.Nf3 O-O 5.O-O d6",
  },
} as const;

const EN: Section[] = [
  {
    id: "about",
    name: "About",
    lede: "Product leader. I connect product strategy with business outcomes: read the position, think a few moves ahead, then execute.",
    cards: [
      {
        meta: "Profile",
        title: "Building digital products with cross-functional teams",
        sum: "Background in fintech, digital acquisition, conversion optimization, technology modernization and business development across Latin America.",
        more: [
          "Product strategy & discovery, UX/UI and data-informed decisions",
          "Applied ML and AI in products and internal processes",
          "Spanish (native) · English (C1, daily with international clients)",
        ],
      },
      {
        meta: "Now",
        title: "Head of Product & Business Development at global.esur",
        sum: "Leading product strategy and growth for OneClick across Latin America.",
      },
      {
        meta: "How I work",
        title: "One North Star, then the next move",
        sum: "Pick the metric that matters, remove friction end to end, ship often.",
        more: [
          "Client collections as North Star Metric, end-to-end conversion as KPI",
          "From quarterly deployments to multiple releases per week",
          "Coaching engineers to apply product and design principles",
        ],
      },
    ],
  },
  {
    id: "experience",
    name: "Experience",
    lede: "Over a decade across banking, fintech and B2B software, from analyst to CEO.",
    cards: [
      {
        meta: "global.esur · Oct 2026 — Present",
        title: "Head of Product & Business Development",
        sum: "Product strategy and growth for OneClick: monetization, onboarding and adoption across Latin America.",
        more: [
          "Positioning OneClick as the tool for long-tail licensing and a new digital channel for CMOs",
          "Advising the modernization of a 10+ year-old legacy CRM",
          "Business development across LatAm: outreach, demos, proposals and negotiation",
        ],
      },
      {
        meta: "global.esur · May 2024 — Oct 2026",
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
        meta: "Mercado Libre · Jul 2021 — May 2024",
        title: "Product Fintech Supervisor",
        sum: "Credit card and credit line onboarding across the Mercado Libre and Mercado Pago ecosystem.",
        more: [
          "Designed and improved 20+ financial product acquisition journeys across Latin America",
          "Used company data, credit bureau queries and ML models to reduce friction and lift conversion",
          "Previously Senior Fintech Product Analyst (2021 — 2023)",
        ],
      },
      {
        meta: "Amalgama · Aug 2020 — Jul 2021",
        title: "Senior Product Owner",
        sum: "Digital products for U.S. clients: CRM solutions, ERPs and community platforms.",
      },
      {
        meta: "BBVA · Banco Comafi · 2015 — 2020",
        title: "Product Owner and earlier roles",
        sum: "Digital sales of financial products at BBVA; marketing and BI at Banco Comafi.",
        more: [
          "BBVA Product Owner: investment-product acquisition flows with less friction (2019 — 2020)",
          "BBVA Product Analyst: Investments, Personal & Mortgage Loans (2017 — 2018)",
          "Banco Comafi: Marketing Analyst, after starting as Business Intelligence intern (2015 — 2017)",
        ],
      },
      {
        meta: "Education · UADE",
        title: "B.A. in Marketing",
        sum: "2014 — 2018, with a university exchange at the Berlin School of Economics and Law (2017).",
        more: [
          "Reforge — Product Strategy",
          "ITBA — Advanced Certification in Blockchain (2022)",
          "Coderhouse — UX/UI Design (2020) · BBVA — Design Thinking (2020)",
        ],
      },
    ],
  },
  {
    id: "projects",
    name: "Projects",
    lede: "Products built, problems solved, decisions taken.",
    cards: [
      {
        meta: "global.esur",
        title: "OneClick",
        sum: "Self-service licensing for collective management organizations: a tool for long-tail licensing and a new digital channel for CMOs.",
        more: ["North Star: client collections", "Focus on monetization, onboarding and adoption across Latin America"],
        tags: ["Product strategy", "Growth", "LatAm"],
      },
      {
        meta: "OneClick admin",
        title: "WIPO mediation module",
        sum: "Bulk mediation requests to the WIPO Arbitration and Mediation Center, piloted with DNDA Argentina.",
        more: ["Batch building in a Notion-style grid, review and approval", "Live tracking of every case sent"],
        tags: ["UX", "Legal-tech"],
      },
      {
        meta: "global.esur",
        title: "Legacy CRM modernization",
        sum: "Shaping the replacement of a 10+ year-old CRM to automate commercial data capture and improve decision-making.",
        tags: ["Platform", "Data"],
      },
      {
        meta: "AI agent",
        title: "Newsletter Radar",
        sum: "Research agent that scans sources on technology × collective rights management and sends a curated digest, with an approval dashboard.",
        tags: ["AI agents", "Vercel", "Supabase"],
      },
      {
        meta: "Side project",
        title: "Over The Board",
        sum: "Chess matching app to find nearby over-the-board opponents in Greater Buenos Aires.",
        more: ["Geolocation search for opponents", "Telegram match notifications", "Chess.com and Lichess rating linking"],
        tags: ["Next.js", ".NET", "Supabase"],
      },
    ],
  },
  {
    id: "beyond",
    name: "Beyond Work",
    lede: "What keeps me curious outside the roadmap.",
    cards: [
      {
        meta: "Berlin · 2017",
        title: "A semester abroad",
        sum: "University exchange at the Berlin School of Economics and Law: strategic management, English for business and some German.",
      },
      {
        meta: "Learning",
        title: "Always one course in progress",
        sum: "From product strategy to UX/UI, design thinking, JavaScript and blockchain.",
      },
      {
        meta: "Over the board",
        title: "Chess",
        sum: "The game behind this site, and behind a side project to find opponents nearby.",
      },
    ],
  },
  {
    id: "stack",
    name: "Tech Stack",
    lede: "Tools I use, and what I actually use them for.",
    cards: [
      { meta: "Build", title: "Web products", sum: "Prototypes and production front-ends.", tags: ["Next.js", "React", "TypeScript", "Tailwind", "Vite"] },
      { meta: "Data & backend", title: "Services and storage", sum: "Small APIs and managed databases.", tags: ["Supabase", "PostgreSQL", ".NET", "Vercel"] },
      { meta: "AI & automation", title: "Agents and workflows", sum: "Research, content and operations automated end to end.", tags: ["Claude Code", "AI agents", "n8n", "Resend"] },
      { meta: "Product craft", title: "Deciding what to build", sum: "Analytics, experimentation and design.", tags: ["Product analytics", "UX/UI", "Applied ML", "Remotion"] },
    ],
  },
  {
    id: "chess",
    name: "Chess",
    lede: "Where the strategy habit comes from.",
    cards: [
      {
        meta: "This page",
        title: "A real game in the background",
        sum: "Each section plays one move of an English Opening against a King's Indian setup.",
        more: ["1.c4 Nf6 2.g3 g6 3.Bg2 Bg7 4.Nf3 O-O 5.O-O", "Go back and the moves are taken back"],
      },
      {
        meta: "Building for players",
        title: "Over The Board",
        sum: "An app to turn online interest into in-person games: nearby opponents of similar strength, linked to Chess.com and Lichess ratings.",
      },
    ],
  },
  {
    id: "tournaments",
    name: "Tournaments",
    lede: "Chess events I organize, where chess and the tech community meet.",
    cards: [
      {
        meta: "May 12, 2026 · Aleph Hub, Buenos Aires",
        title: "Techess — Chess & Tech Workshops",
        sum: "Organized with Crecimiento. First edition: an open chess tournament plus two applied-AI workshops.",
        href: "https://luma.com/techess",
      },
    ],
  },
  {
    id: "newsletter",
    name: "Newsletter",
    lede: "Insights on technology and collective rights management, written for decision-makers at CMOs.",
    cards: [
      {
        meta: "Oct 7, 2026",
        title: "The Challenge of Licensing the Long Tail",
        sum: "The hardest operational challenge for a CMO lies with the thousands of small establishments that use music and rarely get licensed.",
        href: insightEn("long-tail-licensing-challenge"),
      },
      {
        meta: "Sep 21, 2026",
        title: "Sony and Universal vs. Suno, Round 2",
        sum: "The argument is no longer which catalog was used, but how the model was trained, and that changes the question for every CMO.",
        href: insightEn("sony-universal-suno-second-lawsuit"),
      },
      {
        meta: "Aug 26, 2026",
        title: "AI in audiovisual, where do we stand?",
        sum: "A map of the six leading players in AI video generation, their approach and their legal exposure.",
        href: insightEn("ai-in-audiovisual-where-we-stand"),
      },
      {
        meta: "Archive",
        title: "All insights",
        sum: "22 articles since January 2026, in English, Spanish and Portuguese.",
        href: "https://globalesur.com/insights",
      },
    ],
  },
  {
    id: "contact",
    name: "Contact",
    lede: "Your move.",
    cards: [
      { meta: "Email", title: PROFILE.email, sum: "The fastest way to reach me.", href: `mailto:${PROFILE.email}` },
      { meta: "Network", title: "LinkedIn", sum: "linkedin.com/in/ezequiel-fc", href: PROFILE.linkedin },
      { meta: "Social", title: "X", sum: "x.com/jopofernandez", href: PROFILE.x },
    ],
  },
];

const ES: Section[] = [
  {
    id: "about",
    name: "Sobre mí",
    lede: "Líder de producto. Conecto la estrategia de producto con los resultados del negocio: leer la posición, pensar unas jugadas adelante y ejecutar.",
    cards: [
      {
        meta: "Perfil",
        title: "Construyo productos digitales con equipos multidisciplinarios",
        sum: "Experiencia en fintech, adquisición digital, optimización de conversión, modernización tecnológica y desarrollo de negocio en Latinoamérica.",
        more: [
          "Estrategia y discovery de producto, UX/UI y decisiones basadas en datos",
          "ML e IA aplicados a productos y procesos internos",
          "Español (nativo) · Inglés (C1, uso diario con clientes internacionales)",
        ],
      },
      {
        meta: "Hoy",
        title: "Head of Product & Business Development en global.esur",
        sum: "Lidero la estrategia de producto y el crecimiento de OneClick en Latinoamérica.",
      },
      {
        meta: "Cómo trabajo",
        title: "Una North Star, y después la próxima jugada",
        sum: "Elegir la métrica que importa, sacar fricción de punta a punta y salir a producción seguido.",
        more: [
          "Recaudación de los clientes como North Star Metric y conversión end-to-end como KPI",
          "De deploys trimestrales a varios releases por semana",
          "Acompaño a los ingenieros a aplicar principios de producto y diseño",
        ],
      },
    ],
  },
  {
    id: "experience",
    name: "Experiencia",
    lede: "Más de diez años entre banca, fintech y software B2B, de analista a CEO.",
    cards: [
      {
        meta: "global.esur · Oct 2026 — Actualidad",
        title: "Head of Product & Business Development",
        sum: "Estrategia de producto y crecimiento de OneClick: monetización, onboarding y adopción en Latinoamérica.",
        more: [
          "Posicionar OneClick como la herramienta para licenciar el long tail y un nuevo canal digital para las sociedades de gestión colectiva",
          "Asesoro la modernización de un CRM legacy de más de 10 años",
          "Desarrollo de negocio en LatAm: prospección, demos, propuestas y negociación",
        ],
      },
      {
        meta: "global.esur · May 2024 — Oct 2026",
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
        meta: "Mercado Libre · Jul 2021 — May 2024",
        title: "Product Fintech Supervisor",
        sum: "Onboarding de tarjetas de crédito y líneas de crédito en el ecosistema de Mercado Libre y Mercado Pago.",
        more: [
          "Diseñé y mejoré más de 20 flujos de adquisición de productos financieros en Latinoamérica",
          "Usé datos propios, consultas a burós de crédito y modelos de ML para reducir fricción y mejorar la conversión",
          "Antes, Senior Fintech Product Analyst (2021 — 2023)",
        ],
      },
      {
        meta: "Amalgama · Ago 2020 — Jul 2021",
        title: "Senior Product Owner",
        sum: "Productos digitales para clientes de EE. UU.: soluciones de CRM, ERPs y plataformas para comunidades.",
      },
      {
        meta: "BBVA · Banco Comafi · 2015 — 2020",
        title: "Product Owner y roles anteriores",
        sum: "Venta digital de productos financieros en BBVA; marketing y BI en Banco Comafi.",
        more: [
          "Product Owner en BBVA: flujos de adquisición de inversiones con menos fricción (2019 — 2020)",
          "Product Analyst en BBVA: Inversiones, Préstamos Personales e Hipotecarios (2017 — 2018)",
          "Banco Comafi: Marketing Analyst, después de empezar como pasante de Business Intelligence (2015 — 2017)",
        ],
      },
      {
        meta: "Formación · UADE",
        title: "Licenciatura en Marketing",
        sum: "2014 — 2018, con un intercambio en la Berlin School of Economics and Law (2017).",
        more: [
          "Reforge — Product Strategy",
          "ITBA — Certificación Avanzada en Blockchain (2022)",
          "Coderhouse — Diseño UX/UI (2020) · BBVA — Design Thinking (2020)",
        ],
      },
    ],
  },
  {
    id: "projects",
    name: "Proyectos",
    lede: "Productos construidos, problemas resueltos, decisiones tomadas.",
    cards: [
      {
        meta: "global.esur",
        title: "OneClick",
        sum: "Licenciamiento autoservicio para sociedades de gestión colectiva: una herramienta para el long tail y un nuevo canal digital.",
        more: ["North Star: la recaudación de los clientes", "Foco en monetización, onboarding y adopción en Latinoamérica"],
        tags: ["Estrategia de producto", "Growth", "LatAm"],
      },
      {
        meta: "Admin de OneClick",
        title: "Módulo de mediación OMPI",
        sum: "Solicitudes masivas de mediación al Centro de Arbitraje y Mediación de la OMPI, con piloto junto a la DNDA Argentina.",
        more: ["Armado de lotes en una grilla estilo Notion, revisión y aprobación", "Seguimiento en vivo de cada caso enviado"],
        tags: ["UX", "Legal-tech"],
      },
      {
        meta: "global.esur",
        title: "Modernización del CRM legacy",
        sum: "Definición del reemplazo de un CRM de más de 10 años para automatizar la captura de datos comerciales y decidir mejor.",
        tags: ["Plataforma", "Datos"],
      },
      {
        meta: "Agente de IA",
        title: "Newsletter Radar",
        sum: "Agente de research que monitorea fuentes sobre tecnología × gestión colectiva de derechos y envía un digest curado, con panel de aprobación.",
        tags: ["Agentes de IA", "Vercel", "Supabase"],
      },
      {
        meta: "Proyecto personal",
        title: "Over The Board",
        sum: "App para encontrar rivales de ajedrez presencial cerca, en el Gran Buenos Aires.",
        more: ["Búsqueda de rivales por geolocalización", "Notificaciones de partidas por Telegram", "Vinculación de rating de Chess.com y Lichess"],
        tags: ["Next.js", ".NET", "Supabase"],
      },
    ],
  },
  {
    id: "beyond",
    name: "Fuera del trabajo",
    lede: "Lo que me mantiene curioso fuera del roadmap.",
    cards: [
      {
        meta: "Berlín · 2017",
        title: "Un semestre afuera",
        sum: "Intercambio en la Berlin School of Economics and Law: management estratégico, inglés de negocios y algo de alemán.",
      },
      {
        meta: "Aprendizaje",
        title: "Siempre con un curso en marcha",
        sum: "De estrategia de producto a UX/UI, design thinking, JavaScript y blockchain.",
      },
      {
        meta: "Sobre el tablero",
        title: "Ajedrez",
        sum: "El juego detrás de este sitio, y de un proyecto personal para encontrar rivales cerca.",
      },
    ],
  },
  {
    id: "stack",
    name: "Stack técnico",
    lede: "Las herramientas que uso, y para qué las uso de verdad.",
    cards: [
      { meta: "Construir", title: "Productos web", sum: "Prototipos y front-ends en producción.", tags: ["Next.js", "React", "TypeScript", "Tailwind", "Vite"] },
      { meta: "Datos y backend", title: "Servicios y almacenamiento", sum: "APIs chicas y bases de datos gestionadas.", tags: ["Supabase", "PostgreSQL", ".NET", "Vercel"] },
      { meta: "IA y automatización", title: "Agentes y flujos", sum: "Research, contenido y operaciones automatizados de punta a punta.", tags: ["Claude Code", "Agentes de IA", "n8n", "Resend"] },
      { meta: "Oficio de producto", title: "Decidir qué construir", sum: "Analítica, experimentación y diseño.", tags: ["Product analytics", "UX/UI", "ML aplicado", "Remotion"] },
    ],
  },
  {
    id: "chess",
    name: "Ajedrez",
    lede: "De dónde viene el hábito de pensar en estrategia.",
    cards: [
      {
        meta: "Este sitio",
        title: "Una partida real de fondo",
        sum: "Cada sección juega una jugada de una Apertura Inglesa contra un esquema de India de Rey.",
        more: ["1.c4 Cf6 2.g3 g6 3.Ag2 Ag7 4.Cf3 O-O 5.O-O", "Si volvés atrás, las jugadas se deshacen"],
      },
      {
        meta: "Construyendo para jugadores",
        title: "Over The Board",
        sum: "Una app para pasar del interés online a partidas en persona: rivales cerca y de nivel parecido, con el rating de Chess.com y Lichess.",
      },
    ],
  },
  {
    id: "tournaments",
    name: "Torneos",
    lede: "Eventos de ajedrez que organizo, donde se cruzan el ajedrez y la comunidad tech.",
    cards: [
      {
        meta: "12 de mayo de 2026 · Aleph Hub, Buenos Aires",
        title: "Techess — Ajedrez y workshops tech",
        sum: "Organizado junto a Crecimiento. Primera edición: un torneo abierto de ajedrez y dos workshops de IA aplicada.",
        href: "https://luma.com/techess",
      },
    ],
  },
  {
    id: "newsletter",
    name: "Newsletter",
    lede: "Insights sobre tecnología y gestión colectiva de derechos, para quienes toman decisiones en las sociedades de gestión.",
    cards: [
      {
        meta: "7 oct 2026",
        title: "El desafío del licenciamiento en el long tail",
        sum: "El desafío operativo más difícil para una sociedad de gestión está en los miles de pequeños establecimientos que usan música y casi nunca se licencian.",
        href: insightEs("desafio-licenciamiento-long-tail"),
      },
      {
        meta: "21 sep 2026",
        title: "Sony y Universal vs. Suno, round 2",
        sum: "El argumento ya no es qué catálogo se usó, sino cómo se entrenó el modelo, y eso cambia la pregunta para cualquier sociedad de gestión.",
        href: insightEs("sony-universal-suno-segunda-demanda"),
      },
      {
        meta: "26 ago 2026",
        title: "IA en el audiovisual, ¿dónde estamos parados?",
        sum: "Un mapa de los seis jugadores principales en generación de video con IA, su enfoque y su situación legal.",
        href: insightEs("ia-audiovisual-donde-estamos-parados"),
      },
      {
        meta: "Archivo",
        title: "Todos los insights",
        sum: "22 artículos desde enero de 2026, en español, inglés y portugués.",
        href: "https://globalesur.com/es/insights",
      },
    ],
  },
  {
    id: "contact",
    name: "Contacto",
    lede: "Tu jugada.",
    cards: [
      { meta: "Email", title: PROFILE.email, sum: "La forma más rápida de contactarme.", href: `mailto:${PROFILE.email}` },
      { meta: "Red", title: "LinkedIn", sum: "linkedin.com/in/ezequiel-fc", href: PROFILE.linkedin },
      { meta: "Redes", title: "X", sum: "x.com/jopofernandez", href: PROFILE.x },
    ],
  },
];

export const SECTIONS: Record<Lang, Section[]> = { es: ES, en: EN };
/** ids de las secciones (iguales en ambos idiomas; se usan en la URL) */
export const SECTION_IDS = ES.map((s) => s.id);

// Una jugada por sección: Apertura Inglesa vs esquema de India de Rey (fianchetto doble).
// 1.c4 Nf6 2.g3 g6 3.Bg2 Bg7 4.Nf3 O-O 5.O-O — el enroque mueve dos piezas.
export type Ply = { san: string; moves: [string, string][] };
export const PLIES: Ply[] = [
  { san: "c4", moves: [["c2", "c4"]] },
  { san: "Nf6", moves: [["g8", "f6"]] },
  { san: "g3", moves: [["g2", "g3"]] },
  { san: "g6", moves: [["g7", "g6"]] },
  { san: "Bg2", moves: [["f1", "g2"]] },
  { san: "Bg7", moves: [["f8", "g7"]] },
  { san: "Nf3", moves: [["g1", "f3"]] },
  { san: "O-O", moves: [["e8", "g8"], ["h8", "f8"]] },
  { san: "O-O", moves: [["e1", "g1"], ["h1", "f1"]] },
  { san: "d6", moves: [["d7", "d6"]] },
];
export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
