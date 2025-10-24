import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
  ],
  esbuild: {
    // Skip TypeScript checking during build for faster deployment
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable source maps for production debugging
    sourcemap: mode === 'development',
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (id.includes('react-router-dom')) {
              return 'router-vendor'
            }
            if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('zod')) {
              return 'form-vendor'
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor'
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase-vendor'
            }
            if (id.includes('zustand')) {
              return 'state-vendor'
            }
            return 'vendor'
          }
        },
      },
    },
    // Optimize build performance
    target: 'esnext',
    minify: 'esbuild',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dev server
  server: {
    hmr: {
      overlay: false,
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'zustand',
      'react-hook-form',
      'zod',
    ],
  },
}))
