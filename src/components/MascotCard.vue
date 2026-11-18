<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import mascotSrc from '../assets/mascot.jpg'

const zoomed = ref(false)
let historyPushed = false
let savedOverflow = ''

function openZoom() {
  if (zoomed.value) return
  savedOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  zoomed.value = true
  // 压一条历史，让移动端物理返回键可以关闭预览而不是退出博客
  try {
    window.history.pushState({ mascotZoom: true }, '')
    historyPushed = true
  } catch {
    historyPushed = false
  }
}

function closeZoom() {
  if (!zoomed.value) return
  zoomed.value = false
  document.body.style.overflow = savedOverflow
  if (historyPushed) {
    historyPushed = false
    window.history.back()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeZoom()
  }
}

function onPopState() {
  if (zoomed.value) {
    historyPushed = false
    zoomed.value = false
    document.body.style.overflow = savedOverflow
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('popstate', onPopState)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('popstate', onPopState)
  document.body.style.overflow = savedOverflow || ''
})
</script>

<template>
  <div class="glass-card mascot-card">
    <button
      type="button"
      class="mascot-zoom"
      aria-label="放大查看图片"
      @click="openZoom"
    >
      <img :src="mascotSrc" alt="gonnabeok blog mascot" />
    </button>
  </div>

  <Teleport to="body">
    <Transition name="zoom-fade">
      <div
        v-if="zoomed"
        class="mascot-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="图片预览"
        @click="closeZoom"
      >
        <img
          class="mascot-lightbox-img"
          :src="mascotSrc"
          alt="gonnabeok blog mascot（放大预览）"
          @click.stop
        />
        <button
          type="button"
          class="lightbox-close"
          aria-label="关闭预览"
          @click="closeZoom"
        >
          ×
        </button>
        <span class="lightbox-hint">点击空白处或按返回键关闭</span>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mascot-card {
  position: relative;
  display: grid;
  place-items: center;
  padding: 0.7rem 0.7rem 2.2rem;
  overflow: hidden;
  background: var(--mascot-card-bg);
}

/* 封面图注：刊物感的小字 */
.mascot-card::after {
  content: 'FIG. 01 — 云海之上 / ABOVE THE CLOUDS';
  position: absolute;
  bottom: 0.7rem;
  left: 1rem;
  color: var(--color-dim);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  pointer-events: none;
}

.mascot-zoom {
  display: block;
  width: 100%;
  padding: 0;
  background: none;
  border: 0;
  cursor: zoom-in;
  -webkit-tap-highlight-color: transparent;
}

.mascot-zoom img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 4px;
  filter: saturate(0.92) contrast(1.05) brightness(0.96);
  transition: filter var(--dur-base) ease, transform var(--dur-base) var(--ease-out);
}

.mascot-zoom:hover img {
  filter: saturate(1.05) contrast(1.03) brightness(1.02);
  transform: scale(1.015);
}

/* 弹层 Teleport 到 body，彻底脱离祖先的 transform / backdrop-filter / overflow，
   避免 position: fixed 被错误地相对父容器定位（移动端 WebView 常见 bug） */
.mascot-lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 2rem;
  padding-top: max(2rem, env(safe-area-inset-top));
  padding-right: max(2rem, env(safe-area-inset-right));
  padding-bottom: max(2rem, env(safe-area-inset-bottom));
  padding-left: max(2rem, env(safe-area-inset-left));
  background: var(--lightbox-bg);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  cursor: zoom-out;
  overscroll-behavior: contain;
  touch-action: manipulation;
}

.mascot-lightbox-img {
  display: block;
  max-width: min(92vw, 1200px);
  max-height: 82vh;
  max-height: 82dvh;
  width: auto;
  height: auto;
  object-fit: contain;
  border: 1px solid var(--color-line-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-3);
  cursor: default;
}

.lightbox-close {
  position: absolute;
  top: max(1.2rem, env(safe-area-inset-top));
  right: max(1.4rem, env(safe-area-inset-right));
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  padding: 0;
  color: var(--color-text);
  background: var(--lightbox-close-bg);
  border: 1px solid var(--color-line);
  border-radius: 50%;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--dur-fast) ease;
}

.lightbox-close:hover {
  color: var(--color-accent);
  background: var(--color-accent-soft);
}

.lightbox-hint {
  position: absolute;
  bottom: max(1.4rem, env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  color: var(--color-dim);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  white-space: nowrap;
  pointer-events: none;
}

.zoom-fade-enter-active,
.zoom-fade-leave-active {
  transition: opacity 0.2s ease;
}

.zoom-fade-enter-active .mascot-lightbox-img,
.zoom-fade-leave-active .mascot-lightbox-img {
  transition: transform 0.2s ease;
}

.zoom-fade-enter-from,
.zoom-fade-leave-to {
  opacity: 0;
}

.zoom-fade-enter-from .mascot-lightbox-img,
.zoom-fade-leave-to .mascot-lightbox-img {
  transform: scale(0.94);
}
</style>
