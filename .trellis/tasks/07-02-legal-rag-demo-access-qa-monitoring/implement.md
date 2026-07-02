# Legal RAG Demo Access And QA Monitoring Implement Plan

## 1. Context

- [x] Inspect `blog-semi` Legal RAG public content.
- [x] Inspect `legal-rag` auth, health, RAG query, ingestion jobs, and e2e smoke.
- [x] Read/update repo-specific rules before editing each repo.

## 2. Legal RAG Monitoring

- [x] Extend `apps/web/scripts/e2e-smoke.mjs` with API smoke helpers and cookie handling.
- [x] Assert seeded dataset job succeeds or times out with a clear message.
- [x] Assert RAG query returns answer plus citations/retrieved chunks/diagnostics.
- [x] Update `docs/demo-script.md` with the stronger smoke command and env variables.

## 3. Main Site Demo Copy

- [x] Update Legal RAG project detail/assistant context with demo access boundary and recommended walkthrough.
- [x] If useful, update the Legal RAG public blog copy with a short demo access note that does not include real credentials.
- [x] Regenerate assistant index and sitemap if public data changes.

## 4. Validation

- [x] `legal-rag`: `node --check apps\web\scripts\e2e-smoke.mjs`
- [x] `legal-rag`: `npm.cmd run typecheck`
- [x] `legal-rag`: `npm.cmd --workspace apps/api run test:unit`
- [x] `legal-rag`: `npm.cmd --workspace apps/api run validate`
- [x] `legal-rag`: local API/Web `npm.cmd --workspace apps/web run test:e2e:smoke`
- [x] `blog-semi`: `npm.cmd run assistant:index`
- [x] `blog-semi`: `npm.cmd run sitemap:generate`
- [x] `blog-semi`: `npm.cmd run blog:check`
- [x] `blog-semi`: `npm.cmd run lint`
- [x] `blog-semi`: `npm.cmd run build`
- [x] `blog-semi`: `npm.cmd run check:ui` if UI-visible content changes.
- [x] `git diff --check` in touched repos.
- [x] changed-file sensitive scan in touched repos.

## 5. Finish

- [ ] Commit/push `legal-rag` current branch if changed.
- [ ] Commit/push `blog-semi/main` if changed.
- [ ] Archive child task and record journal.

## Human Review Gate

- [x] 用户提供并确认可公开的低权限 demo email/password 之前，不把任何密码写进公开文章或项目页。
