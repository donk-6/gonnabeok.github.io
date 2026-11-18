<script setup lang="ts">
import { openExternal } from '../lib/external'

const links = [
  { label: 'Gitee', url: 'https://gitee.com/gonnabeok' },
  { label: '稀土掘金', url: 'https://juejin.cn/' },
]
</script>

<template>
  <section class="page-heading">
    <p class="eyebrow">About</p>
    <h1>关于 gonnabeok</h1>
    <p>一份持续更新的个人技术刊物，记录工程实践、学习路径与项目复盘。</p>
  </section>

  <section class="about-layout">
    <div class="about-main">
      <h2>这里写什么</h2>
      <p>
        这个博客优先记录前端工程、Vue 生态、部署流程和真实项目中的技术取舍。目标不是把篇幅写满，而是每篇文章都留下一个清楚的问题和可以复用的答案。
      </p>
      <p>
        文章之外，首页还放了一些日常工具：签到日历用来记录坚持，财经速览用来跟进市场，在线音乐则陪着写完这些文字。技术之外，也留一点生活气息。
      </p>
    </div>

    <aside class="about-panel">
      <h2>关注方向</h2>
      <ul>
        <li>Vue 3 与组件设计</li>
        <li>前端工程化与部署</li>
        <li>技术学习与复盘</li>
      </ul>
      <h2 class="panel-sub">找到我</h2>
      <div class="about-links">
        <a
          v-for="link in links"
          :key="link.url"
          :href="link.url"
          @click.prevent="openExternal(link.url)"
        >{{ link.label }} ↗</a>
      </div>
    </aside>
  </section>
</template>
