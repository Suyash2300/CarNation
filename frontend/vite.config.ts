import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html in dist folder
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        // Note: React must load before other chunks, so we keep it in main bundle or ensure proper order
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // Split large libraries into separate chunks
            // React will be in main bundle or react-vendor (loaded first via dependency)
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
              return 'redux-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('react-select')) {
              return 'select-vendor';
            }
            if (id.includes('@stripe')) {
              return 'payment-vendor';
            }
            if (id.includes('socket.io-client')) {
              return 'socket-vendor';
            }
            // React and React-DOM - keep together, will load first due to dependencies
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            // Other vendor libraries
            return 'vendor';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Minification
    minify: 'esbuild',
    // Target modern browsers for smaller bundle
    target: 'es2015',
    // CSS code splitting
    cssCodeSplit: true,
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    // Report compressed sizes
    reportCompressedSize: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'lucide-react',
      // Include react-select dependencies to fix module resolution
      'react-select',
      'hoist-non-react-statics',
    ],
  },
  // Resolve configuration for better module handling
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})

