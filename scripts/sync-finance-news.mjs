#!/usr/bin/env node
/**
 * 每日财经新闻同步脚本。
 *
 * 从新浪财经滚动新闻接口拉取当天财经资讯，按
 * 黄金 / 标普500 两个主题各筛选 1 条，
 * 写入 src/data/finance-news.json 供首页「每日财经新闻」模块展示。
 * 该脚本可由定时任务（如 GitHub Actions）每天执行，也可本地手动运行：
 *
 *   node scripts/sync-finance-news.mjs
 */

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const FEEDS = [
  { pageid: 384, lid: 2672 }, // 美股频道
  { pageid: 153, lid: 2516 }, // 财经频道
]

const PAGES = 3
const PAGE_SIZE = 50
const ITEMS_PER_CATEGORY = 1

const OUTPUT_PATH = fileURLToPath(
  new URL('../src/data/finance-news.json', import.meta.url)
)

const TIME_ZONE = 'Asia/Shanghai'

// 每个主题的关键词：先按精确关键词筛选，数量不足时再用宽松关键词补齐
const CATEGORIES = [
  {
    name: '黄金',
    exact: ['黄金', '金价', '贵金属', '金市', '现货金', '金银', '金条', '沪金', '金饰', 'COMEX金', '国际金', '黄金价格', '金价上涨', '金价下跌'],
    loose: [],
  },
  {
    name: '标普500',
    exact: ['标普500', '标普 500', '标准普尔', 'S&P 500', '标普指数', '标普500指数', '标指'],
    loose: ['标普'],
  },
]

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function formatParts(timestamp) {
  return Object.fromEntries(
    dateFormatter
      .formatToParts(timestamp)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  )
}

/** 返回 YYYY-MM-DD 格式的上海时区日期。 */
function formatDate(timestamp) {
  const { year, month, day } = formatParts(timestamp)
  return `${year}-${month}-${day}`
}

/** 返回 HH:mm 格式的上海时区时间。 */
function formatTime(timestamp) {
  const { hour, minute } = formatParts(timestamp)
  return `${hour}:${minute}`
}

function buildOutput(timestamp) {
  return {
    updatedAt: `${formatDate(timestamp)}T${formatTime(timestamp)}:00+08:00`,
    updatedDate: formatDate(timestamp),
    source: '新浪财经',
    items: [],
  }
}

async function main() {
  const now = Date.now()
  const output = buildOutput(now)
  const rawItems = await fetchRawItems()
  const uniqueItems = dedupe(rawItems)

  for (const category of CATEGORIES) {
    const picked = pickItems(uniqueItems, category, ITEMS_PER_CATEGORY)
    for (const item of picked) {
      output.items.push(toNewsItem(item, category.name, now))
    }
  }

  if (output.items.length === 0) {
    throw new Error('接口返回的数据中没有可用的财经新闻')
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n', 'utf8')
  const perCategory = CATEGORIES.map(
    (cat) => `${cat.name}×${output.items.filter((it) => it.category === cat.name).length}`
  ).join(' ')
  console.log(`已同步 ${output.items.length} 条财经新闻（${perCategory}）→ src/data/finance-news.json`)
}

/** 从多个频道抓取最近几页新闻，合并为一个列表。 */
async function fetchRawItems() {
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
  }

  const all = []
  for (const feed of FEEDS) {
    for (let page = 1; page <= PAGES; page += 1) {
      const url =
        `https://feed.mix.sina.com.cn/api/roll/get?pageid=${feed.pageid}` +
        `&lid=${feed.lid}&num=${PAGE_SIZE}&page=${page}`
      const response = await fetch(url, { headers })
      if (!response.ok) {
        throw new Error(`新浪财经接口请求失败：HTTP ${response.status}`)
      }
      const payload = await response.json()
      const data = payload?.result?.data
      if (Array.isArray(data)) {
        all.push(...data)
      }
    }
  }

  if (all.length === 0) {
    throw new Error('新浪财经接口没有返回新闻数据，请稍后重试')
  }
  return all
}

/** 按链接去重，保留最新出现的版本。 */
function dedupe(rawItems) {
  const seenUrls = new Set()
  const unique = []
  for (const raw of rawItems) {
    const url = String(raw.url ?? '').trim()
    if (!url || seenUrls.has(url)) continue
    seenUrls.add(url)
    unique.push(raw)
  }
  return unique
}

/**
 * 从新闻列表里按关键词筛选某个主题的条目。
 * 先用精确关键词，不足规定数量时再用宽松关键词补齐。
 */
function pickItems(rawItems, category, limit) {
  const matches = (keywords) =>
    rawItems.filter((item) => {
      const title = String(item.title ?? '')
      return keywords.some((keyword) => title.includes(keyword))
    })

  const exact = matches(category.exact)
  if (exact.length >= limit) {
    return exact.slice(0, limit)
  }

  const picked = [...exact]
  const pickedUrls = new Set(picked.map((item) => item.url))
  for (const item of matches(category.loose)) {
    if (picked.length >= limit) break
    if (pickedUrls.has(item.url)) continue
    picked.push(item)
    pickedUrls.add(item.url)
  }
  return picked
}

/** 把接口原始条目转成站点数据格式。 */
function toNewsItem(raw, category, now) {
  const ctime = Number(raw.ctime)
  return {
    category,
    title: String(raw.title ?? '').trim(),
    url: String(raw.url ?? '').trim(),
    intro: String(raw.intro ?? '').trim().slice(0, 100),
    source: String(raw.media_name ?? '').trim() || '新浪财经',
    time: Number.isFinite(ctime) && ctime > 0 ? formatTime(ctime * 1000) : formatTime(now),
  }
}

main().catch((error) => {
  console.error(`[每日财经新闻同步失败] ${error instanceof Error ? error.message : error}`)
  process.exit(1)
})
