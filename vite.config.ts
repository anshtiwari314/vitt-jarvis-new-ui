import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['9385a6729111.ngrok-free.app','7cd9222053c6.ngrok-free.app','0d8a3d82f1a9.ngrok-free.app'], // Add your host here
  },
})
