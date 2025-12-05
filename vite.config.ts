import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['5cad324a9752.ngrok-free.app','17f3a6f5bc33.ngrok-free.app','2b9589983f8b.ngrok-free.app','08e22c7cf26e.ngrok-free.app'], // Add your host here
  },
})
