import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['1cdc-2409-4091-7-be0e-bd68-ab53-f3b8-5f3b.ngrok-free.app'], // Add your host here
  },
})
