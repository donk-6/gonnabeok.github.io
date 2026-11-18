<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { quotes } from '../data/quotes'

// 当前时间：问候语和名言都依赖它，定时器到点后刷新它来触发更新
const now = ref(new Date())

// 问候语：按当前小时数分成凌晨/早上/下午/晚上四段
const greeting = computed(() => {
  const hour = now.value.getHours()
  if (hour < 6) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// 名言：按本地日期计算槽位，以 00:00 / 12:00 为分界每 12 小时换一条
const quote = computed(() => {
  // 取当天本地 0 点的时间戳，换算成“从纪元起第几天”
  const localDayStart = new Date(
    now.value.getFullYear(),
    now.value.getMonth(),
    now.value.getDate(),
  )
  const days = Math.floor(localDayStart.getTime() / 86_400_000)
  // 每天两个槽位：上午一个、下午一个，再对名言总数取模，保证轮换不越界
  const slot = days * 2 + (now.value.getHours() >= 12 ? 1 : 0)
  return quotes[slot % quotes.length]
})

// 定时器句柄：记录当前定时任务，便于组件卸载时清理
let timer: number | undefined

// 计算距离下一个整点还有多久，到点后刷新时间并继续排下一次
function scheduleNextTick() {
  const nextHour = new Date(now.value)
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
  timer = window.setTimeout(
    () => {
      now.value = new Date()
      scheduleNextTick()
    },
    Math.max(nextHour.getTime() - now.value.getTime(), 1000),
  )
}

onMounted(() => {
  // 组件挂载后启动定时任务，问候语和名言都会在整点准时切换
  scheduleNextTick()
})

onBeforeUnmount(() => {
  // 组件卸载时清掉定时器，避免内存泄漏
  if (timer) {
    window.clearTimeout(timer)
  }
})
</script>

<template>
  <div class="glass-card greeting-card">
    <!-- 按时段变化的问候语 -->
    <h1>{{ greeting }}</h1>
    <!-- 每 12 小时更换的名言，切换时带淡入淡出动画 -->
    <Transition name="quote-fade" mode="out-in">
      <div :key="quote.text" class="quote-block">
        <!-- 名言正文 -->
        <p class="quote">“{{ quote.text }}”</p>
        <!-- 名言出处 -->
        <p class="quote-author">—— {{ quote.author }}</p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.greeting-card {
  position: relative;
  padding: 1.8rem 2rem 2rem;
}

/* 装饰性大引号：贴在问候语右上角，作为编辑感的点睛 */
.greeting-card::after {
  content: '\201D';
  position: absolute;
  top: 1.2rem;
  right: 2rem;
  color: var(--color-accent);
  font-family: var(--font-display);
  font-size: 3.4rem;
  line-height: 1;
  opacity: 0.3;
  pointer-events: none;
}

.greeting-card h1 {
  position: relative;
  z-index: 1;
  margin: 0;
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 6vw, 3.6rem);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.quote-block {
  position: relative;
  z-index: 1;
  margin-top: 1.4rem;
  padding-left: 1.1rem;
  border-left: 2px solid var(--color-accent);
}

.quote {
  margin: 0;
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: 1.08rem;
  font-style: italic;
  line-height: 1.75;
}

.quote-author {
  margin: 0.5rem 0 0;
  color: var(--color-dim);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  text-align: right;
}

.quote-fade-enter-active,
.quote-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.quote-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.quote-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 480px) {
  .greeting-card {
    padding: 1.4rem 1.4rem 1.6rem;
  }

  .greeting-card::after {
    font-size: 2.6rem;
    right: 1.4rem;
  }
}
</style>
