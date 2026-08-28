import gsap from 'gsap';

export class IntroScreen {
  constructor({ onStart }) {
    this.onStart = onStart;
    document.getElementById('intro-start').addEventListener('click', () => this.start());
  }

  playEntrance() {
    gsap.timeline({ delay: 0.15 })
      .to('#intro .eyebrow', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0)
      .fromTo('#intro h1', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, 0.15)
      .fromTo('#intro p', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, 0.35)
      .fromTo('#intro-start', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.55);
  }

  start() {
    gsap.to('#intro', {
      opacity: 0, duration: 0.9, ease: 'power2.inOut',
      onComplete: () => { document.getElementById('intro').style.display = 'none'; }
    });
    gsap.to('#top-bar', { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.4 });
    gsap.to('#hint', { opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.9 });
    if (this.onStart) this.onStart();
  }
}
