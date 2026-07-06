# Internal assistant finalization

## Goal

把现有内部助手从 MVP 推进到可作为正式内部产品使用的形态：内部成员可以通过邀请码进入一个真实的协作工作台，查看和管理自己的历史会话，基于公开知识与受控内部知识获得有引用、有边界、有诊断的回答；站点 owner 可以在隐藏管理页管理成员、邀请码、内部知识与同步状态；公开助手、内部助手、RAG Orchestrator 继续保持三服务边界和严格的 scope 隔离。

## Confirmed Facts

- 归档任务 `06-30-complete-ai-assistant-mvp` 明确把内部助手定位为第一版 MVP，并推迟了完整历史浏览 API、私有知识源、文件上传、向量库和完整管理后台。
- 当前内部助手页面仍以示例会话为主：`src/pages/AssistantPage.tsx:133` 初始化 `demoInternalMessages`，`src/pages/AssistantPage.tsx:331` 展示 `EXAMPLES, NOT HISTORY`，`src/pages/AssistantPage.tsx:419` 明确提示历史列表和私有知识库不在本版范围内。
- 当前隐藏管理页只支持保存 admin token、读取摘要和创建邀请码：`src/pages/AssistantAdminPage.tsx:114` 调用 `/admin/summary`，`src/pages/AssistantAdminPage.tsx:162` 调用 `/admin/invites`，`src/pages/AssistantAdminPage.tsx:320` 仍展示 MVP 边界说明。
- 当前内部 API 已有邀请兑换、成员 token、会话写入、消息写入和用量日志基础：`server/src/app.ts:120`、`server/src/app.ts:176`、`server/src/app.ts:211`、`server/src/app.ts:237`。
- 当前 Prisma schema 已有 `Invite`、`Member`、`ChatSession`、`ChatMessage`、`UsageLog`，但没有内部知识源/文档模型：`prisma/schema.prisma:9` 至 `prisma/schema.prisma:69`。
- 当前 Qdrant 路径已经支持 scoped retrieve：public 只查公开集合，internal 可查 public + internal 集合；但 sync 只把 `publicKnowledgeV2` 写入 public collection，尚未写入 `biau_internal_chunks`：`server/src/ragQdrantStore.ts:86`、`server/src/ragQdrantStore.ts:121`。
- 现有架构决策已经确定三服务边界：public assistant、internal assistant、RAG Orchestrator。`docs/deployment.md:89` 至 `docs/deployment.md:94` 记录了 `ASSISTANT_SERVICE_MODE=public|internal|rag` 的部署形态。
- 用户已确认最终方向是 Agentic Hybrid RAG 优先，不以 Neo4j/知识图谱作为第一步；不要为了“阶段一可用”牺牲最终产品形态。

## Decisions

- D1. 保留邀请码兑换 + member token 的访问模式，不在本任务引入公开注册、账号密码登录、OAuth 或复杂组织系统。
- D2. 内部助手的最终形态优先落在“成员工作台 + 管理后台 + 内部知识源 + scoped RAG”上，而不是继续包装现有 demo。
- D3. 向量检索主路径使用已选定的 Qdrant collection：`biau_public_chunks` 与 `biau_internal_chunks`。Supabase/pgvector 仅保留为兼容路径，不作为本任务主线。
- D4. 内部知识先做数据库管理的 curated corpus：管理员录入或导入经过脱敏审核的内部文档，再由 internal service 触发 RAG Orchestrator 同步到 internal collection。不要让 RAG 服务直接依赖浏览器或公开前端。
- D5. 内部检索可以合并 public + internal 上下文，但公开助手永远不能读 internal scope、internal collection 或内部文档。
- D6. 不做模型测活、provider ping、doctor/diagnose、小诗测试或无业务意义的测试 prompt。需要真实模型质量验证时，记录为人工 gate，等待用户批准真实任务。
- D7. 支持成员级模型渠道分配：服务端环境变量定义可用模型渠道，成员表只保存 `modelChannelId`，admin 管理面分配渠道；不得把渠道 API key、base URL 或 provider 私有配置写入数据库、前端或公开文档。

## Requirements

- R1. 成员访问：内部入口必须支持邀请码兑换、成员资料展示、退出/清除本地 token、当前成员身份校验，并对无 API、无数据库、无 token、token 失效给出低敏且可操作的错误状态。
- R2. 会话工作台：内部成员必须可以创建新会话、查看自己的会话列表、加载历史消息、继续对话，并至少支持重命名或归档一种基础整理动作。任何成员不得读取或写入其他成员会话。
- R3. 内部回答：`POST /chat/internal` 必须继续写入用户消息、助手消息、citations、模型/检索 meta 和 usage log；回答必须使用 scoped RAG，上下文不足时明确说明限制，不编造内部事实。
- R4. 内部知识源：管理端必须支持维护经过审核的内部知识文档，至少包含标题、摘要、正文、标签、状态、更新时间和安全提示；只有 active/reviewed 文档可以进入 internal RAG sync。
- R5. RAG 同步：RAG Orchestrator 必须支持同步 internal corpus 到 `biau_internal_chunks`，并返回低敏 sync 诊断。同步失败不能泄露 Qdrant URL、API key、embedding key、数据库 URL 或原始 provider payload。
- R6. 管理后台：隐藏管理页必须从 MVP 摘要升级为可操作后台，至少支持成员列表、邀请码列表/状态、创建邀请码、禁用或撤销成员、查看基础 usage，以及内部知识同步状态。
- R7. UI/UX：内部助手页面要去掉“大段 MVP 解释”和“示例即历史”的错觉，改为正式产品工作台：左侧真实会话、主区对话、右侧状态/引用/能力面板，空状态简洁，按钮和输入状态明确。
- R8. 部署与状态：文档和状态数据必须说明 internal API、RAG Orchestrator、Qdrant internal collection、数据库、模型 provider 的配置边界和人工验证项；前端只能读取 `VITE_INTERNAL_ASSISTANT_API_BASE_URL` 这类公开 base URL。
- R9. 安全：不得提交真实 API key、数据库 URL、admin token、member token、invite code、模型中转地址、Qdrant endpoint 或私有文档内容。代码和文档示例只能使用占位符或 smoke-test 假值。
- R10. 成员级模型渠道：内部成员可被 admin 分配不同模型渠道；内部聊天必须按该成员的渠道选择模型配置并写入低敏 `model/provider/channel` meta。未知、未配置或被禁用的渠道必须安全回退到默认渠道或本地 fallback，并返回低敏诊断。

## Acceptance Criteria

- [ ] AC1. `/assistant` 不再展示 demo session 作为主要信息架构；未登录、已登录、无历史、有历史、发送中、错误、引用展示等状态都能正常渲染。
- [ ] AC2. 后端提供 member-scoped 的 session list / message load / create-or-continue / rename-or-archive API，并通过 smoke 覆盖“未授权 401、成员隔离、数据库缺失低敏错误”。
- [ ] AC3. 内部 chat 调用 scoped RAG 时使用 internal key/scope，返回 citations 与 sanitized retrieval meta；public mode 或 public key 无法拿到 internal context。
- [ ] AC4. 管理后台可以查看成员、邀请码、基础 usage、内部知识文档和 sync 状态，并支持至少一个成员撤销/禁用动作。
- [ ] AC5. 内部知识文档可以在数据库中维护，active/reviewed 文档可同步到 Qdrant internal collection；本地无外部凭据时仍有 deterministic fallback 或 mock smoke。
- [ ] AC6. admin 可以给成员分配模型渠道；内部聊天按成员渠道选择模型，并且前端/API 响应只暴露渠道 id/label/model/provider，不暴露 key 或 base URL。
- [ ] AC7. `npm.cmd run prisma:validate`、`npm.cmd run server:build`、`npm.cmd run server:smoke`、`npm.cmd run assistant:service-modes-smoke`、`npm.cmd run assistant:rag-smoke`、`npm.cmd run lint`、`npm.cmd run build` 通过，或明确记录不可运行原因。
- [ ] AC8. 相关部署文档、状态/observability 说明、manual gates 更新完成，且变更 diff 通过敏感信息扫描。

## Out Of Scope

- 公开注册、密码登录、OAuth、组织/团队计费、多租户权限矩阵。
- 浏览器直连 Qdrant、Supabase service role、embedding/reranker provider 或模型中转。
- 未经审核的文件上传、PDF/DOCX/OCR ingestion、大规模爬虫 ingestion。
- Neo4j、深度知识图谱遍历、LangGraph 级多 agent 编排。本任务保留未来接口，但不先引入。
- 自动真实模型质量测试、模型测活、provider ping、小任务测试 prompt。
- 公开展示或提交任何真实内部文档、账号、密钥、后台密码或生产连接串。

## Manual Gates

- 生产 `DATABASE_URL`、`ADMIN_TOKEN`、`ASSISTANT_MODEL_*`、`ASSISTANT_RAG_*`、`QDRANT_*`、`EMBEDDING_*` 变量由用户在 Render/Qdrant/模型中转后台维护。
- 用户需要确认第一批 internal corpus 的来源和脱敏标准；没有确认前只能使用公开知识或本地 mock 文档验证流程。
- Qdrant internal collection 的真实 sync 和 embedding provider 调用需要用户批准真实同步任务；本任务本地验证只使用 mock/local 路径。
- 真实模型回答质量验证需要用户提供真实业务问题并批准调用；不得自动发测活 prompt。
- 用户需要在 Render 或本地私有环境变量里维护 `ASSISTANT_MODEL_CHANNELS_JSON`，并决定每个成员默认分配的渠道；代码只提供占位示例和安全解析。

## Open Questions

无阻塞问题。默认按上述 decisions 执行；后续如果用户调整访问方式或内部知识来源，再回到本 PRD 更新范围。
