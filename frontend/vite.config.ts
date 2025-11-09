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
        // Simplified chunking - keep React in main bundle to avoid loading order issues
        manualChunks: (id: string) => {
          if (id.includes('node_modules')) {
            // Keep React and React-DOM in main bundle (don't split them)
            // This ensures React is always available before other chunks load
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return; // Keep in main bundle
            }
            
            // Split other large libraries
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
              return 'redux-vendor';
            }
            if (id.includes('react-router')) {
              return 'react-router';
            }
            if (id.includes('react-select')) {
              return 'select-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('@stripe')) {
              return 'payment-vendor';
            }
            if (id.includes('socket.io-client')) {
              return 'socket-vendor';
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

