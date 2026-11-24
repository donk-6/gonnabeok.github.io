<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 停留时长：1 秒后自动进入目标页（略高于需求，确保「无限进步」四字完整亮相）
const STAY_MS = 1000

const router = useRouter()
const route = useRoute()
const leaving = ref(false)

let timer: ReturnType<typeof setTimeout> | undefined

function goHome() {
  if (leaving.value) return
  leaving.value = true
  // 目标页：优先取 ?next=（首次访问被拉来看开屏前的目标），否则回首页
  const next = typeof route.query.next === 'string' ? route.query.next : '/'
  // 等待淡出动画结束后再跳转，避免页面切换突兀
  window.setTimeout(() => router.replace(next), 480)
}

onMounted(() => {
  // 1 秒后触发退场；退场动画自身约 480ms，总停留 ≈ 1.5s
  timer = setTimeout(goHome, STAY_MS)
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<template>
  <!-- 开屏：点击任意处可立即跳过（可访问性兜底） -->
  <div
    class="splash"
    :class="{ 'is-leaving': leaving }"
    role="dialog"
    aria-modal="true"
    aria-label="无限进步开屏动画"
    @click="goHome"
  >
    <!-- 背景层：渐变网格 + 扫描线 + 颗粒 -->
    <div class="splash-bg" aria-hidden="true"></div>
    <div class="splash-scanline" aria-hidden="true"></div>

    <!-- 旋转轨道环 -->
    <div class="orbit" aria-hidden="true">
      <span class="orbit-ring orbit-ring--outer"></span>
      <span class="orbit-ring orbit-ring--mid"></span>
      <span class="orbit-ring orbit-ring--inner"></span>
      <span class="orbit-dot"></span>
    </div>

    <!-- 中心内容 -->
    <div class="splash-core">
      <p class="splash-kicker">EST. · A JOURNAL OF PROGRESS</p>

      <h1 class="splash-title" aria-label="无限进步">
        <span class="char" style="--i: 0">無</span>
        <span class="char" style="--i: 1">限</span>
        <span class="char" style="--i: 2">進</span>
        <span class="char" style="--i: 3">步</span>
      </h1>

      <p class="splash-sub">KEEP MOVING · KEEP BECOMING</p>

      <div class="splash-hint" aria-hidden="true">载入中 — 即将进入</div>
    </div>
  </div>
</template>

<style scoped>
/* 开屏模块：复古未来「无限进步」。所有颜色走设计令牌，适配明暗双主题。 */

.splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: var(--color-bg);
  cursor: pointer;
  opacity: 1;
  transition: opacity 0.48s var(--ease-out), visibility 0.48s;
}

.splash.is-leaving {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

/* ---------- 背景：渐变网格 + 扫描线 + 颗粒 ---------- */
.splash-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.splash-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(46rem 36rem at 50% 42%, var(--glow-1), transparent 60%),
    radial-gradient(40rem 34rem at 16% 110%, var(--glow-2), transparent 55%),
    var(--color-bg);
}

.splash-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: var(--grid-opacity);
  background-image:
    linear-gradient(var(--color-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-line) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(circle at 50% 45%, #000 0%, transparent 80%);
  -webkit-mask-image: radial-gradient(circle at 50% 45%, #000 0%, transparent 80%);
}

/* 扫描线：复古未来质感 */
.splash-scanline {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.025) 0,
    rgba(255, 255, 255, 0.025) 1px,
    transparent 1px,
    transparent 3px
  );
  opacity: 0.5;
}

/* ---------- 旋转轨道环 ---------- */
.orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(78vmin, 560px);
  height: min(78vmin, 560px);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.orbit-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid var(--color-line-strong);
}

.orbit-ring--outer {
  border-color: var(--color-line);
  animation: spin 26s linear infinite;
}

.orbit-ring--outer::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  width: 8px;
  height: 8px;
  background: var(--color-accent);
  border-radius: 50%;
  box-shadow: 0 0 16px var(--color-accent), 0 0 34px var(--color-accent);
}

.orbit-ring--mid {
  inset: 12%;
  border-style: dashed;
  border-color: var(--color-line);
  animation: spin-rev 18s linear infinite;
}

.orbit-ring--mid::before {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 20%;
  width: 6px;
  height: 6px;
  background: var(--color-sky);
  border-radius: 50%;
  box-shadow: 0 0 14px var(--color-sky);
}

.orbit-ring--inner {
  inset: 26%;
  border-color: var(--color-accent-soft);
  animation: spin 12s linear infinite;
}

.orbit-dot {
  position: absolute;
  top: 6%;
  left: 50%;
  width: 10px;
  height: 10px;
  margin-left: -5px;
  background: var(--color-accent);
  border-radius: 50%;
  box-shadow: 0 0 20px var(--color-accent), 0 0 44px var(--color-accent);
  animation: dot-orbit 12s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes spin-rev {
  to {
    transform: rotate(-360deg);
  }
}

@keyframes dot-orbit {
  to {
    transform: rotate(360deg) translateX(min(39vmin, 280px)) rotate(-360deg);
  }
}

/* ---------- 中心内容 ---------- */
.splash-core {
  position: relative;
  z-index: 2;
  display: grid;
  justify-items: center;
  text-align: center;
  padding: var(--space-5);
}

.splash-kicker {
  margin: 0 0 var(--space-4);
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: var(--step--1);
  font-weight: 600;
  letter-spacing: 0.32em;
  opacity: 0;
  animation: fade-up 0.6s var(--ease-out) 0.15s forwards;
}

.splash-title {
  display: flex;
  gap: 0.04em;
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(4rem, 18vw, 9rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.02em;
  /* 中心大字：实色暖白 + 日出橙光晕，保证各浏览器稳定显示 */
  color: var(--color-text);
  filter: drop-shadow(0 0 22px var(--glow-1)) drop-shadow(0 0 60px var(--glow-1));
}

/* 「步」字独立染成强调色，作视觉锚点 */
.splash-title .char:last-child {
  color: var(--color-accent);
}

.splash-title .char {
  display: inline-block;
  opacity: 0;
  transform: translateY(0.35em) scale(0.92);
  filter: blur(6px);
  animation: char-in 0.5s var(--ease-out) forwards;
  animation-delay: calc(0.12s + var(--i) * 0.08s);
}

@keyframes char-in {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

.splash-sub {
  margin: var(--space-4) 0 0;
  color: var(--color-dim);
  font-family: var(--font-mono);
  font-size: var(--step--1);
  font-weight: 500;
  letter-spacing: 0.34em;
  opacity: 0;
  animation: fade-up 0.6s var(--ease-out) 0.9s forwards;
}

.splash-hint {
  margin-top: var(--space-6);
  color: var(--color-dim);
  font-family: var(--font-mono);
  font-size: var(--step--2);
  letter-spacing: 0.18em;
  opacity: 0;
  animation: fade-up 0.5s var(--ease-out) 1.05s forwards;
}

.splash-hint::after {
  content: '';
  display: inline-block;
  width: 1.1em;
  height: 0.4em;
  margin-left: 0.5em;
  vertical-align: middle;
  border-radius: 2px;
  background: var(--color-accent);
  animation: blink 1.1s steps(2, start) infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* ---------- 响应式 ---------- */
@media (max-width: 480px) {
  .splash-title {
    font-size: clamp(3.2rem, 20vw, 5.4rem);
  }

  .splash-sub {
    letter-spacing: 0.22em;
  }
}

/* ---------- 降级动效 ---------- */
@media (prefers-reduced-motion: reduce) {
  .orbit-ring,
  .orbit-dot,
  .splash-hint::after {
    animation: none !important;
  }

  .splash-kicker,
  .splash-title .char,
  .splash-sub,
  .splash-hint {
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    animation: none !important;
  }
}
</style>
