import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('Vite 配置中读取到的环境变量:', {
    WEB_DEFAULT_API: env.WEB_DEFAULT_API,
    VITE_DEFAULT_API: env.VITE_DEFAULT_API
  })

  return {
    define: {
      // 暴露 WEB_DEFAULT_API 环境变量给前端代码
      'import.meta.env.WEB_DEFAULT_API': JSON.stringify(env.WEB_DEFAULT_API)
    },
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    // 修复FFmpeg worker警告
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/core']
    },
    // 配置worker处理
    worker: {
      format: 'es'
    },
    // 配置HTTPS headers for SharedArrayBuffer (FFmpeg需要)
    server: {
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      }
    }
  }
})
