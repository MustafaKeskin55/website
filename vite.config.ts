import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'admin-src',
  plugins: [react()],
  base: './',
  build: {
    outDir: '../admin',
    emptyOutDir: true,
  }
});
