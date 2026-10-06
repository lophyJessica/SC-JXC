// 构建配置：开发用 npm run dev；打包用 npm run build，产出 dist/index.html
// 打包结果是"一个文件"（脚本和样式都内联进 index.html），双击就能在浏览器打开，不需要启动服务
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: './', // 相对路径，dist 放到哪个文件夹都能打开
  plugins: [vue(), viteSingleFile()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 5000
  },
  server: { port: 5173 }
})
