# AI 日报正式内容生产系统

## Goal

把当前 `ai-daily:draft` 的离线草稿能力升级为一套正式的软件工程与业务流程：从来源收集、分级、摘要、趋势判断、事实核查、人工审核到公开发布，形成可追踪、可验证、可迭代的 AI 日报生产系统。

目标不是做“自动生成文章”，而是做一个可信内容生产系统：AI 可以帮助提效，但每一期公开内容都必须有来源、证据、审核状态和发布 gate。

用户已明确：本任务不以快速出产品为优先，可以接受较大的架构改造来提升长期体验。目标应从“命令行草稿脚本”上升为“内部内容工作台”：支持 AI 日报、普通博客和后续页面内容的快速提交、编辑、审核与发布导出。

## Background

### Repository Facts

- `src/data/blogShared.ts` 已经定义 `ai-daily` 栏目，中文名为 `AI 日报`，英文副标题为 `AI Daily`。
- `npm.cmd run ai-daily:draft` 已存在，当前可从手动 source JSON 生成 evidence-first Markdown 草稿。
- `blog-content-pipeline` 规范要求先证据、再草稿、再审核，模型生成必须显式批准。
- `blog:check` 会检查 draft frontmatter 和 evidence scaffold。
- 仓库已存在 `server/`、Express、Prisma、`DATABASE_URL`、邀请码、成员、聊天记录和 RAG orchestrator 相关代码；因此项目不是从零开始后端化。
- 当前公开博客内容主要由 `src/data/blog.ts`、`src/data/blogContent.ts`、`src/data/blogCuration.ts` 和 `src/data/blog-posts/*.ts` 组成，适合静态构建，但不适合非代码化快速编辑。
- 当前路由包含 `/blog`、`/blog/:slug`、`/assistant`、`/assistant/admin`、`/status` 等页面，还没有统一内容工作台或 CMS 路由。

### Research Facts

见 `research.md`。

- n8n newsletter workflow 代表一种自动化模式：RSS 抓取 -> AI 摘要 -> AI 改写 -> 保存为邮件草稿，仍保留 review/send 边界。
- Feedly 将 AI newsletter 拆成单篇 AI Summary 和跨文章 AI Overview，说明“逐条摘要”和“整期趋势判断”不应混用同一提示词。
- Trusting News 与 Reuters Institute 的资料都强调透明披露、人类编辑参与、事实核查和对 AI 输出保持怀疑。
- 官方 RSS / 文档 / 发布页适合作为高可信来源；第三方聚合、社区生成 feed 和社交信号只能作为候选来源，需要二次核查。

## User-Provided Methodology Adaptation

用户提供的 AI 业务分析方法论可借鉴为本项目流程：

1. 业务访谈：确认角色、流程、痛点、频次、数据来源、合规边界。
2. 场景分级：判断是问答、抽取、分类、生成、审核还是自动执行。
3. 数据盘点：梳理文档、表格、系统接口、历史工单、标注样本、专家规则。
4. 方案选择：规则、RAG、Agent、微调、传统机器学习或混合方案。
5. 原型验证：先做低风险 POC，明确输入输出、页面原型、流程图和验收标准。
6. 评测体系：准确率、召回率、引用命中率、拒答准确率、幻觉率、人工一致率、处理时长、满意度。
7. 上线闭环：权限、日志、人审、灰度、培训、反馈、badcase 迭代。

本任务会按这个思想做，但不会照搬为纯企业咨询流程；它要落到 BIAU Port 的博客生产系统。

## Product Roles

- 内容策划者：决定今天是否值得发、看哪些来源、选哪些主题。
- 来源采集者：维护 source pool、RSS、手动链接和候选来源。
- AI 摘要助手：对单条来源做结构化摘要、分类和风险提示。
- AI 总编助手：对多条来源做趋势合并、标题建议和 issue-level brief。
- 审稿人：核查来源、事实、版权摘要、表达和发布风险。
- 发布者：把已审稿件写入公开博客数据、更新 sitemap，并承担最终责任。

## Requirements

### R1. 来源系统

- 支持手动 source JSON。
- 设计正式 source pool：来源名、URL/feed、来源类型、可信等级、语言、栏目、抓取频率、是否需要人工确认。
- 来源分级至少包括：
  - `official-primary`
  - `official-secondary`
  - `trusted-aggregator`
  - `community-generated`
  - `manual-candidate`
- 每条来源必须保留原始链接、发布时间、抓取时间、摘要输入文本和候选标签。

### R2. 场景分级

AI 日报系统至少拆成这些任务类型：

- 抽取：从来源中抽取标题、时间、主体、模型/产品名、版本、链接。
- 分类：判断模型发布、工具更新、研究论文、产业动态、监管/安全、项目相关。
- 生成：生成单条摘要、整期摘要、标题、导语和影响判断。
- 审核：事实核查、版权摘要、敏感信息、夸张表述、重复内容。
- 自动执行：只允许进入 draft，不允许无人审核自动发布。

### R3. 内容生产流程

一期 AI 日报必须有以下状态流：

```text
source-collected -> extracted -> summarized -> synthesized -> review-needed -> approved -> published
                                   \-> rejected
                                   \-> needs-more-evidence
```

第一版可以只实现到 `review-needed`，但必须为后续状态预留数据字段。

### R4. 模型策略

- 默认不高并发调用多个模型。
- 正式流程推荐串行：
  - Codex/脚本整理 evidence pack；
  - strong profile 做单条摘要或整期初稿；
  - review profile 做结构和语言审稿；
  - Codex 做最终事实、安全和站点集成检查。
- fast profile 只用于低风险标题、标签、去重或格式辅助。
- 不做中转站测活；任何 live 模型调用都必须是明确的小型内容任务。

### R5. 审核与合规

- 每条事实必须能回到来源链接。
- 长文本不能复制来源原文，只能转述和短摘。
- 必须标记 AI 辅助方式：none / summary-assisted / draft-assisted / polish-assisted。
- 必须记录人工 review 人/时间或至少记录 review gate checklist。
- 不公开 API key、模型中转站、内部链接、私有账号、未公开部署信息。

### R6. 评测体系

第一版评测不要求自动打分全部上线，但需要设计指标：

- 来源覆盖率：候选来源中被成功读取的比例。
- 去重率：重复来源/同主题聚合效果。
- 摘要准确率：人工抽样核查摘要是否忠实。
- 引用命中率：每条关键事实是否有来源链接。
- 幻觉率：无来源断言数量。
- 拒发准确率：系统是否能拦住不适合发布的内容。
- 人工一致率：AI 判断与审稿人判断的一致程度。
- 处理时长：从来源收集到 review-needed 的耗时。

### R7. 软件工程交付

规划完成后进入实现时，应优先交付：

1. 内部内容工作台的信息架构：草稿箱、AI 日报 issue、来源池、审核队列、发布导出。
2. 后端内容 schema：content draft、source item、issue run、review record、publish export。
3. 受保护 API：只允许管理员或内容编辑者创建、修改、审核和导出草稿。
4. 保持当前静态公开站兼容：公开页面继续读取稳定的公开内容产物，不直接暴露未审核数据库内容。
5. 保持 `ai-daily:draft` 兼容，后续迁移为工作台背后的导入/导出命令或检查工具。
6. 验证命令：`blog:check`、`lint`、`build`，以及后端 `server:build`、`prisma:validate`。

### R8. 内容工作台与页面编辑

- 第一版允许较大改造，但公开站不应因为后台复杂度而牺牲访问速度和稳定性。
- 推荐新增内部 `/studio` 工作台，而不是把公开站整体变成动态 CMS。
- 工作台至少覆盖：
  - 快速新建博客草稿；
  - 编辑标题、栏目、摘要、正文段落、知识点、关联项目、可见性；
  - AI 日报来源录入、来源分级、issue 合成和审核状态；
  - 预览公开文章效果；
  - 审核通过后导出为现有公开博客数据格式或后续统一内容格式。
- 后续页面编辑可以先覆盖博客和 AI 日报，再扩展到项目详情页、资源页、站点状态说明等结构化页面。

## Non-Goals

- 不在本任务中直接开无人值守每日自动发布。
- 不在仓库写入真实 API key、中转站 URL、私有 RSS token 或付费平台凭据。
- 不把 AI 日报做成无审核 SEO 内容农场。
- 不在没有来源证据时生成“今日最新”新闻。
- 不把公开站全部切成未缓存的动态渲染页面；后台动态化与公开发布面需要分层。
- 不在第一轮同时覆盖所有页面类型的完全可视化编辑；先把博客/AI 日报闭环打通，再扩展项目详情页。

## Acceptance Criteria

- [ ] PRD 明确业务角色、场景分级、数据来源、合规边界和评测指标。
- [ ] `research.md` 记录网络调研命令、关键来源和可采纳结论。
- [ ] `design.md` 说明正式系统架构、数据流、状态机、source schema、draft schema、模型调用边界和发布 gate。
- [ ] `implement.md` 拆出可验证实现步骤，优先从 source pool 和 draft pipeline 开始。
- [ ] 至少有一份正式流程图或 Mermaid 图描述从 source 到 publish gate 的流程。
- [x] 用户已决策：第一版偏内部内容工作台与体验优先，不以快速命令行 MVP 为主。
- [ ] 设计必须说明公开静态站、内部工作台、后端 API、数据库和发布导出之间的边界。
- [ ] 设计必须说明博客快速提交流程，以及后续扩展到项目详情页/页面编辑的路径。

## Product Decision

第一版形态已更新为“内部内容工作台优先”。用户已确认持久化与发布源-of-truth：

- 已选：使用现有后端 + Prisma/Postgres 保存草稿、来源、审核状态和导出记录；公开站继续读取已审核导出的静态内容产物。
- 不选第一阶段：Git-backed Markdown/JSON 作为唯一源-of-truth。它的版本追溯优势会保留为后续增强方向，但第一阶段不让服务端直接承担 Git 冲突、权限和提交安全问题。

## Manual Setup Needed

这些事项需要用户在平台侧或私密配置侧完成，代码实现不能替用户写入真实值：

- 生产数据库：确认使用哪一个 Postgres 实例，并在 Render/部署平台里设置 `DATABASE_URL`。如果继续使用现有 Render Postgres，可以复用；如果切换 Supabase，需要用户复制真实连接串。
- Studio 管理密钥：在部署平台设置 `ADMIN_TOKEN` 或未来专用 `STUDIO_ADMIN_TOKEN`，不要写入仓库。
- CORS/站点域名：确认公开站和后端 API 的正式域名，部署平台里设置 `CORS_ORIGIN`。
- 数据库迁移执行：首次上线内容工作台前，需要在生产环境执行 Prisma migration；可由部署命令自动执行，也可由用户在 Render shell/部署流程里确认。
- 模型配置：AI 日报的模型辅助步骤默认关闭；首次真实模型辅助摘要/润色前，用户需要确认使用哪个模型渠道和具体任务。
- 发布权限策略：确认第一版 `/studio` 是只给站长使用，还是给旁边小伙伴开编辑账号。推荐第一版只开放站长管理员。
