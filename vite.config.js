import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase'))    return 'supabase'
            if (id.includes('lucide'))       return 'lucide'
            if (id.includes('html2canvas'))  return 'html2canvas'
            if (id.includes('pinia'))        return 'pinia'
            if (id.includes('vue-router'))   return 'router'
            return 'vendor'
          }
        },
      },
    },
  },
})
