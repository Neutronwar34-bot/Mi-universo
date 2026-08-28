import { tracks } from '../data/track.json';

// Tocadiscos fijo en una esquina: reproduce en cola los mp3 de
// public/audio/ (los coloca el usuario manualmente). Empieza en pausa
// siempre (autoplay con sonido lo bloquean los navegadores) y avanza de
// pista sola cuando una termina.
export class RecordPlayer {
  constructor({ audioEl, root, playBtn, trackNameEl }) {
    this.audio = audioEl;
    this.root = root;
    this.playBtn = playBtn;
    this.trackNameEl = trackNameEl;
    this.playing = false;
    this.tracks = tracks || [];
    this.index = this.tracks.length ? Math.floor(Math.random() * this.tracks.length) : 0;

    this.audio.loop = false;
    this.audio.volume = 0.28;

    if (!this.tracks.length) {
      this.root.classList.add('record-player--missing');
      this.trackNameEl.textContent = 'Agrega mp3 a public/audio/';
    } else {
      this.loadTrack(this.index);
    }

    this.playBtn.addEventListener('click', () => this.toggle());
    this.audio.addEventListener('ended', () => this.next());
    this.audio.addEventListener('error', () => {
      this.root.classList.add('record-player--missing');
      this.trackNameEl.textContent = 'No se pudo cargar la pista';
    });
  }

  loadTrack(index) {
    const t = this.tracks[index];
    if (!t) return;
    this.root.classList.remove('record-player--missing');
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    this.audio.src = encodeURI(base + t.src);
    this.trackNameEl.textContent = t.title || 'Música ambiente';
  }

  next() {
    if (!this.tracks.length) return;
    this.index = (this.index + 1) % this.tracks.length;
    this.loadTrack(this.index);
    if (this.playing) this.play();
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play();
  }

  play() {
    this.audio.play().then(() => {
      this.playing = true;
      this.root.classList.add('is-playing');
    }).catch(() => {
      this.root.classList.add('record-player--missing');
    });
  }

  pause() {
    this.audio.pause();
    this.playing = false;
    this.root.classList.remove('is-playing');
  }
}
