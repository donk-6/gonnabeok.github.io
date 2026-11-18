<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import mascotSrc from '../assets/mascot.jpg'

const zoomed = ref(false)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    zoomed.value = false
  }
}

watch(zoomed, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="glass-card mascot-card">
    <button
      type="button"
      class="mascot-zoom"
      aria-label="放大查看图片"
      @click="zoomed = true"
    >
      <img :src="mascotSrc" alt="gonnabeok blog mascot" />
    </button>
  </div>

  <Transition name="zoom-fade">
    <div
      v-if="zoomed"
      class="mascot-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
      @click="zoomed = false"
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
        @click="zoomed = false"
      >
        ×
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.mascot-card {
  position: relative;
  display: grid;
  place-items: center;
  padding: 0.7rem 0.7rem 2.2rem;
  overflow: hidden;
  background: linear-gradient(165deg, rgba(23, 29, 42, 0.9), rgba(13, 17, 25, 0.92));
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
  background: rgba(6, 8, 12, 0.9);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  cursor: zoom-out;
}

.mascot-lightbox-img {
  max-width: 92vw;
  max-height: 88vh;
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
  background: rgba(236, 229, 216, 0.1);
  border: 1px solid var(--color-line);
  border-radius: 50%;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: background-color var(--dur-fast) ease;
}

.lightbox-close:hover {
  color: var(--color-accent);
  background: var(--color-accent-soft);
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
