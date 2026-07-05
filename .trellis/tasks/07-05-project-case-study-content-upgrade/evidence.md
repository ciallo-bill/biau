# First-Batch Project Case Study Evidence

> Scope: `legal-rag`, `ozon-erp`, `pet-workspace`, `xunqiu`, `biau-playlab`, `blog-semi`.
> Rule: README is only a clue. Public copy must be backed by code, scripts, tests, deploy docs, public-safe assets, or generated status data.

## Shared Public Assets

Reusable public-safe assets already exist under `public/images/projects/showcase/`:

- Legal RAG: `legal-rag-knowledge.png`, `legal-rag-qa.png`, `legal-rag-reviewed.png`, `legal-rag-flow.svg`, `legal-rag-report-boundary.svg`.
- Ozon ERP: `erp-cover.svg`, `ozon-erp-admin-runtime.png`, `ozon-erp-workflow.svg`, `ozon-erp-data-model.svg`, `ozon-erp-admin-console.svg`.
- Pet: `android-main.png`, `android-hatch.png`, `android-community.png`, `android-profile.png`, `fantasy-pet-review-flow.svg`, `fantasy-pet-api-contract.svg`, `fantasy-pet-flow.png`.
- Blog Semi: `blog-semi-home-desktop.png`, `blog-semi-projects-desktop.png`, `blog-semi-blogs-desktop.png`, plus mobile/webp variants.
- Playlab: `space-war-web-showcase.png`, game runtime screenshots and Godot showcase SVGs.
- Xunqiu: `xunqiu-android64-runtime.png`, `xunqiu-migration-flow.svg`, `xunqiu-module-map.svg`, `xunqiu-verification-chain.svg`.

No new asset is required for this slice.

## legal-rag

Current detail coverage: all 6 groups present; 3 body visuals.

Evidence inspected:

- Workspace scripts in `D:\workspace4Cursor\legal-rag\package.json` include build/typecheck flows for `apps/api`, `apps/web`, and `packages/shared`.
- `apps/api/src/app.ts` exposes health, auth, quality/evaluation, audit logs, projects, ingestion, datasets, RAG query, and contract review routes.
- `packages/shared/src/types.ts` defines citation, diagnostics, quality, eval, project-space, ingestion, and contract-review contracts.
- RAG implementation files include `rag-service.ts`, `query-rewriter.ts`, `rerank-service.ts`, `pgvector.ts`, `memory.ts`, and tests.
- Contract review is backed by `review-service.ts`, `review-eval-service.ts`, sample contracts, and eval sets.
- `apps/api/src/validate.ts` runs local validation for health, quality report, evaluation reports, dataset seed, RAG answer with citations/diagnostics, and contract risks.
- `apps/web/scripts/e2e-smoke.mjs` and Vue components show login, knowledge, QA, review, and quality-panel surfaces.
- `CONTEXT.md` explicitly states project-space scoping, citation grounding/refusal, rule-first contract review, quality report, audit log, and no committed credentials.

Public-safe facts:

- Full-stack legal RAG workbench with Vue/Web, Express/API, shared types, public-safe dataset seed, project-space scoping, citations, diagnostics, contract review, evals, quality panel, and audit logs.
- Hosted mode can use Render + PostgreSQL/pgvector + OpenAI-compatible providers, while local demo can use mock/memory. Public copy should describe the adapter boundary, not private provider details.

Do not publish:

- Demo login passwords, model base URLs, database URLs, Render/Supabase dashboard details, private user lists, or raw uploaded legal/business documents.

Suggested content update:

- Add stronger mention that audit logs and project-space authorization are part of the demonstrable backend contract, not just UI decoration.

## ozon-erp

Current detail coverage: all 6 groups present; 3 body visuals.

Evidence inspected:

- Workspace scripts in `D:\workspace4Cursor\erp\package.json` cover web/API/extension dev, workspaces build/test, Prisma, smoke, extension release checks, deploy sync, and security audit.
- `apps/api/src/server.ts` registers health, plugin update, auth, shops, products, selection, settings, Ozon, collect, metrics, commissions, exchange rates, watermark, uploads, and extension routes.
- `apps/api/prisma/schema.prisma` models users, shops, Ozon credentials, products, drafts, import logs, pending actions, job queue, audit logs, market metrics, and commission mappings.
- `apps/api/src/routes/auth.registration.test.ts` and `apps/api/src/lib/runtime.test.ts` cover registration/bootstrap defaults and explicit registration switch behavior.
- `apps/api/src/lib/queue.ts`, `worker.ts`, and `jobExecutor.test.ts` show optional Redis/BullMQ queue mode and local fallback behavior.
- `apps/extension` contains WXT/MV3 source, release version checks, popup, content script, background script, and generated ZIP.
- `docs/ozon-launch-readiness-report-*`, `ozon-commission-coverage-report-*`, `handoff-checklist-*`, and `security-dependency-audit.md` back the launch/readiness and known-risk wording.

Public-safe facts:

- Ozon ERP is a deployed business system with Vue admin, Express API, Prisma/PostgreSQL data model, optional Redis/BullMQ worker, WXT/Chrome extension, release checks, smoke scripts, and audit/queue boundaries.
- Production self-registration support exists in code, but live availability must be read from `/api/auth/bootstrap` or the status synthetic result.

Do not publish:

- The repository contains deploy commands and extension defaults with sensitive-looking operational details. These should not be copied into public copy. Do not publish real shop credentials, extension keys, deployment host/user, database URLs, or Ozon tokens.

Suggested content update:

- Clarify that plugin release/version checks are part of delivery quality and that deployment commands exist only as private handoff material.

## pet-workspace

Current detail coverage: all 6 groups present; 3 body visuals.

Evidence inspected:

- `D:\workspace4Cursor\pet\gamer\package.json` includes workspace test, admin-review, community-api, pet-generator, worker config check, database migration, private-ops preflight/smoke, and hook audit scripts.
- `services/community-api` contains routes, store, PostgreSQL store, migrations, metrics, structured logging, rate limit, SLA, release, configured store, and many tests.
- `apps/android-community` contains Android shell, Community API client/repository/mappers, generation client/service, pet shell, default-pet assets, unit tests, and Android UI smoke hooks.
- `apps/admin-review` contains static admin UI, queue presenter/store, tests, and Dockerfile.
- `services/pet-generator` contains adapter, server, GA random pet worker, state source, sync, and tests.
- `docs/api/community-api.md`, `docs/OBSERVABILITY.md`, `docs/SLA-CONFIGURATION.md`, `docs/RATE-LIMITING.md`, and `docs/TRACEABILITY-MATRIX.md` back API, observability, SLA, rate-limit, and test-matrix claims.
- APK scan found only `apps/android-community/app/build/outputs/apk/debug/app-debug.apk`; no release APK/AAB candidate was found.

Public-safe facts:

- Pet is WIP with Android App, Community API, Admin Review, Pet Generator, worker/QA/human-review chain, package contracts, PostgreSQL migration path, metrics/SLA/rate-limit/logging, and a public static App showcase page.
- The public APK gate must remain closed until release signing, checksum, version notes, regression evidence, and manual approval exist.

Do not publish:

- Private ops tokens, model/provider URLs, server-to-server Agent tokens, database URLs, private deployment hosts, Worker commands, or debug APK as a public release.

Suggested content update:

- Strengthen the distinction between public App showcase, internal debug APK evidence, and final release gate.

## xunqiu

Current detail coverage: all 6 groups present; 4 body visuals.

Evidence inspected:

- `D:\workspace4Codex\xunqiu\xunqiu-android64` contains Android 64-bit source, `ApiClient`, screens for home/community/tweets/videos/team/schedule/pitch/profile, test matrix, legacy-entry matrix, stage plan, and build script.
- `D:\workspace4Codex\xunqiu-backend-modern\pom.xml` confirms Spring Boot 3.3.6, Java 17, actuator, JPA, security, validation, web, Flyway PostgreSQL, PostgreSQL runtime, AWS S3 SDK, H2, and Testcontainers.
- Backend source includes account, user, tweet, video, team, match, pitch, search, misc, fallback, root controllers, file storage service, request support, security config, and database-url environment post-processor.
- Backend tests include compatibility API, PostgreSQL compatibility, file storage, and database URL post-processor tests.
- `scripts/smoke-test.ps1` exists for live smoke over backend-compatible endpoints.
- Showcase site contains `index.html`, `docs.html`, `docs/`, `downloads/latest-xunqiu64.apk`, assets, favicon, and headers.

Public-safe facts:

- Xunqiu is a migration case: old app/backend remain history boundary, new Android 64 client and Spring Boot backend validate compatible routes, modern PostgreSQL/Flyway persistence, R2-style object storage, and a static showcase with stage APK.

Do not publish:

- Old backend IPs, test passwords, signing paths, database URLs, R2/Render private config, or any credentials from local properties files.

Suggested content update:

- Clarify that the stage APK is a public showcase artifact but not a full app-store release promise.

## biau-playlab

Current detail coverage: all 6 groups present; 3 body visuals.

Evidence inspected:

- `D:\workspace4Cursor\game\blog\package.json` includes Astro build, content audit, dist link audit, verify, play export/check, Cloudflare Pages deploy, R2 upload, and public endpoint check scripts.
- `src/content/config.ts` defines Astro content collections for published articles, article workbench, games, and devlogs.
- `src/content/games/*.md` contains six playable game entries with `playableWeb` and `embedUrl` fields, including `spacewar-ii`.
- `src/pages/games/[slug].astro`, `GameEmbed.astro`, `GameCard.astro`, RSS, sitemap, and robots routes show the visitor flow and SEO surface.
- `tools/audit_site_content.mjs`, `audit_dist_links.mjs`, `check_r2_play_exports.mjs`, `upload_r2_play.mjs`, and `check_public_endpoints.mjs` back the quality claims.
- Public assets include screenshots, posters, SVG covers, videos, and game-specific images.

Public-safe facts:

- Playlab is an Astro static portfolio and Godot Web play platform with six playable projects, content collections, structured pages, RSS/sitemap/robots, Cloudflare Pages, R2-oriented play exports, and endpoint checks.

Do not publish:

- Cloudflare tokens, R2 bucket credentials, private upload commands with secrets, or local Godot export paths.

Suggested content update:

- Mention structured data / RSS / sitemap as part of content-site maturity, not just game screenshots.

## blog-semi

Current detail coverage: all 6 groups present; 3 body visuals.

Evidence inspected:

- `D:\workspace4Cursor\blog-semi\package.json` includes assistant knowledge generation, RAG checks, model/backend smoke, Prisma, blog checks, Studio export/planning commands, synthetic checks, site status, UI check, sitemap, image optimization, and verify.
- `src/data/portfolio.ts` owns project display data, `detailContent`, visuals, assistant context, and projection helpers.
- `src/pages/ProjectDetailPage.tsx` renders grouped detail sections and body visuals from data, not hard-coded project-specific content.
- `src/data/blogCuration.ts`, `blogContent.ts`, and `blog-posts/*` back curated public blog visibility.
- `src/data/assistant.ts`, `assistantKnowledge.ts`, `scripts/generate-assistant-knowledge.ts`, `server/src/ragOrchestrator.ts`, `ragPostgresStore.ts`, `ragQdrantStore.ts`, and `ragEmbeddings.ts` back public assistant/local RAG direction.
- `scripts/check-*-synthetic.mjs`, `generate-site-status.ts`, and `src/pages/SiteStatusPage.tsx` / `SiteStatusDetailPage.tsx` back status and reliability-observation claims.
- `public/pet-app-showcase/` and `public/status/*.json` are static public surfaces generated or maintained by this repo.

Public-safe facts:

- Blog Semi is the current BIAU Port main site: React/Vite/Semi UI, static typed data, curated blog, public assistant, lightweight backend/RAG groundwork, Studio draft flows, status pages, and validation scripts.

Do not publish:

- API keys, model channels, Qdrant/Supabase/Aiven URLs, database connection strings, admin tokens, invite tokens, or private production config.

Suggested content update:

- Add that the site now has Studio planning/export tools and external RAG store groundwork, while public pages remain static and Git-reviewed.
