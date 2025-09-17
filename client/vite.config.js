// client/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Allow external access
    strictPort: false, // Don't auto-change port if busy
    watch: {
      usePolling: true, // Better for some environments
      interval: 1000 // Polling interval
    }
  }
})