import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',
  // Reuse the playground's production-assets (header.png, icon.png, machine icons)
  // so the replica skin can reference them via /production-assets/*.
  publicDir: resolve(__dirname, '../../playground/public'),
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5200,
  },
  resolve: {
    alias: {
      '@demo/ui-core': resolve(__dirname, '../core/src'),
      '@demo/ui-react': resolve(__dirname, '../react/src'),
      '@demo/ui-theme': resolve(__dirname, '../theme/src/index.css'),
    },
  },
})
