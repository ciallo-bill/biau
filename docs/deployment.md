# 部署方案

## 当前线上地址

```text
https://biau.playlab.eu.cc
```

## 部署结论

当前站点部署在 Cloudflare Pages，并通过 GitHub `main` 分支自动更新。

推荐继续使用 Cloudflare Pages 的原因：

- 当前站点是 React + Vite 静态应用，生产产物是 `dist`，非常适合 Pages 的 GitHub 自动构建。
- 页面主要是官网展示、项目展示、案例中心和博客内容，不依赖常驻 Node 服务。
- Cloudflare Pages 自带 CDN、HTTPS、预览环境和回滚能力。
- `public/_redirects` 已加入，生产环境刷新 `/projects`、`/cases`、`/blogs` 会回退到 `index.html`。

## Cloudflare Pages 配置

GitHub 仓库：

```text
git@github.com-bill:ciallo-bill/biau.git
```

Cloudflare Pages 项目配置：

```text
Framework preset: None
Production branch: main
Build command: npm run build
Build output directory: dist
Root directory: 留空
```

如果 Cloudflare 需要指定 Node 版本，建议使用：

```text
NODE_VERSION=22
```

## 自定义域名

当前绑定域名：

```text
biau.playlab.eu.cc
```

域名已在 Cloudflare Pages 的 `Custom domains` 中绑定，线上访问地址为：

```text
https://biau.playlab.eu.cc
```

## 自动更新流程

以后每次修改站点后，在本地执行：

```bash
npm run lint
npm run build
git add .
git commit -m "Update site"
git push
```

推送到 GitHub 的 `main` 分支后，Cloudflare Pages 会自动触发构建并更新线上站点。

## 如果 GitHub 已更新但线上还是旧版本

本地确认方式：

```bash
git log --oneline -3
git ls-remote origin refs/heads/main
```

如果两边都能看到最新 commit，但线上页面仍加载旧的 `/assets/index-*.js`，优先检查 Cloudflare Pages 后台：

- `Deployments` 是否出现最新 commit。
- 最新部署是否成功。
- `Production branch` 是否仍是 `main`。
- `Root directory` 是否留空。
- `Build command` 是否为 `npm run build`。
- `Build output directory` 是否为 `dist`。

如果没有出现最新部署，可以在 Cloudflare Pages 项目中手动点击 `Retry deployment` 或 `Create deployment`。

## 手动部署备用方案

如果 Git 集成暂时没有触发，可以用 Wrangler 直接上传本地构建产物。首次使用需要在本机登录 Cloudflare：

```bash
npx wrangler login
```

确认登录状态：

```bash
npx wrangler whoami
```

构建并部署：

```bash
npm run build
npx wrangler pages deploy dist --project-name=biau
```

如果 Cloudflare Pages 项目名不是 `biau`，把 `--project-name` 改成 Pages 后台显示的项目名。

## hidencloud 适用场景

hidencloud 当前更适合作为桌宠项目的公开 API、社区数据和生成代理层，而不是第一版静态官网的主托管入口。

适合放到 hidencloud 的内容：

- 桌宠社区 API
- 生成任务、审核、发布等后端接口
- 需要和桌宠 App 同域或同服务编排的页面
- 未来官网中需要读取真实社区数据的接口代理

不建议第一版官网直接放到 hidencloud 的原因：

- 静态官网不需要常驻服务，放在 Pages 更简单。
- hidencloud 已经承担社区 API 和生成代理职责，继续叠加官网静态托管会增加运维耦合。
- 官网内容更新更适合走 GitHub -> Cloudflare Pages 的自动部署链路。

## 线上检查记录

已检查以下路径返回 `200 OK`：

```text
https://biau.playlab.eu.cc/
https://biau.playlab.eu.cc/projects
https://biau.playlab.eu.cc/cases
https://biau.playlab.eu.cc/blogs
```
