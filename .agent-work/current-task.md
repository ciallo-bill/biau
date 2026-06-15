# Current Task

Date: 2026-06-15
Repo: /home/zhang/workspace/blog-semi
Branch: main
Controller: Codex
Builder: Codex

## Goal

Continue showcase asset coverage inside WSL by adding desensitized Ozon ERP evidence diagrams and using them on the Ozon case detail page.

## Scope

- Create public-safe Ozon ERP workflow and data-model diagrams.
- Add Ozon ERP image evidence to `/cases/ozon-erp`.
- Preserve existing Legal RAG, Pet Workspace, and Godot showcase image mappings.
- Update `docs/showcase-assets.md` to reflect the new Ozon asset coverage.
- Verify route rendering, image loading, lint, build, and sensitive wording scan in WSL.

## Non-goals

- Do not copy real store names, accounts, cookies, Ozon credentials, database URLs, hostnames, ports, backup hashes, bundle paths, or deployment records.
- Do not modify `~/workspace/reference-projects`.
- Do not add new projects.
- Do not redesign the whole case-detail layout.
- Do not push before verification.

## Allowed Paths

- `src/App.tsx`
- `docs/showcase-assets.md`
- `public/images/projects/showcase/ozon-erp-workflow.svg`
- `public/images/projects/showcase/ozon-erp-data-model.svg`
- `.agent-work/*`

## Acceptance Criteria

- [x] `/cases/ozon-erp` shows three Ozon evidence images.
- [x] The two new Ozon diagrams are public-safe and path-free.
- [x] Existing `/cases/legal-rag`, `/cases/pet-workspace`, and `/cases/godot-showcase` evidence images still work.
- [x] No horizontal overflow appears on desktop/mobile checks.
- [x] Public text does not introduce `面试` / `作品集` wording or sensitive credentials/endpoints.
- [x] `npm run lint` and `npm run build` pass in WSL.

## Verification Plan

- Browser-check `/cases/ozon-erp` at desktop and mobile widths.
- Run a quick image regression for the existing case image routes.
- Run `npm run lint`.
- Run `npm run build`.
- Run a sensitive/public wording scan over `src`, `docs`, `public`, and active `.agent-work` files.
- Commit only after the evidence is clean.
