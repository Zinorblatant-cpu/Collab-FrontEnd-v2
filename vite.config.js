import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    proxy: {
      '/auth':    { target: 'http://localhost:3001', changeOrigin: true },
      '/users':   { target: 'http://localhost:3001', changeOrigin: true },
      '/courses': { target: 'http://localhost:3001', changeOrigin: true },
      '/lessons': { target: 'http://localhost:3001', changeOrigin: true },
      '/health':  { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
});
