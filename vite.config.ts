import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['eef4cc7a7546.ngrok-free.app','5a9c4b4b54b3.ngrok-free.app'], // Add your host here
  },
})
