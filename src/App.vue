<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const year = new Date().getFullYear()

type Theme = 'dark' | 'light'
const theme = ref<Theme>('dark')

function applyTheme(next: Theme) {
  theme.value = next
  const root = document.documentElement
  root.setAttribute('data-theme', next)
  root.style.colorScheme = next
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', next === 'light' ? '#f2ede3' : '#0b0e14')
  try {
    localStorage.setItem('gonnabeok-theme', next)
  } catch {
    /* 隐私模式下存储不可用，切换仍生效 */
  }
}

function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

onMounted(() => {
  // 与 index.html 的防闪烁脚本保持一致，这里只同步 Vue 状态
  const saved = localStorage.getItem('gonnabeok-theme')
  applyTheme(saved === 'light' || saved === 'dark' ? saved : 'dark')
})

function goBack() {
  const state = window.history.state as { back?: unknown } | null
  if (state?.back) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<template>
  <div class="site-shell app-bg">
    <header class="site-header">
      <div class="header-left">
        <button type="button" class="back-button" aria-label="返回上一页" @click="goBack">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.5 4.5 8 12l7.5 7.5 1.4-1.4L10.8 12l6.1-6.1z" />
          </svg>
          <span>返回</span>
        </button>

        <RouterLink class="brand" to="/" aria-label="返回首页">
          <span class="brand-mark">G</span>
          <span class="brand-text">gonnabeok</span>
        </RouterLink>
      </div>

      <div class="header-right">
        <nav class="site-nav" aria-label="主导航">
          <RouterLink to="/">首页</RouterLink>
          <RouterLink to="/posts">文章</RouterLink>
          <RouterLink to="/about">关于</RouterLink>
        </nav>

        <button
          type="button"
          class="theme-toggle"
          :aria-label="theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'"
          :title="theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'"
          @click="toggleTheme"
        >
          <svg v-if="theme === 'dark'" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 4V2m0 20v-2M4.93 4.93l-1.42-1.42m16.98 16.98-1.42-1.42M4 12H2m20 0h-2M4.93 19.07l-1.42 1.42M19.51 4.49l1.42 1.42"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
            <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8" />
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>

    <main>
      <RouterView />
    </main>

    <footer class="site-footer">
      <span>© {{ year }} gonnabeok — 一份持续更新的个人技术刊物</span>
      <span>SET IN PLAYFAIR &amp; IBM PLEX · BUILT WITH VUE</span>
    </footer>
  </div>
</template>
