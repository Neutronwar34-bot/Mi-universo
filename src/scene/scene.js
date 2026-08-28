import * as THREE from 'three';

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  return renderer;
}

export function createScene() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x080a17, 0.0032);

  const ambient = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambient);
  const keyLight = new THREE.PointLight(0xfff2d9, 1.4, 300);
  keyLight.position.set(30, 40, 20);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0x8fa8ff, 0.6, 300);
  rimLight.position.set(-40, -20, -30);
  scene.add(rimLight);

  return scene;
}

function buildStarfield(count, radiusMin, radiusMax, size, opacity) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [
    new THREE.Color('#ffffff'), new THREE.Color('#dfe6ff'),
    new THREE.Color('#ffe9c7'), new THREE.Color('#e6d8ff')
  ];
  for (let i = 0; i < count; i++) {
    const r = radiusMin + Math.random() * (radiusMax - radiusMin);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size, vertexColors: true, transparent: true, opacity,
    sizeAttenuation: true, depthWrite: false
  });
  return new THREE.Points(geo, mat);
}

export function createStarfields(scene) {
  const starsNear = buildStarfield(2600, 60, 260, 0.55, 0.9);
  const starsFar = buildStarfield(1800, 260, 500, 1.1, 0.55);
  scene.add(starsNear, starsFar);
  return { starsNear, starsFar };
}

function makeNebulaTexture(colorA, colorB) {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  g.addColorStop(0, colorA);
  g.addColorStop(0.45, colorB);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  return new THREE.CanvasTexture(c);
}

function addNebula(scene, colorA, colorB, pos, scale, opacity) {
  const tex = makeNebulaTexture(colorA, colorB);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.position.copy(pos);
  sprite.scale.set(scale, scale, 1);
  scene.add(sprite);
  return sprite;
}

export function createNebulae(scene) {
  return [
    addNebula(scene, 'rgba(140,110,220,0.55)', 'rgba(60,40,120,0)', new THREE.Vector3(-90, 30, -160), 260, 0.5),
    addNebula(scene, 'rgba(217,138,146,0.5)', 'rgba(120,40,70,0)', new THREE.Vector3(120, -40, -200), 300, 0.4),
    addNebula(scene, 'rgba(127,179,163,0.5)', 'rgba(30,80,70,0)', new THREE.Vector3(0, 90, -260), 340, 0.35)
  ];
}
