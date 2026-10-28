<script setup lang="ts">
import { computed } from 'vue'
import { getPostById } from '../data/posts'

const props = defineProps<{
  id: string
}>()

const post = computed(() => getPostById(props.id))
</script>

<template>
  <article v-if="post" class="post-detail">
    <RouterLink class="back-link" to="/posts">返回文章列表</RouterLink>
    <p class="eyebrow">{{ post.date }} · {{ post.readingTime }}</p>
    <h1>{{ post.title }}</h1>
    <p class="detail-summary">{{ post.summary }}</p>
    <div class="tag-row">
      <span v-for="tag in post.tags" :key="tag">{{ tag }}</span>
    </div>

    <div class="article-body">
      <p v-for="paragraph in post.content" :key="paragraph">{{ paragraph }}</p>
    </div>
  </article>

  <section v-else class="empty-state">
    <h1>文章不存在</h1>
    <p>这篇文章可能已经移动或还没有发布。</p>
    <RouterLink class="primary-link" to="/posts">回到文章列表</RouterLink>
  </section>
</template>
