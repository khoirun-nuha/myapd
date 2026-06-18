import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host:'0.0.0.0',
    allowedHosts: [
      'dev.frontend.merak.web.id' // Izinkan domain ini untuk mengakses server
    ],
    port: 5173,
    proxy: {
      // Proxy /api ke backend — bypass SSL cert issue di development
      '/api': {
        target: 'http://dev.backend.merak.web.id/',
        changeOrigin: true,
        secure: false, // abaikan SSL invalid cert saat development
      },
    },
  },
})
