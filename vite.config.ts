import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // 使用相对路径，GitHub Pages / Gitee Pages 的用户主页与项目主页均可直接部署
  base: './',
  plugins: [vue()],
})
