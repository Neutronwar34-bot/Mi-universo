import gsap from 'gsap';
import * as THREE from 'three';
import { CHAR_LABELS } from '../scene/characters.js';
import { showToast } from './ui-toast.js';

function lighten(hex, amt) {
  const c = new THREE.Color(hex);
  const hsl = {}; c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.min(1, hsl.l + amt));
  return '#' + c.getHexString();
}

export class WorldFormUI {
  constructor({ onCreate, onUpdate }) {
    this.onCreate = onCreate;
    this.onUpdate = onUpdate;
    this.wrap = document.getElementById('form-wrap');
    this.card = document.getElementById('form-card');
    this.isOpen = false;
    this.editingId = null;
    this.selectedChar = 'rose';

    this.charChipsWrap = document.getElementById('char-preview');
    Object.keys(CHAR_LABELS).forEach(key => {
      const chip = document.createElement('div');
      chip.className = 'char-chip' + (key === this.selectedChar ? ' active' : '');
      chip.textContent = CHAR_LABELS[key];
      chip.dataset.char = key;
      chip.addEventListener('click', () => {
        this.selectedChar = key;
        [...this.charChipsWrap.children].forEach(c => c.classList.toggle('active', c.dataset.char === key));
      });
      this.charChipsWrap.appendChild(chip);
    });

    document.getElementById('f-size').addEventListener('input', (e) => {
      document.getElementById('f-size-val').textContent = parseFloat(e.target.value).toFixed(2);
    });

    document.getElementById('btn-cancel-form').addEventListener('click', () => this.close());
    document.getElementById('form-backdrop').addEventListener('click', () => this.close());
    document.getElementById('btn-submit-form').addEventListener('click', () => this.submit());
  }

  open(worldData) {
    this.editingId = worldData ? worldData.id : null;
    const title = document.getElementById('form-title');
    const submitBtn = document.getElementById('btn-submit-form');

    if (worldData) {
      title.textContent = 'Editar mundo';
      submitBtn.textContent = 'Guardar cambios ✦';
      document.getElementById('f-name').value = worldData.name;
      document.getElementById('f-subtitle').value = worldData.subtitle;
      document.getElementById('f-letter').value = worldData.letter;
      document.getElementById('f-color1').value = worldData.colorA;
      document.getElementById('f-color2').value = worldData.accent || worldData.colorB;
      document.getElementById('f-size').value = worldData.size;
      document.getElementById('f-size-val').textContent = worldData.size.toFixed(2);
      this.selectedChar = worldData.character;
    } else {
      title.textContent = 'Crear un mundo nuevo';
      submitBtn.textContent = 'Crear mundo ✦';
      document.getElementById('f-name').value = '';
      document.getElementById('f-subtitle').value = '';
      document.getElementById('f-letter').value = '';
      document.getElementById('f-color1').value = '#e8b4bc';
      document.getElementById('f-color2').value = '#8a6bbf';
      document.getElementById('f-size').value = 1.15;
      document.getElementById('f-size-val').textContent = '1.15';
      this.selectedChar = 'rose';
    }
    [...this.charChipsWrap.children].forEach(c => c.classList.toggle('active', c.dataset.char === this.selectedChar));

    this.wrap.style.display = 'flex';
    this.isOpen = true;
    gsap.fromTo(this.card, { opacity: 0, scale: 0.9, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' });
    gsap.fromTo('#form-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.4 });
  }

  close() {
    this.isOpen = false;
    gsap.to(this.card, {
      opacity: 0, scale: 0.92, y: 14, duration: 0.3, ease: 'power2.in',
      onComplete: () => { this.wrap.style.display = 'none'; }
    });
  }

  async submit() {
    const name = document.getElementById('f-name').value.trim();
    const subtitle = document.getElementById('f-subtitle').value.trim();
    const letter = document.getElementById('f-letter').value.trim();
    const color1 = document.getElementById('f-color1').value;
    const color2 = document.getElementById('f-color2').value;
    const size = parseFloat(document.getElementById('f-size').value);

    if (!name || !letter) {
      showToast('Ponle al menos un nombre y una carta ✦');
      return;
    }

    const worldData = {
      name, subtitle, letter,
      character: this.selectedChar,
      colorA: color1,
      colorB: lighten(color1, -0.12),
      accent: color2,
      size
    };

    const submitBtn = document.getElementById('btn-submit-form');
    submitBtn.disabled = true;
    try {
      if (this.editingId) {
        await this.onUpdate(this.editingId, worldData);
        showToast('Mundo actualizado ✦');
      } else {
        await this.onCreate(worldData);
        showToast('Tu mundo ha nacido ✦');
      }
      this.close();
    } catch (err) {
      console.error('[ui-form] Error guardando mundo', err);
      showToast('No se pudo guardar el mundo. Intenta de nuevo.');
    } finally {
      submitBtn.disabled = false;
    }
  }
}
