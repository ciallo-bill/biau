# CC Builder Plan: InteSpace Runtime Screenshots

Date: 2026-06-16
Task: Add real runtime screenshots for InteSpace and connect them to the public showcase site.

## Builder Findings

- InteSpace is a portrait-first Godot project with a player hub, combat HUD, weapon/growth loop, and public-safe visual states suitable for the showcase site.
- The source project should remain read-only. Screenshot capture must happen through a temporary copy under `D:/workspace4Codex/.tmp-godot-capture/`.
- The strongest public evidence for this slice is the player hub plus gameplay HUD. A result/loop screenshot is optional only if it can be captured reliably.

## Proposed Scope

1. Generate reviewed screenshots from the actual Godot project through a temporary capture copy.
2. Publish only selected PNGs under `public/images/projects/showcase/intespace-*.png`.
3. Use the player-hub screenshot as the InteSpace project visual.
4. Add InteSpace runtime evidence to `/cases/godot-showcase` while keeping the existing system-loop diagram.
5. Update `docs/showcase-assets.md`, `.agent-work/current-task.md`, and `.agent-work/verification.md`.

## Risks And Constraints

- Do not modify `D:/workspace4Codex/intespace`.
- Do not modify `~/workspace/reference-projects`.
- Do not publish local paths, raw logs, Godot `.import` metadata, release packages, hashes, accounts, IPs, tokens, or generated validation output.
- Do not claim Raiden has real runtime screenshots.

## Verification

- Confirm PNG dimensions and file sizes.
- Run `npm run lint`.
- Run `npm run build`.
- Run the public-safety wording scan.
- Browser-check `/projects/intespace`, `/games/intespace`, and `/cases/godot-showcase` at desktop and mobile widths.
