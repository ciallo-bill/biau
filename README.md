# Biau Labs 展示系统

基于 React、Vite、TypeScript 和 Semi Design 构建的动态展示网站，用于组织 AI 应用、全栈开发、游戏项目、案例中心和博客内容。

## 线上地址

```text
https://biau.playlab.eu.cc
```

## 本地开发

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## 内部助手 API

本仓库同时包含一个独立的 Node/TypeScript 助手后端，位于 `server/`。前端仍部署到 Cloudflare Pages，助手 API 可单独部署到 Render，并连接 Aiven PostgreSQL。

```bash
npm run assistant:index
npm run prisma:validate
npm run server:build
npm run server:smoke
```

前端通过 `VITE_CHAT_API_BASE_URL` 指向助手 API；未配置时会使用站点本地公开知识回退。

内部成员入口位于 `/assistant`。第一版支持输入邀请码和显示名兑换成员 token，并把 token 保存在当前浏览器的 `localStorage`；没有 API、没有 token 或数据库不可用时，页面会退回到已脱敏的公开站点知识。

隐藏管理入口位于 `/assistant/admin`。第一版只支持手动保存 `ADMIN_TOKEN`、读取 `GET /admin/summary` 摘要和调用 `POST /admin/invites` 创建邀请码，不包含完整成员管理、历史记录浏览或私有知识源接入。

## 技术栈

- React 19
- Vite
- TypeScript
- Semi Design
- Express / Prisma / PostgreSQL（内部助手 API）

## 更新上线

代码推送到 GitHub 的 `main` 分支后，Cloudflare Pages 会自动构建并更新线上站点。

```bash
git add .
git commit -m "Update site"
git push
```

详细部署方案见 [docs/deployment.md](docs/deployment.md)。
