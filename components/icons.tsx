// Íconos de las cards: en SVG (y no como caracteres de texto) para que queden centrados en su círculo
// sin depender de la métrica de la fuente.

export const IconArrow = ({ size = 11 }: { size?: number }) => (
  <svg className="ic" viewBox="0 0 12 12" width={size} height={size} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" />
  </svg>
);

export const IconPlus = ({ size = 11 }: { size?: number }) => (
  <svg className="ic" viewBox="0 0 12 12" width={size} height={size} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M6 2.5v7M2.5 6h7" />
  </svg>
);
