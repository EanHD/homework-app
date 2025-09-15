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

  const isProduction = mode === 'production';

  return {
    // Use root base in dev for stable HMR/WS; GH Pages base in build
    base: mode === 'development' ? '/' : '/homework-app/',
    plugins: [react()],
    define: {
      __BUILD_ID__: JSON.stringify(buildId),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    },
    build: {
      // Production optimizations
      minify: isProduction ? 'esbuild' : false,
      sourcemap: !isProduction, // Disable sourcemaps in production for smaller bundles
      target: 'es2020',
      cssCodeSplit: true,
      reportCompressedSize: true,
      brotliSize: false,
      
      // Performance budget enforcement
      chunkSizeWarningLimit: 500, // Warn if chunk > 500KB
      
      rollupOptions: {
        treeshake: true,
        input: {
          main: fileURLToPath(new URL('./index.html', import.meta.url)),
          sw: fileURLToPath(new URL('./src/sw.ts', import.meta.url)),
        },
        output: {
          entryFileNames: (chunkInfo) => {
            return chunkInfo.name === 'sw' ? 'sw.js' : 'assets/[name]-[hash].js';
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
          // Optimize chunk splitting for better caching
          manualChunks: {
            // Vendor chunk for large third-party libraries
            vendor: ['react', 'react-dom'],
            // Mantine UI chunk
            mantine: ['@mantine/core', '@mantine/hooks', '@mantine/notifications'],
            // Supabase chunk
            supabase: ['@supabase/supabase-js'],
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
    exclude: ['tests/e2e/**'],
    setupFiles: ['tests/setup.ts'],
    pool: 'threads',
    minWorkers: 1,
    maxWorkers: 1,
  },
  };
});
