import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['86f2bfb40702.ngrok-free.app','5460f7f59304.ngrok-free.app'], // Add your host here
  },
})
