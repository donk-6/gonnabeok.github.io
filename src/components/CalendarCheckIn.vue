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
  padding: 1.1rem 1.2rem;
}

.checkin-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}

.checkin-head strong {
  display: block;
  color: #111827;
  font-size: 0.95rem;
}

.checkin-head small {
  color: #9aa4b8;
  font-size: 0.72rem;
}

.checkin-nav {
  display: flex;
  gap: 0.3rem;
}

.checkin-nav button {
  display: grid;
  width: 1.5rem;
  height: 1.5rem;
  place-items: center;
  border: 0;
  border-radius: 0.35rem;
  color: #586174;
  background: #eef2f8;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
}

.checkin-nav button:hover {
  color: #1b74e4;
  background: #e7f0fb;
}

.checkin-nav .back-today {
  font-size: 0.7rem;
  font-weight: 700;
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
  color: #9aa4b8;
  font-size: 0.68rem;
  font-weight: 700;
}

.checkin-day {
  position: relative;
  display: grid;
  aspect-ratio: 1;
  place-items: center;
  border-radius: 0.35rem;
  color: #586174;
  font-size: 0.72rem;
}

.checkin-day.blank {
  visibility: hidden;
}

.checkin-day.clickable {
  cursor: pointer;
}

.checkin-day.signed {
  color: #1b74e4;
  background: #e7f0fb;
  font-weight: 800;
}

.checkin-day.signed::after {
  position: absolute;
  bottom: 2px;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #1b74e4;
  content: '';
}

.checkin-day.is-today {
  box-shadow: inset 0 0 0 1.5px #1b74e4;
  color: #1b74e4;
  font-weight: 800;
}

.checkin-day.is-today.signed {
  color: #ffffff;
  background: #1b74e4;
  box-shadow: none;
}

.checkin-day.is-today.signed::after {
  background: #ffffff;
}

.checkin-stats {
  display: flex;
  justify-content: space-between;
  margin: 0.8rem 0 0.6rem;
  padding-top: 0.7rem;
  border-top: 1px dashed rgba(23, 32, 51, 0.12);
  color: #7a8496;
  font-size: 0.74rem;
}

.checkin-stats b {
  color: #111827;
  font-size: 0.95rem;
}

.checkin-button {
  width: 100%;
  min-height: 2.5rem;
  border: 0;
  border-radius: 0.6rem;
  color: #ffffff;
  background: #1b74e4;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 0.5rem 1.2rem rgba(27, 116, 228, 0.25);
}

.checkin-button:hover {
  background: #155fc0;
}

.checkin-button.done {
  color: #8a94a6;
  background: #eef2f8;
  box-shadow: none;
  cursor: default;
}

.checkin-tip {
  margin: 0.55rem 0 0;
  color: #1b74e4;
  font-size: 0.74rem;
  font-weight: 600;
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
