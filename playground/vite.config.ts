import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export default defineConfig({
  plugins: [react(), vue()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      react: path.resolve(root, 'node_modules/react'),
      'react-dom': path.resolve(root, 'node_modules/react-dom'),
      '@demo/ui-core': path.resolve(root, 'packages/core/src'),
      '@demo/ui-chart': path.resolve(root, 'packages/chart/src'),
      '@demo/ui-form': path.resolve(root, 'packages/form/src'),
      '@demo/ui-react': path.resolve(root, 'packages/react/src'),
      '@demo/ui-vue': path.resolve(root, 'packages/vue/src'),
      '@demo/ui-web-components': path.resolve(root, 'packages/web-components/src'),
      '@demo/ui-theme': path.resolve(root, 'packages/theme/src/index.css'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'echarts'],
  },
})
