# Builder Plan: Raiden Closed-Loop Screenshots

Date: 2026-06-16
Task: Add Raiden result and chapter-summary screenshots to the Godot showcase.

## Builder Findings

- Raiden already has real menu, Stage 01, and Stage 02 screenshots.
- The remaining Raiden evidence gap is the result/summary layer: proof that the UI can present a completed route and chapter wrap-up.
- The result and chapter outro scenes are driven by `RunState`, so a public-safe state can be seeded in a temporary capture copy without modifying the source project or publishing raw run data.

## Proposed Scope

1. Seed a public-safe chapter-complete state in the temporary capture copy.
2. Capture `raiden-results-summary.png` and `raiden-chapter-outro.png` from the actual Godot UI.
3. Add both screenshots to `/cases/godot-showcase`.
4. Update `docs/showcase-assets.md`, `.agent-work/current-task.md`, and `.agent-work/verification.md`.

## Verification

- Confirm PNG dimensions and file sizes.
- Run `npm run lint`.
- Run `npm run build`.
- Run the public-safety wording scan.
- Browser-check `/cases/godot-showcase` at desktop and mobile widths.
