# Legal RAG demo access and QA monitoring

## Goal

让 Legal RAG 的公开演示更容易被访客理解和验证：主站说明清楚 demo 访问边界，Legal RAG 自身 smoke 覆盖登录后的公开数据集初始化与 RAG 问答，避免“能打开但看不了核心功能”的展示断点。

## Requirements

- 不把真实后台密码、模型 key、数据库连接串、Render/Supabase 后台地址或私有运维信息写入仓库或公开文章。
- 如果需要公开账号密码，只能使用专门创建的低权限 demo 凭据，并作为 human review gate 由用户确认后再发布。
- `legal-rag` 的 smoke/监控流程要能：
  - 检查 `/api/health`。
  - 在启用认证时通过环境变量读取 demo email/password 登录。
  - 初始化公开安全数据集或复用已存在数据。
  - 执行一次 RAG 问答，并断言 answer、citations/retrieved chunks、diagnostics 可用。
  - 在每一步失败时给出明确错误，方便定位是 health、auth、dataset、query 还是 UI 失败。
- `blog-semi` 主站要同步 Legal RAG 项目页/相关文章或展示数据：
  - 告诉访客演示工作台需要专用 demo 账号，不公开真实后台密码。
  - 给出推荐演示路径：登录、初始化公开数据集、RAG 问答、合同审查、质量面板。
  - 说明凭据发布状态和后续优化方向，不暗示访客已经能访问未公开凭据。
- 继续保持主站公开助手知识与 sitemap 不漂移。

## Acceptance Criteria

- [ ] Legal RAG smoke 脚本覆盖 authenticated demo 的 RAG 问答健康检查，且不硬编码密码。
- [ ] Legal RAG 相关文档说明环境变量用法和故障定位。
- [ ] 主站 Legal RAG 公开内容解释 demo 访问边界和演示路径，不包含真实密码。
- [ ] 如未公开 demo 凭据，任务记录里明确 human review gate。
- [ ] `legal-rag` 相关最小验证通过。
- [ ] `blog-semi` 相关最小验证通过。
- [ ] `git diff --check` 和 changed-file sensitive scan 通过。

## Notes

- 用户原话希望“后台密码放在文章中”，本任务按安全边界解释为“公开 demo 访问凭据/指引”，不是发布真实后台/admin 密码。
