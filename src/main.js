import * as THREE from 'three';
import './style.css';

import { createRenderer, createScene, createStarfields, createNebulae } from './scene/scene.js';
import { createCamera } from './scene/camera.js';
import { FlightController } from './scene/flightControls.js';
import { WorldManager } from './scene/worlds.js';
import { fetchWorlds, createWorld, updateWorld, deleteWorld } from './data/worldsStore.js';
import { LoadingScreen } from './ui/ui-loading.js';
import { IntroScreen } from './ui/ui-intro.js';
import { SurfaceView } from './ui/ui-surface.js';
import { WorldFormUI } from './ui/ui-form.js';
import { showToast } from './ui/ui-toast.js';
import { DiscoveryTracker } from './ui/ui-progress.js';
import { initMobileControls } from './ui/ui-mobile-controls.js';
import { RecordPlayer } from './audio/recordPlayer.js';
import { playPop } from './audio/sfx.js';

const PROXIMITY_RADIUS = 7;

/* ---------- Three.js setup ---------- */
const canvas = document.getElementById('scene');
const renderer = createRenderer(canvas);
const scene = createScene();
const camera = createCamera();

const { starsNear, starsFar } = createStarfields(scene);
const nebulae = createNebulae(scene);

const worldManager = new WorldManager(scene);
const flightController = new FlightController(camera, canvas);
flightController.onBoundaryHit = () => showToast('Has llegado al borde de tu universo ✦');

/* ---------- App state ---------- */
let worlds = [];
let introVisible = true;
let nearbyWorldId = null;
let currentSurfaceId = null;

const discoveryTracker = new DiscoveryTracker(document.getElementById('discovery-counter'));

/* ---------- Vista de superficie ---------- */
const surfaceView = new SurfaceView({
  onClose: () => closeSurface(),
  onEdit: () => { if (currentSurfaceId) formUI.open(worldManager.get(currentSurfaceId).data); },
  onDelete: async () => {
    if (!currentSurfaceId) return;
    if (!confirm('¿Eliminar este mundo para siempre?')) return;
    const id = currentSurfaceId;
    try {
      await deleteWorld(id);
    } catch (e) {
      console.error('[main] error eliminando mundo', e);
      showToast('No se pudo eliminar el mundo.');
      return;
    }
    worldManager.removeWorld(id);
    worlds = worlds.filter(w => w.id !== id);
    discoveryTracker.setTotal(worlds.length);
    closeSurface();
    showToast('El mundo se disolvió entre las estrellas');
  }
});

function openSurface(id) {
  const w = worldManager.get(id);
  if (!w) return;
  currentSurfaceId = id;
  hideProximityPrompt();
  surfaceView.open(w.data);
  discoveryTracker.markVisited(id);
  playPop();
}

function closeSurface() {
  surfaceView.close();
  currentSurfaceId = null;
}

/* ---------- Create / edit form ---------- */
const formUI = new WorldFormUI({
  onCreate: async (data) => {
    const created = await createWorld(data);
    worlds.push(created);
    worldManager.addWorld(created);
    discoveryTracker.setTotal(worlds.length);
  },
  onUpdate: async (id, data) => {
    const updated = await updateWorld(id, data);
    const idx = worlds.findIndex(w => w.id === id);
    if (idx !== -1) worlds[idx] = updated;
    worldManager.replaceWorld(id, updated);
  }
});
document.getElementById('btn-create').addEventListener('click', () => formUI.open(null));

/* ---------- Prompt de proximidad ---------- */
const proximityPrompt = document.getElementById('proximity-prompt');
const proximityNameEl = document.getElementById('proximity-name');
function showProximityPrompt(name) {
  proximityNameEl.textContent = name;
  proximityPrompt.classList.add('visible');
}
function hideProximityPrompt() {
  proximityPrompt.classList.remove('visible');
}
document.getElementById('proximity-btn').addEventListener('click', () => {
  if (nearbyWorldId) openSurface(nearbyWorldId);
});

/* ---------- Respawn ---------- */
document.getElementById('respawn-btn').addEventListener('click', () => flightController.respawn());

/* ---------- Click directo en un planeta ---------- */
const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
let downPos = null, downTime = 0;

canvas.addEventListener('pointerdown', (e) => {
  downPos = { x: e.clientX, y: e.clientY };
  downTime = performance.now();
});
canvas.addEventListener('pointerup', (e) => {
  if (!downPos) return;
  const dx = e.clientX - downPos.x, dy = e.clientY - downPos.y;
  const moved = Math.sqrt(dx * dx + dy * dy);
  const dt = performance.now() - downTime;
  downPos = null;
  if (moved > 8 || dt > 600) return;
  if (!flightController.enabled || surfaceView.isOpen || formUI.isOpen || introVisible) return;

  pointerNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointerNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObjects(worldManager.hitMeshes, false);
  if (!hits.length) return;
  const id = hits[0].object.userData.worldId;
  if (id === nearbyWorldId) openSurface(id);
  else showToast('Acércate más para leer este mundo ✦');
});

/* ---------- Hint ---------- */
function hideHint() { document.getElementById('hint').style.opacity = '0'; }
function hintTimer() { setTimeout(() => { if (!surfaceView.isOpen) hideHint(); }, 7000); }

/* ---------- Intro ---------- */
const introScreen = new IntroScreen({
  onStart: () => {
    introVisible = false;
    hintTimer();
  }
});

/* ---------- Controles táctiles ---------- */
initMobileControls(flightController);

/* ---------- Tocadiscos ---------- */
const recordPlayer = new RecordPlayer({
  audioEl: document.getElementById('audio-ambient'),
  root: document.getElementById('record-player'),
  playBtn: document.getElementById('record-play-btn'),
  trackNameEl: document.getElementById('record-track-name')
});

/* ---------- Carga inicial ---------- */
const loadingScreen = new LoadingScreen();
loadingScreen.run([
  { label: 'Cargando fuentes…', run: () => document.fonts ? document.fonts.ready : Promise.resolve() },
  {
    label: 'Conectando con el universo…',
    run: async () => { worlds = await fetchWorlds(); }
  },
  {
    label: 'Construyendo los mundos…',
    run: async () => {
      worldManager.rebuildAll(worlds);
      discoveryTracker.setTotal(worlds.length);
    }
  }
]).then(() => {
  introScreen.playEntrance();
});

/* ---------- Loop de animación ---------- */
const clock = new THREE.Clock();

function updateProximity() {
  const nearest = worldManager.nearestWithin(camera.position, PROXIMITY_RADIUS);
  if (nearest) {
    nearbyWorldId = nearest.world.data.id;
    showProximityPrompt(nearest.world.data.name);
  } else {
    nearbyWorldId = null;
    hideProximityPrompt();
  }
}

function animate() {
  requestAnimationFrame(animate);
  // OJO: getElapsedTime() internamente ya llama a getDelta() y consume el
  // intervalo — llamar a ambos por frame deja el segundo con ~0s siempre.
  // Un solo getDelta() por frame, y el tiempo total desde su propiedad.
  const dt = Math.min(clock.getDelta(), 0.1);
  const t = clock.elapsedTime;

  // Única fuente de verdad: el vuelo solo está activo cuando no hay
  // intro/formulario/vista de superficie tapando la pantalla.
  flightController.enabled = !introVisible && !surfaceView.isOpen && !formUI.isOpen;

  flightController.update(dt);
  worldManager.animate(t, dt);
  if (flightController.enabled) updateProximity();
  else { nearbyWorldId = null; hideProximityPrompt(); }

  starsNear.rotation.y += dt * 0.004;
  starsFar.rotation.y -= dt * 0.0018;

  nebulae.forEach((n, i) => { n.material.rotation += dt * 0.01 * (i % 2 === 0 ? 1 : -1); });

  renderer.render(scene, camera);
}
animate();

/* ---------- Resize / teclas ---------- */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (formUI.isOpen) formUI.close();
    else if (surfaceView.isOpen) closeSurface();
  }
});
