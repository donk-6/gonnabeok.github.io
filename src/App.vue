<script setup lang="ts">
import DesktopPet from './components/DesktopPet/DesktopPet.vue'

const year = new Date().getFullYear()
</script>

<template>
  <div class="site-shell app-bg">
    <header class="site-header">
      <RouterLink class="brand" to="/" aria-label="返回首页">
        <span class="brand-mark">G</span>
        <span class="brand-text">gonnabeok</span>
      </RouterLink>

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

  <DesktopPet />
</template>
