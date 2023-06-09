import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {createRuntimeGeneratedType} from '../../src/index'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: createRuntimeGeneratedType({
          prefix: true,
          dataSource: '', // 指定接口返回数据的位置
          outputPath: path.resolve(__dirname, './src/types.ts'),
          baseUrl: '/api/*',
          matching: [
            '/posts/*/comments',
            '/test/*'
          ]
        }),
      },
    }
  }
})
