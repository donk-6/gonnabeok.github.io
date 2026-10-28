export interface FinanceNewsItem {
  category: string
  title: string
  url: string
  intro: string
  source: string
  time: string
}

export interface FinanceNewsData {
  updatedAt: string
  updatedDate: string
  source: string
  items: FinanceNewsItem[]
}

// 该文件由 scripts/sync-finance-news.mjs 每天自动同步更新
import rawFinanceNews from './finance-news.json'

export const financeNewsData = rawFinanceNews as FinanceNewsData
