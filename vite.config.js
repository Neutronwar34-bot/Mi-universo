import { defineConfig } from 'vite';

// Vercel sirve el sitio en la raíz del dominio, así que base queda en '/'.
export default defineConfig({
  base: '/',
  server: {
    port: 5173,
    open: false
  }
});
