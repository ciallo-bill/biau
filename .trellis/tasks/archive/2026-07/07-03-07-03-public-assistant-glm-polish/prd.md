# Public assistant GLM integration and product polish

## Goal

把公开助手从“本地知识兜底问答”推进到可配置模型增强的正式产品形态：服务端通过 OpenAI-compatible GLM 渠道调用模型，前端默认态更轻、更像产品助手，避免一打开就堆大量文字，同时保留无模型/模型失败时的本地公开知识 fallback。

## Requirements

- 模型接入：
  - 服务端公开助手接口支持 OpenAI-compatible chat completion 配置。
  - 通过环境变量配置 base URL、API key、model，不把真实 key 写进仓库、前端 bundle、状态页或公开知识。
  - 可使用用户之前提供的限时 GLM 渠道作为本地/部署环境变量值，但仓库只记录变量名和示例占位。
  - 模型调用失败、超时或未配置时，仍回退到当前本地公开知识回答。
- 产品体验：
  - 公开助手打开后的默认内容减少，避免长篇项目卡片堆满面板。
  - 默认欢迎态更像正式产品：短说明、少量建议问题、发送后再展示引用/相关项目。
  - 回答语气更自然，避免呆板模板感；但必须基于公开知识，不能编造私有事实。
  - 清楚区分“模型增强回答”和“本地公开知识回答”，但不暴露 provider key 或内部配置。
- 安全边界：
  - 公开助手不能访问私有仓库、后台、账号、未公开部署或环境变量值。
  - 不在前端显示 API key。
  - 不做无意义测活；如果测试模型，只用一个小的公开站点问题。

## Acceptance Criteria

- [x] 服务端公开助手可在配置环境变量后调用 OpenAI-compatible GLM 模型。
- [x] 未配置模型或模型失败时，本地公开知识 fallback 仍可用。
- [x] 前端公开助手默认打开态更简洁，不再展示大段默认说明和长项目卡片。
- [x] 更新 `.env.example` 或相关文档，说明公开助手模型变量设置方式，不包含真实 key。
- [x] 通过 `npm.cmd run assistant:index`、`npm.cmd run server:build`、`npm.cmd run server:smoke`、`npm.cmd run lint`、`npm.cmd run build`。
- [x] 通过 `git diff --check` 和敏感扫描。

## Notes

- 用户提供过限时 GLM-5.2 OpenAI-compatible 渠道，但真实 key 只能由本地/部署环境变量提供。
- 推荐实现顺序：先读现有 `server/src` 与 `PublicAssistantWidget`，保留 fallback，再加模型增强与 UI 精简。
- 验证补充：`npm.cmd run check:ui` 已通过，覆盖公开助手初始面板不展示引用卡；`server:smoke` 已覆盖 mock OpenAI-compatible 模型成功、未配置模型 fallback、provider 失败 fallback。
- 敏感扫描只命中变量名、占位文档和 smoke 测试用假 key；未写入用户提供的临时 GLM key 或 relay URL。
