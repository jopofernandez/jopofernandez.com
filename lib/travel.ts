// Lugares del mapa de Viajes. Para sumar uno: agregarlo acá (lat/lon del centro de la ciudad o de la región).
// Las fotos se generan con portfolio-chess/scripts/travel-photos.mjs y quedan listadas en data/travel-photos.json por id.

import type { Lang } from "./content";

type T = Record<Lang, string>;
export type Place = { id: string; name: T; country: T; lat: number; lon: number; years?: string[] };

const C = {
  de: { es: "Alemania", en: "Germany" },
  uk: { es: "Reino Unido", en: "United Kingdom" },
  es: { es: "España", en: "Spain" },
  it: { es: "Italia", en: "Italy" },
  nl: { es: "Países Bajos", en: "Netherlands" },
  gr: { es: "Grecia", en: "Greece" },
  br: { es: "Brasil", en: "Brazil" },
  ar: { es: "Argentina", en: "Argentina" },
  mx: { es: "México", en: "Mexico" },
  us: { es: "Estados Unidos", en: "United States" },
} satisfies Record<string, T>;
const same = (s: string): T => ({ es: s, en: s });

export const PLACES: Place[] = [
  { id: "berlin", name: { es: "Berlín", en: "Berlin" }, country: C.de, lat: 52.52, lon: 13.405, years: ["2017", "2018", "2021", "2023"] },
  { id: "leipzig", name: same("Leipzig"), country: C.de, lat: 51.34, lon: 12.375 },
  { id: "rostock", name: same("Rostock"), country: C.de, lat: 54.092, lon: 12.099 },
  { id: "london", name: { es: "Londres", en: "London" }, country: C.uk, lat: 51.507, lon: -0.128 },
  { id: "manchester", name: same("Manchester"), country: C.uk, lat: 53.481, lon: -2.243 },
  { id: "long-buckby", name: same("Long Buckby"), country: C.uk, lat: 52.3, lon: -1.08 },
  { id: "rugby", name: same("Rugby"), country: C.uk, lat: 52.37, lon: -1.264 },
  { id: "madrid", name: same("Madrid"), country: C.es, lat: 40.417, lon: -3.704 },
  { id: "barcelona", name: same("Barcelona"), country: C.es, lat: 41.387, lon: 2.17 },
  { id: "alicante", name: same("Alicante"), country: C.es, lat: 38.345, lon: -0.481 },
  { id: "mallorca", name: same("Mallorca"), country: C.es, lat: 39.62, lon: 2.98 },
  { id: "amsterdam", name: { es: "Ámsterdam", en: "Amsterdam" }, country: C.nl, lat: 52.368, lon: 4.904 },
  { id: "czechia", name: { es: "República Checa", en: "Czech Republic" }, country: { es: "Europa central", en: "Central Europe" }, lat: 50.075, lon: 14.438 },
  { id: "rome", name: { es: "Roma", en: "Rome" }, country: C.it, lat: 41.903, lon: 12.496 },
  { id: "naples", name: { es: "Nápoles", en: "Naples" }, country: C.it, lat: 40.852, lon: 14.268 },
  { id: "bari", name: same("Bari"), country: C.it, lat: 41.117, lon: 16.872 },
  { id: "puglia", name: same("Puglia"), country: C.it, lat: 40.73, lon: 17.58 },
  { id: "morano", name: { es: "Morano Calabro", en: "Morano Calabro" }, country: { es: "Calabria, Italia", en: "Calabria, Italy" }, lat: 39.844, lon: 16.137 },
  { id: "croatia", name: { es: "Croacia", en: "Croatia" }, country: { es: "Costa dálmata", en: "Dalmatian coast" }, lat: 43.9, lon: 15.9 },
  { id: "albania", name: same("Albania"), country: { es: "Balcanes", en: "Balkans" }, lat: 41.15, lon: 20.0 },
  { id: "corfu", name: { es: "Corfú", en: "Corfu" }, country: C.gr, lat: 39.62, lon: 19.92 },
  { id: "buenos-aires", name: same("Buenos Aires"), country: C.ar, lat: -34.604, lon: -58.382 },
  { id: "salta", name: same("Salta"), country: C.ar, lat: -24.782, lon: -65.423 },
  { id: "patagonia", name: same("Patagonia"), country: C.ar, lat: -44.5, lon: -70.0 },
  { id: "sao-paulo", name: same("São Paulo"), country: C.br, lat: -23.551, lon: -46.633 },
  { id: "sp-north-coast", name: { es: "Litoral norte de São Paulo", en: "São Paulo north coast" }, country: C.br, lat: -23.75, lon: -45.35 },
  { id: "rio", name: { es: "Río de Janeiro", en: "Rio de Janeiro" }, country: C.br, lat: -22.907, lon: -43.173 },
  { id: "tulum", name: same("Tulum"), country: C.mx, lat: 20.211, lon: -87.465 },
  { id: "miami", name: same("Miami"), country: C.us, lat: 25.762, lon: -80.192 },
  { id: "orlando", name: same("Orlando"), country: C.us, lat: 28.538, lon: -81.379 },
  { id: "china", name: same("China"), country: { es: "Asia", en: "Asia" }, lat: 34.5, lon: 108.9 },
];
