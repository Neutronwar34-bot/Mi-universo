# Prompt para Claude Code — "Cartas para otro planeta"

Contexto: ya existe un archivo `principito.html` (single-file, Three.js + GSAP) con una
escena espacial 3D navegable donde cada planeta es una "carta" con un personaje estilo
recorte de papel. Quiero migrarlo a un repo real con backend en Supabase, desplegado en
GitHub Pages, y convertirlo en algo que se sienta más "videojuego web" que "página web".

## 1. Estructura del proyecto
- Inicializa el repo con Vite (vanilla JS o vanilla-ts, sin framework de UI pesado —
  quiero mantener el control directo sobre Three.js).
- Estructura sugerida: `src/scene/`, `src/ui/`, `src/data/`, `src/audio/`, `public/audio/`.
- Migra el HTML/CSS/JS del archivo `principito.html` adjunto, separando en módulos
  (scene.js, worlds.js, characters.js, ui-letter.js, ui-form.js, camera.js, audio.js).
- Configura GitHub Actions para deploy automático a GitHub Pages en cada push a `main`.

## 2. Backend: Supabase
- Voy a darte el Project URL y la anon public key por separado (no las pongas nunca en
  el repo directamente, van en variables de entorno `.env.local`, con `.env.example`
  como plantilla y `.env*` en `.gitignore`).
- Crea una tabla `worlds` con RLS activado:
  - id (uuid, pk), name, subtitle, letter (text), character (text),
    color_a, color_b, accent, size (float), position_index (int),
    created_at (timestamptz default now()), is_default (bool default false)
- Reemplaza el `localStorage` actual por lectura/escritura a Supabase:
  - Al cargar, trae todos los mundos (defaults + personalizados) desde la tabla.
  - Crear/editar/eliminar mundo desde el formulario ya existente debe hacer
    insert/update/delete contra Supabase en vez de `localStorage.setItem`.
- Como es un proyecto personal por ahora, RLS puede permitir lectura pública y
  escritura pública (sin auth), pero coméntalo claramente en el código como algo a
  revisar si algún día se vuelve multiusuario.

## 3. Sensación de "videojuego web"
- Mantén toda la navegación 3D actual (orbit, click-to-fly, letter modal) pero:
  - Agrega una pantalla de carga inicial con progreso real (assets, fuentes, conexión
    a Supabase) antes de mostrar la intro.
  - Agrega sonido de interfaz sutil (whoosh al volar hacia un planeta, un "pop" suave
    al abrir la carta) — usa Web Audio API con tonos sintetizados simples si no hay
    archivos de sonido, no hace falta libraries de audio pesadas.
  - Considera un pequeño contador/indicador de "mundos descubiertos: X/Y" en la esquina,
    como un logro de videojuego, sin ser intrusivo.

## 4. Música de fondo + tocadiscos
- NO generes ni busques archivos de audio con música real con copyright (incluyendo
  Ryuichi Sakamoto) — yo voy a colocar manualmente un archivo con licencia válida en
  `public/audio/ambient.mp3`. Escribe el código asumiendo que ese archivo existe ahí.
- Construye un tocadiscos (record player) como componente fijo en una esquina de la
  pantalla:
  - Ícono de disco de vinilo que gira mientras suena (CSS animation, se pausa si el
    audio está pausado).
  - Brazo/aguja que se posa sobre el disco cuando está reproduciendo.
  - Click para play/pause. Empieza pausado por defecto (los navegadores bloquean
    autoplay con sonido de todas formas) con un pequeño prompt tipo "▶ tocar música".
  - Muestra el nombre de la pista (puedes leerlo de un pequeño JSON de metadata en
    `src/data/track.json` que yo edito con el nombre real de la canción que use).
- El volumen debe ser bajo por defecto y no interferir con el sonido ambiente futuro.

## 5. Bug conocido ya corregido en el HTML original
En el loop de animación había `n.rotation += 0;` sobre un `THREE.Sprite`, lo cual
tira `Cannot assign to read only property 'rotation'` porque en Sprite la rotación
visual se controla vía `material.rotation`, no `object3d.rotation`. Ya está eliminado
en el archivo que te paso, pero ojo si reescribes esa sección desde cero.

## 6. Qué te voy a dar yo (no lo asumas ni lo inventes)
- El archivo `principito.html` de referencia.
- Project URL y anon key de Supabase (por fuera de este prompt).
- El archivo de música con licencia válida.
- Confirmación del usuario/repo de GitHub para el deploy.

Empieza por: (1) montar el esqueleto Vite + estructura de carpetas, (2) migrar el
código del HTML a módulos sin cambiar el comportamiento, (3) conectar Supabase,
(4) agregar tocadiscos + hook de audio, (5) configurar GitHub Actions para Pages.
Ve mostrándome avances por fases, no todo de una vez.
