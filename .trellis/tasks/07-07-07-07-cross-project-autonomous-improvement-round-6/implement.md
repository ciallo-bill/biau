# Cross-project Autonomous Improvement Round 6 Implementation Plan

## Default Order

1. Finish parent artifacts.
2. Start parent task.
3. Create and start `round-6-xunqiu-status-apk-backend-gate`.
4. Complete that child if locally possible; otherwise record its manual gate and move to the next child.
5. Continue with Playlab/game, project-detail visuals, internal assistant knowledge admin, or blog quality depending on what is locally actionable.

## Per-child Protocol

- Read child `prd.md`, `design.md`, and `implement.md`.
- Load `trellis-before-dev` before code edits.
- Read affected repo rules and scripts before touching associated projects.
- Keep changes small, reversible, and public-safe.
- Update `manual-gates.md` whenever a platform, credential, release, model, or signed artifact decision is required.
- Run focused validation; run full `verify` for shared UI/status/data changes.

## Default Validation

- `npm.cmd run status:contract`
- `npm.cmd run project-details:check` when project detail data changes.
- Relevant `*:synthetic` and `site:status` when status data changes.
- `npm.cmd run check:ui` when routes, project cards, status pages, or project detail UI change.
- `npm.cmd run verify` before broad main-site commits.
- `git diff --check` and targeted sensitive-value scan before commit.

## Completion

Round 6 is complete when at least one P1 child is completed, pushed, and archived, and this parent task records completed work, validation, manual gates, and the recommended next round.

