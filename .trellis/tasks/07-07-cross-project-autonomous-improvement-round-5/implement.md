# Cross-project Autonomous Improvement Round 5 Implementation Plan

## Default Order

1. Finish parent planning artifacts.
2. Start parent task.
3. Create and start `round-5-project-detail-case-study-visuals`.
4. Improve one project detail page or shared project detail system with evidence-first content and inline visuals.
5. Validate and commit the slice.
6. Continue down the P1 list unless a manual gate blocks the exact task.

## Per-child Protocol

- Read child `prd.md`.
- Load `trellis-before-dev` before editing.
- Inspect the affected repo rules and scripts before touching associated projects.
- Prefer public-safe data structures and reusable content components.
- Update `manual-gates.md` for blocked platform/credential/release work.
- Run focused validation first; broaden only when routes, data contracts, or shared UI changed.

## Default Validation

For `blog-semi` changes:

- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run check:ui` when routes, visible UI, cards, status pages, or project detail pages change.
- `npm.cmd run site:status` / related synthetic scripts when status data changes.
- `git diff --check`
- targeted sensitive-value scan over changed files.

For associated projects:

- read local scripts first;
- run the smallest lint/build/test/smoke that validates the change;
- never publish or push sensitive artifacts.

## Long-running Rules

- Do not wait for the user on platform gates.
- Do not keep reopening completed tasks; archive completed children before moving on.
- If a network or platform check flakes, record low-sensitive evidence and choose a local task next.
- Every work segment should leave one durable output: code, data, docs, test record, or manual gate.

## Completion

Round 5 is complete when at least one P1 child is completed and the parent records what was done, what remains gated, what was validated, and what should be attempted next.
