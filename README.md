# gonnabeok.github.io

Vue 3 + Vite 个人技术博客，托管在 GitHub 仓库 `donk-6/gonnabeok.github.io`，通过 GitHub Pages 发布。

站点地址：https://donk-6.github.io/gonnabeok.github.io/

## Scripts

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run preview
```

## GitHub Pages 部署

项目使用相对路径构建（`base: './'`）和 hash 路由，适合 Pages 的项目站点子路径访问。

1. 修改文章或组件后提交到 `main` 分支。
2. `git push origin main`。
3. `.github/workflows/deploy.yml` 会自动安装依赖、构建 `dist/`，并发布到 GitHub Pages。
4. 在仓库 Actions 页面确认 `Deploy GitHub Pages` 运行成功。

首次使用需要在仓库 Settings → Pages → Build and deployment 中把 Source 设为 **GitHub Actions**。

## 每日财经新闻同步

首页的「每日财经新闻」模块由 `scripts/sync-finance-news.mjs` 生成数据。

- 本地/手动：`node scripts/sync-finance-news.mjs`，会更新 `src/data/finance-news.json`。
- 自动：`.github/workflows/sync-finance-news.yml` 每天 08:30 / 20:30（北京时间）拉取新闻、提交数据、重新构建并发布到 Pages。
- 手动验证：在 GitHub 仓库 Actions 页面选择「每日财经新闻同步」，点击 **Run workflow** 可立即执行一次。
- 脚本内置重试和兜底：接口临时失败会重试 3 次；当天没有关键词命中时会用最新新闻占位，避免模块空白。

## Content

Each article lives in its own file under `src/data/articles/`, e.g. `src/data/articles/my-first-post.ts`.
Files in that directory are collected automatically, so adding a post is just creating a new file —
see `src/data/articles/TEMPLATE.md` for the exact format.
