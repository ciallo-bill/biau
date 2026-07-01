# Chunk strategy draft evidence review

## Goal

把 `content-drafts/02-chunk-strategy-public.md` 从带有 TODO/待作者补充的模型草稿，刷新为可继续人工审稿的 evidence-first draft。重点是用当前 Legal RAG 代码证明 chunk 策略、metadata、引用和验证链路，减少泛泛 AI 文案。

## Requirements

- 必须使用 `blog-content-pipeline` skill。
- 写作模式为 `Codex-only scaffold/review`，模型渠道 `none`。
- 不调用 live model，不运行 `--generate` 或 `--polish-from`。
- 不发布到 runtime blog，不修改 `src/data/blog*`、`blogCuration`、assistant index 或 sitemap。
- 不删除旧博客，不公开任何仍为“待核验”的事实。
- 从当前代码取证，至少覆盖：
  - `legal-rag/apps/api/src/chunks/splitter.ts`
  - `legal-rag/apps/api/src/documents/ingestion-service.ts`
  - `legal-rag/apps/api/src/documents/text.ts`
  - `legal-rag/apps/api/src/rag/rag-service.ts`
  - `legal-rag/apps/api/src/citations/citations.ts`
  - `legal-rag/apps/api/src/validate.ts`
  - `legal-rag/apps/web/src/components/QaView.vue`
- 草稿应移除或改写明显占位语，如 `[待作者补充...]`。
- 保留 `blog:check` 所需 evidence headings、review gates 和 promotion checklist。

## Acceptance Criteria

- [x] `content-drafts/02-chunk-strategy-public.md` 有真实证据包、安全事实、不确定事实和禁写边界。
- [x] Draft Body 不再依赖“请作者补充”的占位段落。
- [x] 运行 `npm.cmd run blog:check`、`git diff --check` 和敏感信息扫描。
- [x] 人工审核 gate 清楚标明：是否发布、是否配图、是否继续模型润色仍需单独决定。

## Notes

- 这是父任务的内容治理小步，不进入公开发布流程。
- 本轮刷新为 `Codex-only scaffold/review`，模型渠道为 `none`，未运行 live model、`--generate` 或 `--polish-from`。
- 已移除 `TODO` / `待作者补充` / `请在此处` 占位语，并把实践案例改为 Legal RAG 当前 `section-aware chunk` 实现。
- 验证已运行：`rg` 占位词检查、`npm.cmd run blog:check`、`git diff --check`、敏感信息扫描。敏感扫描只命中禁写说明、metadata 字段名和正文里的 Token 概念词。
- Human gate: 是否发布、是否配图、是否继续模型润色仍需用户后续单独决定。
