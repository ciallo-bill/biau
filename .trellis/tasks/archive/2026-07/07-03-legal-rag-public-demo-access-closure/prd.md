# Legal RAG public demo access closure

## Goal

修复 Legal RAG 线上演示入口“能打开但被登录页挡住”的展示断点：让工作台登录页在部署显式配置公开 demo 凭据时能直接给访客可用提示和填充入口；主站项目页同步说明访问边界，避免访客误以为在线工作台已经无需凭据可用。

## Evidence

- 用户截图显示 `https://legal-rag-web.onrender.com` 停在登录页，邮箱预填 `demo@legal-rag.local`，密码为空。
- `D:\workspace4Cursor\legal-rag\apps\web\src\App.vue` 默认 `loginEmail = "demo@legal-rag.local"`，但不显示密码或 demo 指引。
- `D:\workspace4Cursor\legal-rag\apps\web\src\components\LoginPanel.vue` 只有邮箱、密码和登录按钮。
- `D:\workspace4Cursor\legal-rag\apps\api\src\config\env.ts` 要求 `AUTH_ENABLED=true` 时由 `AUTH_PASSWORD` 或 `AUTH_USERS_JSON` 配置密码，仓库不能提交真实值。
- `D:\workspace4Cursor\legal-rag\CONTEXT.md` 明确 model keys、database credentials、demo login credentials must never be committed。
- 主站 `src/data/portfolio.ts` 当前说明低权限 demo 凭据需要单独确认后再公开，但线上登录页没有给访客下一步。
- 用户补充截图显示线上 API 日志连续报 `ENOENT: no such file or directory, open '/app/eval/rag-eval-set.json'` 和 `/app/eval/contract-review-eval-set.json`，工作台顶部出现 `Request failed: 500`。
- `D:\workspace4Cursor\legal-rag\apps\api\Dockerfile` runtime 阶段原本只复制 `datasets`，没有复制根目录 `eval/`，而质量/评测接口把这些 fixtures 当作必存在文件读取。

## Requirements

- 在 `legal-rag` 前端增加一个公开 demo 凭据提示机制：
  - 通过 Vite public env 显式配置公开 demo email/password/note。
  - 未配置公开 demo password 时，不显示任何密码占位或暗示值。
  - 配置后登录页显示这是“公开演示凭据”，并提供填入演示凭据按钮。
- 公开 demo password 必须只来自部署环境变量，不写入仓库。
- 登录页文案要说明凭据是低权限/可回收 demo，不是后台管理员密码。
- 更新 `legal-rag` 文档，说明部署时如何设置公开 demo 提示，并要求和 API auth 凭据保持一致。
- 更新 `blog-semi` Legal RAG 项目页/助手知识：
  - 说明如果登录页显示公开 demo 凭据即可直接试用。
  - 如果登录页没有显示凭据，则工作台仍是受控演示入口。
  - 不写任何真实密码。
- 修复线上质量面板/评测报告的 500：
  - API Docker runtime 镜像必须包含 `eval/` fixtures。
  - 若部署方式仍缺少 eval fixtures，质量/评测接口应返回可解释的空评测/warn 状态，不阻断知识库、问答、合同审查演示。
- 验证 `legal-rag` typecheck/build 以及 `blog-semi` assistant index、lint/build。

## Out of Scope

- 不部署线上 Render 服务。
- 不创建或提交真实 demo password。
- 不修改模型、数据库、RAG、合同审查逻辑。
- 不公开真实管理员密码、私有后台、模型 key、数据库连接串或 Render/Supabase 运维配置。

## Acceptance Criteria

- [x] `legal-rag` 登录页支持部署显式配置公开 demo 凭据提示。
- [x] 未配置公开 demo password 时，登录页不展示密码。
- [x] 配置公开 demo password 时，登录页展示提示并可一键填入邮箱/密码。
- [x] `legal-rag` 文档说明 `VITE_PUBLIC_DEMO_EMAIL` / `VITE_PUBLIC_DEMO_PASSWORD` / `VITE_PUBLIC_DEMO_NOTE` 使用方式和安全边界。
- [x] `legal-rag` API Docker runtime 复制 `eval/` fixtures。
- [x] 评测 fixtures 缺失时，RAG/合同评测服务返回空评测并让质量报告显示 warn，不再返回 500。
- [x] `blog-semi` Legal RAG 项目页和公开助手知识同步 demo 访问边界。
- [x] 通过验证：`legal-rag npm.cmd --workspace apps/api run test:unit`、`legal-rag npm.cmd --workspace apps/api run validate`、`legal-rag npm.cmd run typecheck`、`legal-rag npm.cmd run build`、`blog-semi npm.cmd run assistant:index`、`blog-semi npm.cmd run lint`、`blog-semi npm.cmd run build`。
- [x] 完成 `git diff --check` 和敏感扫描。
