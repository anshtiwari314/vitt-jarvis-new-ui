import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['9385a6729111.ngrok-free.app','1c33c1e4880d.ngrok-free.app'], // Add your host here
  },
})
