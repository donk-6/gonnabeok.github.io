export interface BlogPost {
  id: string
  title: string
  date: string
  summary: string
  tags: string[]
  readingTime: string
  content: string[]
}

// 自动收集 src/data/articles/ 下的所有文章文件（每个文件默认导出一篇 BlogPost）
// 新增文章时只需在 articles 目录里新建一个 .ts 文件，无需修改这里的代码
const modules = import.meta.glob('./articles/*.ts', { eager: true })

export const posts: BlogPost[] = Object.values(modules)
  .map((module) => (module as { default?: BlogPost }).default)
  .filter((post): post is BlogPost => Boolean(post))
  .sort((a, b) => b.date.localeCompare(a.date))

export const allTags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort()

export function getPostById(id: string) {
  return posts.find((post) => post.id === id)
}
