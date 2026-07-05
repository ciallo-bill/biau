# 项目详情页技术案例内容与配图补全实施计划

## Phase 0. Context And Safety Prep

- [x] 读取当前任务 `prd.md` 和 `design.md`。
- [x] 读取前端相关 spec：
  - `.trellis/spec/frontend/directory-structure.md`
  - `.trellis/spec/frontend/component-guidelines.md`
  - `.trellis/spec/frontend/state-management.md`
  - `.trellis/spec/frontend/type-safety.md`
  - `.trellis/spec/frontend/quality-guidelines.md`
- [x] 读取 shared thinking guide：
  - `.trellis/spec/guides/cross-layer-thinking-guide.md`
  - `.trellis/spec/guides/code-reuse-thinking-guide.md`
- [x] 确认工作区无非本任务脏文件。

## Phase 1. First-Batch Evidence Matrix

第一批项目：

- [x] `legal-rag`
- [x] `ozon-erp`
- [x] `pet-workspace`
- [x] `xunqiu`
- [x] `biau-playlab`
- [x] `blog-semi`

每个项目采集：

- [x] 本项目已存在 `detailContent` 覆盖组和 visual 数量。
- [x] 可复用 public assets。
- [x] 关联项目真实代码结构、脚本、测试、部署配置、公开页面。
- [x] 不能公开或需要 gate 的能力。
- [x] 适合写入 `assistantContext` 的公开事实。

输出建议：

- 已在任务目录新增 `evidence.md`，记录每个项目的证据摘要、候选更新点和禁写内容。

## Phase 2. Content Update Slice

- [x] 更新 `src/data/portfolio.ts` 中第一批项目的 `detailContent`：
  - `overview`
  - `workflow`
  - `architecture`
  - `quality`
  - `limitations`
  - `roadmap`
- [x] 第一批每个项目正文 visual 不少于 2 个。
- [x] 技术栈解释必须说明协作方式，不只列工具名。
- [x] 每个项目都保留后续优化方向。
- [x] Pet 明确为当前工作状态和发布 gate，不包装成最终发布完成体。
- [x] 已部署项目明确线上演示、登录门禁、demo 凭据、APK、状态页等公开边界。

## Phase 3. Asset Update Slice

- [x] 检查已引用 `visual.image` 是否存在。
- [x] 未新增 SVG；沿用现有 public-safe 素材。
- [x] 未新增截图；沿用现有脱敏截图和抽象图。

## Phase 4. Assistant Knowledge Sync

- [x] 同步更新第一批项目的 `assistantContext`。
- [x] 运行：

```powershell
npm.cmd run assistant:index
```

- [x] 检查生成的 `server/data/public-knowledge*.json` 不包含敏感信息。

## Phase 5. Validation

最小验证：

```powershell
npm.cmd run assistant:index
npm.cmd run lint
npm.cmd run build
npm.cmd run check:ui
git diff --check
```

如改动 public image 格式或新增大量资产，补充：

```powershell
npm.cmd run images:optimize
```

如改动公开博客关系或 sitemap 相关数据，补充：

```powershell
npm.cmd run blog:audit
npm.cmd run sitemap:generate
```

安全扫描：

- [x] 扫描 diff 中是否含 `sk-`、`DATABASE_URL`、`postgres://`、`password`、`PRIVATE KEY`、私有 dashboard URL、本地签名路径或真实账号。
- [x] 未新增图片/SVG；无需检查新增图片文本层。

## Phase 6. Commit And Handoff

- [x] 根据 diff 大小决定一个提交或多个提交：
  - 推荐第一批内容可拆为 `feat(projects): enrich core project case studies`。
  - 如果资产较多，可拆为 `feat(projects): add case study visuals`。
- [ ] 成功提交后按仓库规则推送 `origin main`。
- [ ] 更新任务记录，说明哪些项目完成、哪些游戏项目留到第二批。

## Validation Results

- `visual.image` public asset existence check: passed.
- `npm.cmd run assistant:index`: passed, generated 25 public knowledge items and V2 knowledge with 49 chunks.
- `npm.cmd run assistant:kg-check`: passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run build`: passed, with existing Vite dynamic import chunking warnings only.
- `npm.cmd run check:ui`: passed for 12 routes across 2 viewports.
- `git diff --check`: no whitespace errors; only Windows LF/CRLF warnings.
- Sensitive scan: no real secrets or connection strings found in this diff; matches are boundary warnings such as not publishing passwords/tokens.

## Manual Gates

- 需要真实线上截图时，必须确认截图不含凭据和私有后台信息。
- 需要公开 APK、demo 凭据、生产状态或 live smoke 结论时，只能使用已经在主站/状态页公开安全表达过的事实。
- 如发现关联项目本身存在功能问题，只记录为后续关联项目任务；本任务优先处理项目详情页展示和公开知识一致性。

## Rollback Points

- `src/data/portfolio.ts` 内容更新可单独回滚。
- `public/images/projects/showcase/*` 新增资产可单独删除。
- `server/data/public-knowledge*.json` 可通过重新运行 `assistant:index` 恢复到数据源一致状态。
