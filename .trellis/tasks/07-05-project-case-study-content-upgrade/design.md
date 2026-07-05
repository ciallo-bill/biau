# 项目详情页技术案例内容与配图补全设计

## Architecture Decision

采用 **Static Case Study Data + Public Asset Evidence**：

- 公开项目页继续由 `src/data/portfolio.ts` 驱动，不引入动态 CMS。
- `Project.detailContent` 是项目案例正文的唯一公开内容结构。
- `ProjectDetailSection.visual` 承载正文中的截图、流程图、架构图、数据流、状态证据和发布证据。
- `Project.assistantContext` 与详情内容同步维护，供公开助手知识索引使用。
- 新增素材只放入 public-safe 路径，优先 `public/images/projects/showcase/`。
- Studio 可以生成项目详情草稿和 dry-run plan，但生产代码落地仍通过 Git diff 人工审查。

这条路线延续现有静态站优势：公开页面速度和稳定性不依赖数据库；每次内容变更都有 Git diff、资产检查、助手索引和 UI 回归。

## Target Scope

第一批固定为 6 个主项目：

- `legal-rag`
- `ozon-erp`
- `pet-workspace`
- `xunqiu`
- `biau-playlab`
- `blog-semi`

第二批再统一扫游戏项目：

- `game-first-tetris`
- `game-next-spacewar`
- `intespace`
- `raiden-prototype`
- `space-war`
- `spacewar-ii`

## Data Boundaries

### Project Content

Owner: `src/data/portfolio.ts`

Relevant contracts:

- `Project.detailContent?: ProjectDetailContent`
- `ProjectDetailContentKey = overview | workflow | architecture | quality | limitations | roadmap`
- `ProjectDetailSection.visual?: ProjectVisualBlock`
- `Project.assistantContext?: string[]`

Implementation should update existing `projects` entries rather than creating parallel content maps.

### Rendering

Owner: `src/pages/ProjectDetailPage.tsx`

Current rendering already supports:

- hero image;
- quick links;
- highlights;
- tech stack;
- related links;
- grouped case-study sections;
- section-level visual figures;
- related blog posts;
- related projects.

Default plan is content/data work. Component changes are allowed only if content reveals a real rendering limitation, such as visual captions not fitting, missing asset fallback, or layout overflow.

### Public Assets

Owner: `public/images/projects/showcase/`

Allowed assets:

- real sanitized screenshots;
- authored SVG architecture/flow/data/status diagrams;
- generated or edited bitmap assets only if they are clearly illustrative and do not pretend to be product screenshots.

Disallowed assets:

- screenshots with credentials, bearer tokens, database URLs, private dashboards, model provider URLs, local file paths, private customer data, exact sensitive metrics, or admin-only secrets;
- private APK links or signing paths;
- dark/blurred stock-like placeholders that do not help inspect the project.

### Assistant Knowledge

Owners:

- `src/data/portfolio.ts`
- `scripts/generate-assistant-knowledge.ts`
- `src/data/assistant.ts`

`getProjectAssistantSummary(project)` and `getProjectAssistantTags(project)` are the shared projection points. After changing project content or assistant context, run `npm.cmd run assistant:index` so server-side public knowledge stays aligned.

## Evidence Workflow

For each first-batch project:

1. Read local project rules if present: `AGENTS.md`, `CLAUDE.md`, `.cursor/rules`.
2. Inspect real project structure, scripts, source modules, tests, deployment config, and public assets.
3. Record only public-safe facts into project content.
4. Classify unverified or gated capabilities as limitations, gates, or roadmap.
5. Pick or create visual evidence:
   - screenshot for visible product state;
   - workflow diagram for user journey;
   - architecture/data-flow diagram for system structure;
   - status/release diagram for reliability or APK/deploy gates.
6. Update `detailContent` and `assistantContext` together.

## Content Shape Per Project

Each first-batch project should aim for:

- `overview`: visitor value, product identity, public demo boundaries.
- `workflow`: the best public walkthrough or user journey.
- `architecture`: how frontend/backend/data/model/deployment pieces work together.
- `quality`: tests, smoke, synthetic, eval, build, deployment or status evidence.
- `limitations`: what is gated, WIP, private, or not production-ready.
- `roadmap`: future iteration directions.

Acceptance allows 5 of 6 groups if one group genuinely does not fit, but the default target is all 6.

## Rollout Strategy

Recommended implementation order:

1. Create an evidence matrix for the 6 first-batch projects.
2. Update the weakest first-batch pages first.
3. Add or fix assets only when the existing asset library cannot support the case.
4. Regenerate assistant knowledge.
5. Run validation.
6. Commit one or more reviewable slices.

## Risks

- **Content drift**: project page and assistant answer diverge.
  - Mitigation: update `assistantContext` in the same diff and run `assistant:index`.
- **Overclaiming**: page says a gated or planned capability is live.
  - Mitigation: require limitations/gates in every project and inspect real code/scripts.
- **Asset safety**: screenshot leaks private information.
  - Mitigation: prefer existing sanitized assets; inspect new assets before commit.
- **Huge diff**: updating all pages at once becomes hard to review.
  - Mitigation: first batch is 6 projects; commit can be split by content family if needed.
- **Component pressure**: content needs drive unplanned UI refactor.
  - Mitigation: only make narrow rendering fixes if validation proves existing UI cannot carry content.

## Rollback

- Content changes are Git-tracked in `src/data/portfolio.ts`.
- New assets are Git-tracked under `public/images/projects/showcase/`.
- If a project page quality regresses, revert the relevant content/asset commit without affecting Studio, backend, or public routes.
