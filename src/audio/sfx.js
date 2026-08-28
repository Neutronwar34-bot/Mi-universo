// Efectos de interfaz sintetizados con Web Audio API (sin archivos de audio).
let ctx = null;
function getCtx() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioCtx();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Barrido de frecuencia descendente con ruido filtrado: sensación de "vuelo".
export function playWhoosh() {
  try {
    const c = getCtx();
    const now = c.currentTime;
    const bufferSize = c.sampleRate * 0.5;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = c.createBufferSource();
    noise.buffer = buffer;

    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.9;
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.exponentialRampToValueAtTime(220, now + 0.55);

    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    noise.connect(filter).connect(gain).connect(c.destination);
    noise.start(now);
    noise.stop(now + 0.55);
  } catch (e) { /* audio no disponible, silencioso */ }
}

// Tono suave ascendente tipo "pop" para abrir una carta.
export function playPop() {
  try {
    const c = getCtx();
    const now = c.currentTime;
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.14);

    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    osc.connect(gain).connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  } catch (e) { /* audio no disponible, silencioso */ }
}
