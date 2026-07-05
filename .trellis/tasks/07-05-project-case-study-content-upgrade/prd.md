# 项目详情页技术案例内容与配图补全

## Goal

把 BIAU Port 主站的项目详情页从“项目卡片扩展页”升级为访客可读的技术案例页：每个重点项目不仅有首屏截图，还要在正文中穿插界面截图、流程图、架构图、数据流、状态证据或发布证据，并用实现、架构、质量、当前边界和后续优化解释项目价值。

目标不是一次性生成漂亮文案，而是基于真实项目代码、脚本、部署配置、测试、公开资产和已有页面材料整理可信案例内容。README 只能作为线索，不能作为唯一证据。

## Background

### User Intent

- 用户希望项目页偏“访客可读的技术案例页”，合理展示实现、架构、技术栈、多维分析、项目不足和后续优化方向。
- 用户明确要求分析项目时不能只看 README，因为 README 可能过时。
- 用户希望项目详情页内容更丰富，且正文中穿插示例图、流程图等，不只是最上面一张图。
- Pet 项目可以暂时展示当前工作状态，后续继续优化；其他主要项目基本已有线上部署，应尽量展示完整体和迭代方向。
- 用户已确认第一批按推荐范围推进：先补强 6 个主项目 `legal-rag`、`ozon-erp`、`pet-workspace`、`xunqiu`、`biau-playlab`、`blog-semi`；第二批再统一扫 6 个游戏项目的一致性。

### Confirmed Repository Facts

- 主站项目数据源是 `src/data/portfolio.ts`。
- 项目详情页渲染入口是 `src/pages/ProjectDetailPage.tsx`。
- `Project.detailContent` 已支持 6 类内容组：`overview`、`workflow`、`architecture`、`quality`、`limitations`、`roadmap`。
- `ProjectDetailSection.visual` 已支持正文视觉块，类型包括 `screenshot`、`architecture`、`workflow`、`data-flow`、`status`、`release`、`diagram`。
- `public/images/projects/showcase/` 已存在多类截图和 SVG 素材，包括 Legal RAG、Pet、Ozon ERP、Blog Semi、Playlab/Godot 游戏、Xunqiu 等。
- 已存在 `npm.cmd run studio:project-detail-plan -- --sample <projectId>`，可以把 Studio 项目详情草稿 dry-run 映射为 `Project.detailContent` 和 `assistantContext` 更新计划，但不会直接写 `portfolio.ts`。
- 当前项目详情现状摘要：
  - Legal RAG、Pet、Ozon ERP、BIAU Playlab、Blog Semi、Xunqiu 已有较完整 `detailContent` 和多张正文 visual。
  - 6 个游戏项目已有基础内容，但通常每组只有 1 个 section，正文深度相对轻。
  - 所有项目都有 hero image，正文 visual 数量大多为 2-4 个。

### Associated Project Roots To Inspect

后续实现不能只读 README，需要按项目读取代码、脚本、配置和测试：

- `D:\workspace4Cursor\legal-rag`
- `D:\workspace4Cursor\erp`
- `D:\workspace4Cursor\pet`
- `D:\workspace4Codex\xunqiu`
- `D:\workspace4Codex\xunqiu-backend-modern`
- `D:\workspace4Cursor\game`
- 主站自身：`D:\workspace4Cursor\blog-semi`

## Requirements

### R1. 内容深度

- 每个纳入范围的项目详情页必须至少覆盖：
  - 项目定位和访客为什么要看；
  - 主要使用路径或演示路径；
  - 实现与架构；
  - 技术栈不是简单罗列，而要解释协作方式；
  - 质量验证、smoke、synthetic、构建、部署或人工验收证据；
  - 当前边界、不能公开的内容、未完成能力；
  - 后续优化方向。

### R2. 视觉证据

- 项目正文中应穿插 visual，而不是只依赖首屏 hero image。
- 优先使用真实公开安全截图；没有截图时使用架构图、流程图、数据流图、状态证据图或发布证据图。
- 所有 `visual.image` 必须指向 public-safe 资产，优先 `/images/projects/showcase/`。
- 不提交含有账号、密钥、后台私有链接、数据库、模型渠道、客户数据或敏感指标的截图。

### R3. 证据来源

- 每个项目至少检查其真实代码结构、脚本、测试、部署配置、公开页面或已生成资产。
- README、PRD 或历史文档只能作为辅助线索，不能单独决定公开表述。
- 对无法验证的能力应写成 `planned`、`gated`、`待验证` 或 `后续优化`，不能写成已完成事实。

### R4. Assistant 知识同步

- 更新项目详情内容时，同步维护 `assistantContext`，让公开助手能回答项目实现、架构、边界和后续方向。
- `assistantContext` 只能包含公开安全事实，不包含账号、密钥、私有 URL、本地绝对路径、生产配置或内部后台。

### R5. 发布方式

- 允许直接更新 `src/data/portfolio.ts` 和 public-safe assets。
- 如使用 Studio 草稿，应先通过 `studio:project-detail-plan` 输出更新计划，再人工审查后落地。
- 不让 Studio API 直接写 `portfolio.ts`。

### R6. 优先级

- 第一轮应避免“所有项目平均用力导致每页都浅”。
- 推荐先补强主站首页重点项目和业务价值最高的项目，再统一扫游戏项目一致性。
- 第一批固定为：
  - `legal-rag`
  - `ozon-erp`
  - `pet-workspace`
  - `xunqiu`
  - `biau-playlab`
  - `blog-semi`

## Acceptance Criteria

- [ ] PRD 明确项目详情页内容目标、证据边界、视觉资产边界和验收口径。
- [ ] `design.md` 说明 `portfolio.ts`、项目详情渲染、public assets、assistant knowledge 和验证脚本之间的边界。
- [ ] `implement.md` 拆出分阶段执行清单，包含逐项目证据采集、内容更新、资产检查、助手索引和 UI 验证。
- [ ] 第一批 6 个主项目的 `detailContent` 至少覆盖 6 个内容组中的 5 个，且正文 visual 不少于 2 个。
- [ ] 第一批项目的 `assistantContext` 与公开详情内容保持一致。
- [ ] 新增或引用的正文图片/SVG 均存在于公开目录，且不含敏感信息。
- [ ] 更新后运行必要验证：`assistant:index`、资产存在检查、`lint`、`build`、`check:ui`；若改动博客/助手索引或 sitemap，再运行对应检查。
- [ ] 公开页面不把未上线能力、人工 gate、调试状态或计划项写成已完成事实。

## Out Of Scope

- 不在本任务中直接重构 `ProjectDetailPage.tsx` 的整体信息架构，除非内容落地暴露出现有组件无法承载的必要问题。
- 不公开真实后台账号、密码、API key、数据库 URL、模型中转站、私有仪表盘或本地签名路径。
- 不为了补图而伪造业务截图；可使用明确标注为架构/流程的 SVG，但不能伪装成真实运行证据。
- 不在第一轮重新制作所有博客文章。
