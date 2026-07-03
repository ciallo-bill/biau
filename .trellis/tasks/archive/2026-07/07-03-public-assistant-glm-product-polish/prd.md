# Public assistant GLM product polish

## Goal

把公开助手从“站点角落里的知识问答小组件”推进到更像正式产品的体验：可以通过私有服务端环境变量接入用户提供的 GLM/OpenAI-compatible 模型通道，默认展开内容更克制，回答更主动但仍以公开站点知识为边界，并且在没有模型或模型失败时继续可用。

## Background

- 用户指出当前公开助手“有点呆板，并且默认显示了很多字”。
- 用户之前提供过限时 GLM-5.2 中转信息，但这些属于临时敏感凭据，不能写入仓库、前端 Vite 变量或公开状态文件。
- 当前仓库已有 `ASSISTANT_MODEL_*` 服务端环境变量、`server/src/model.ts`、`/chat/public`、`PublicAssistantWidget` 和本地公开知识 fallback。
- 公开助手应回答基于网站内容的问题；当前博客和项目内容仍在优化中，因此助手需要表达公开知识边界，不能编造未核验事实。

## Requirements

- 后端模型通道保持 OpenAI-compatible，适配 GLM-5.2 这类中转模型；真实 base URL 和 API key 只通过服务端环境变量配置。
- 模型提示词需要更像产品助手：先给直接结论，再给可点击来源/下一步，不能长篇铺陈，也不能泄露内部配置。
- 前端公开助手默认态要更克制：不要一打开就出现大量说明文字或过多 citation 卡片。
- 面板打开后应能清楚展示当前状态：模型增强、站点知识 fallback、本地知识或请求异常。
- 建议问题要更贴近访客场景：项目能力、演示入口、可靠性状态、博客/知识内容。
- 没有配置 API 或模型失败时，仍然使用本地公开知识 fallback，可继续通过 UI 回归验证。
- 不写入真实账号、密码、生产 API、模型 key、私有中转站 URL、内部监控面板或敏感指标。

## Acceptance Criteria

- [x] `server/src/model.ts` 的公开回答 prompt 明确限制事实来源和输出风格，适合 GLM/OpenAI-compatible 模型。
- [x] `.env.example` 或文档只展示占位配置与推荐模型名，不包含用户给过的真实 key/base URL。
- [x] 公开助手默认打开后的初始内容更短，citation 卡片默认不显示，交互后再展示来源。
- [x] 公开助手状态、建议问题、输入区和 loading/error 表达更像正式产品且不冗长。
- [x] `npm.cmd run assistant:index`、`npm.cmd run lint`、`npm.cmd run build`、`npm.cmd run check:ui` 通过。
- [x] `git diff --check` 和敏感扫描通过，确认没有 GLM 临时 key 或真实中转 URL 入库。

## Out of Scope

- 不部署真实模型环境变量。
- 不在浏览器端暴露模型 key。
- 不自动发布新博客内容或公开未核验草稿。
- 不改变内部助手邀请、会员、数据库持久化策略。
