# 如何添加新文章

1. 在 `src/data/articles/` 目录下新建一个 `.ts` 文件，文件名建议直接用文章的英文 id，例如 `my-first-post.ts`。
2. 复制下面的模板，填入文章内容。
3. 保存即可，不需要修改任何其他文件。构建时会自动收集该目录下的所有 `.ts` 文件，并按 `date` 倒序展示。

## 模板

```ts
import type { BlogPost } from '../posts'

const post: BlogPost = {
  id: 'my-first-post',      // 唯一 ID，会出现在网址里（#/posts/my-first-post）
  title: '我的第一篇文章',
  date: '2026-08-11',       // 显示日期，格式 YYYY-MM-DD，文章按日期倒序排列
  summary: '一句话简介，会显示在文章列表页。',
  tags: ['Vue', '写作'],     // 标签，用于列表页筛选
  readingTime: '3 min',
  content: [
    '第一段内容。',
    '第二段内容，数组里的每个字符串会渲染成一个段落。',
  ],
}

export default post
```

## 注意事项

- `id` 必须全局唯一，建议使用英文小写和短横线。
- `content` 目前是纯文本段落，还不支持 Markdown 语法。
- 文件请保存为 UTF-8 编码（VS Code 默认就是）。
