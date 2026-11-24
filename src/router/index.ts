import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PostsView from '../views/PostsView.vue'
import PostDetailView from '../views/PostDetailView.vue'
import AboutView from '../views/AboutView.vue'
import SplashScreen from '../components/SplashScreen.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/splash', name: 'splash', component: SplashScreen },
    { path: '/posts', name: 'posts', component: PostsView },
    { path: '/posts/:id', name: 'post-detail', component: PostDetailView, props: true },
    { path: '/about', name: 'about', component: AboutView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// 进站即展示：本次会话首次访问时，先展示开屏动画，再进入目标页。
// 用 sessionStorage 标记「本次会话已看过开屏」，刷新/站内导航不重复展示，
// 但每次重新打开站点（新会话）都会再次展示。
const SPLASH_SEEN_KEY = 'gonnabeok-splash-seen'

router.beforeEach((to) => {
  // 直接访问开屏路由本身，或已看过开屏，则放行
  if (to.path === '/splash') return true

  let seen = false
  try {
    seen = sessionStorage.getItem(SPLASH_SEEN_KEY) === '1'
  } catch {
    /* 隐私模式下 sessionStorage 不可用，按未看过处理 */
  }

  // 首次访问：跳转开屏，并把目标页记下来（开屏结束后回原目标页）
  if (!seen) {
    try {
      sessionStorage.setItem(SPLASH_SEEN_KEY, '1')
    } catch {
      /* 忽略存储失败 */
    }
    return { path: '/splash', query: to.fullPath !== '/' ? { next: to.fullPath } : {} }
  }

  return true
})

export default router
