# Implement Plan

## Checklist

1. Load project guidelines with `trellis-before-dev` before editing production files.
2. Start this child task with `python ./.trellis/scripts/task.py start 06-30-enhance-game-and-pet-project-pages`.
3. Update `src/data/portfolio.ts`.
   - Add `detailContent` and `assistantContext` to `pet-workspace`.
   - Add `detailContent` and `assistantContext` to `biau-playlab`.
   - Add concise `assistantContext` to the six game entries.
   - Keep public copy sanitized and visitor-readable.
4. Regenerate assistant data with `npm.cmd run assistant:index`.
5. Run verification.
   - `npm.cmd run lint`
   - `npm.cmd run build`
   - `npm.cmd run verify`
6. Inspect `git diff` and ensure unrelated dirty files are not included.
7. Archive the child task after checks pass.
8. Update parent task progress and journal if needed.

## Validation Notes

- Known existing Vite warnings about ineffective dynamic imports are acceptable if the build exits successfully.
- If assistant indexing changes ordering or generated timestamps only, inspect the generated diff before keeping it.
- If `portfolio.ts` type-check fails, prefer adjusting data shape to the existing `ProjectDetailContent` schema rather than changing renderer types.

## Risk Points

- The pet project has many private operational details; only use public-safe high-level descriptions.
- The game source and pet source projects are evidence only. Do not edit them.
- Existing unrelated dirty files must remain unstaged and unmodified by this task.

## Review Gate

Planning is ready for implementation when `prd.md`, `design.md`, and `implement.md` exist and the user has approved proceeding. This session is Codex inline mode, so `implement.jsonl` and `check.jsonl` seed manifests do not need curated sub-agent entries.
