import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: './', // relative assets for Android WebView
  build: {
    outDir: '../app/src/main/assets/web',
    emptyOutDir: true,
  }
});
