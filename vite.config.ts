import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['fe8a-103-173-124-132.ngrok-free.app','7cc57011abcd.ngrok-free.app','7cc57011412345a.ngrok-free.app','7cc57011447a.ngrok-free.app','afb715722b35.ngrok-free.app','44ae-2401-4900-8828-9ca4-684c-30f7-85f8-948a.ngrok-free.app'], // Add your host here
  },
})
