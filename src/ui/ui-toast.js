import gsap from 'gsap';

let toastTween;

export function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  if (toastTween) toastTween.kill();
  toastTween = gsap.timeline()
    .to(el, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
    .to(el, { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in', delay: 2.2 });
}
