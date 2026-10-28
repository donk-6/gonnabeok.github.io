import type { BlogPost } from '../posts'

const post: BlogPost = {
  id: 'personal-blog-rhythm',
  title: '个人技术博客的长期维护节奏',
  date: '2026-06-04',
  summary: '技术博客不只是搭建页面，更重要的是建立可持续的记录方式，让输出变成工程成长的副产品。',
  tags: ['Writing', 'Learning', 'Workflow'],
  readingTime: '6 min',
  content: [
    '个人博客最难的部分不是首版上线，而是持续更新。一个可维护的博客，应该让写作路径足够短。',
    '可以把文章分成三类：问题复盘、知识整理、项目日志。问题复盘帮助自己避免重复踩坑，知识整理帮助建立体系，项目日志记录真实决策。',
    '第一版不用追求复杂 CMS。用一个数据文件管理文章，反而能让注意力放回内容本身。等文章多起来，再迁移到 Markdown 或内容系统也不迟。',
  ],
}

export default post
