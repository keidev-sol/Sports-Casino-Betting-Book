import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true, // bind 0.0.0.0 so VS Code port-forwarding / remote browsers can reach it
    strictPort: true, // fail loudly instead of silently hopping to 5174
    fs: {
      allow: ['..'], // allow importing from the sibling shared/ directory
    },
    proxy: {
      '/api': 'http://localhost:4000',
      '/ws': { target: 'ws://localhost:4000', ws: true },
    },
  },
});
