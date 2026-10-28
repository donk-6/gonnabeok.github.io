<script setup lang="ts">
import { computed, ref } from 'vue'
import { allTags, posts } from '../data/posts'

const activeTag = ref('All')
const tagOptions = computed(() => ['All', ...allTags])
const visiblePosts = computed(() => {
  if (activeTag.value === 'All') {
    return posts
  }

  return posts.filter((post) => post.tags.includes(activeTag.value))
})
</script>

<template>
  <section class="page-heading">
    <p class="eyebrow">Archive</p>
    <h1>文章</h1>
    <p>按主题筛选文章，快速回到某个技术问题的上下文。</p>
  </section>

  <section class="filter-bar" aria-label="文章标签筛选">
    <button
      v-for="tag in tagOptions"
      :key="tag"
      type="button"
      :class="{ active: activeTag === tag }"
      @click="activeTag = tag"
    >
      {{ tag }}
    </button>
  </section>

  <section class="article-list">
    <RouterLink v-for="post in visiblePosts" :key="post.id" class="article-row" :to="`/posts/${post.id}`">
      <div>
        <span class="post-date">{{ post.date }} · {{ post.readingTime }}</span>
        <h2>{{ post.title }}</h2>
        <p>{{ post.summary }}</p>
      </div>
      <div class="tag-row">
        <span v-for="tag in post.tags" :key="tag">{{ tag }}</span>
      </div>
    </RouterLink>
  </section>
</template>
