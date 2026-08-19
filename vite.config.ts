import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      includeAssets: ['lame.min.js', '*.wasm', '*.onnx', 'vad.worklet.bundle.min.js'],
      manifest: {
        name: 'Vitt Life Insurance',
        short_name: 'Vitt Life',
        description: 'Life Insurance tablet app',
        theme_color: '#0284c7',
        background_color: '#ffffff',
        display: 'standalone', // good for tablets; use 'fullscreen' for kiosk
        orientation: 'portrait', // if tablet is always landscape
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm,onnx}'],
        // Large ML assets — increase limit if needed
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  server: {
    allowedHosts: ['fdd2-103-173-124-184.ngrok-free.app','7cc57011abcd.ngrok-free.app','7cc57011412345a.ngrok-free.app','7cc57011447a.ngrok-free.app','afb715722b35.ngrok-free.app','44ae-2401-4900-8828-9ca4-684c-30f7-85f8-948a.ngrok-free.app'], // Add your host here
  },
})
