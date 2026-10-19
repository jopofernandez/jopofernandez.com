# jopofernandez.com

Portfolio personal de **Ezequiel Fernández**: una partida de ajedrez dibujada en tinta que se juega mientras recorrés el sitio.
Personal portfolio of **Ezequiel Fernández**: an ink-drawn chess game that plays itself as you scroll.

- Cada sección es una jugada de una Apertura Inglesa contra un esquema de India de Rey: 1.c4 Cf6 2.g3 g6 3.Ag2 Ag7 4.Cf3 O-O 5.O-O.
- La escena se dibuja con un shader WebGL (hervor de línea, vapor, luz y trama Bayer); piezas, manos y reloj se alinean con la misma cámara.
- Español por defecto, inglés según el navegador. Tema oscuro y claro.

## Stack

Next.js 16 (App Router, export estático) · TypeScript · WebGL · Web Audio · Geist / Geist Mono.

```bash
npm install
npm run dev     # http://localhost:5181
npm run build   # sitio estático en out/
```

El contenido está en `lib/content.ts`; la escena en `lib/chess-scene.ts` y `lib/scene-shader.ts`.

## Créditos / Credits

- **Música**: "Midnight Amber Room", de [Open Lo-Fi](https://github.com/btahir/open-lofi), con licencia CC0 1.0 (dominio público).
- **Sonido de las piezas**: grabaciones de [simone_ds](https://freesound.org/people/simone_ds/sounds/366065/) y [Alnotreally](https://freesound.org/people/Alnotreally/sounds/801349/) en Freesound, con licencia CC0 1.0.
- **Ilustraciones**: escena, piezas y manos generadas con gpt-image-2 y procesadas a mano (recorte, calibración del tablero, duotono).
- **Tipografías**: [Geist](https://vercel.com/font) (SIL Open Font License).
