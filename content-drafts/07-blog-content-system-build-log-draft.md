---
slug: "blog-content-system-build-log-draft"
title: "博客内容系统构建手记：如何把 AI 写作变成可审稿流水线"
column: "build-log"
series: "站点构建手记"
tag: "构建手记"
status: "draft"
generatedBy: "codex-reviewed-draft"
generatedAt: "2026-07-01T05:09:11.708Z"
modelStrategy: "Codex 先整理证据包与边界；如需长文改写，串行调用一个强内容模型；最后由 Codex 做事实核查、脱敏、结构调整和入库。本次刷新未调用模型。"
---

# 博客内容系统构建手记：如何把 AI 写作变成可审稿流水线

## Evidence Pack
- `.agents/skills/blog-content-pipeline/SKILL.md`
- `.agents/skills/blog-content-pipeline/references/templates.md`
- `.agents/skills/blog-content-pipeline/references/usage.md`
- `.agents/skills/blog-content-pipeline/references/review-and-prompts.md`
- `.trellis/spec/backend/blog-draft-workflow.md`
- `.trellis/tasks/archive/2026-07/07-01-first-build-log-post/research.md`
- `.trellis/tasks/archive/2026-07/07-01-blog-content-pipeline-dry-run/prd.md`
- `.trellis/tasks/archive/2026-07/07-01-blog-model-setup-wizard/prd.md`
- `content-drafts/blog-content-system-build-log-draft.skill-dry-run.md`
- `scripts/blog-rewrite-plan.json`
- `scripts/generate-blog-draft.mjs`
- `scripts/blog-model-config.mjs`
- `scripts/check-public-blog.mjs`
- `src/data/blogShared.ts`
- `src/data/blogCuration.ts`
- `src/data/blog-posts/blog-content-system-build-log.ts`
- `package.json`

## Safe Public Facts
- 博客系统已经使用 `BlogColumn` 表达五个一级栏目：知识积累、项目总结、资源分享、AI 日报和构建手记。
- 公开博客通过 `blogCuration` 控制可见性；未策展文章默认隐藏，不会因为存在草稿就自动公开。
- `blog-content-pipeline` 要求先取证、再起草、再审稿，最后才决定是否进入公开发布流程。
- `blog:draft` 默认生成 evidence-first scaffold；只有显式加 `--generate` 才会请求模型。
- `blog:model doctor` 默认是离线配置检查；显式小任务才适合做模型路由验证。
- 当前草稿保留在 `content-drafts/`，本轮不改 `src/data/blog*` 运行时公开数据。
- 已有公开文章 `blog-content-system-build-log` 复盘了栏目化和内容治理，因此本草稿需要聚焦 skill 正常使用流程，避免重复总览文章。

## Uncertain Or Stale Facts
- 当前私有 `strong` 模型渠道是否已经能完成长文生成，本轮不做实时验证。
- 这篇草稿是否需要未来公开发布，取决于它是否能提供不同于既有构建手记的读者价值。
- 如果未来公开发布，是否需要配图或图示，应在发布任务里按正文用途重新决定。
- 旧博客内容的筛选、重写或删除仍属于后续清理任务，不能在本文里写成已经完成。

## Forbidden / Private Details
- 不写入模型中转站地址、API key、账号、真实部署入口、数据库连接串、私有运维信息或本机绝对路径。
- 不引用或复述私有环境配置文件里的值。
- 不暗示草稿会自动公开发布。
- 不编造访问量、SEO 增长、模型质量分数、用户反馈或生产指标。
- 不把装饰性生成图伪装成真实产品截图、真实控制台或真实数据图。

## Draft Brief
- Column: 构建手记 / Build Log
- Column note: 适合记录站点、助手、内容系统和 Trellis 工作流演进。
- Target reader: 关注 AI 辅助内容生产、个人项目站点和技术博客治理的访客
- Summary: 复盘 `blog-content-pipeline` 从“写作说明”变成可重复执行流程的过程：先选择主题和模板，再建立证据包、确认模型边界、刷新草稿并执行审稿检查。
- Public angle: 这不是一篇自动写作教程，而是说明 AI 内容生产如何被放进可审稿、可验证、可暂停发布的工程流程。
- Knowledge points: 内容治理、AI 写作流水线、证据包、模型边界、公开策展、Trellis 工作流
- Project examples: BIAU Port 内容系统、公开助手知识索引、Trellis 任务归档
- Overlap boundary: 稳定的栏目迁移和公开策展事实已由既有构建手记覆盖；本文只写 skill 使用流程和演练经验。

## Article Outline
- 问题起点 / Problem
- 关键决策 / Decision
- 实现路径 / Implementation
- 验证方式 / Verification
- 经验沉淀 / Lessons
- 下一步 / Next Steps

## Model Strategy
- 本次刷新由 Codex 基于证据包直接改写，没有调用实时模型。
- 默认长期策略仍是：Codex 先整理证据包与边界；如需长文改写，串行调用一个强内容模型；最后由 Codex 做事实核查、脱敏、结构调整和入库。
- 不默认多模型并发。只有在重要文章、表达风格不确定或观点 framing 有争议时，才考虑多模型对照。
- 模型渠道状态用离线 `status` / `doctor` 先检查；路由验证应作为显式小任务，而不是普通草稿流程的默认动作。

## Draft Body

### 问题起点

最初的问题并不是“再让 AI 写几篇博客”，而是更具体：一个已经安装好的 `blog-content-pipeline` skill，能不能像真正可复用的内容生产流程一样被别人下载、设置、选择主题、生成草稿、审稿和暂停发布？

这个问题很重要。技术博客如果只依赖一次性 prompt，很容易得到语气顺滑但事实边界模糊的文章；如果直接让模型批量产出，又会把项目事实、部署状态、模型配置和公开内容混在一起。对 BIAU Port 这种项目展示站来说，博客应该帮助访客理解工程判断，而不是把草稿变成自动发布机器。

所以这次构建手记不再重复“博客系统如何栏目化”的总览。那个主题已经有公开文章记录过。本次更像一次流程演练：站在使用者视角，验证 skill 是否能指导一篇草稿从选题走到审稿。

### 关键决策

第一个决策是把输出限制在 `content-drafts/`。草稿存在，不等于公开；公开仍然要经过运行时文章数据、loader、curation、助手索引和 sitemap 的发布流程。这个边界让内容生产可以大胆试稿，同时不会误伤公开页面。

第二个决策是允许使用自定义模板。本轮采用“问题起点 -> 关键决策 -> 实现路径 -> 验证方式 -> 经验沉淀 -> 下一步”，而不是强行把内置 Build Log 模板当成固定标题。内置模板更适合做检查清单：起点、决策、路径、验证、收益、后续工作都要覆盖，但具体文章可以用更顺手的表达结构。

第三个决策是本次不调用实时模型。模型不是被禁止，而是要被放在正确位置：证据包完成之后，才值得把材料交给一个强内容模型起草或改写；模型输出回来之后，Codex 还要继续做事实核查、脱敏、结构修订和入库判断。这样模型负责语言生产，人和工程流程负责证据边界。

### 实现路径

正常流程从选题开始。`blog:plan` 会列出 `scripts/blog-rewrite-plan.json` 里的候选主题，本轮选择 `blog-content-system-build-log-draft`，栏目是 `build-log`。这个主题适合记录内容系统和 AI 写作流程的演进，但也有一个明显风险：站点已经有一篇公开的内容系统构建手记，所以新草稿必须收窄到“skill 使用流程演练”，而不是再写一次栏目迁移总览。

接着是证据包。证据来源不只包括 skill 自身的 `SKILL.md`，还包括模板说明、使用规范、审稿协议、博客草稿脚本、模型配置脚本、公开检查脚本、栏目类型、公开策展数据、既有公开文章和历史 Trellis 任务记录。证据包的作用不是装饰，而是给每个公开判断找出处，也把不确定事实和禁写细节提前摆出来。

然后刷新草稿。为了兼容 `blog:check`，草稿上半部分保留固定 evidence 区块：Safe Public Facts、Uncertain Or Stale Facts、Forbidden / Private Details、Review Gates 和 Promotion Checklist。真正面向读者的正文放在 `Draft Body` 里。这样同一个文件既能被脚本检查，也能被作者继续打磨。

### 验证方式

这条流程的验证分两层。第一层是命令行为：`blog:model doctor --profile strong --format markdown` 应保持离线检查，不应该随手发送模型请求；`blog:draft -- --slug blog-content-system-build-log-draft` 在草稿已存在且不加 `--force` 时应该跳过，避免误覆盖；`blog:check` 应该确认草稿结构、禁用语境和 evidence 区块仍然完整。

第二层是人工审稿。本文需要通过事实、安全、栏目适配、重复度和发布边界检查。事实上，它只能说证据里能确认的内容；安全上，它不能带出模型渠道、密钥、真实部署或敏感运行信息；栏目上，它属于构建手记；重复度上，它要避开既有公开文章已经讲过的栏目治理总览；发布边界上，它仍然只是草稿。

图片也在验证范围内。这个主题暂时不需要生成图。如果未来公开发布，更适合补一张自制流程图，例如 `evidence pack -> draft -> review -> curation -> publish checks`，而不是生成看起来像真实后台的装饰图。

### 经验沉淀

这次演练最大的收获，是把“AI 写作”从一个模型调用问题，重新拆回内容工程问题。模型能帮助写作，但不能替代证据包、栏目判断、敏感信息边界和发布检查。

第二个收获是模板应该服务文章，而不是反过来支配文章。内置栏目模板提供最低覆盖面，自定义模板提供更自然的叙事结构。只要证据、安全和审稿门禁不下降，文章结构就可以根据主题调整。

第三个收获是失败也应该进入流程。之前的干跑记录里，强内容模型渠道出现过路由问题；这不是写作质量问题，而是配置和模型路由问题。把问题写成阶段报告，比悄悄换模型或追加 fallback 更可靠。先让失败可见，再讨论兜底策略，流程才会越来越稳。

### 下一步

短期内，这篇草稿不需要进入公开站点。更合适的下一步是继续把 skill 的使用体验打磨清楚：模型配置向导、离线状态检查、显式小任务验证、模板选择、图片策略和发布清单都要让使用者一眼知道该做什么。

如果未来要把它发布成正式文章，可以有两种方向。第一种是把它作为既有构建手记的补充，只讲“正常使用 skill 的流程”。第二种是等模型起草、图片策略和发布门禁都跑完后，把它改成一篇更完整的“AI 内容流水线实践”文章。无论选哪种，都不应该绕过证据包和公开策展。

## Image Decision
- 本轮不需要图片生成。
- 如果未来公开发布，优先使用自制流程图，不使用伪装成真实后台或真实数据的生成图。
- 图片进入公开文章前，需要记录来源类型、用途、alt text、是否为证据，以及公开安全审查结果。

## Review Gates
- [x] Every project claim is backed by the evidence pack.
- [x] No private or sensitive information is included.
- [x] The draft does not duplicate stable project-detail-page facts.
- [x] The selected column matches the actual purpose of the article.
- [x] Hidden drafts remain hidden until explicitly curated.
- [x] Existing public article overlap is identified and narrowed to the skill-flow angle.
- [x] No live model use happened in this refresh.

## Promotion Checklist
- [ ] Convert reviewed content into `src/data/blog-posts/<slug>.ts` only after review.
- [ ] Add summary metadata to `src/data/blog.ts`.
- [ ] Register a loader in `src/data/blogContent.ts` only if the post should be public/loadable.
- [ ] Add `blogCuration` only when ready for public visibility.
- [ ] Run `npm.cmd run blog:audit`, `assistant:index`, `sitemap:generate`, `lint`, and `build` after public promotion.
