# Implementation Plan

## Checklist

- [x] Load relevant frontend specs before editing.
- [x] Add image metadata validation to `scripts/check-project-detail-evidence.ts`.
- [x] Add raster WebP sidecar checks.
- [x] Update docs/specs.
- [x] Run targeted and broad validation.
- [x] Commit and archive child task.

## Validation Commands

- `npm.cmd run project-details:check`
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run verify`
- `git diff --check`
- Diff-level sensitive scan over changed files.

## Validation Results

- `npm.cmd run project-details:check` passed for 12 projects after the gate was added.
- Negative check: temporarily removed `legal-rag-reviewed.webp`; `project-details:check` failed with the expected missing WebP sidecar error, then the asset was restored.
- Negative check: temporarily replaced `legal-rag-reviewed.png` with a 1x1 PNG; `project-details:check` failed with the expected tiny-image error, then the asset was restored.
- Negative check: temporarily replaced `legal-rag-reviewed.png` with text; `project-details:check` failed with the expected unreadable-image error, then the asset was restored.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed; Vite reported only the existing ineffective dynamic import warnings.
- `npm.cmd run verify` passed, including assistant, Studio, project detail, status contract, preview, and UI checks.
- `git diff --check` passed.
- Diff-level sensitive scan over changed files returned no matches.
