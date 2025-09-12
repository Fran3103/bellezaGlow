import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   server: {
    port: 5173,
    proxy: {
      // Opción 1: proxiar a producción
      // '/api': { target: 'https://belleza-glow.vercel.app', changeOrigin: true, secure: true },

      // Opción 2 (mejor): proxiar a vercel dev local
      '/api': { target: 'http://localhost:3002', changeOrigin: true },
    },
  },
})
