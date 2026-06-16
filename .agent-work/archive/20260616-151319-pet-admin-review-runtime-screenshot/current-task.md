# Current Task

Date: 2026-06-16
Repo: /home/zhang/workspace/blog-semi
Branch: main
Controller: Codex
Builder: Claude Code via `cc`

## Goal

Add one public-safe Pet Workspace admin-review runtime screenshot to close the current Pet Workspace showcase gap for a desensitized review-console view.

## Scope

- Use `gamer/apps/admin-review` from the Pet Workspace reference project as the real runtime source.
- Keep `/home/zhang/workspace/reference-projects/pet` and `/mnt/d/workspace4Codex/pet` read-only.
- Create a temporary `GA_PET_RUN_ROOT` with only demo candidate data and generated placeholder preview/motion images.
- Run the admin-review server from a temporary copy or directly from read-only source if no files are written to it.
- Capture one public-safe screenshot:
  - `public/images/projects/showcase/fantasy-pet-admin-review-runtime.png`
- Add the screenshot to the Pet Workspace case evidence matrix.
- Update `docs/showcase-assets.md` and verification notes.

## Non-goals

- Do not start real community API, pet generator worker, cloud services, database, Supabase, Android app, or deployment scripts.
- Do not publish real task JSON, run paths, model configuration, cloud endpoints, storage keys, local validation paths, generated candidate packages, or private assets.
- Do not modify reference/source Pet files.
- Do not redesign the Pet Workspace case page or rewrite unrelated project content.
- Do not close xunqiu or blog-semi screenshot gaps in this slice.

## Allowed Paths

- public/images/projects/showcase/fantasy-pet-admin-review-runtime.png
- src/App.tsx
- docs/showcase-assets.md
- .agent-work/current-task.md
- .agent-work/cc-plan.md
- .agent-work/codex-review.md
- .agent-work/verification.md

## Acceptance Criteria

- [x] `cc` produces a read-only plan before implementation.
- [x] One Pet admin-review runtime screenshot is added under `public/images/projects/showcase/`.
- [x] The screenshot is generated from the real admin-review UI with only demo/desensitized candidate data.
- [x] `/cases/pet-workspace` includes the new evidence card and the image decodes locally.
- [x] `docs/showcase-assets.md` marks the Pet Workspace admin-review screenshot gap as covered.
- [x] Sensitive/public wording scan is reviewed.
- [x] `npm run lint` and `npm run build` pass in WSL.
- [x] Browser QA checks `/cases/pet-workspace` at desktop and mobile widths.

## Verification Plan

- Confirm the screenshot file exists and is a valid PNG.
- Run sensitive/public wording scan over changed files.
- Run `npm run lint`.
- Run `npm run build`.
- Browser-check `/cases/pet-workspace` locally at desktop and mobile widths.
- Commit and push after verification passes.
