import type { BlogPost } from '../posts'

const post: BlogPost = {
  id: 'vite-deploy-github-pages',
  title: '用 Vite 部署 GitHub Pages 的关键点',
  date: '2026-06-05',
  summary: '记录 Vite 项目部署到 GitHub Pages 时最容易忽略的 base、路由和 Actions 配置。',
  tags: ['Vite', 'GitHub Pages', 'Deploy'],
  readingTime: '4 min',
  content: [
    'GitHub Pages 的用户主页仓库通常使用 username.github.io，站点根路径就是 /，所以 Vite 的 base 可以保持为 /。',
    '如果是项目页，地址会带仓库名，这时 base 需要改成 /repo-name/。这也是很多静态资源 404 的来源。',
    '对于单页应用，使用 hash 路由能避开刷新详情页时服务器找不到真实文件的问题，是小型个人博客很实用的选择。',
  ],
}

export default post
