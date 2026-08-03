import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Moo — Plant-Based Challenge',
        short_name: 'Moo',
        description: 'Take care of a cow. Save the planet. Sort of.',
        theme_color: '#FAF9F5',
        background_color: '#FAF9F5',
        display: 'standalone',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/avatars') || url.pathname.startsWith('/sprites'),
            handler: 'CacheFirst',
            options: { cacheName: 'sprites' },
          },
          {
            urlPattern: ({ url }) => /supabase\.co\/(rest|storage)/.test(url.href),
            handler: 'NetworkFirst',
            options: { cacheName: 'supabase', networkTimeoutSeconds: 4 },
          },
        ],
      },
    }),
  ],
  // host: true binds to all interfaces so the dev server is reachable from a
  // phone on the same Wi-Fi (http://<your-lan-ip>:5180) — the only practical way
  // to test touch drag on real iOS/Android.
  // PORT override lets a second dev server (e.g. another Claude session) run
  // alongside the default one without fighting over 5180.
  server: { port: Number(process.env.PORT) || 5180, strictPort: true, host: true },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
