import * as THREE from 'three';

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 800);
  return camera;
}
