import gsap from 'gsap';

// Pantalla de carga con progreso real: cada paso reporta cuándo termina y
// esto mueve la barra. Al terminar, se desvanece y deja ver la intro.
export class LoadingScreen {
  constructor() {
    this.el = document.getElementById('loading');
    this.bar = document.getElementById('loading-bar');
    this.label = document.getElementById('loading-label');
    this.progress = 0;
  }

  setProgress(pct, label) {
    this.progress = Math.min(1, pct);
    gsap.to(this.bar, { scaleX: this.progress, duration: 0.4, ease: 'power2.out' });
    if (label) this.label.textContent = label;
  }

  async run(steps) {
    this.setProgress(0, steps[0]?.label || 'Cargando…');
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      this.setProgress(i / steps.length, step.label);
      try {
        await step.run();
      } catch (e) {
        console.error('[loading] paso falló:', step.label, e);
      }
    }
    this.setProgress(1, 'Listo ✦');
    await new Promise(r => setTimeout(r, 250));
    await new Promise(resolve => {
      gsap.to(this.el, {
        opacity: 0, duration: 0.7, ease: 'power2.inOut',
        onComplete: () => { this.el.style.display = 'none'; resolve(); }
      });
    });
  }
}
