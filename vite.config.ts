import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      // openwakeword + @ricky0123/vad-web import onnxruntime-web; use WASM shim under Vite.
      'onnxruntime-web': path.resolve(rootDir, 'src/lib/onnxruntime-web-shim.js'),
    },
  },
  optimizeDeps: {
    exclude: ['openwakeword-web', 'openwakeword-wasm-browser'],
  },
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      '/api/anam': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api/tts': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
    allowedHosts: [
      '426f-103-173-124-192.ngrok-free.app ',
      'fdd2-103-173-124-184.ngrok-free.app',
      '7cc57011abcd.ngrok-free.app',
      '7cc57011412345a.ngrok-free.app',
      '7cc57011447a.ngrok-free.app',
      'afb715722b35.ngrok-free.app',
      '44ae-2401-4900-8828-9ca4-684c-30f7-85f8-948a.ngrok-free.app',
      '9464-2401-4900-8927-91e4-5871-dc27-2799-78c0.ngrok-free.app'
    ],
  },
})
