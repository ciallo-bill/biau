# Current Task

Date: 2026-06-16
Repo: /home/zhang/workspace/blog-semi
Branch: main
Controller: Codex
Builder: Codex

## Goal

Add real runtime screenshots for Next Spacewar and connect them to the public showcase site.

## Scope

- Use the complete Windows source project only through a temporary capture copy.
- Publish two reviewed, public-safe runtime screenshots: main menu and gameplay HUD.
- Use the main menu screenshot as the Next Spacewar project visual.
- Add Next Spacewar runtime evidence to /cases/godot-showcase.
- Update docs/showcase-assets.md and verification notes.

## Non-goals

- Do not modify ~/workspace/reference-projects.
- Do not modify D:/workspace4Codex/game-next-spacewar.
- Do not publish Godot export packages, logs, .import metadata, local paths, build artifacts, package hashes, or raw validation output.
- Do not claim InteSpace or Raiden have real runtime screenshots yet.

## Allowed Paths

- public/images/projects/showcase/next-spacewar-*.png
- src/data/portfolio.ts
- src/App.tsx
- docs/showcase-assets.md
- .agent-work/current-task.md
- .agent-work/verification.md

## Acceptance Criteria

- [x] Next Spacewar screenshots are generated from the actual Godot project in a temporary copy.
- [x] Selected screenshots are public-safe and added to public/images/projects/showcase.
- [x] Next Spacewar project card/detail uses a real runtime screenshot.
- [x] /cases/godot-showcase includes Next Spacewar runtime evidence alongside the existing structure diagram.
- [x] docs/showcase-assets.md distinguishes covered and remaining Godot screenshot gaps.
- [x] npm run lint and npm run build pass in WSL.
- [x] Sensitive/public wording scan is reviewed.
- [x] Browser QA confirms local routes load images without console errors or horizontal overflow.

## Verification Plan

- Confirm copied PNG dimensions and file sizes.
- Run npm run lint.
- Run npm run build.
- Run sensitive/public wording scan.
- Browser-check /projects/game-next-spacewar, /games/next-spacewar, and /cases/godot-showcase at desktop and mobile widths.
- Commit and push after verification passes.
