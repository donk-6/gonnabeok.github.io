<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const year = new Date().getFullYear()

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

      <nav class="site-nav" aria-label="主导航">
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/posts">文章</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>

    <footer class="site-footer">
      <span>© {{ year }} gonnabeok · 用 Vue 3 书写</span>
      <span>Powered by Vue 3 &amp; Vite</span>
    </footer>
  </div>
</template>
