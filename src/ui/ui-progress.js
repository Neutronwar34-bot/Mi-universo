const STORAGE_KEY = 'principito_discovered_v1';

function loadDiscovered() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) { return new Set(); }
}
function saveDiscovered(set) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...set])); } catch (e) { /* noop */ }
}

// Pequeño contador de "mundos descubiertos: X/Y" tipo logro de videojuego.
export class DiscoveryTracker {
  constructor(el) {
    this.el = el;
    this.discovered = loadDiscovered();
  }

  setTotal(total) {
    this.total = total;
    this.render();
  }

  markVisited(id) {
    if (this.discovered.has(id)) return;
    this.discovered.add(id);
    saveDiscovered(this.discovered);
    this.render();
  }

  render() {
    if (!this.el) return;
    this.el.textContent = `mundos descubiertos: ${this.discovered.size}/${this.total || 0}`;
  }
}
