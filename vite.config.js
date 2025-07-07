import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [vue()],
//   build: {
//     outDir: 'dist'
//   }
// })

export default defineConfig({
  base: '/', // 部署到 Vercel 時保留 '/'
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    open: true
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 拆分第三方套件到 vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  }
})

