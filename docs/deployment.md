# 部署方案

## 结论

当前推荐先部署到 Cloudflare Pages。

原因：

- 当前站点是 React + Vite 静态应用，生产产物是 `dist`，非常适合 Pages 的 GitHub 自动构建。
- 页面主要是官网展示、项目展示、案例中心和博客内容，不依赖常驻 Node 服务。
- Cloudflare Pages 自带 CDN、HTTPS、预览环境和回滚能力，适合先把官网快速上线。
- `public/_redirects` 已加入，生产环境刷新 `/projects`、`/cases`、`/blogs` 这类前端路由时会回退到 `index.html`。

## Cloudflare Pages 配置

GitHub 仓库：

```text
git@github.com:ciallo-bill/biau.git
```

Cloudflare Pages 项目配置：

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Production branch: main
```

如果 Cloudflare 需要指定 Node 版本，建议使用当前 LTS 或项目可用版本，例如：

```text
NODE_VERSION=22
```

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

## 推荐演进路线

1. 第一阶段：Cloudflare Pages 托管官网静态站。
2. 第二阶段：配置自定义域名，例如 `biau.dev` 或 `www.biau.dev`。
3. 第三阶段：如果官网需要展示真实桌宠社区数据，再通过 API 调用 hidencloud。
4. 第四阶段：将 AI 应用、合同审查、桌宠社区等项目逐步接入独立案例详情页。

## 首次推送准备

当前仓库是本地新仓库，远程仓库可设置为：

```bash
git remote add origin git@github.com:ciallo-bill/biau.git
```

首次提交和推送前建议确认：

- `npm run build` 通过
- `npm run lint` 通过
- `output/`、`dist/`、`node_modules/` 不进入 Git
- 公开页面里没有密钥、真实隐私信息或不该公开的本地配置
