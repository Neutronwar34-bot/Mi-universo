import * as THREE from 'three';

const UP = new THREE.Vector3(0, 1, 0);

function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

export const SPAWN_POS = new THREE.Vector3(0, 6, 34);
export const SPAWN_YAW = 0; // cámara por defecto mira hacia -Z, spawn está en +Z: ya mira al origen
export const SPAWN_PITCH = -0.12;

// Debe quedar cómodamente por fuera de donde `computeWorldPosition` deja de
// generar mundos (ver worlds.js: MIN_RADIUS + sqrt(index)*RADIUS_GROWTH) —
// así el jugador nota "hasta acá llega el universo" en vez de un corte feo.
export const BOUNDARY_RADIUS = 165;

const LOOK_SENSITIVITY = 0.0034;
const MAX_PITCH = 1.35;
const ACCEL = 60;
const DAMPING = 8;

// Vuelo libre estilo "nave": WASD/flechas mueven en el plano horizontal
// relativo a hacia dónde mira la cámara, Space/Shift (o botones táctiles)
// suben/bajan, y arrastrar (mouse o touch) mira alrededor. Todo queda
// acotado a BOUNDARY_RADIUS desde el punto de spawn.
export class FlightController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.dom = domElement;
    this.enabled = false;

    this.yaw = SPAWN_YAW;
    this.pitch = SPAWN_PITCH;
    this.camera.position.copy(SPAWN_POS);

    this.keys = new Set();
    this.touchInput = { forward: 0, back: 0, left: 0, right: 0, up: 0, down: 0 };
    this.velocity = new THREE.Vector3();

    this.isDragging = false;
    this.dragMoved = 0;
    this._lastX = 0;
    this._lastY = 0;

    this.onBoundaryHit = null;
    this._hitBoundaryOnce = false;

    this._onKeyDown = (e) => { if (isTypingTarget(e.target)) return; this.keys.add(e.code); };
    this._onKeyUp = (e) => { this.keys.delete(e.code); };
    this._onPointerDown = (e) => {
      this.isDragging = true;
      this.dragMoved = 0;
      this._lastX = e.clientX; this._lastY = e.clientY;
    };
    this._onPointerMove = (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this._lastX;
      const dy = e.clientY - this._lastY;
      this._lastX = e.clientX; this._lastY = e.clientY;
      this.dragMoved += Math.abs(dx) + Math.abs(dy);
      this.yaw -= dx * LOOK_SENSITIVITY;
      this.pitch -= dy * LOOK_SENSITIVITY;
      this.pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, this.pitch));
    };
    this._onPointerUp = () => { this.isDragging = false; };

    this.dom.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    this._applyRotation();
  }

  setTouchInput(name, active) {
    this.touchInput[name] = active ? 1 : 0;
  }

  respawn() {
    this.yaw = SPAWN_YAW;
    this.pitch = SPAWN_PITCH;
    this.camera.position.copy(SPAWN_POS);
    this.velocity.set(0, 0, 0);
    this._applyRotation();
  }

  _applyRotation() {
    this.camera.quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
  }

  _readAxis(posKeys, negKeys, touchPos, touchNeg) {
    let v = 0;
    if (posKeys.some(k => this.keys.has(k)) || this.touchInput[touchPos]) v += 1;
    if (negKeys.some(k => this.keys.has(k)) || this.touchInput[touchNeg]) v -= 1;
    return v;
  }

  update(dt) {
    if (!this.enabled) return;
    this._applyRotation();

    const fwdInput = this._readAxis(['KeyW', 'ArrowUp'], ['KeyS', 'ArrowDown'], 'forward', 'back');
    const rightInput = this._readAxis(['KeyD', 'ArrowRight'], ['KeyA', 'ArrowLeft'], 'right', 'left');
    const upInput = this._readAxis(['Space'], ['ShiftLeft', 'ShiftRight', 'ControlLeft'], 'up', 'down');

    const forwardYaw = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, this.yaw, 0, 'YXZ'));
    const right = forwardYaw.clone().cross(UP).normalize();

    const wish = new THREE.Vector3()
      .addScaledVector(forwardYaw, fwdInput)
      .addScaledVector(right, rightInput)
      .addScaledVector(UP, upInput);

    if (wish.lengthSq() > 0) wish.normalize();

    this.velocity.addScaledVector(wish, ACCEL * dt);
    // Amortiguación exponencial: siempre queda en (0,1], a diferencia de
    // "1 - DAMPING*dt" que se vuelve negativo (y anula toda la velocidad)
    // en cuanto el frame tarda más de 1/DAMPING segundos.
    this.velocity.multiplyScalar(Math.exp(-DAMPING * dt));
    const maxSpeed = 20;
    if (this.velocity.length() > maxSpeed) this.velocity.setLength(maxSpeed);

    this.camera.position.addScaledVector(this.velocity, dt);

    const dist = this.camera.position.length();
    if (dist > BOUNDARY_RADIUS) {
      this.camera.position.setLength(BOUNDARY_RADIUS);
      this.velocity.multiplyScalar(0.2);
      if (!this._hitBoundaryOnce) {
        this._hitBoundaryOnce = true;
        if (this.onBoundaryHit) this.onBoundaryHit();
      }
    }
  }

  dispose() {
    this.dom.removeEventListener('pointerdown', this._onPointerDown);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }
}
