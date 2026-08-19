// vite.config.ts
import { defineConfig } from "file:///D:/vitt.ai/vitt-avatar-new-ui/node_modules/vite/dist/node/index.js";
import react from "file:///D:/vitt.ai/vitt-avatar-new-ui/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { VitePWA } from "file:///D:/vitt.ai/vitt-avatar-new-ui/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true
      },
      includeAssets: ["lame.min.js", "*.wasm", "*.onnx", "vad.worklet.bundle.min.js"],
      manifest: {
        name: "Vitt Life Insurance",
        short_name: "Vitt Life",
        description: "Life Insurance tablet app",
        theme_color: "#0284c7",
        background_color: "#ffffff",
        display: "standalone",
        // good for tablets; use 'fullscreen' for kiosk
        orientation: "portrait",
        // if tablet is always landscape
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,wasm,onnx}"],
        // Large ML assets — increase limit if needed
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
      }
    })
  ],
  server: {
    allowedHosts: ["fdd2-103-173-124-184.ngrok-free.app", "7cc57011abcd.ngrok-free.app", "7cc57011412345a.ngrok-free.app", "7cc57011447a.ngrok-free.app", "afb715722b35.ngrok-free.app", "44ae-2401-4900-8828-9ca4-684c-30f7-85f8-948a.ngrok-free.app"]
    // Add your host here
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx2aXR0LmFpXFxcXHZpdHQtYXZhdGFyLW5ldy11aVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcdml0dC5haVxcXFx2aXR0LWF2YXRhci1uZXctdWlcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L3ZpdHQuYWkvdml0dC1hdmF0YXItbmV3LXVpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJ1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgVml0ZVBXQSh7XHJcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxyXG4gICAgICBkZXZPcHRpb25zOiB7XHJcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgICAgaW5jbHVkZUFzc2V0czogWydsYW1lLm1pbi5qcycsICcqLndhc20nLCAnKi5vbm54JywgJ3ZhZC53b3JrbGV0LmJ1bmRsZS5taW4uanMnXSxcclxuICAgICAgbWFuaWZlc3Q6IHtcclxuICAgICAgICBuYW1lOiAnVml0dCBMaWZlIEluc3VyYW5jZScsXHJcbiAgICAgICAgc2hvcnRfbmFtZTogJ1ZpdHQgTGlmZScsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICdMaWZlIEluc3VyYW5jZSB0YWJsZXQgYXBwJyxcclxuICAgICAgICB0aGVtZV9jb2xvcjogJyMwMjg0YzcnLFxyXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjZmZmZmZmJyxcclxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsIC8vIGdvb2QgZm9yIHRhYmxldHM7IHVzZSAnZnVsbHNjcmVlbicgZm9yIGtpb3NrXHJcbiAgICAgICAgb3JpZW50YXRpb246ICdwb3J0cmFpdCcsIC8vIGlmIHRhYmxldCBpcyBhbHdheXMgbGFuZHNjYXBlXHJcbiAgICAgICAgc3RhcnRfdXJsOiAnLycsXHJcbiAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAncHdhLTE5MngxOTIucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICdwd2EtNTEyeDUxMi5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJ3B3YS01MTJ4NTEyLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgICBwdXJwb3NlOiAnbWFza2FibGUnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgICB9LFxyXG4gICAgICB3b3JrYm94OiB7XHJcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLGljbyxwbmcsc3ZnLHdhc20sb25ueH0nXSxcclxuICAgICAgICAvLyBMYXJnZSBNTCBhc3NldHMgXHUyMDE0IGluY3JlYXNlIGxpbWl0IGlmIG5lZWRlZFxyXG4gICAgICAgIG1heGltdW1GaWxlU2l6ZVRvQ2FjaGVJbkJ5dGVzOiA1ICogMTAyNCAqIDEwMjQsXHJcbiAgICAgIH0sXHJcbiAgICB9KSxcclxuICBdLFxyXG4gIHNlcnZlcjoge1xyXG4gICAgYWxsb3dlZEhvc3RzOiBbJ2ZkZDItMTAzLTE3My0xMjQtMTg0Lm5ncm9rLWZyZWUuYXBwJywnN2NjNTcwMTFhYmNkLm5ncm9rLWZyZWUuYXBwJywnN2NjNTcwMTE0MTIzNDVhLm5ncm9rLWZyZWUuYXBwJywnN2NjNTcwMTE0NDdhLm5ncm9rLWZyZWUuYXBwJywnYWZiNzE1NzIyYjM1Lm5ncm9rLWZyZWUuYXBwJywnNDRhZS0yNDAxLTQ5MDAtODgyOC05Y2E0LTY4NGMtMzBmNy04NWY4LTk0OGEubmdyb2stZnJlZS5hcHAnXSwgLy8gQWRkIHlvdXIgaG9zdCBoZXJlXHJcbiAgfSxcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUErUSxTQUFTLG9CQUFvQjtBQUM1UyxPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBR3hCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxNQUNOLGNBQWM7QUFBQSxNQUNkLFlBQVk7QUFBQSxRQUNWLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQSxlQUFlLENBQUMsZUFBZSxVQUFVLFVBQVUsMkJBQTJCO0FBQUEsTUFDOUUsVUFBVTtBQUFBLFFBQ1IsTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBLFFBQ2IsYUFBYTtBQUFBLFFBQ2Isa0JBQWtCO0FBQUEsUUFDbEIsU0FBUztBQUFBO0FBQUEsUUFDVCxhQUFhO0FBQUE7QUFBQSxRQUNiLFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1AsY0FBYyxDQUFDLDBDQUEwQztBQUFBO0FBQUEsUUFFekQsK0JBQStCLElBQUksT0FBTztBQUFBLE1BQzVDO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sY0FBYyxDQUFDLHVDQUFzQywrQkFBOEIsa0NBQWlDLCtCQUE4QiwrQkFBOEIsNkRBQTZEO0FBQUE7QUFBQSxFQUMvTztBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
