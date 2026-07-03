# BIAU Port / 泊岸

基于 React、Vite、TypeScript 和 Semi Design 构建的产品官网，用于组织 AI 应用、业务系统、移动端应用、互动体验、知识内容和公开助手入口。

站点目标是让访客能快速理解每个项目的实现、架构、技术栈、演示入口、可靠性状态和后续优化方向；公开内容只保留可展示、可验证、已脱敏的信息。

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

## 助手 API

本仓库同时包含一个 Node/TypeScript 助手后端，位于 `server/`。公开助手可通过 Cloudflare Pages Functions 使用同域 `/api`，内部助手 API 也可以单独部署到 Render，并连接 PostgreSQL。

```bash
npm run assistant:index
npm run prisma:validate
npm run server:build
npm run server:smoke
```

前端通过 `VITE_CHAT_API_BASE_URL` 指向助手 API；模型通道只在服务端用 `ASSISTANT_MODEL_*` 配置。未配置 API 或模型时，公开助手会使用站点本地公开知识回退。

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
