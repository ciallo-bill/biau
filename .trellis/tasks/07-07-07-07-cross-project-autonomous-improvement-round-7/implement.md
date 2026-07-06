# Cross-project Autonomous Improvement Round 7 Implementation Plan

## Default Order

1. [x] Create parent task.
2. [ ] Finish parent artifacts.
3. [ ] Start parent task.
4. [ ] Create and start `round-7-internal-assistant-agentic-workspace-polish`.
5. [ ] Complete that child if locally possible; otherwise record manual gates and move to the next child.
6. [ ] Continue with blog knowledge quality, reliability observation, or cross-project polish depending on what is locally actionable.

## Per-child Protocol

- Read child `prd.md`, `design.md`, and `implement.md`.
- Load `trellis-before-dev` before code edits.
- Read affected repo rules and scripts before touching associated projects.
- Keep changes small, reversible, and public-safe.
- Update `manual-gates.md` whenever a platform, credential, release, model, or signed artifact decision is required.
- Run focused validation; run full `verify` for shared UI/status/data changes.

## Default Validation

- `npm.cmd run lint`
- `npm.cmd run build`
- Relevant server/API smoke or contract checks for internal assistant changes.
- `npm.cmd run check:ui` when routes, admin pages, assistant pages, status pages, or project detail UI change.
- `npm.cmd run verify` before broad main-site commits.
- `git diff --check` and targeted sensitive-value scan before commit.

## Completion

Round 7 is complete when at least one P1 child is completed, pushed, and archived, and this parent task records completed work, validation, manual gates, and the recommended next round.
