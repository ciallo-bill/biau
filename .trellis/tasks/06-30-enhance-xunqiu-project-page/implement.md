# Enhance Xunqiu Project Page Implementation Plan

## Guardrails

- Do not edit source repositories:
  - `D:\workspace4Codex\xunqiu`
  - `D:\workspace4Codex\xunqiu-backend-modern`
- Do not include secrets, IPs, credentials, password hashes, signing information, local SDK paths, database URLs, raw cloud variables, or private file paths in public UI copy.
- Do not rewrite blog posts in this child task.
- Preserve unrelated dirty files: `AGENTS.md`, `.agents/`, `.codex/`, and `docs/agents/codex-workflow.md`.
- Keep the parent task and remaining child tasks active; only this Xunqiu child should be started/implemented/archived when complete.

## Ordered Checklist

### 1. Evidence Audit

- Re-check evidence before writing public copy:
  - Android 64-bit Gradle/config and source screens.
  - `ApiClient` endpoint compatibility and media safeguards.
  - backend `pom.xml`, `application*.yml`, `render.yaml`, `Dockerfile`.
  - backend controllers, service, file storage, migrations, tests, smoke script.
  - showcase site docs and public assets.
- Confirm no unsafe details from inspected files enter public page or assistant context.

### 2. Data Content

- Update the Xunqiu entry in `src/data/portfolio.ts`:
  - refine summary/highlights if useful.
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

### 3. Detail Page Rendering

- Remove or disable the `project.id === 'xunqiu'` hard-coded `XunqiuProjectArticle` path after its useful content is represented in `detailContent`.
- Remove unused Xunqiu constants/functions from `ProjectDetailPage.tsx` if no longer referenced.
- Keep `OzonErpProjectArticle` unchanged.
- Verify `/projects/xunqiu` uses the generic project case-study renderer.

### 4. Assistant Knowledge

- Run `npm.cmd run assistant:index`.
- Confirm `server/data/public-knowledge.json` includes richer `project:xunqiu` summary and tags via existing projection helpers.
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
- Update `.trellis/spec/` only if this task discovers a new reusable convention beyond the Legal RAG project-detail model.
- Commit only current-task files.
- Archive `06-30-enhance-xunqiu-project-page` after successful validation and commit.
- Record the session journal.

## Rollback Points

- Data rollback: remove Xunqiu `detailContent` and `assistantContext`.
- Rendering rollback: restore `XunqiuProjectArticle` conditional and constants if generic rendering has unexpected issues.
- Knowledge rollback: revert generated `server/data/public-knowledge.json` and rerun `assistant:index`.

## Review Before Start

Before starting implementation, confirm:

- Xunqiu should follow the same visitor-readable technical case-study model as Legal RAG.
- The page should emphasize migration, Android 64-bit rebuild, backend modernization, media pipeline, validation, limitations, and roadmap.
- Source repositories remain read-only.
- Public safety constraints are accepted.
