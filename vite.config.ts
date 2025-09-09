import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  // Set base for GitHub Pages. Defaults to '/' for local/dev builds.
  // When building on GitHub Actions, GITHUB_REPOSITORY is set (e.g., EanHD/homework-app).
  base: process.env.GITHUB_REPOSITORY?.endsWith('/homework-app') ? '/homework-app/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.spec.ts', 'tests/**/*.spec.tsx'],
    setupFiles: [],
    pool: 'threads',
    minWorkers: 1,
    maxWorkers: 1,
  },
});
