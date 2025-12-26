import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
