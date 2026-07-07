# Round 15 project visual text density guard

## Goal

Raise the quality floor for project detail body visuals by requiring visitor-readable alt text and captions, then fix the few existing visuals that are too terse.

## Requirements

- R1. `npm.cmd run project-details:check` must reject in-body project visual images with too-short alt text or captions.
- R2. The minimum should be conservative enough to catch placeholder text without forcing marketing copy.
- R3. Existing project detail pages must pass after updating only public-safe copy.
- R4. Do not add new images, external URLs, generated screenshots, or private evidence.
- R5. Keep the project-detail content source of truth in `src/data/portfolio.ts`.

## Acceptance Criteria

- [x] `scripts/check-project-detail-evidence.ts` enforces minimum visual alt/caption lengths for image-backed visuals.
- [x] Existing project visual copy is updated where needed.
- [x] `npm.cmd run project-details:check` passes.
- [x] Required validation commands pass.

## Out of Scope

- Replacing project screenshots or diagrams.
- Changing project detail page layout.
- Adding new projects or changing public project links.
