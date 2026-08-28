import * as THREE from 'three';
import gsap from 'gsap';

const GOLDEN_ANGLE = 2.399963229728653;

// Distribución en espiral acotada (tipo filotaxis): el radio crece con la
// raíz del índice, así que aunque se agreguen cientos de mundos custom
// nunca se sale del BOUNDARY_RADIUS del vuelo libre (ver flightControls.js).
const MIN_RADIUS = 13;
const RADIUS_GROWTH = 5.2;

export function computeWorldPosition(index) {
  const radius = MIN_RADIUS + Math.sqrt(index) * RADIUS_GROWTH;
  const angle = index * GOLDEN_ANGLE;
  const height = Math.sin(index * 1.35) * 6 + Math.cos(index * 0.5) * 4;
  return new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const TEXTURE_STYLES = ['watercolor', 'banded', 'cratered', 'swirl'];

function pickTextureStyle(id) {
  return TEXTURE_STYLES[hashString(String(id)) % TEXTURE_STYLES.length];
}
function hasRing(id) {
  return hashString('ring:' + id) % 5 === 0; // ~1 de cada 5 mundos
}

function planetBase(ctx, colorA, colorB) {
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, colorA); grad.addColorStop(1, colorB);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 512, 256);
}

function paintWatercolor(ctx) {
  for (let i = 0; i < 14; i++) {
    const x = Math.random() * 512, y = Math.random() * 256, r = 30 + Math.random() * 90;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const light = Math.random() > 0.5;
    g.addColorStop(0, light ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.10)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.6, Math.random() * Math.PI, 0, Math.PI * 2); ctx.fill();
  }
}

function paintBanded(ctx) {
  const bands = 7 + Math.floor(Math.random() * 4);
  for (let i = 0; i < bands; i++) {
    const y = (i / bands) * 256;
    const h = 256 / bands;
    const light = i % 2 === 0;
    ctx.fillStyle = light ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 512; x += 32) {
      ctx.lineTo(x, y + Math.sin(x * 0.03 + i) * 6);
    }
    ctx.lineTo(512, y + h); ctx.lineTo(0, y + h); ctx.closePath();
    ctx.fill();
  }
}

function paintCratered(ctx) {
  for (let i = 0; i < 22; i++) {
    const x = Math.random() * 512, y = Math.random() * 256, r = 6 + Math.random() * 22;
    ctx.fillStyle = 'rgba(0,0,0,0.14)';
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(x - r * 0.25, y - r * 0.25, r * 0.7, r * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
  }
}

function paintSwirl(ctx) {
  ctx.save();
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)';
    ctx.lineWidth = 10 + Math.random() * 8;
    ctx.beginPath();
    const yBase = Math.random() * 256;
    for (let x = -20; x <= 532; x += 16) {
      const y = yBase + Math.sin(x * 0.02 + i * 1.7) * 40;
      x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function makePlanetTexture(colorA, colorB, style) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const ctx = c.getContext('2d');
  planetBase(ctx, colorA, colorB);
  if (style === 'banded') paintBanded(ctx);
  else if (style === 'cratered') paintCratered(ctx);
  else if (style === 'swirl') paintSwirl(ctx);
  else paintWatercolor(ctx);

  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(256, 128, 40 + i * 46, 128, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

function makeRingTexture(colorA) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 32;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.5, colorA);
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  for (let i = 0; i < 40; i++) {
    ctx.globalAlpha = 0.3 + Math.random() * 0.5;
    const y = Math.random() * 32;
    ctx.fillRect(0, y, 256, 1 + Math.random() * 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Gestiona los objetos 3D de cada mundo: solo el planeta (+ halo y, a
// veces, un anillo) — el personaje ya NO vive superpuesto en la escena;
// se dibuja en la vista de superficie (ui-surface.js) al acercarse.
export class WorldManager {
  constructor(scene) {
    this.scene = scene;
    this.worldGroups = new Map();
    this.hitMeshes = [];
    this.orderedIds = [];
  }

  get(id) {
    return this.worldGroups.get(id);
  }

  buildWorldObject(data, index, animateIn) {
    const pos = computeWorldPosition(index);
    const group = new THREE.Group();
    group.position.copy(pos);
    this.scene.add(group);

    const size = data.size || 1.15;
    const style = pickTextureStyle(data.id);

    const geo = new THREE.SphereGeometry(size, 40, 40);
    const tex = makePlanetTexture(data.colorA, data.colorB, style);
    const mat = new THREE.MeshStandardMaterial({
      map: tex, roughness: 0.85, metalness: 0.05,
      emissive: new THREE.Color(data.colorA), emissiveIntensity: 0.1
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.z = Math.random() * 0.6 - 0.3;
    group.add(mesh);

    const glowGeo = new THREE.SphereGeometry(size * 1.22, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(data.colorA), transparent: true, opacity: 0.16,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(glow);

    let ring = null;
    if (hasRing(data.id)) {
      const ringGeo = new THREE.RingGeometry(size * 1.5, size * 2.1, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        map: makeRingTexture(data.accent || data.colorA),
        transparent: true, side: THREE.DoubleSide, opacity: 0.8, depthWrite: false
      });
      ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.4;
      ring.rotation.z = Math.random() * Math.PI;
      group.add(ring);
    }

    const hitGeo = new THREE.SphereGeometry(size * 1.9, 16, 16);
    const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
    const hit = new THREE.Mesh(hitGeo, hitMat);
    hit.userData.worldId = data.id;
    group.add(hit);
    this.hitMeshes.push(hit);

    if (animateIn) {
      group.scale.setScalar(0.001);
      gsap.to(group.scale, { x: 1, y: 1, z: 1, duration: 1.1, ease: 'elastic.out(1,0.6)', delay: 0.05 });
    }

    this.worldGroups.set(data.id, { group, mesh, glow, ring, hit, data, bobPhase: Math.random() * 10 });
    return group;
  }

  rebuildAll(worlds) {
    this.hitMeshes.length = 0;
    this.worldGroups.forEach(w => this.scene.remove(w.group));
    this.worldGroups.clear();
    this.orderedIds = worlds.map(w => w.id);
    worlds.forEach((w, i) => this.buildWorldObject(w, i, false));
  }

  addWorld(data, index) {
    this.orderedIds.push(data.id);
    this.buildWorldObject(data, index, true);
  }

  replaceWorld(id, newData, index) {
    const w = this.worldGroups.get(id);
    if (!w) return;
    this.scene.remove(w.group);
    this.worldGroups.delete(id);
    this.hitMeshes = this.hitMeshes.filter(h => h.userData.worldId !== id);
    this.buildWorldObject(newData, index, true);
  }

  removeWorld(id) {
    const w = this.worldGroups.get(id);
    if (!w) return;
    this.scene.remove(w.group);
    this.worldGroups.delete(id);
    this.orderedIds = this.orderedIds.filter(x => x !== id);
    this.hitMeshes = this.hitMeshes.filter(h => h.userData.worldId !== id);
  }

  // Mundo más cercano a `position` dentro de `radius`, o null.
  nearestWithin(position, radius) {
    let best = null, bestDist = Infinity;
    this.worldGroups.forEach(w => {
      const d = position.distanceTo(w.group.position) - (w.data.size || 1.15);
      if (d < radius && d < bestDist) { bestDist = d; best = w; }
    });
    return best ? { world: best, distance: bestDist } : null;
  }

  animate(t, dt) {
    this.worldGroups.forEach(w => {
      w.mesh.rotation.y += dt * 0.12;
      if (w.ring) w.ring.rotation.z += dt * 0.03;
    });
  }
}
