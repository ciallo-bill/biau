# Current Task

Date: 2026-06-16
Repo: /home/zhang/workspace/blog-semi
Branch: main
Controller: Codex
Builder: Claude Code via `cc`

## Goal

Clean up stale public-facing status and next-step wording now that several showcase screenshots and evidence entries have been added.

## Scope

- Review visible Chinese copy in project, case, and game detail data for stale phrases such as “补充中”, “补充截图”, and “接入 Web 试玩入口”.
- Update only wording that is now inaccurate because evidence already exists.
- Keep legitimate future work, especially real Godot Web package integration, but phrase it precisely.
- Make case statuses more polished and consistent with the current evidence level.

## Non-goals

- Do not redesign page layouts in this slice.
- Do not add new projects or cases.
- Do not modify reference project directories.
- Do not claim a real Godot Web build exists where only a site-level showcase entry exists.
- Do not publish private paths, accounts, service addresses, release package paths, local validation paths, or sensitive operational data.

## Allowed Paths

- src/App.tsx
- src/data/portfolio.ts
- docs/showcase-assets.md
- .agent-work/current-task.md
- .agent-work/cc-plan.md
- .agent-work/codex-review.md
- .agent-work/verification.md

## Acceptance Criteria

- [x] Previous task artifacts are archived before new work.
- [x] `cc` is asked for a read-only plan using provider order `a -> b -> c -> d`.
- [x] Codex records a narrowed review before implementation.
- [x] Stale public wording is updated without broad rewrites.
- [x] Space War wording clearly distinguishes “site showcase entry” from a real playable Godot Web package.
- [x] Sensitive/public wording scan is reviewed.
- [x] `npm run lint` passes.
- [x] `npm run build` passes.
- [x] Browser QA checks key affected routes at desktop and mobile widths.
- [ ] Changes are committed, pushed, and production QA is recorded.

## Verification Plan

- Run targeted `rg` scans for stale words and sensitive/private terms.
- Run `npm run lint`.
- Run `npm run build`.
- Browser-check `/projects`, `/cases`, `/cases/godot-showcase`, and `/games/space-war` locally at desktop and mobile widths.
- After push and Cloudflare deployment, verify production routes and record the result in `.agent-work/verification.md`.
