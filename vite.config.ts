import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { execSync } from 'node:child_process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Generate build ID from git commit or fallback to timestamp
  // Use stable ID in development to prevent service worker refresh loops
  let buildId: string;
  try {
    buildId = mode === 'development' ? 'dev-stable' : execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    buildId = mode === 'development' ? 'dev-stable' : Date.now().toString();
  }

  return {
    // Use root base in dev for stable HMR/WS; GH Pages base in build
    base: mode === 'development' ? '/' : '/homework-app/',
    plugins: [react()],
    define: {
      __BUILD_ID__: JSON.stringify(buildId),
    },
    build: {
      rollupOptions: {
        input: {
          main: fileURLToPath(new URL('./index.html', import.meta.url)),
          sw: fileURLToPath(new URL('./src/sw.ts', import.meta.url)),
        },
        output: {
          entryFileNames: (chunkInfo) => {
            return chunkInfo.name === 'sw' ? 'sw.js' : 'assets/[name]-[hash].js';
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5000,
      hmr: {
        port: 5000,
      },
      allowedHosts: ['1755e6d3-6953-4f17-a66c-a7d844f91178-00-3n90unkyc9g08.kirk.replit.dev'],
    },
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['tests/**/*.spec.ts', 'tests/**/*.spec.tsx'],
      setupFiles: ['tests/setup.ts'],
      pool: 'threads',
      minWorkers: 1,
      maxWorkers: 1,
    },
  };
});
