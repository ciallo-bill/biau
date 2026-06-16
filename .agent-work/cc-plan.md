# Builder Plan: Next Spacewar Result Screenshot

Date: 2026-06-16
Task: Add Next Spacewar result-page screenshot to the Godot showcase.

## Builder Status

Claude Code was attempted in non-interactive planning mode, but the local WSL CLI returned `Not logged in · Please run /login`. This slice is therefore continuing as Codex fallback while preserving the same builder/controller artifact structure.

## Builder Findings

- `game-next-spacewar` already has real menu and gameplay HUD screenshots.
- The remaining Next Spacewar evidence gap is the result-page layer: proof that the menu, combat loop, pause/help flow and run summary are connected into a full showcase route.
- The result page is driven by `RunResultState.store_result(...)`, so a public-safe result state can be seeded in a temporary capture copy without modifying the source project or publishing raw gameplay logs.
- Relevant source files:
  - `/mnt/d/workspace4Codex/game-next-spacewar/scenes/run_result.tscn`
  - `/mnt/d/workspace4Codex/game-next-spacewar/scripts/run_result.gd`
  - `/mnt/d/workspace4Codex/game-next-spacewar/scripts/run_result_state.gd`
  - `/mnt/d/workspace4Codex/game-next-spacewar/scripts/main.gd`

## Proposed Scope

1. Use the existing temporary copy at `D:/workspace4Codex/.tmp-godot-capture/game-next-spacewar`.
2. Add a temporary result capture runner in that copy only.
3. Seed a public-safe run-complete state and capture the actual `run_result.tscn` UI as `next-spacewar-result-summary.png`.
4. Add the selected screenshot to `/cases/godot-showcase`.
5. Update `docs/showcase-assets.md`, `.agent-work/current-task.md`, and `.agent-work/verification.md`.

## Verification

- Confirm PNG dimensions and file size.
- Run `npm run lint`.
- Run `npm run build`.
- Run the public-safety wording scan.
- Browser-check `/cases/godot-showcase` at desktop and mobile widths.
