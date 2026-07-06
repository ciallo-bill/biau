# Internal Assistant Production Acceptance and Studio Workflow Polish

## Goal

把刚落地的内部助手 `studio.draft` 受控写草稿能力推进到“可正式验收”的形态：成员从 `/assistant` 触发草稿创建后，能清楚看到创建结果、失败原因和安全状态，并能一键进入 `/studio` 定位到对应草稿继续审核；所有内容仍保持 hidden + review-needed，不泄露密钥、不绕过 Studio 审核和导出 gate。

## User Value

- 内部成员不用猜“助手到底有没有创建草稿”，工具轨迹会明确展示成功、降级或策略阻断原因。
- 成功创建的草稿可以从助手结果直接跳到 Studio 对应记录，减少从草稿箱里手动搜索的摩擦。
- 用户醒来后可以按一份生产验收清单检查 Render、Studio token、成员 token 和数据库配置；本地代码改动不阻塞在云平台手动操作上。

## Confirmed Facts

- 上一任务已经完成受控草稿写入：`executeStudioDraft()` 会调用 `buildAgentStudioDraft()`，通过 `getStudioPrisma()` 创建 `ContentDraft`，并把 `review-needed + hidden` 安全 artifact 返回到工具轨迹中（`server/src/agentTools.ts:240`、`server/src/agentTools.ts:291`、`server/src/agentTools.ts:297`）。
- 现在成功 artifact 的 `href` 固定为 `/studio`，还不能深链到具体草稿（`server/src/agentStudioDrafts.ts:125`、`server/src/agentStudioDrafts.ts:134`）。
- 前端 `/assistant` 已经渲染 artifact，但只是链接到 `artifact.href`，文案只有创建成功状态，没有额外定位信息（`src/pages/AssistantPage.tsx:887`）。
- Studio 页面已有草稿列表和选中状态，但没有读取 `/studio?draft=...` 这类 query 并自动选择草稿（`src/pages/StudioPage.tsx:722`、`src/pages/StudioPage.tsx:727`）。
- 前端类型当前把 `AssistantStudioDraftArtifact.href` 限定为字面量 `/studio`，深链需要同步更新类型和 normalizer（`src/data/assistant.ts:80`、`src/data/assistant.ts:89`）。
- 后端失败分支已经区分 `not_configured`、`policy_blocked`、`tool_error`，但助手侧展示仍偏技术轨迹，缺少对成员可读的失败提示（`server/src/agentTools.ts:252`、`server/src/agentTools.ts:275`、`server/src/agentTools.ts:311`）。

## Requirements

- R1. 成功创建 Studio 草稿后，工具 artifact 必须提供安全深链，例如 `/studio?draft=<id>`，允许 Studio 页面定位到对应草稿；链接不得包含 token、数据库信息、正文内容或管理员参数。
- R2. `/assistant` 必须继续渲染安全 artifact，并让成员清楚知道草稿仍是 `review-needed`、`hidden`、需要人工审核。
- R3. `/studio` 必须支持从安全 query 参数自动选择草稿；如果目标草稿不存在、列表未加载或 token 未配置，应给出温和的状态提示，不影响手动使用草稿箱。
- R4. Studio 草稿列表或编辑态应能识别 `aiAssistance: "agentic-workspace"` 创建的草稿，帮助审核者区分助手生成内容和人工草稿。
- R5. `studio.draft` 的失败/降级诊断必须更可读，至少区分：
  - Studio DB 未配置；
  - 敏感内容被策略阻断；
  - slug 冲突重试耗尽或数据库写入错误；
  - no-live / plan-only 模式未写库。
- R6. 本任务不得扩大权限边界：普通内部聊天仍只允许 read + draft-write，不能发布、审核通过、导出、改公开 `src/data/*`、改成员/邀请/模型渠道、调用外部 live 诊断。
- R7. 生产验收步骤应以文档/checklist 落地；真实 Render 环境、成员 token、Studio token、云数据库和模型调用验证记录为人工 gate，不在本地自动执行。

## Acceptance Criteria

- [x] 从 `studio.draft` 成功返回的 artifact 包含草稿 id/slug/title/column/status/visibility/reviewRequired 和安全 Studio 深链。
- [x] `/assistant` 的工具轨迹展示成功草稿，并通过深链进入 `/studio?draft=<id>`。
- [x] `/studio?draft=<id>` 在草稿列表加载后自动选中对应草稿；找不到时显示非阻塞提示。
- [x] Studio UI 能标识 Agentic Workspace 创建的草稿，且不改变 review/export gate。
- [x] `not_configured`、`policy_blocked`、`tool_error`、`plan-only` 的展示文案足够让成员知道下一步该做什么，但不暴露密钥、endpoint、DB URL 或内部栈。
- [x] `studio.draft` 仍不会触发 publish/export/review/admin/member/model-channel mutation。
- [x] 不新增模型测活、provider ping、生产 synthetic 或 live API 调用。
- [x] 本地验证通过：`npm.cmd run prisma:validate`、`npm.cmd run server:build`、`npm.cmd run server:smoke`、`npm.cmd run assistant:service-modes-smoke`、`npm.cmd run studio:smoke`、`npm.cmd run lint`、`npm.cmd run build`、`npm.cmd run check:ui`、`git diff --check`。
- [x] changed files 敏感扫描不包含真实密钥、token、数据库连接串、私有模型中转地址或生产凭据。

## Out Of Scope

- 从助手直接发布、导出、批准审核或修改公开内容文件。
- 浏览器 `/assistant` 持有 `STUDIO_ADMIN_TOKEN` 或直接写 Studio API。
- 引入新的数据库表、认证系统或大规模 Studio 重构。
- 真实 Render 生产调用、模型渠道测活、外部 provider 诊断。
- 把草稿生成质量提升为完整写作流水线；本任务只做验收、定位和工作流 polish。

## Manual Gates

- 用户在 Render 上确认内部助手服务和 Studio 服务的环境变量已经按最终部署填写。
- 用户用自己的成员 token 在生产 `/assistant` 发起真实草稿请求。
- 用户用 Studio token 打开生产 `/studio?draft=<id>`，确认能看到 hidden + review-needed 草稿。
- 如需真实模型参与草稿内容生成，必须由用户批准真实任务调用；本任务不做模型测活。

## Open Questions

None blocking. 默认决策：本轮只做本地/代码层验收与 UI deep-link polish，把真实 Render 生产验证留作 manual gate。
