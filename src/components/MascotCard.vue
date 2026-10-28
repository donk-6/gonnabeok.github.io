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
  padding: 1.4rem;
  overflow: hidden;
  background: linear-gradient(
    165deg,
    rgba(255, 255, 255, 0.96) 0%,
    rgba(236, 244, 253, 0.88) 100%
  );
}

.mascot-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 5px;
  background: linear-gradient(
    180deg,
    rgba(27, 116, 228, 0) 55%,
    rgba(27, 116, 228, 0.07) 100%
  );
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
  border-radius: 5px;
  box-shadow: 0 4px 14px rgba(23, 32, 51, 0.1);
  filter: saturate(0.9) brightness(1.04) contrast(1.02);
  transform: scale(0.99);
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
  background: rgba(15, 23, 42, 0.82);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  cursor: zoom-out;
}

.mascot-lightbox-img {
  max-width: 92vw;
  max-height: 88vh;
  border-radius: 0.75rem;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
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
  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
  border: 0;
  border-radius: 50%;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.28);
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
