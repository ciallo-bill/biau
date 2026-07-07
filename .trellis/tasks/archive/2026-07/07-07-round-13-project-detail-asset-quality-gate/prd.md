# Round 13 project detail asset quality gate

## Goal

Strengthen project detail evidence checks so referenced public showcase assets are parseable, large enough for visitor-readable case pages, and optimized with raster WebP sidecars.

## Background

- `scripts/check-project-detail-evidence.ts` already verifies project detail structure, public-safe paths, image existence, alt text, captions, and visual composition.
- It does not yet verify that referenced image files are readable images, large enough to be useful on a case-study page, or paired with WebP optimized sidecars for raster assets.
- Existing showcase assets were measured locally and fit a safe minimum threshold: the smallest referenced mobile screenshots are still at least 390px wide and 852px tall.

## Requirements

- R1. Extend the project detail evidence check from path existence to asset-quality validation.
- R2. Validate every referenced hero/body visual image can be parsed for dimensions.
- R3. Fail tiny placeholder-like assets while allowing mobile/tall screenshots and SVG diagrams.
- R4. Require raster public showcase assets used by project details to have matching `.webp` sidecars.
- R5. Update docs/specs so future project detail asset changes know the quality bar.
- R6. Do not add, replace, or fabricate project screenshots in this task.

## Acceptance Criteria

- [x] `npm.cmd run project-details:check` fails on unreadable/tiny referenced assets.
- [x] `npm.cmd run project-details:check` fails when a referenced raster asset lacks a matching WebP sidecar.
- [x] Existing project detail assets pass the strengthened check.
- [x] `docs/showcase-assets.md` and frontend quality specs mention parseable dimensions and WebP sidecars.
- [x] Required validation commands pass.

## Out of Scope

- Generating or editing screenshots.
- Claiming a project has new runtime evidence without adding real safe assets.
- Publishing APKs or external demo links.
