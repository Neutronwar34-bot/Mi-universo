# Cartas para otro planeta

Un pequeño universo navegable en 3D (Three.js + GSAP) donde cada planeta es
una carta con un personaje estilo recorte de papel, inspirado en *El
Principito*. Backend en Supabase, pensado para desplegarse en GitHub Pages.

## Estructura

```
src/
  scene/       renderer, vuelo libre (flightControls.js), construcción de planetas, personajes de papel
  ui/          intro, loading, vista de superficie, formulario crear/editar, toast, contador, controles táctiles
  data/        cliente Supabase, CRUD de mundos, metadata de las pistas de música
  audio/       efectos de interfaz sintetizados (Web Audio) + tocadiscos
  main.js      arma todo lo anterior y corre el loop de animación
public/audio/  mp3 con licencia válida que el usuario coloca ahí — se reproducen en cola, en orden aleatorio inicial
supabase/      schema.sql: tabla `worlds` + políticas RLS + seed de los 5 mundos
legacy/        principito.html original (single-file) y el prompt de migración, como referencia
```

## Navegación

Vuelo libre estilo nave (no hay cámara orbital): WASD/flechas mueven en el
plano horizontal relativo a hacia dónde mira la cámara, Space/Shift suben y
bajan, y arrastrar (mouse o touch) mira alrededor. En pantallas táctiles
aparece un D-pad + botones de subir/bajar (`ui-mobile-controls.js`). El
vuelo está acotado a `BOUNDARY_RADIUS` desde el spawn (`flightControls.js`).

Los mundos ya no muestran el personaje superpuesto en la escena 3D — solo el
planeta (con variedad de texturas: acuarela, bandas, cráteres, remolinos, y
~1 de cada 5 con anillo). Al acercarse a un planeta aparece un prompt "Ver
planeta ✦"; abrirlo lleva a la vista de superficie (`ui-surface.js`): fondo
con los colores del mundo, el personaje 2D animado estilo Paper Mario, y la
carta como panel de diálogo anclado abajo. No hay botón de "siguiente
mundo" — hay que acercarse a cada uno para leerlo.

**Nota para quien toque `src/main.js` o `flightControls.js`:** el loop de
animación usa `clock.getDelta()` una sola vez por frame y lee
`clock.elapsedTime` para el tiempo total — llamar también a
`clock.getElapsedTime()` en el mismo frame vuelve a consumir el delta y lo
deja en ~0 siempre (bug real que hubo aquí). La amortiguación de velocidad
en `flightControls.js` usa `Math.exp(-DAMPING*dt)`, no `1-DAMPING*dt`: esa
segunda forma se vuelve negativa (y anula toda la velocidad) en frames
lentos.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:5173/.

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar con las credenciales del
proyecto de Supabase (Project Settings → API):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Solo la clave **publishable/anon** va en el frontend. La `secret key` de
Supabase nunca debe usarse desde el cliente.

## Supabase

Ejecutar `supabase/schema.sql` en el SQL Editor del proyecto para crear la
tabla `worlds` (con RLS público de lectura/escritura, ver comentarios en el
archivo — a revisar el día que esto deje de ser un proyecto personal) y
sembrar los 5 mundos por defecto.

Si Supabase no está configurado o falla la conexión, la app cae a una lista
de mundos por defecto local (`src/data/worldsStore.js`) para no quedar vacía.

## Música ambiente

`src/data/track.json` define el título de la pista y la ruta del audio
(`public/audio/ambient.mp3`). El tocadiscos empieza pausado (los navegadores
bloquean autoplay con sonido) y si el archivo no existe lo indica en la UI
en vez de romperse.

## Deploy

`.github/workflows/deploy.yml` hace build y publica en GitHub Pages en cada
push a `main`. Hay que cargar `VITE_SUPABASE_URL` y
`VITE_SUPABASE_PUBLISHABLE_KEY` como secrets del repo, y habilitar GitHub
Pages con fuente "GitHub Actions" en la configuración del repo.
