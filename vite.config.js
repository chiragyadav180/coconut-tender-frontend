import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // Import the PWA plugin

export default defineConfig({
  plugins: [
    react(),
    VitePWA({ // Add the PWA plugin configuration
      registerType: 'autoUpdate', // Auto-update the Service Worker
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'], // Cached assets
      manifest: {
        name: 'Coconut Tender',
        short_name: 'App',
        description: 'A React PWA with Vite',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
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
            purpose: 'any maskable', // For adaptive icons
          },
        ],
      },
    }),
  ],
});