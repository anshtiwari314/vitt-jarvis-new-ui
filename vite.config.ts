import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['fe33-2409-40d0-12d3-a936-b47d-25fb-e82f-8159.ngrok-free.app','7cc57011abcd.ngrok-free.app','7cc57011412345a.ngrok-free.app','7cc57011447a.ngrok-free.app','afb715722b35.ngrok-free.app'], // Add your host here
  },
})
