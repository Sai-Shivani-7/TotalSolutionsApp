import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11'], // Add your own list of target browsers
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'], // Optional polyfills if needed
    }),
  ],
  server: {
  watch: {
    usePolling: true,
  },
  proxy: {
    '/api': {
      target: 'http://localhost:4001',
      changeOrigin: true,
      secure: false,
    },
  },
},
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          redux: ['redux', 'react-redux', '@reduxjs/toolkit'],
          router: ['react-router-dom'],
          ui: ['@heroicons/react', 'lucide-react', 'react-icons'],
          utils: ['axios', 'date-fns', 'jwt-decode', 'jspdf', 'jspdf-autotable'],
          modal: ['react-modal'],
          toast: ['react-toastify'],
          helmet: ['react-helmet'],
        },
      },
    },
  },
})

