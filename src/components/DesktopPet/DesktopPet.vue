<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import petImg from './assets/pet.png'

const props = withDefaults(
  defineProps<{
    /** 宠物宽度（px），高度按素材比例自动计算 */
    size?: number
    /** 浮层层级 */
    zIndex?: number
  }>(),
  {
    size: 140,
    zIndex: 800,
  },
)

const STORAGE_POS = 'blog-desktop-pet-pos'
const STORAGE_HIDDEN = 'blog-desktop-pet-hidden'
const ASPECT = 898 / 330
const MESSAGES = [
  '嗨，我是你的桌面小伙伴 👋',
  '按住我就可以拖动我哦～',
  '写代码累了就休息一下吧 ☕',
  '今天也要加油鸭！',
  '看看最近的文章吧 📚',
]

const rootEl = ref<HTMLElement | null>(null)
const visible = ref(true)
const dragging = ref(false)
const showBubble = ref(false)
const bubbleText = ref('')
const x = ref(0)
const y = ref(0)

let bubbleTimer: number | undefined
let startPointer = { x: 0, y: 0 }
let startPos = { x: 0, y: 0 }
let didMove = false

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

function petHeight() {
  return Math.round(props.size * ASPECT)
}

function defaultX() {
  return Math.max(0, window.innerWidth - props.size - 24)
}

function defaultY() {
  return Math.max(0, window.innerHeight - petHeight() - 24)
}

function savePosition() {
  try {
    localStorage.setItem(STORAGE_POS, JSON.stringify({ x: x.value, y: y.value }))
  } catch {
    /* 隐私模式下可能无法写入，忽略即可 */
  }
}

function loadPosition() {
  try {
    const saved = localStorage.getItem(STORAGE_POS)
    if (saved) {
      const parsed = JSON.parse(saved) as { x?: number; y?: number }
      x.value = clamp(parsed.x ?? defaultX(), 0, Math.max(0, window.innerWidth - props.size))
      y.value = clamp(parsed.y ?? defaultY(), 0, Math.max(0, window.innerHeight - petHeight()))
      return
    }
  } catch {
    /* 数据损坏时回退到默认位置 */
  }
  x.value = defaultX()
  y.value = defaultY()
}

function loadHidden() {
  try {
    visible.value = localStorage.getItem(STORAGE_HIDDEN) !== '1'
  } catch {
    visible.value = true
  }
}

function hidePet() {
  visible.value = false
  try {
    localStorage.setItem(STORAGE_HIDDEN, '1')
  } catch {
    /* 忽略 */
  }
}

function showPet() {
  visible.value = true
  try {
    localStorage.removeItem(STORAGE_HIDDEN)
  } catch {
    /* 忽略 */
  }
}

function hideBubble() {
  showBubble.value = false
  window.clearTimeout(bubbleTimer)
}

function showRandomMessage() {
  bubbleText.value = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
  showBubble.value = true
  window.clearTimeout(bubbleTimer)
  bubbleTimer = window.setTimeout(hideBubble, 4000)
}

function onPointerDown(event: PointerEvent) {
  if ((event.target as HTMLElement).closest('.pet-close')) return
  dragging.value = true
  didMove = false
  startPointer = { x: event.clientX, y: event.clientY }
  startPos = { x: x.value, y: y.value }
  rootEl.value?.setPointerCapture(event.pointerId)
  hideBubble()
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  const dx = event.clientX - startPointer.x
  const dy = event.clientY - startPointer.y
  if (Math.abs(dx) + Math.abs(dy) > 4) didMove = true
  x.value = clamp(startPos.x + dx, 0, Math.max(0, window.innerWidth - props.size))
  y.value = clamp(startPos.y + dy, 0, Math.max(0, window.innerHeight - petHeight()))
}

function onPointerUp() {
  if (!dragging.value) return
  dragging.value = false
  if (didMove) {
    savePosition()
  } else {
    showRandomMessage()
  }
}

function onResize() {
  if (!visible.value) return
  x.value = clamp(x.value, 0, Math.max(0, window.innerWidth - props.size))
  y.value = clamp(y.value, 0, Math.max(0, window.innerHeight - petHeight()))
}

onMounted(() => {
  loadHidden()
  loadPosition()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  window.clearTimeout(bubbleTimer)
})
</script>

<template>
  <Transition name="bubble">
    <div
      v-if="visible"
      ref="rootEl"
      class="desktop-pet"
      :class="{ 'is-dragging': dragging }"
      :style="{ left: `${x}px`, top: `${y}px`, width: `${size}px`, zIndex }"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div v-if="showBubble" class="pet-bubble" role="status">
        {{ bubbleText }}
      </div>

      <div class="pet-stage">
        <img class="pet-img" :src="petImg" alt="桌面宠物" draggable="false" />
        <div class="pet-shadow" aria-hidden="true"></div>
      </div>

      <button
        class="pet-close"
        type="button"
        aria-label="隐藏桌面宠物"
        title="隐藏宠物"
        @pointerdown.stop
        @click.stop="hidePet"
      >
        ×
      </button>
    </div>

    <button
      v-else
      class="pet-restore"
      type="button"
      aria-label="显示桌面宠物"
      title="召唤桌面宠物"
      :style="{ zIndex }"
      @click="showPet"
    >
      🐾
    </button>
  </Transition>
</template>

<style scoped>
.desktop-pet {
  position: fixed;
  user-select: none;
  touch-action: none;
  cursor: grab;
}

.desktop-pet.is-dragging {
  cursor: grabbing;
}

.desktop-pet.is-dragging .pet-img,
.desktop-pet.is-dragging .pet-shadow {
  animation-play-state: paused;
}

.pet-stage {
  position: relative;
  width: 100%;
}

.pet-img {
  display: block;
  width: 100%;
  height: auto;
  transform-origin: 50% 100%;
  animation: pet-bob 3.4s ease-in-out infinite;
  filter: drop-shadow(0 10px 12px rgba(15, 23, 42, 0.18));
}

.pet-shadow {
  position: absolute;
  left: 50%;
  bottom: 4px;
  width: 62%;
  height: 14px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse,
    rgba(15, 23, 42, 0.32) 0%,
    rgba(15, 23, 42, 0) 70%
  );
  transform: translateX(-50%);
  animation: shadow-pulse 3.4s ease-in-out infinite;
}

.pet-bubble {
  position: absolute;
  bottom: calc(100% + 14px);
  left: 50%;
  max-width: 220px;
  width: max-content;
  padding: 0.55rem 0.8rem;
  color: #1f2937;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(23, 32, 51, 0.08);
  border-radius: 0.75rem;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.14);
  font-size: 0.82rem;
  line-height: 1.45;
  text-align: center;
  translate: -50% 0;
}

.pet-bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  border: 7px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.96);
  translate: -50% 0;
}

.pet-close {
  position: absolute;
  top: 4px;
  right: 2px;
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  color: #64748b;
  background: rgba(255, 255, 255, 0.85);
  border: 0;
  border-radius: 50%;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);
  transition:
    opacity 0.15s ease,
    background-color 0.15s ease,
    color 0.15s ease;
}

.desktop-pet:hover .pet-close,
.desktop-pet:focus-within .pet-close {
  opacity: 1;
}

.pet-close:hover {
  color: #dc2626;
  background: #ffffff;
}

.pet-restore {
  position: fixed;
  right: 24px;
  bottom: 24px;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  font-size: 1.25rem;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(23, 32, 51, 0.08);
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.16);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.pet-restore:hover {
  transform: translateY(-2px);
}

.bubble-enter-active,
.bubble-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@keyframes pet-bob {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-9px) rotate(1.6deg);
  }
}

@keyframes shadow-pulse {
  0%,
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 0.55;
  }
  50% {
    transform: translateX(-50%) scale(0.86);
    opacity: 0.32;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pet-img,
  .pet-shadow {
    animation: none;
  }
}

@media (max-width: 640px) {
  .desktop-pet,
  .pet-restore {
    display: none;
  }
}
</style>
