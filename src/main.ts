import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles.css'

// 每次页面加载/刷新时清空开屏标记，保证刷新后都会重新播放开屏动画。
// 站内路由导航不会重新执行本文件，因此导航不会重复弹开屏。
try {
  sessionStorage.removeItem('gonnabeok-splash-seen')
} catch {
  /* 隐私模式下存储不可用，忽略 */
}

createApp(App).use(router).mount('#app')
