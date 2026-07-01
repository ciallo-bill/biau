# Blog content system design

## Problem

博客需要从一次性生成的文章堆，升级为可长期维护的栏目化内容系统。新系统应让访客理解“这里有哪些类型的内容”，也让后续写作、模型协作、审稿和发布检查有固定路径。

本设计采用直接迁移：不保留旧 `BlogCategory = tech | project | news | resource | daily` 兼容层。实现阶段应把博客域里的 `category` 语义替换为新的 `column` 语义。

## Column Contract

新增 `BlogColumn`：

```ts
export type BlogColumn = 'knowledge' | 'project-notes' | 'resources' | 'ai-daily' | 'build-log'
```

栏目元数据建议放在 `src/data/blogShared.ts` 或独立 `src/data/blogColumns.ts`，但必须由博客列表、详情页、项目延展阅读、助手标签和审计脚本复用。

每个栏目包含：

- `id`: `BlogColumn`
- `titleZh`: 中文主标题
- `titleEn`: 英文副标题或辅助标识
- `description`: 访客可读说明
- `scope`: 适合写什么
- `avoid`: 不适合写什么

栏目定义：

| Column | 中文 | English | Scope | Avoid |
| --- | --- | --- | --- | --- |
| `knowledge` | 知识积累 | Knowledge Notes | 可复用技术方法、架构理解、工程治理、AI 应用经验 | 单纯项目流水账、新闻搬运 |
| `project-notes` | 项目总结 | Project Notes | 项目阶段复盘、关键问题、架构取舍、踩坑修复、迭代路线 | 重复项目详情页的功能清单、技术栈、演示入口 |
| `resources` | 资源分享 | Resource Picks | 用户主动推荐的工具、文章、仓库、模型、课程、素材与使用笔记 | 自动拼接的资源模板、无个人判断的链接堆 |
| `ai-daily` | AI 日报 | AI Daily | 高频 AI 动态、模型更新、工具变化、行业案例和可试能力 | 未核实消息、长期方法论文章 |
| `build-log` | 构建手记 | Build Log | 网站、内容系统、AI 助手、Trellis 工作流的构建过程和系统演进 | 与项目详情页重复的稳定展示文案 |

## Data Migration Shape

直接把博客数据从：

```ts
category: BlogCategory
```

迁移为：

```ts
column: BlogColumn
```

并把 `categoryLabels` 替换为 `blogColumnMeta` 或 `blogColumnLabels`。迁移后博客域不再导出 `BlogCategory`。

现有 9 篇公开文章建议归属：

| Slug | Column | Reason |
| --- | --- | --- |
| `legal-rag-review` | `project-notes` | 项目复盘，关注 MVP 到生产化路线 |
| `legal-rag-production-upgrade-plan` | `project-notes` | 项目迭代路线，不是通用技术总结 |
| `ozon-erp-architecture` | `project-notes` | ERP 项目架构总结 |
| `pet-workspace-pipeline` | `project-notes` | Pet 项目当前工作和生成管线总结 |
| `xunqiu-android64-rebuild` | `project-notes` | 历史移动项目阶段复盘 |
| `game-showcase-standard` | `project-notes` | 游戏项目展示系统的阶段总结 |
| `content-modeling-project-site` | `knowledge` | 内容模型与信息架构可复用方法 |
| `public-content-governance` | `knowledge` | 公开内容治理方法 |
| `static-site-release-verification` | `knowledge` | 静态站发布验证方法 |

隐藏文章可以留在源数据中，但如果迁移 `BlogPostSummary` 类型，隐藏文章也必须补 `column`，避免类型绕过。迁移不等于公开发布。

## UI And Public Surfaces

博客列表页应按 `BlogColumn` 筛选，不再按旧分类筛选。

栏目按钮可以同时展示中文主标题与英文辅助标识，例如：

```txt
知识积累
Knowledge Notes
```

现阶段不要求博客页接入完整语言切换；可以先显示双语标签。若实现时接入 `SiteLanguage`，也必须保持同一套栏目语义，只切展示文本。

文章详情页、关联阅读卡片、项目详情页的延展阅读标签都应使用新栏目元数据。`getRelatedBlogPosts` 的相似度评分从旧 `category` 改为 `column`。

## Curation And Assistant

`src/data/blogCuration.ts` 仍负责公开可见性、内容角色、优先级和项目关系，但它应读取 `post.column` 并把栏目纳入：

- `filterBlogPosts`
- `getBlogAssistantTags`
- `getRelatedBlogPosts`
- 审计报告里的栏目统计

`BlogContentRole` 可以继续保留，因为它描述文章在策展系统里的角色，不等于站点一级栏目。若后续发现 role 与 column 重叠，再单独收敛。

## Content Pipeline Skill

创建 `.agents/skills/blog-content-pipeline/SKILL.md`，固化流程而非写死某个模型。

默认流水线：

1. Codex 从项目代码、README、部署脚本、现有页面和 Trellis 任务取证。
2. Codex 形成资料包、栏目、文章目标、事实边界和禁止泄露清单。
3. 一个强内容模型串行生成或改写正文。
4. Codex 审稿：事实核对、结构调整、脱敏、栏目匹配、与项目详情页去重。
5. Codex 入库并运行审计、索引、sitemap、lint/build。

默认只用一个内容模型。GLM-5.2、DeepSeek V4 Pro、Gemini 3.1 Pro 可以作为强写作/改写候选；Gemini 3.5 Flash 更适合摘要、提纲、轻量改写或批量预检查。

多模型对照只用于重要文章、风格难定或事实表达争议。默认串行调用；如必须并发，必须明确模型走不同中转站，避免单中转高并发。

## Rollout

第一阶段只做栏目系统与流水线基础：

- 直接迁移博客数据类型和 UI 到 `BlogColumn`。
- 映射现有 9 篇公开文章。
- 创建内容生产 skill 与模板。
- 更新审计脚本和必要规范。

不批量发布 AI 日报，不批量重写隐藏文章，不引入 CMS。

## Rollback

如果迁移导致公开页面或审计异常，回滚点是本任务所有博客域改动。因为不做兼容层，实施时必须小步提交并先跑 `blog:audit`、`assistant:index`、`sitemap:generate`、`lint`、`build`。
