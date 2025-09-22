import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Désactive la mise en cache pour le développement
    cors: true,
    strictPort: true,
  },
  build: {
    target: 'es2015', // Cible ES2015 pour une meilleure compatibilité
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          'ui': ['@headlessui/react', '@heroicons/react'],
        },
      },
    },
  },
  // Configuration pour la gestion des polyfills
  optimizeDeps: {
    esbuildOptions: {
      // Pour la compatibilité avec Safari
      target: 'es2020',
      // Activation des fonctionnalités expérimentales
      supported: { 
        'top-level-await': true,
        'bigint': true,
      },
    },
  },
  // Désactive le hachage des noms de fichiers pour faciliter le débogage
  base: './',
})
