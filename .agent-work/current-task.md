# Current Task

Date: 2026-06-16
Repo: /home/zhang/workspace/blog-semi
Branch: main
Controller: Codex
Builder: Codex fallback

## Goal

Add a Next Spacewar result-page screenshot to strengthen the Godot showcase closed-loop evidence.

## Scope

- Use a temporary capture copy of game-next-spacewar only.
- Seed a public-safe result-page state in the temporary copy, then capture the actual Godot RunResult UI.
- Add the selected screenshot to /cases/godot-showcase.
- Update docs/showcase-assets.md and verification notes.

## Non-goals

- Do not modify ~/workspace/reference-projects.
- Do not modify D:/workspace4Codex/game-next-spacewar.
- Do not publish raw logs, .import metadata, local paths, build artifacts, package hashes, accounts, IPs, tokens, release package details, or private configs.
- Do not claim the result screenshot is real player telemetry; describe it as a public-safe state UI capture.

## Allowed Paths

- public/images/projects/showcase/next-spacewar-result-summary.png
- src/App.tsx
- docs/showcase-assets.md
- .agent-work/current-task.md
- .agent-work/verification.md
- .agent-work/cc-plan.md
- .agent-work/codex-review.md

## Acceptance Criteria

- [x] Result screenshot is generated from the actual Godot UI in a temporary copy.
- [x] Selected screenshot is public-safe and added to public/images/projects/showcase.
- [x] /cases/godot-showcase includes Next Spacewar result-page evidence alongside menu and gameplay screenshots.
- [x] docs/showcase-assets.md marks Next Spacewar result-page coverage and leaves InteSpace result-page as a later gap.
- [x] npm run lint and npm run build pass in WSL.
- [x] Sensitive/public wording scan is reviewed.
- [x] Browser QA confirms local /cases/godot-showcase loads the new image without console errors or horizontal overflow.

## Verification Plan

- Confirm copied PNG dimensions and file size.
- Run npm run lint.
- Run npm run build.
- Run sensitive/public wording scan.
- Browser-check /cases/godot-showcase at desktop and mobile widths.
- Commit and push after verification passes.
