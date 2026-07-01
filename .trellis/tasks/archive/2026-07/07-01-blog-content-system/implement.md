# Blog content system implementation plan

## Preconditions

- Task status must be `in_progress` before editing production code.
- Inline Codex workflow skips JSONL sub-agent curation; Phase 2 must load `trellis-before-dev`.
- Preserve unrelated dirty files: `AGENTS.md`, `.agents/`, `.codex/`, `docs/agents/codex-workflow.md`.

## Implementation Checklist

1. Load development context
   - Read `.trellis/spec/` frontend guidance with `trellis-before-dev`.
   - Recheck current dirty worktree before touching files.

2. Replace blog category model with column model
   - Update `src/data/blogShared.ts`.
   - Replace `BlogCategory` with `BlogColumn`.
   - Replace `category` with `column` in `BlogPost` and `BlogPostSummary`.
   - Replace `categoryLabels` with shared column metadata/labels that include Chinese and English text.

3. Migrate blog summary data
   - Update `src/data/blog.ts` public and hidden summaries from `category` to `column`.
   - Assign current public posts according to `design.md`.
   - Assign hidden posts conservatively, mostly `knowledge` unless a title/series clearly belongs elsewhere.
   - Do not make hidden posts public.

4. Migrate full blog post files
   - Update `src/data/blog-posts/*.ts` from `category` to `column`.
   - Keep current content text unchanged unless TypeScript requires a small structural change.

5. Update public curation and filtering
   - Update `src/data/blogCuration.ts` imports, selector types, `filterBlogPosts`, assistant tags, related-post scoring and audit-facing data.
   - Keep `BlogContentRole` only as curation role, not first-level column.

6. Update UI surfaces
   - Replace `CategoryFilter` with a column-aware filter, or refactor it into `BlogColumnFilter`.
   - Update `src/pages/BlogPage.tsx` state and available filter derivation to use columns.
   - Update `src/pages/BlogPostPage.tsx` detail and related labels.
   - Update `src/pages/ProjectDetailPage.tsx` project reading labels.
   - Show Chinese title with English auxiliary label where layout allows.

7. Update scripts and generated artifacts
   - Update `scripts/audit-blog-catalog.ts` statistics and checks from category to column.
   - Update `scripts/check-public-blog.mjs` only if it relies on old terminology.
   - Run `assistant:index` and `sitemap:generate` after data migration.

8. Add content pipeline skill
   - Create `.agents/skills/blog-content-pipeline/SKILL.md`.
   - Include evidence-first workflow, model-selection rules, serial default, multi-model exception policy, templates and review gates.
   - Do not hardcode provider credentials, API URLs, relay names or secrets.

9. Add templates/reference docs
   - Add a compact reusable template for `知识积累`, `项目总结`, `资源分享`, `AI 日报`, `构建手记`.
   - Keep templates as writing guidance, not public articles.

10. Update Trellis spec if implementation creates a durable contract
    - Record the new public blog column contract in `.trellis/spec/frontend/state-management.md`.
    - Mention that public blog surfaces must use `BlogColumn` and public selectors.

## Validation

Run after code/data changes:

```bash
npm.cmd run blog:audit
npm.cmd run assistant:index
npm.cmd run sitemap:generate
npm.cmd run lint
npm.cmd run build
```

Attempt broad verification if the above pass:

```bash
npm.cmd run verify
```

If generated assistant knowledge or sitemap changes, inspect the diff before committing.

## Risk Notes

- Type migration touches many static data files; avoid unrelated text rewrites.
- Hidden posts must remain hidden after column migration.
- Public route access must still go through `getPublicBlogPostSummary`.
- Do not leak local paths, API keys, deployment secrets or private endpoints into templates or skill docs.
- UI labels must not overflow on mobile; keep bilingual labels compact.

## Review Gate

Before running `task.py start`, review:

- `prd.md`
- `design.md`
- `implement.md`

Then start implementation with:

```bash
python ./.trellis/scripts/task.py start ./.trellis/tasks/07-01-blog-content-system
```
