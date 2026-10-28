# gonnabeok.gitee.io

Vue 3 + Vite 个人技术博客，部署到 Gitee Pages。

## Scripts

```bash
pnpm install
pnpm run dev
pnpm run build
pnpm run preview
```

## Gitee Pages 部署

项目使用相对路径构建（`base: './'`），用户主页（`用户名.gitee.io`）和项目主页（子路径部署）都适用。

1. 构建站点：`pnpm build`
2. 提交构建产物（`dist` 目录已被 gitignore，需要强制添加）：

   ```bash
   git add -f dist
   git commit -m "build: 构建站点"
   ```

3. 推送到 Gitee 远程仓库：

   ```bash
   git remote add gitee https://gitee.com/gonnabeok/gonnabeok.gitee.io.git
   git push gitee master
   ```

4. 打开仓库「服务 → Gitee Pages」，选择分支与目录（根目录），点击「启动」。
5. 之后每次内容更新推送后，回到 Gitee Pages 页面点击「更新」即可生效
   （Gitee Pages 免费版需要手动点击更新，没有自动部署）。

## 每日财经新闻同步

首页的「每日财经新闻」模块由 `scripts/sync-finance-news.mjs` 生成数据。

- 本地/手动：`node scripts/sync-finance-news.mjs`，会更新 `src/data/finance-news.json`。
- 自动：`.github/workflows/sync-finance-news.yml` 每天 08:30 / 20:30 定时同步
  （需要把仓库镜像到 GitHub 才能用 GitHub Actions；纯 Gitee 环境只能手动运行，
  或者使用 Gitee Go 自行配置定时流水线）。

## Content

Each article lives in its own file under `src/data/articles/`, e.g. `src/data/articles/my-first-post.ts`.
Files in that directory are collected automatically, so adding a post is just creating a new file —
see `src/data/articles/TEMPLATE.md` for the exact format.
