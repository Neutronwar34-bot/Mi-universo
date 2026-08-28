import { defineConfig } from 'vite';

// Repo se sirve en GitHub Pages como https://<user>.github.io/Mi-universo/,
// así que en build necesita ese base path; en dev queda en la raíz.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Mi-universo/' : '/',
  server: {
    port: 5173,
    open: false
  }
}));
