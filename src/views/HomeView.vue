<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { posts } from '../data/posts'
import FinanceNewsModule from '../components/FinanceNewsModule.vue'
import MusicModule from '../components/MusicModule.vue'
import MascotCard from '../components/MascotCard.vue'
import GreetingCard from '../components/GreetingCard.vue'
import CalendarCheckIn from '../components/CalendarCheckIn.vue'
import { openExternal } from '../lib/external'

const featuredPosts = computed(() => posts.slice(0, 3))
const now = ref(new Date())

const timeText = computed(() => {
  return now.value.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
})

let timer: number | undefined

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) {
    window.clearInterval(timer)
  }
})
</script>

<template>
  <section class="desk-board">
    <aside class="glass-card profile-card">
      <div class="profile-title">
        <span class="avatar-chip">G</span>
        <div>
          <strong>gonnabeok</strong>
          <small>个人技术博客</small>
        </div>
      </div>

      <p class="menu-label">GENERAL</p>
      <nav class="profile-menu" aria-label="首页快捷导航">
        <RouterLink to="/posts"><span>01</span>近期文章</RouterLink>
        <a href="#projects"><span>02</span>我的项目</a>
        <RouterLink to="/about"><span>03</span>关于网站</RouterLink>
        <a href="#topics"><span>04</span>每日财经</a>
      </nav>

      <RouterLink class="featured-pill" to="/posts">
        <span>TOP</span>
        优秀博客
      </RouterLink>
    </aside>

    <div class="center-stack">
      <MascotCard />

      <GreetingCard />

      <div class="quick-actions">
        <a class="action-button dark" href="https://gitee.com/gonnabeok" @click.prevent="openExternal('https://gitee.com/gonnabeok')">Gitee</a>
        <a class="action-button" href="https://juejin.cn/" @click.prevent="openExternal('https://juejin.cn/')">稀土掘金</a>
        <a class="action-button" href="https://es6.ruanyifeng.com/" @click.prevent="openExternal('https://es6.ruanyifeng.com/')">ES6</a>
        <a class="action-button" href="https://developer.mozilla.org/" @click.prevent="openExternal('https://developer.mozilla.org/')">javascript</a>
        <a class="action-button" href="https://cn.vuejs.org/" @click.prevent="openExternal('https://cn.vuejs.org/')">Vue3</a>
      </div>
    </div>

    <aside class="right-stack">
      <RouterLink class="write-button" to="/posts">全部文章</RouterLink>

      <div class="glass-card clock-card">
        <span>{{ timeText }}</span>
      </div>

      <CalendarCheckIn />
    </aside>
  </section>

  <section class="lower-board">
    <RouterLink class="glass-card latest-card" :to="featuredPosts[0] ? `/posts/${featuredPosts[0].id}` : '/posts'">
      <p class="menu-label">最新文章</p>
      <div class="latest-content">
        <span class="article-icon">01</span>
        <div>
          <strong>{{ featuredPosts[0]?.title ?? '暂无文章' }}</strong>
          <small>{{ featuredPosts[0]?.date ?? '文章发布后会显示在这里' }}</small>
        </div>
      </div>
    </RouterLink>

    <FinanceNewsModule id="topics" />

    <MusicModule id="projects" />
  </section>
</template>
