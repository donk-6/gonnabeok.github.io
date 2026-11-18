<script setup lang="ts">
import { computed } from 'vue'
import { financeNewsData } from '../data/finance-news'
import { openExternal } from '../lib/external'

const CATEGORY_ORDER = ['黄金', '标普500']

const groups = computed(() =>
  CATEGORY_ORDER.map((category) => ({
    category,
    items: financeNewsData.items
      .filter((item) => item.category === category)
      .slice(0, 1),
  })).filter((group) => group.items.length > 0)
)

const updatedText = computed(() => {
  const date = financeNewsData.updatedDate
  return date ? date.replace(/-/g, '.') : ''
})
</script>

<template>
  <section class="glass-card news-card">
    <div class="news-head">
      <p class="menu-label">每日财经新闻</p>
      <span v-if="updatedText" class="news-updated">{{ updatedText }} 更新</span>
    </div>

    <div v-if="groups.length" class="news-groups">
      <div v-for="group in groups" :key="group.category" class="news-group">
        <p class="news-category">{{ group.category }}</p>
        <a
          v-for="(item, index) in group.items"
          :key="item.url"
          class="news-item"
          :href="item.url"
          @click.prevent="openExternal(item.url)"
        >
          <span class="news-index">{{ index + 1 }}</span>
          <span class="news-body">
            <strong>{{ item.title }}</strong>
            <small>{{ item.source }} · {{ item.time }}</small>
          </span>
        </a>
      </div>
    </div>

    <div v-else class="news-empty">
      <span>📈</span>
      <p>今日新闻同步中</p>
      <small>数据将在每天早晨自动更新</small>
    </div>

    <a
      class="news-more"
      href="https://finance.sina.com.cn/roll/"
      @click.prevent="openExternal('https://finance.sina.com.cn/roll/')"
    >
      更多财经资讯 →
    </a>
  </section>
</template>

<style scoped>
.news-card {
  overflow: hidden;
  padding: var(--space-4);
}

.news-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.news-head .menu-label {
  margin: 0;
}

.news-updated {
  flex: 0 0 auto;
  color: var(--color-dim);
  font-family: var(--font-mono);
  font-size: 0.68rem;
}

.news-groups {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-3);
  min-width: 0;
}

.news-group {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.28rem;
  min-width: 0;
}

.news-category {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.1rem;
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.news-category::before {
  content: '';
  flex: 0 0 auto;
  width: 0.42rem;
  height: 0.42rem;
  background: var(--color-accent);
  border-radius: 999px;
}

.news-group:nth-child(1) .news-category::before {
  background: var(--color-sky);
}

.news-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  min-width: 0;
  padding: 0.45rem 0.55rem;
  background: var(--color-surface-2);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition:
    border-color var(--dur-fast) ease,
    transform var(--dur-fast) ease;
}

.news-item:hover {
  border-color: var(--color-accent);
  transform: translateX(2px);
}

.news-index {
  flex: 0 0 auto;
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.7rem;
}

.news-body {
  min-width: 0;
}

.news-body strong {
  display: block;
  overflow: hidden;
  color: var(--color-text);
  font-size: 0.83rem;
  font-weight: 600;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-item:hover .news-body strong {
  color: var(--color-accent);
}

.news-body small {
  display: block;
  margin-top: 0.15rem;
  overflow: hidden;
  color: var(--color-dim);
  font-family: var(--font-mono);
  font-size: 0.66rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.3rem;
  margin-top: var(--space-3);
  padding: var(--space-4);
  color: var(--color-dim);
  background: var(--color-surface-2);
  border: 1px dashed var(--color-line-strong);
  border-radius: var(--radius-sm);
  text-align: center;
}

.news-empty p {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.85rem;
  font-weight: 600;
}

.news-empty small {
  font-size: 0.72rem;
}

.news-more {
  display: inline-block;
  margin-top: var(--space-3);
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.72rem;
}

.news-more:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
