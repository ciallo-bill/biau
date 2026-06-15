# Current Task

Date: 2026-06-15
Repo: /home/zhang/workspace/blog-semi
Branch: main
Controller: Codex
Builder: Codex

## Goal

Add the first non-Space War real Godot runtime screenshots by generating Tetris screenshots from the actual Godot project and connecting them to the public showcase site.

## Scope

- Use a temporary copy of the complete Windows Tetris project under /tmp/godot-capture so source projects are not modified.
- Run the project's existing screenshot regression script with Godot 4.6.1 in WSL.
- Add selected public-safe Tetris runtime screenshots to blog-semi.
- Use the desktop runtime screenshot as the Tetris project visual.
- Add Tetris runtime evidence to /cases/godot-showcase.
- Update docs/showcase-assets.md and verification notes.

## Non-goals

- Do not modify ~/workspace/reference-projects.
- Do not modify D:/workspace4Codex/game-first-tetris.
- Do not add Godot export packages, Web playable files, or generated .import metadata.
- Do not publish full raw screenshot-regression output; only selected reviewed images.
- Do not claim other Godot projects have real runtime screenshots yet.

## Allowed Paths

- public/images/projects/showcase/tetris-*.png
- src/data/portfolio.ts
- src/App.tsx
- docs/showcase-assets.md
- .agent-work/current-task.md
- .agent-work/verification.md

## Acceptance Criteria

- [x] Tetris runtime screenshots are generated from the actual Godot project in a temporary copy.
- [x] Selected screenshots are public-safe and added to public/images/projects/showcase.
- [x] Tetris project card/detail uses a real runtime screenshot.
- [x] /cases/godot-showcase includes Tetris runtime evidence alongside the existing structure diagram.
- [x] docs/showcase-assets.md distinguishes Tetris real screenshots from other Godot structure diagrams.
- [x] npm run lint and npm run build pass in WSL.
- [x] Browser QA confirms local routes load images without console errors or horizontal overflow.

## Verification Plan

- Confirm generated PNG dimensions and file sizes.
- Run npm run lint.
- Run npm run build.
- Run sensitive/public wording scan.
- Browser-check /projects, /projects/game-first-tetris, /games/first-tetris, and /cases/godot-showcase at desktop and mobile widths.
- Commit and push after verification passes.
