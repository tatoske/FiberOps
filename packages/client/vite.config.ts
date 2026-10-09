import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@fiberops/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
  },
  server: {
    port: 5180,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3011',
        changeOrigin: true,
      },
    },
  },
});
