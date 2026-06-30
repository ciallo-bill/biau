# Enhance game and pet project pages

## Goal

Improve the public project pages and assistant knowledge for the game portfolio and the AI pet workspace so visitors can read them as technical case studies instead of thin project cards.

The game work should be presented as an already deployed showcase: one Astro content site plus six playable Godot Web entries. The pet work should be presented as current work in progress: a real Android + Community API + generation pipeline workspace with meaningful implementation and validation evidence, but not as a finished production product.

## Background And Evidence

- Main site data lives in `src/data/portfolio.ts`. Existing rich project pages use `detailContent` and `assistantContext`; the project detail route already renders those generic sections.
- `pet-workspace`, `biau-playlab`, and the six game entries currently have mostly card-level content in `src/data/portfolio.ts`.
- `D:/workspace4Cursor/game/blog/package.json` confirms the Playlab site uses Astro 5 and has `content:audit`, `build`, `dist:audit`, `verify`, `deploy:pages`, `deploy:play`, and `deploy:check` scripts.
- `D:/workspace4Cursor/game/blog/src/content/config.ts` defines a rich games collection with status, screenshots, playable web links, challenge, mechanic, contribution, outcome, nextStep, milestones, docs, and devlog relations.
- `D:/workspace4Cursor/game/blog/tools/check_public_endpoints.mjs` checks the game site, every game detail page, every playable Web export, and the main BIAU project pages.
- The six game content pages under `D:/workspace4Cursor/game/blog/src/content/games/` describe the deployed Godot games: Tetris, Next Spacewar, intespace, Raiden, space-war, and Spacewar II.
- `D:/workspace4Cursor/pet/README.md`, `PRD-summary.md`, `ARCHITECTURE.md`, `API-SPECIFICATION.md`, `DATA-MODEL.md`, and `ROADMAP.md` describe the pet workspace as a multi-repo product effort around Android, Community API, admin review, generation rules, QA gates, and human review.
- `D:/workspace4Cursor/pet/gamer/package.json` confirms a Node workspace with Community API, Pet Generator, Admin Review, shared packages, migration, test, worker, preflight, smoke, and private ops audit scripts.
- `D:/workspace4Cursor/pet/gamer/services/community-api/src/routes.js` confirms concrete public routes for feed, community home, approved pets, packages, wallet, check-in, submissions, import drafts, bundle validation, admin reviews, review queue, SLA, metrics, and health.
- `D:/workspace4Cursor/pet/gamer/docs/TRACEABILITY-MATRIX.md` maps 45 requirements to 70+ tests, while also recording Android emulator E2E and live private deployment as known substitute-evidence gaps.
- `D:/workspace4Cursor/pet/fantasy-pet-rule/README.md`, `app-integration-guide.md`, and `pipeline-v2-contract.md` confirm the generation service boundary: App -> Community API gateway -> generation API -> trusted worker -> GenericAgent/Codex -> QA -> human review -> package.

## Requirements

- Add visitor-readable technical case content for `biau-playlab`.
  - Present it as the unified game portfolio and playable platform.
  - Explain the Astro content model, game detail pages, playable Web exports, audit/build/deploy checks, and public endpoint verification.
  - Mention limitations around blog/content quality separately from the playable game showcase.
  - Include concrete next iteration directions.
- Add visitor-readable technical case content for `pet-workspace`.
  - Present it as current work with real implementation evidence, not as a completed public product.
  - Explain the Android app, Community API gateway, admin review UI, pet generator adapter, generation rule service, QA gates, human review, `downloadId` safety boundary, package generation, observability, SLA, and test traceability.
  - Preserve public/private boundaries and avoid exposing operational secrets, real hosts, provider URLs, tokens, env values, local internal paths, or deployment command details.
  - Include current gaps and next iteration directions.
- Improve the six individual game entries enough for assistant retrieval and project discovery.
  - Keep each game aligned with its actual implemented mechanics and status.
  - Prefer concise `assistantContext` and, where useful, lightweight detail sections rather than six overly long pages.
  - Mention each game's follow-up direction.
- Regenerate public assistant knowledge after updating project data.
- Do not edit source projects under `D:/workspace4Cursor/game` or `D:/workspace4Cursor/pet`.
- Do not edit unrelated dirty files: `AGENTS.md`, `.agents/`, `.codex/`, or `docs/agents/codex-workflow.md`.

## Acceptance Criteria

- [ ] `src/data/portfolio.ts` contains rich `detailContent` and `assistantContext` for `biau-playlab`.
- [ ] `src/data/portfolio.ts` contains rich `detailContent` and `assistantContext` for `pet-workspace`, with wording that clearly marks it as work in progress.
- [ ] The six game entries contain accurate assistant-searchable context based on code/content evidence, including follow-up directions.
- [ ] Public-facing copy is sanitized: no secrets, real credentials, private tokens, connection strings, real provider base URLs, internal host details, or private deployment paths.
- [ ] `server/data/public-knowledge.json` is regenerated from the updated project data.
- [ ] `npm.cmd run assistant:index`, `npm.cmd run lint`, `npm.cmd run build`, and `npm.cmd run verify` complete successfully, allowing only known existing non-fatal Vite dynamic-import warnings if they appear.

## Out Of Scope

- Rewriting the blog/article content quality on the Playlab or main site.
- Editing, deploying, or validating the source game projects.
- Editing, deploying, or validating the pet source projects.
- Adding new project detail components unless the existing generic renderer proves insufficient.
- Publishing private pet generation, worker, provider, or deployment operations.
