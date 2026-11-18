<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import {
  buildPlaylistPlayerUrl,
  fetchPlaylist,
  parseNeteaseLink,
  type NeteaseTrack,
} from '../lib/netease'

const STORAGE_KEY = 'gonnabeok.music.playlist.v1'

const linkText = ref('')
const syncing = ref(false)
const tip = ref('')
const tipError = ref(false)

const audioEl = ref<HTMLAudioElement | null>(null)
const tracks = ref<NeteaseTrack[]>([])
const currentIndex = ref(-1)
const playing = ref(false)
const muted = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.8)
const showList = ref(false)
const fallbackUrl = ref('')
const playerKey = ref(0)

const currentTrack = computed(() =>
  currentIndex.value >= 0 ? (tracks.value[currentIndex.value] ?? null) : null
)
const progress = computed(() =>
  duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
)

function fmtTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return '00:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function showTip(message: string, isError = false) {
  tip.value = message
  tipError.value = isError
}

function savePlaylistId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // 隐私模式等场景写入失败时忽略
  }
}

function playAt(index: number) {
  if (index < 0 || index >= tracks.value.length) return
  currentIndex.value = index
  const audio = audioEl.value
  if (!audio) return
  audio.src = tracks.value[index].url
  audio.load()
  audio
    .play()
    .then(() => {
      playing.value = true
    })
    .catch(() => {
      showTip('浏览器阻止了自动播放，请点击 ▶', true)
    })
}

function togglePlay() {
  const audio = audioEl.value
  if (!audio || currentIndex.value < 0) return
  if (audio.paused) {
    audio
      .play()
      .then(() => {
        playing.value = true
      })
      .catch(() => showTip('播放失败，请尝试切换下一首', true))
  } else {
    audio.pause()
  }
}

function next() {
  if (!tracks.value.length) return
  playAt((currentIndex.value + 1) % tracks.value.length)
}

function prev() {
  if (!tracks.value.length) return
  playAt((currentIndex.value - 1 + tracks.value.length) % tracks.value.length)
}

function seek(e: MouseEvent) {
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  const audio = audioEl.value
  if (audio && duration.value > 0) {
    audio.currentTime = ratio * duration.value
  }
}

function onTime() {
  if (audioEl.value) currentTime.value = audioEl.value.currentTime
}

function onMeta() {
  if (audioEl.value) duration.value = audioEl.value.duration || 0
}

function onAudioError() {
  const track = currentTrack.value
  if (!track) return

  showTip(`《${track.title}》无法播放，可能受版权或地区限制，已跳到下一首`, true)
  if (tracks.value.length > 1) {
    window.setTimeout(next, 1200)
  }
}

function applyVolume() {
  const audio = audioEl.value
  if (!audio) return
  audio.volume = volume.value
  audio.muted = volume.value === 0
  muted.value = audio.muted
}

function toggleMute() {
  const audio = audioEl.value
  if (!audio) return
  audio.muted = !audio.muted
  muted.value = audio.muted
}

function applyLink(raw: string): string {
  const parsed = parseNeteaseLink(raw)
  if (parsed.kind === 'playlist' && parsed.id) {
    return parsed.id
  }
  if (parsed.kind === 'song') {
    throw new Error('这是单曲链接，请粘贴歌单分享链接')
  }
  if (parsed.kind === 'album') {
    throw new Error('这是专辑链接，请粘贴歌单分享链接')
  }
  throw new Error('没有识别出网易云歌单链接，请检查后重试')
}

async function loadPlaylist(id: string, autoplay: boolean) {
  syncing.value = true
  try {
    const list = await fetchPlaylist(id)
    tracks.value = list
    currentIndex.value = 0
    fallbackUrl.value = ''
    savePlaylistId(id)
    showTip(
      autoplay
        ? `歌单同步成功，共 ${list.length} 首`
        : `已恢复上次歌单，共 ${list.length} 首`
    )

    await nextTick()
    const audio = audioEl.value
    if (!audio) return
    applyVolume()
    audio.src = list[0].url
    audio.load()
    if (autoplay) {
      audio
        .play()
        .then(() => {
          playing.value = true
        })
        .catch(() => showTip('请点击 ▶ 开始播放', true))
    }
  } catch (err) {
    // 歌单接口不可用时回退到官方播放器，保证仍然可以听
    tracks.value = []
    currentIndex.value = -1
    fallbackUrl.value = buildPlaylistPlayerUrl(id)
    playerKey.value += 1
    savePlaylistId(id)
    showTip(
      err instanceof Error ? `${err.message}，已切换官方播放器` : '歌单加载失败，已切换官方播放器',
      true
    )
  } finally {
    syncing.value = false
  }
}

async function sync() {
  const raw = linkText.value.trim()
  if (!raw) {
    showTip('请先粘贴网易云歌单分享链接', true)
    return
  }
  let id: string
  try {
    id = applyLink(raw)
  } catch (err) {
    showTip(err instanceof Error ? err.message : '链接无法识别', true)
    return
  }
  await loadPlaylist(id, true)
}

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && /^\d+$/.test(saved)) {
      void loadPlaylist(saved, false)
    }
  } catch {
    // 本地缓存读取失败时忽略
  }
})
</script>

<template>
  <section class="glass-card music-module">
    <div class="music-head">
      <span class="music-note">
        <img v-if="currentTrack?.pic" :src="currentTrack.pic" alt="" />
        <template v-else>♪</template>
      </span>
      <div class="music-meta">
        <strong :title="currentTrack?.title">{{ currentTrack?.title || 'Close To Code' }}</strong>
        <small :title="currentTrack?.artist">
          {{ currentTrack ? currentTrack.artist : '网易云歌单 · 在线听' }}
        </small>
      </div>
    </div>

    <audio
      v-if="tracks.length"
      ref="audioEl"
      preload="none"
      @play="playing = true"
      @pause="playing = false"
      @ended="next"
      @timeupdate="onTime"
      @loadedmetadata="onMeta"
      @error="onAudioError"
    />

    <div v-if="fallbackUrl" class="music-frame">
      <iframe
        :key="playerKey"
        :src="fallbackUrl"
        title="网易云音乐播放器"
        loading="lazy"
        allow="autoplay"
      />
    </div>

    <template v-else-if="tracks.length">
      <div class="player-actions">
        <button type="button" class="ctrl-btn" aria-label="上一首" @click="prev">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5h2v14H5zm14 0v14L8 12z" />
          </svg>
        </button>
        <button type="button" class="main-play" aria-label="播放或暂停" @click="togglePlay">
          <svg v-if="playing" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 5h3.2v14H7zm6.8 0H17v14h-3.2z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <button type="button" class="ctrl-btn" aria-label="下一首" @click="next">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17 5h2v14h-2zM3 5v14l11-7z" />
          </svg>
        </button>

        <span class="volume">
          <button type="button" class="mute-btn" aria-label="静音" @click="toggleMute">
            {{ muted || volume === 0 ? '🔇' : '🔊' }}
          </button>
          <input
            v-model.number="volume"
            class="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.02"
            aria-label="音量"
            @input="applyVolume"
          />
        </span>

        <button type="button" class="list-toggle" @click="showList = !showList">
          歌单 {{ tracks.length }} 首 {{ showList ? '▲' : '▼' }}
        </button>
      </div>

      <div class="player-bar">
        <span class="time">{{ fmtTime(currentTime) }}</span>
        <div class="progress" @click="seek">
          <div class="progress-inner" :style="{ width: progress + '%' }"></div>
        </div>
        <span class="time">{{ fmtTime(duration) }}</span>
      </div>

      <div v-if="showList" class="song-list">
        <button
          v-for="(track, index) in tracks"
          :key="track.url"
          type="button"
          class="song-item"
          :class="{ active: index === currentIndex }"
          @click="playAt(index)"
        >
          <span class="song-index">{{ index + 1 }}</span>
          <span class="song-name">{{ track.title }}</span>
          <span class="song-artist">{{ track.artist }}</span>
        </button>
      </div>
    </template>

    <div v-else class="music-placeholder">
      <span class="placeholder-note">♪</span>
      <p>在线听歌</p>
      <small>粘贴网易云歌单链接，即可收听整个歌单</small>
    </div>

    <p v-if="tip" class="sync-tip" :class="{ error: tipError }">{{ tip }}</p>

    <div class="music-sync">
      <div class="sync-panel">
        <div class="sync-input-row">
          <input
            v-model="linkText"
            type="text"
            placeholder="粘贴网易云歌单分享链接…"
            @keyup.enter="sync"
          />
          <button
            type="button"
            class="sync-btn"
            :disabled="syncing"
            @click="sync"
          >
            {{ syncing ? '同步中…' : '同步' }}
          </button>
        </div>
        <small>支持 music.163.com / y.music.163.com 歌单链接，或直接粘贴歌单 ID</small>
      </div>
    </div>
  </section>
</template>

<style scoped>
.music-module {
  padding: var(--space-4);
}

.music-head {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.music-note {
  display: grid;
  flex: 0 0 auto;
  width: 2.6rem;
  height: 2.6rem;
  place-items: center;
  overflow: hidden;
  color: var(--color-accent);
  background: var(--color-accent-soft);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  font-size: 1.1rem;
}

.music-note img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.music-meta {
  min-width: 0;
}

.music-meta strong,
.music-meta small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.music-meta strong {
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
}

.music-meta small {
  color: var(--color-dim);
  font-family: var(--font-mono);
  font-size: 0.78rem;
}

.play-dot {
  display: grid;
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  margin-left: auto;
  place-items: center;
  color: var(--color-bg);
  background: var(--color-accent);
  border-radius: 999px;
  font-size: 0.72rem;
}

.player-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: var(--space-3);
}

.ctrl-btn,
.main-play {
  display: grid;
  place-items: center;
  border: 0;
  cursor: pointer;
  transition:
    transform var(--dur-fast) ease,
    background-color var(--dur-fast) ease,
    color var(--dur-fast) ease;
}

.ctrl-btn {
  width: 2.2rem;
  height: 2.2rem;
  color: var(--color-muted);
  background: var(--color-surface-2);
  border: 1px solid var(--color-line);
  border-radius: 50%;
}

.ctrl-btn svg,
.main-play svg {
  width: 15px;
  height: 15px;
  fill: currentColor;
}

.ctrl-btn:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.main-play {
  width: 2.6rem;
  height: 2.6rem;
  color: var(--color-bg);
  background: var(--color-accent);
  border-radius: 50%;
  box-shadow: 0 0 0 4px var(--color-accent-soft);
}

.main-play svg {
  width: 17px;
  height: 17px;
}

.main-play:hover {
  transform: scale(1.06);
  background: var(--color-accent-deep);
}

.ctrl-btn:active,
.main-play:active {
  transform: scale(0.94);
}

.volume {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-left: auto;
}

.mute-btn {
  padding: 0;
  color: var(--color-muted);
  background: none;
  border: 0;
  font-size: 0.82rem;
  cursor: pointer;
}

.volume-slider {
  width: 3.4rem;
  accent-color: var(--color-accent);
}

.list-toggle {
  flex: 0 0 auto;
  padding: 0.42rem 0.6rem;
  color: var(--color-accent);
  background: transparent;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  cursor: pointer;
}

.list-toggle:hover {
  border-color: var(--color-accent);
  background: var(--color-accent-soft);
}

.player-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: var(--space-3);
}

.time {
  flex: 0 0 auto;
  color: var(--color-dim);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-variant-numeric: tabular-nums;
}

.progress {
  flex: 1;
  height: 4px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-line);
  border-radius: 999px;
  cursor: pointer;
}

.progress-inner {
  height: 100%;
  background: var(--color-accent);
  border-radius: 999px;
}

.song-list {
  max-height: 170px;
  margin-top: var(--space-3);
  overflow-y: auto;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
}

.song-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.45rem 0.6rem;
  color: var(--color-muted);
  background: none;
  border: 0;
  text-align: left;
  cursor: pointer;
}

.song-item + .song-item {
  border-top: 1px solid var(--color-line);
}

.song-item:hover {
  background: var(--color-surface-2);
}

.song-item.active {
  color: var(--color-accent);
  background: var(--color-accent-soft);
}

.song-index {
  flex: 0 0 1.6rem;
  color: var(--color-dim);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
}

.song-item.active .song-index {
  color: var(--color-accent);
}

.song-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8rem;
}

.song-artist {
  flex: 0 0 auto;
  max-width: 38%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-dim);
  font-size: 0.7rem;
}

.music-frame {
  margin-top: var(--space-3);
  overflow: hidden;
  background: var(--color-surface-2);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
}

.music-frame iframe {
  display: block;
  width: 100%;
  height: 66px;
  border: 0;
}

.music-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: var(--space-3);
  padding: var(--space-3);
  color: var(--color-dim);
  background: var(--color-surface-2);
  border: 1px dashed var(--color-line-strong);
  border-radius: var(--radius-sm);
  text-align: center;
}

.music-placeholder .placeholder-note {
  color: var(--color-accent);
  font-size: 1rem;
}

.music-placeholder p {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.85rem;
  font-weight: 600;
}

.music-placeholder small {
  font-size: 0.72rem;
}

.sync-tip {
  margin: var(--space-3) 0 0;
  color: var(--color-dim);
  font-size: 0.76rem;
  text-align: center;
}

.sync-tip.error {
  color: #ff8a7a;
}

.music-sync {
  margin-top: var(--space-3);
  text-align: center;
}

.sync-panel {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-line);
}

.sync-input-row {
  display: flex;
  gap: 0.5rem;
}

.sync-input-row input {
  flex: 1;
  min-width: 0;
  padding: 0.55rem 0.7rem;
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  outline: none;
  transition: border-color var(--dur-fast) ease;
}

.sync-input-row input::placeholder {
  color: var(--color-dim);
}

.sync-input-row input:focus {
  border-color: var(--color-accent);
}

.sync-btn {
  flex: 0 0 auto;
  padding: 0.55rem 0.95rem;
  color: var(--color-bg);
  background: var(--color-accent);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.sync-btn:hover {
  background: var(--color-accent-deep);
}

.sync-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.sync-panel small {
  color: var(--color-dim);
  font-size: 0.7rem;
}
</style>
