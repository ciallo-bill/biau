# Current Task

Date: 2026-06-16
Repo: /home/zhang/workspace/blog-semi
Branch: main
Controller: Codex
Builder: Claude Code via `cc`

## Goal

Close the remaining Space War showcase gap by adding one public-safe screenshot of the site-level Web playtest/showcase entry for Space War.

## Scope

- Confirm whether a real Godot Web export exists.
- If no Web export exists, do not fabricate one; capture the existing site route that represents the Web showcase/playtest entry.
- Prefer `/games/space-war` if it renders correctly.
- Add one screenshot under `public/images/projects/showcase/`.
- Add the screenshot to the Godot/Space War evidence matrix if that improves discoverability.
- Update `docs/showcase-assets.md` so the Space War gap is no longer listed as open.

## Non-goals

- Do not build or publish a new Godot Web export in this slice.
- Do not modify `/home/zhang/workspace/reference-projects/space-war` or `/mnt/d/workspace4Codex/space-war`.
- Do not publish local build paths, release package paths, private validation paths, or unrelated release artifacts.
- Do not redesign the game showcase page.
- Do not close unrelated game project gaps.

## Allowed Paths

- public/images/projects/showcase/space-war-web-showcase.png
- src/App.tsx
- docs/showcase-assets.md
- .agent-work/current-task.md
- .agent-work/cc-plan.md
- .agent-work/codex-review.md
- .agent-work/verification.md

## Acceptance Criteria

- [x] Previous blog-semi screenshot task artifacts are archived before this task overwrites `.agent-work` files.
- [x] `cc` produces a read-only plan before implementation.
- [x] Codex reviews and narrows the plan.
- [x] Screenshot is captured from a public-safe site route, preferably `/games/space-war`.
- [x] Screenshot file exists, decodes as PNG, and shows the intended Space War showcase/playtest entry.
- [x] The screenshot is discoverable from the relevant evidence matrix.
- [x] `docs/showcase-assets.md` marks the Space War screenshot gap as covered.
- [x] Sensitive/public wording scan is reviewed.
- [x] `npm run lint` and `npm run build` pass.
- [x] Browser QA checks the affected route at desktop and mobile widths if source files change.

## Verification Plan

- Inspect reference project for Web export evidence without publishing private paths.
- Use system Chrome against local dev server for screenshot capture.
- Confirm PNG dimensions and decode status.
- Run sensitive/public wording scan over changed files.
- Run `npm run lint`.
- Run `npm run build`.
- Browser-check `/games/space-war` and `/cases/godot-showcase` locally at desktop and mobile widths if the evidence matrix changes.
- Commit and push after verification passes.
