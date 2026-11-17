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
  padding: 1rem 1.1rem;
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
  color: #7b8497;
  font-size: 0.72rem;
  font-weight: 700;
}

.news-groups {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.7rem;
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
  gap: 0.35rem;
  margin: 0 0 0.1rem;
  color: #1b74e4;
  font-size: 0.76rem;
  font-weight: 900;
}

.news-category::before {
  content: '';
  flex: 0 0 auto;
  width: 0.45rem;
  height: 0.45rem;
  background: #1b74e4;
  border-radius: 999px;
}

.news-group:nth-child(1) .news-category::before {
  background: #d4a017;
}

.news-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  min-width: 0;
  padding: 0.38rem 0.55rem;
  background: #f6f8fc;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.news-item:hover {
  background: #e7f0fb;
  border-color: rgba(27, 116, 228, 0.22);
}

.news-index {
  flex: 0 0 auto;
  color: #1b74e4;
  font-size: 0.72rem;
  font-weight: 900;
}

.news-body {
  min-width: 0;
}

.news-body strong {
  display: block;
  overflow: hidden;
  color: #111827;
  font-size: 0.83rem;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-item:hover .news-body strong {
  color: #1b74e4;
}

.news-body small {
  display: block;
  margin-top: 0.15rem;
  overflow: hidden;
  color: #9aa4b8;
  font-size: 0.7rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.3rem;
  margin-top: 0.7rem;
  padding: 0.9rem;
  color: #9aa4b8;
  background: #f2f5f9;
  border: 1px dashed rgba(23, 32, 51, 0.16);
  border-radius: 0.6rem;
  text-align: center;
}

.news-empty p {
  margin: 0;
  color: #586174;
  font-size: 0.85rem;
  font-weight: 700;
}

.news-empty small {
  font-size: 0.74rem;
}

.news-more {
  display: inline-block;
  margin-top: 0.65rem;
  color: #1b74e4;
  font-size: 0.76rem;
  font-weight: 700;
  text-decoration: none;
}

.news-more:hover {
  text-decoration: underline;
}
</style>
