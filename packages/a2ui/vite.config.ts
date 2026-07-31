import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',
  server: {
    port: 5200,
  },
  resolve: {
    alias: {
      '@demo/ui-core': resolve(__dirname, '../core/src'),
      '@demo/ui-react': resolve(__dirname, '../react/src'),
      '@demo/ui-theme': resolve(__dirname, '../theme/src/index.css'),
    },
  },
})
