import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Moo — Plant-Based Challenge',
        short_name: 'Moo',
        description: 'Take care of a cow. Save the planet. Sort of.',
        theme_color: '#123524',
        background_color: '#123524',
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
  server: { port: 5180, strictPort: true },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
