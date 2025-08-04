import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { codeInspectorPlugin } from 'code-inspector-plugin';

// Development server for testing extension pages with code inspector
export default defineConfig({
  root: '.',
  plugins: [
    react(),
    codeInspectorPlugin({ bundler: 'vite' })
  ],
  resolve: {
    alias: {
      '@src': resolve(__dirname, 'pages/popup/src'),
      '@extension/storage': resolve(__dirname, 'packages/storage/dist'),
      '@extension/shared': resolve(__dirname, 'packages/shared/dist'),
      '@extension/i18n': resolve(__dirname, 'packages/i18n/dist'),
      '@extension/ui': resolve(__dirname, 'packages/ui/dist'),
      '@extension/env': resolve(__dirname, 'packages/env/dist'),
    }
  },
  server: {
    port: 3000,
    open: '/dev/popup-dev.html'
  },
  build: {
    outDir: 'dev-dist',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});