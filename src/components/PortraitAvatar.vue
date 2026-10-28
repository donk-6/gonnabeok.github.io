<script setup lang="ts">
// 头像组件：src 传图片地址；没传时显示默认字母 G
defineProps<{
  src?: string
  alt?: string
}>()
</script>

<template>
  <!-- 有图片就显示图片，没有就显示字母 G -->
  <span class="portrait" :class="{ 'is-image': src }">
    <img
      v-if="src"
      :src="src"
      :alt="alt ?? '头像'"
      loading="lazy"
    />
    <span v-else class="portrait-letter">G</span>
  </span>
</template>

<style scoped>
/* 头像容器：固定尺寸的圆角方块 */
.portrait {
  display: grid;
  width: 3.1rem;
  height: 3.1rem;
  place-items: center;
  overflow: hidden;
  color: #ffffff;
  background: #172033;
  border-radius: 0.9rem;
}

/* 有图片时去掉深色背景，让图片铺满 */
.portrait.is-image {
  background: transparent;
}

/* 图片填满容器并裁切居中，不会拉伸变形 */
.portrait img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 没有图片时显示的字母 G */
.portrait-letter {
  font-size: 1.25rem;
  font-weight: 900;
}
</style>
