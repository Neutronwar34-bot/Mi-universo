// Controles táctiles: flechitas para moverse + botones para subir/bajar.
// Se muestran solo en pantallas táctiles vía CSS (ver #mobile-controls en
// style.css); aquí solo se conecta la entrada al FlightController.
export function initMobileControls(flightController) {
  const buttons = document.querySelectorAll('#mobile-controls [data-dir]');
  buttons.forEach(btn => {
    const dir = btn.dataset.dir;
    const start = (e) => { e.preventDefault(); flightController.setTouchInput(dir, true); btn.classList.add('active'); };
    const end = (e) => { e.preventDefault(); flightController.setTouchInput(dir, false); btn.classList.remove('active'); };
    btn.addEventListener('pointerdown', start);
    btn.addEventListener('pointerup', end);
    btn.addEventListener('pointerleave', end);
    btn.addEventListener('pointercancel', end);
  });
}
