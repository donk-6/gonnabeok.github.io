<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const STORAGE_KEY = 'gonnabeok_checkin_dates'
type DateKey = string

/** 用本地时区生成 YYYY-MM-DD，避免 toISOString 的 UTC 偏移导致差一天。 */
function toDateKey(date: Date): DateKey {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function loadRecords(): DateKey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((item): item is DateKey => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

const today = new Date()
const todayKey = toDateKey(today)
const records = ref<Set<DateKey>>(new Set(loadRecords()))

const viewYear = ref(today.getFullYear())
const viewMonth = ref(today.getMonth())

const weekLabels = ['一', '二', '三', '四', '五', '六', '日']

const monthTitle = computed(() => `${viewYear.value}年${viewMonth.value + 1}月`)

/** 生成当月日历格子，周一为一周起点，前面用空格补齐。 */
const cells = computed(() => {
  const firstWeekday = (new Date(viewYear.value, viewMonth.value, 1).getDay() + 6) % 7
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  const result: { key: DateKey; day: number }[] = []
  for (let i = 0; i < firstWeekday; i += 1) {
    result.push({ key: `blank-${i}`, day: 0 })
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    result.push({ key: toDateKey(new Date(viewYear.value, viewMonth.value, d)), day: d })
  }
  return result
})

const signedToday = computed(() => records.value.has(todayKey))
const totalDays = computed(() => records.value.size)

/** 连续签到：今天没签则从昨天起算，避免当天未签就清零。 */
const streakDays = computed(() => {
  let count = 0
  const cursor = new Date(today)
  if (!records.value.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (records.value.has(toDateKey(cursor))) {
    count += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return count
})

const tip = ref('')
let tipTimer: number | undefined

function showTip(text: string) {
  tip.value = text
  if (tipTimer) window.clearTimeout(tipTimer)
  tipTimer = window.setTimeout(() => {
    tip.value = ''
  }, 2400)
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...records.value]))
  } catch {
    // 隐私模式或存储不可用时静默降级，仅保留本次会话状态
  }
}

function checkIn() {
  if (signedToday.value) {
    showTip('今天已经签到啦～')
    return
  }
  const next = new Set(records.value)
  next.add(todayKey)
  records.value = next
  persist()
  showTip(`签到成功！已连续 ${streakDays.value} 天`)
}

function onDayClick(cell: { key: DateKey; day: number }) {
  if (cell.key === todayKey) checkIn()
}

function shiftMonth(offset: number) {
  const target = new Date(viewYear.value, viewMonth.value + offset, 1)
  viewYear.value = target.getFullYear()
  viewMonth.value = target.getMonth()
}

function goToday() {
  viewYear.value = today.getFullYear()
  viewMonth.value = today.getMonth()
}

const isCurrentMonth = computed(
  () => viewYear.value === today.getFullYear() && viewMonth.value === today.getMonth(),
)

onBeforeUnmount(() => {
  if (tipTimer) window.clearTimeout(tipTimer)
})
</script>

<template>
  <div class="glass-card checkin-card">
    <div class="checkin-head">
      <div>
        <p class="checkin-label">CHECK-IN</p>
        <strong>签到日历</strong>
        <small>{{ monthTitle }}</small>
      </div>
      <div class="checkin-nav">
        <button type="button" aria-label="上个月" @click="shiftMonth(-1)">‹</button>
        <button v-if="!isCurrentMonth" type="button" class="back-today" @click="goToday">今</button>
        <button type="button" aria-label="下个月" @click="shiftMonth(1)">›</button>
      </div>
    </div>

    <div class="checkin-week">
      <span v-for="label in weekLabels" :key="label">{{ label }}</span>
    </div>
    <div class="checkin-days">
      <span
        v-for="cell in cells"
        :key="cell.key"
        class="checkin-day"
        :class="{
          blank: cell.day === 0,
          'is-today': cell.key === todayKey,
          signed: cell.day > 0 && records.has(cell.key),
          clickable: cell.key === todayKey,
        }"
        @click="onDayClick(cell)"
      >{{ cell.day || '' }}</span>
    </div>

    <div class="checkin-stats">
      <span>连续 <b>{{ streakDays }}</b> 天</span>
      <span>累计 <b>{{ totalDays }}</b> 天</span>
    </div>

    <button
      type="button"
      class="checkin-button"
      :class="{ done: signedToday }"
      @click="checkIn"
    >
      {{ signedToday ? '今日已签到 ✓' : '每日签到' }}
    </button>

    <transition name="checkin-fade">
      <p v-if="tip" class="checkin-tip">{{ tip }}</p>
    </transition>
  </div>
</template>

<style scoped>
.checkin-card {
  padding: var(--space-4);
}

.checkin-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.checkin-label {
  margin: 0 0 0.25rem;
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.16em;
}

.checkin-head strong {
  display: block;
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: var(--step-0);
  font-weight: 600;
}

.checkin-head small {
  color: var(--color-dim);
  font-family: var(--font-mono);
  font-size: 0.68rem;
}

.checkin-nav {
  display: flex;
  gap: 0.25rem;
}

.checkin-nav button {
  display: grid;
  width: 1.55rem;
  height: 1.55rem;
  place-items: center;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  color: var(--color-muted);
  background: var(--color-surface-2);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  transition:
    color var(--dur-fast) ease,
    border-color var(--dur-fast) ease;
}

.checkin-nav button:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.checkin-nav .back-today {
  font-size: 0.68rem;
}

.checkin-week,
.checkin-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.2rem;
  text-align: center;
}

.checkin-week {
  margin-bottom: 0.35rem;
}

.checkin-week span {
  color: var(--color-dim);
  font-family: var(--font-mono);
  font-size: 0.64rem;
}

.checkin-day {
  position: relative;
  display: grid;
  aspect-ratio: 1;
  place-items: center;
  border-radius: var(--radius-sm);
  color: var(--color-muted);
  font-family: var(--font-mono);
  font-size: 0.68rem;
}

.checkin-day.blank {
  visibility: hidden;
}

.checkin-day.clickable {
  cursor: pointer;
}

.checkin-day.clickable:hover {
  background: var(--color-surface-2);
}

.checkin-day.signed {
  color: var(--color-accent);
  background: var(--color-accent-soft);
  font-weight: 600;
}

.checkin-day.signed::after {
  position: absolute;
  bottom: 3px;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--color-accent);
  content: '';
}

.checkin-day.is-today {
  box-shadow: inset 0 0 0 1.5px var(--color-accent);
  color: var(--color-accent);
  font-weight: 600;
}

.checkin-day.is-today.signed {
  color: var(--color-bg);
  background: var(--color-accent);
  box-shadow: none;
}

.checkin-day.is-today.signed::after {
  background: var(--color-bg);
}

.checkin-stats {
  display: flex;
  justify-content: space-between;
  margin: var(--space-3) 0 var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px dashed var(--color-line-strong);
  color: var(--color-dim);
  font-size: 0.72rem;
}

.checkin-stats b {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: var(--step-1);
  font-variant-numeric: tabular-nums;
}

.checkin-button {
  width: 100%;
  min-height: 2.6rem;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  color: var(--color-bg);
  background: var(--color-accent);
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color var(--dur-fast) ease,
    border-color var(--dur-fast) ease,
    color var(--dur-fast) ease;
}

.checkin-button:hover {
  background: var(--color-accent-deep);
  border-color: var(--color-accent-deep);
}

.checkin-button.done {
  color: var(--color-dim);
  background: transparent;
  border-color: var(--color-line);
  cursor: default;
}

.checkin-tip {
  margin: var(--space-2) 0 0;
  color: var(--color-accent);
  font-size: 0.72rem;
  text-align: center;
}

.checkin-fade-enter-active,
.checkin-fade-leave-active {
  transition: opacity 0.25s;
}

.checkin-fade-enter-from,
.checkin-fade-leave-to {
  opacity: 0;
}
</style>
