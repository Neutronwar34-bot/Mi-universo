import gsap from 'gsap';
import { CHAR_LABELS, makeCharacterCanvas } from '../scene/characters.js';

function lighten(hex, amt) {
  // pequeño ajuste manual sin depender de THREE aquí
  const c = hex.replace('#', '');
  const num = parseInt(c, 16);
  let r = (num >> 16) + Math.round(255 * amt);
  let g = ((num >> 8) & 0xff) + Math.round(255 * amt);
  let b = (num & 0xff) + Math.round(255 * amt);
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Vista de "superficie del planeta": fondo con los colores del mundo,
// personaje 2D animado (paper-cutout, estilo Paper Mario) y la carta como
// un panel de diálogo anclado abajo. Sin botón de "siguiente mundo": hay
// que acercarse a cada planeta para leerlo.
export class SurfaceView {
  constructor({ onClose, onEdit, onDelete }) {
    this.wrap = document.getElementById('surface-view');
    this.backdrop = document.getElementById('surface-backdrop');
    this.ground = document.getElementById('surface-ground');
    this.charCanvas = document.getElementById('surface-character');
    this.charWrap = document.getElementById('surface-character-wrap');
    this.dialogue = document.getElementById('surface-dialogue');
    this.isOpen = false;

    document.getElementById('surface-close').addEventListener('click', () => onClose());
    document.getElementById('btn-edit-world-surface').addEventListener('click', () => onEdit());
    document.getElementById('btn-delete-world-surface').addEventListener('click', () => onDelete());
  }

  open(worldData) {
    const d = worldData;

    this.backdrop.style.background =
      `linear-gradient(180deg, ${lighten(d.colorA, 0.25)} 0%, ${d.colorA} 45%, ${d.colorB} 100%)`;
    this.ground.style.background =
      `radial-gradient(ellipse at 50% 0%, ${d.colorB} 0%, ${lighten(d.colorB, -0.18)} 70%)`;

    const charCanvas = makeCharacterCanvas(d.character, d.colorB, d.accent || d.colorA, { shadow: false });
    const ctx = this.charCanvas.getContext('2d');
    this.charCanvas.width = 256; this.charCanvas.height = 256;
    ctx.clearRect(0, 0, 256, 256);
    ctx.drawImage(charCanvas, 0, 0, 256, 256);

    document.getElementById('surface-eyebrow').textContent = CHAR_LABELS[d.character] || '✦';
    document.getElementById('surface-title').textContent = d.name;
    document.getElementById('surface-subtitle').textContent = d.subtitle;
    document.getElementById('surface-body').textContent = d.letter;
    document.getElementById('btn-edit-world-surface').style.display = d.custom ? 'inline-block' : 'none';
    document.getElementById('btn-delete-world-surface').style.display = d.custom ? 'inline-block' : 'none';

    this.wrap.style.display = 'flex';
    this.isOpen = true;

    gsap.fromTo(this.backdrop, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' });
    gsap.fromTo(this.charWrap, { opacity: 0, y: 40, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.4)', delay: 0.15 });
    gsap.fromTo(this.dialogue, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.3 });
  }

  close() {
    if (!this.isOpen) { this.wrap.style.display = 'none'; return; }
    this.isOpen = false;
    gsap.to(this.dialogue, { opacity: 0, y: 20, duration: 0.25, ease: 'power2.in' });
    gsap.to(this.charWrap, { opacity: 0, y: 20, duration: 0.25, ease: 'power2.in' });
    gsap.to(this.backdrop, {
      opacity: 0, duration: 0.35, ease: 'power2.in', delay: 0.05,
      onComplete: () => { this.wrap.style.display = 'none'; }
    });
  }
}
