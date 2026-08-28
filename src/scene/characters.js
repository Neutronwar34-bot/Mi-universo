import * as THREE from 'three';

export const CHAR_LABELS = {
  rose: '🌹 Rosa', fox: '🦊 Zorro', king: '👑 Rey', lamplighter: '🏮 Farolero',
  star: '⭐ Estrella', bird: '🐦 Ave', moon: '🌙 Luna', book: '📖 Narrador'
};

const OUTLINE = '#fdf6e3';

function baseCanvas() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  return { c, ctx: c.getContext('2d') };
}

function outlinedPath(ctx, drawPathFn, fill, outline) {
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = outline; ctx.lineWidth = 7;
  drawPathFn(); ctx.stroke();
  ctx.fillStyle = fill;
  drawPathFn(); ctx.fill();
}

const CHAR_DRAWERS = {
  rose(ctx, main, accent) {
    ctx.save(); ctx.translate(128, 210);
    outlinedPath(ctx, () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(10, -40, -4, -78); ctx.lineTo(6, -78); ctx.quadraticCurveTo(20, -40, 10, 0); ctx.closePath(); }, '#8bb06a', OUTLINE);
    ctx.translate(0, -96);
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const x = Math.cos(ang) * 30, y = Math.sin(ang) * 22;
      outlinedPath(ctx, () => { ctx.beginPath(); ctx.ellipse(x, y, 26, 20, ang, 0, Math.PI * 2); }, main, OUTLINE);
    }
    outlinedPath(ctx, () => { ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); }, accent, OUTLINE);
    ctx.restore();
  },
  fox(ctx, main, accent) {
    ctx.save(); ctx.translate(128, 190);
    outlinedPath(ctx, () => { ctx.beginPath(); ctx.moveTo(-70, 10); ctx.quadraticCurveTo(-90, -30, -40, -40); ctx.quadraticCurveTo(-10, -70, 40, -60); ctx.quadraticCurveTo(90, -40, 60, 10); ctx.quadraticCurveTo(0, 40, -70, 10); ctx.closePath(); }, main, OUTLINE);
    outlinedPath(ctx, () => { ctx.beginPath(); ctx.moveTo(-30, -52); ctx.lineTo(-48, -96); ctx.lineTo(-8, -64); ctx.closePath(); }, main, OUTLINE);
    outlinedPath(ctx, () => { ctx.beginPath(); ctx.moveTo(24, -58); ctx.lineTo(44, -100); ctx.lineTo(58, -56); ctx.closePath(); }, main, OUTLINE);
    outlinedPath(ctx, () => { ctx.beginPath(); ctx.ellipse(10, -10, 26, 18, 0.1, 0, Math.PI * 2); }, '#fdf6e3', OUTLINE);
    outlinedPath(ctx, () => { ctx.beginPath(); ctx.moveTo(-80, 20); ctx.quadraticCurveTo(-120, 10, -110, -30); ctx.quadraticCurveTo(-95, -10, -70, 10); ctx.closePath(); }, accent, OUTLINE);
    ctx.fillStyle = '#2b1c10'; ctx.beginPath(); ctx.arc(-6, -30, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(26, -34, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  },
  king(ctx, main, accent) {
    ctx.save(); ctx.translate(128, 220);
    outlinedPath(ctx, () => { ctx.beginPath(); ctx.moveTo(-56, -10); ctx.lineTo(-30, -110); ctx.lineTo(30, -110); ctx.lineTo(56, -10); ctx.closePath(); }, main, OUTLINE);
    outlinedPath(ctx, () => { ctx.beginPath(); ctx.arc(0, -128, 30, 0, Math.PI * 2); }, '#f0d3a8', OUTLINE);
    outlinedPath(ctx, () => { ctx.beginPath(); ctx.moveTo(-30, -150); ctx.lineTo(-30, -172); ctx.lineTo(-16, -158); ctx.lineTo(0, -178); ctx.lineTo(16, -158); ctx.lineTo(30, -172); ctx.lineTo(30, -150); ctx.closePath(); }, accent, OUTLINE);
    ctx.fillStyle = '#2b1c10'; ctx.beginPath(); ctx.arc(-10, -128, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, -128, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  },
  lamplighter(ctx, main, accent) {
    ctx.save(); ctx.translate(128, 220);
    outlinedPath(ctx, () => { ctx.beginPath(); ctx.roundRect(-34, -96, 68, 96, 10); }, main, OUTLINE);
    outlinedPath(ctx, () => { ctx.beginPath(); ctx.arc(0, -116, 26, 0, Math.PI * 2); }, '#f0d3a8', OUTLINE);
    outlinedPath(ctx, () => { ctx.beginPath(); ctx.roundRect(-26, -146, 52, 16, 6); }, accent, OUTLINE);
    outlinedPath(ctx, () => { ctx.beginPath(); ctx.roundRect(44, -70, 20, 30, 4); }, '#5c4a30', OUTLINE);
    ctx.save();
    ctx.fillStyle = accent; ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.arc(54, -84, 14, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(54, -84, 24, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#2b1c10'; ctx.beginPath(); ctx.arc(-8, -118, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -118, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  },
  star(ctx, main, accent) {
    ctx.save(); ctx.translate(128, 180);
    function starPath(r1, r2) {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const ang = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? r1 : r2;
        const x = Math.cos(ang) * r, y = Math.sin(ang) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
    }
    outlinedPath(ctx, () => starPath(70, 32), main, OUTLINE);
    ctx.fillStyle = accent; starPath(30, 14); ctx.fill();
    ctx.fillStyle = '#2b1c10'; ctx.beginPath(); ctx.arc(-14, 4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(14, 4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2b1c10'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 16, 10, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.restore();
  },
  bird(ctx, main, accent) {
    ctx.save(); ctx.translate(128, 200);
    outlinedPath(ctx, () => { ctx.beginPath(); ctx.ellipse(0, 0, 46, 34, 0, 0, Math.PI * 2); }, main, OUTLINE);
    outlinedPath(ctx, () => { ctx.beginPath(); ctx.moveTo(0, -10); ctx.quadraticCurveTo(60, -40, 50, 10); ctx.quadraticCurveTo(20, 10, 0, -10); }, accent, OUTLINE);
    outlinedPath(ctx, () => { ctx.beginPath(); ctx.arc(-30, -24, 20, 0, Math.PI * 2); }, main, OUTLINE);
    ctx.fillStyle = accent; ctx.beginPath(); ctx.moveTo(-46, -24); ctx.lineTo(-64, -18); ctx.lineTo(-46, -12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2b1c10'; ctx.beginPath(); ctx.arc(-34, -28, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  },
  moon(ctx, main, accent) {
    ctx.save(); ctx.translate(128, 180);
    ctx.fillStyle = main;
    ctx.beginPath(); ctx.arc(0, 0, 64, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 64, 0, Math.PI * 2); ctx.stroke();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(24, -14, 54, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(-24, 14, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-8, 30, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  },
  book(ctx, main, accent) {
    ctx.save(); ctx.translate(128, 190);
    outlinedPath(ctx, () => { ctx.beginPath(); ctx.roundRect(-56, -70, 112, 90, 8); }, main, OUTLINE);
    ctx.fillStyle = '#fdf6e3'; ctx.fillRect(-48, -62, 96, 74);
    ctx.strokeStyle = 'rgba(59,44,26,0.25)'; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-40, -44 + i * 18); ctx.lineTo(40, -44 + i * 18); ctx.stroke(); }
    ctx.fillStyle = accent; ctx.beginPath(); ctx.moveTo(-10, -70); ctx.lineTo(10, -70); ctx.lineTo(10, -30); ctx.lineTo(0, -42); ctx.lineTo(-10, -30); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
};

// Dibuja el personaje en un canvas 2D crudo (para usar en el DOM, ej. la
// vista de superficie estilo Paper Mario) o para envolver en textura THREE.
export function makeCharacterCanvas(type, main, accent, { shadow = true } = {}) {
  const { c, ctx } = baseCanvas();
  if (shadow) {
    ctx.save();
    ctx.globalAlpha = 0.28; ctx.fillStyle = '#000000';
    ctx.beginPath(); ctx.ellipse(128, 244, 52, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  (CHAR_DRAWERS[type] || CHAR_DRAWERS.star)(ctx, main, accent);
  return c;
}

export function makeCharacterTexture(type, main, accent) {
  const c = makeCharacterCanvas(type, main, accent);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
