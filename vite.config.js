import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    // Three.js va en su propio chunk, cargado sólo al abrir la órbita.
    chunkSizeWarningLimit: 900,
  },
});
