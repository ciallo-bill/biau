# AI 日报与内容工作台现状审计

日期：2026-07-05

## 公开博客数据生成链路

当前公开博客仍是静态优先链路，发布产物进入 Git-tracked TypeScript 数据文件：

- `src/data/blog.ts`：公开博客摘要索引，包含 slug、标题、栏目、摘要、日期、阅读时间、系列和知识点。
- `src/data/blogContent.ts`：正文动态 import loader 白名单，只有登记在这里的 slug 才能被 `/blog/:slug` 加载。
- `src/data/blogCuration.ts`：策展 source-of-truth，控制 `featured` / `archive` / `hidden`、内容角色、优先级和关联项目。
- `src/data/blog-posts/*.ts`：每篇公开正文的结构化 `BlogPost` 模块。

相关守门：

- `npm.cmd run blog:audit` 检查摘要、正文 loader、策展、遗留归档和项目覆盖是否一致。
- `npm.cmd run blog:check` 检查公开博客和草稿中是否出现禁用语境、草稿结构缺失或 evidence scaffold 缺失。
- `npm.cmd run studio:export -- --sample --dry-run` 可验证 Studio draft 到公开静态文件计划的映射，不写文件。

结论：Studio 的数据库草稿不能直接绕过 `blogContent` 和 `blogCuration`；必须通过本地/CI 导出器写入上述静态产物，并通过审计后才进入公开站。

## 后端部署与 Prisma 迁移方式

当前后端复用 Express + Prisma 7 + `@prisma/adapter-pg`：

- `npm.cmd run prisma:validate`：校验 Prisma schema。
- `npm.cmd run prisma:migrate`：使用 `DATABASE_URL` 执行主助手数据库迁移。
- `npm.cmd run prisma:migrate:studio`：通过 `scripts/migrate-studio-database.mjs` 将 `STUDIO_DATABASE_URL` 临时映射为 Prisma 的 `DATABASE_URL` 后执行迁移；如果没有设置 `STUDIO_DATABASE_URL`，脚本安全跳过。
- `server/src/db.ts` 分离 `getPrisma()` 与 `getStudioPrisma()`；Studio 路由必须使用 `requireStudioDatabase()`。

服务模式：

- `ASSISTANT_SERVICE_MODE=studio` 只挂载 `/health` 和 `/studio/api/*`。
- `ASSISTANT_SERVICE_MODE=public` / `internal` / `rag` 仍按各自边界挂载，`assistant:service-modes-smoke` 负责防止路由串台。

结论：内容工作台应继续使用独立 Studio 数据库边界；不要把编辑草稿写入内部助手成员/聊天数据库。

## `/assistant/admin` 认证复用情况

内部助手 admin 使用 `ADMIN_TOKEN` 与 `Authorization: Bearer <token>`。

Studio 使用 `STUDIO_ADMIN_TOKEN`，为空时回退 `ADMIN_TOKEN`：

- 前端仅保存浏览器手动输入的 Studio token，不把服务端 token 写进 bundle。
- 后端 `createStudioRouter()` 对所有 `/studio/api/*` 统一检查 bearer token。
- 缺少 Studio/admin token 时返回 `503 { error: "studio-auth-not-configured" }`。
- 缺少或错误 bearer token 时返回 `401 { error: "missing-studio-token" }`。

结论：第一版可以复用 admin token 形态；后续给小伙伴开放编辑时，需要新增成员角色和权限 UI，不能只共享站长 token。

## `blog:check` 对导出产物的要求

`scripts/check-public-blog.mjs` 当前检查：

- `src/data/blog.ts` 与 `src/data/blog-posts/*.ts` 不包含公开禁用词。
- 公开内容不能保留 Day 编号语境。
- `content-drafts/*.md` 中 `status: draft` 的草稿必须包含标准结构标题。
- evidence draft 需要 `Evidence Pack`、`Safe Public Facts`、`Uncertain Or Stale Facts`、`Review Gates`、`Promotion Checklist` 等 scaffold，并且需要有效 `BlogColumn` 与 `modelStrategy` frontmatter。

结论：Studio 导出的公开正文不应是临时提纲；导出前草稿需要经过审核队列和发布 gate，导出后仍要跑 `blog:audit`、`blog:check`、`lint` 和 `build`。

## 当前状态

已验证命令：

- `npm.cmd run prisma:validate`
- `npm.cmd run server:build`
- `npm.cmd run server:smoke`
- `npm.cmd run assistant:service-modes-smoke`
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run check:ui`
- `npm.cmd run blog:audit`
- `npm.cmd run blog:check`
- `npm.cmd run studio:export -- --sample --dry-run`

人工 gate：

- 生产平台仍需配置真实 `STUDIO_DATABASE_URL` 和 `STUDIO_ADMIN_TOKEN`。
- 首次生产迁移需要确认部署流程运行 `npm run prisma:migrate:studio`。
- 真实模型辅助 AI 日报仍需用户批准具体内容任务；不做 provider ping 或测活 prompt。
