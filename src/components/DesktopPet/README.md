# DesktopPet 桌面宠物

基于图片素材抠图得到的角色透明 PNG，独立封装的一个可交互桌面宠物组件。

## 使用

```vue
<script setup lang="ts">
import DesktopPet from '../components/DesktopPet/DesktopPet.vue'
</script>

<template>
  <DesktopPet />
</template>
```

在 `App.vue` 中引入一次即可全站显示。

## 功能

- 悬浮在页面右下角，可按住拖到任意位置（位置会记忆在 `localStorage`）
- 空闲时上下漂浮 + 轻微摆动，带地面阴影
- 点击角色会弹出随机的对话气泡
- 悬停右上角「×」可隐藏，隐藏后右下角出现 🐾 按钮唤回
- 小屏幕（≤ 640px）自动隐藏，不影响移动端浏览
- 遵循 `prefers-reduced-motion`，系统开启减弱动态时停止动画

## Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `number` | `140` | 宠物宽度（px），高度按素材比例自动计算 |
| `zIndex` | `number` | `800` | 浮层层级，注意低于图片灯箱的 `1000` |

## 素材

- `assets/pet.png`：由用户提供的图片抠图、裁剪、压缩得到的角色透明 PNG（330 × 898，约 52 KB）
- 如需更换角色，直接替换该文件并保持宽高比即可，组件无需改动
