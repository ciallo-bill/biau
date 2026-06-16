# Current Task

Date: 2026-06-16
Repo: /home/zhang/workspace/blog-semi
Branch: main
Controller: Codex
Builder: Claude Code via `cc`

## Goal

Add one public-safe Ozon ERP runtime/admin screenshot to close the current Ozon ERP showcase gap for a desensitized real backend view.

## Scope

- Use a temporary copy of the ERP web app if a runtime capture is needed.
- Keep `/home/zhang/workspace/reference-projects/erp` and `/mnt/d/workspace4Codex/erp` read-only.
- Capture or create one public-safe screenshot representing the ERP admin console runtime view.
- Add the asset to the Ozon ERP case evidence matrix.
- Update `docs/showcase-assets.md` and verification notes.

## Non-goals

- Do not start or depend on the real ERP API, PostgreSQL, Redis, Ozon API, extension release flow, or deployment scripts.
- Do not publish real shop names, order IDs, product IDs, credentials, tokens, database URLs, server hosts, local validation paths, or deployment account details.
- Do not modify reference/source ERP files.
- Do not redesign the Ozon ERP case page or rewrite unrelated project content.
- Do not close Pet Workspace or xunqiu screenshot gaps in this slice.

## Allowed Paths

- public/images/projects/showcase/ozon-erp-admin-runtime.png
- src/App.tsx
- docs/showcase-assets.md
- .agent-work/current-task.md
- .agent-work/cc-plan.md
- .agent-work/codex-review.md
- .agent-work/verification.md

## Acceptance Criteria

- [x] `cc` produces a read-only plan before implementation.
- [x] One Ozon ERP runtime/admin screenshot is added under `public/images/projects/showcase/`.
- [x] The screenshot contains only public-safe mock/desensitized operational data.
- [x] `/cases/ozon-erp` includes the new evidence card and the image decodes locally.
- [x] `docs/showcase-assets.md` marks the Ozon ERP screenshot gap as covered.
- [x] Sensitive/public wording scan is reviewed.
- [x] `npm run lint` and `npm run build` pass in WSL.
- [x] Browser QA checks `/cases/ozon-erp` at desktop and mobile widths.

## Verification Plan

- Confirm the screenshot file exists and is a valid PNG.
- Run sensitive/public wording scan over changed files.
- Run `npm run lint`.
- Run `npm run build`.
- Browser-check `/cases/ozon-erp` locally at desktop and mobile widths.
- Commit and push after verification passes.
