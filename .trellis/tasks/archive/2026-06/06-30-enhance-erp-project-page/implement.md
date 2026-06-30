# Enhance ERP Project Page Implementation Plan

## Guardrails

- Do not edit source repository `D:\workspace4Cursor\erp`.
- Do not include secrets, IPs, deployment host/user details, SFTP details, extension keys, JWT/refresh secrets, ERP encryption keys, database URLs, Redis URLs, Seller cookies, Ozon Client-Id/API-Key, real account data, backup hashes, private paths, or raw private deploy commands in public UI copy.
- Do not rewrite blog posts in this child task.
- Preserve unrelated dirty files: `AGENTS.md`, `.agents/`, `.codex/`, and `docs/agents/codex-workflow.md`.
- Keep the parent task and remaining game/pet child task active; only this ERP child should be started/implemented/archived when complete.

## Ordered Checklist

### 1. Evidence Audit

- Re-check evidence before writing public copy:
  - workspace/package scripts.
  - Vue web router and views.
  - Express server route registration and startup behavior.
  - Prisma schema.
  - auth, extension-key, direct-write, queue, worker, plugin release, audit/logging helpers.
  - products, selection, Ozon, api.chrome, shops, settings, uploads, exchange-rate routes.
  - WXT extension config, background/content/popup entrypoints.
  - tests, smoke script, handoff checklist, launch readiness, commission coverage, dependency-audit docs.
- Confirm no unsafe details from inspected files enter public page or assistant context.
- Prefer code/tests over README/handoff prose if they conflict.

### 2. Data Content

- Update the ERP entry in `src/data/portfolio.ts`:
  - refine summary/highlights/stack if useful.
  - add `detailContent` with groups:
    - overview
    - workflow
    - architecture
    - quality
    - limitations
    - roadmap
  - add `assistantContext` with concise public facts.
- Keep content visitor-readable and case-study oriented.
- Include future optimization directions, not only current implementation.
- Keep existing ERP external link and architecture article link.

### 3. Detail Page Rendering

- Remove or disable the `project.id === 'ozon-erp'` hard-coded `OzonErpProjectArticle` path after its useful content is represented in `detailContent`.
- Remove unused ERP constants/functions/imports from `ProjectDetailPage.tsx` if no longer referenced.
- Verify `/projects/ozon-erp` uses the generic project case-study renderer.

### 4. Assistant Knowledge

- Run `npm.cmd run assistant:index`.
- Confirm `server/data/public-knowledge.json` includes richer `project:ozon-erp` summary and tags via existing projection helpers.
- No generated knowledge shape change is expected.

### 5. Validation

Run:

```powershell
npm.cmd run assistant:index
npm.cmd run lint
npm.cmd run build
npm.cmd run verify
```

If a check fails, fix and rerun the relevant command. If `verify` fails for environment-specific reasons, record exact evidence.

### 6. Review And Finish

- Use `trellis-check` after implementation.
- Update `.trellis/spec/` only if this task discovers a new reusable convention beyond the established project-detail model and public-data-safety rules.
- Commit only current-task files.
- Archive `06-30-enhance-erp-project-page` after successful validation and commit.
- Record the session journal.

## Rollback Points

- Data rollback: remove ERP `detailContent` and `assistantContext`.
- Rendering rollback: restore `OzonErpProjectArticle` conditional and constants if generic rendering has unexpected issues.
- Knowledge rollback: revert generated `server/data/public-knowledge.json` and rerun `assistant:index`.

## Review Before Start

Before starting implementation, confirm:

- ERP should follow the same visitor-readable technical case-study model as Legal RAG and Xunqiu.
- The page should emphasize small-team operations workflow, admin/API/database/plugin architecture, protected write boundary, queue/worker behavior, validation, limitations, and roadmap.
- Source ERP repository remains read-only.
- Public safety constraints are accepted.
