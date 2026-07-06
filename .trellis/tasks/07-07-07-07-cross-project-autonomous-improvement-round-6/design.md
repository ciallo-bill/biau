# Cross-project Autonomous Improvement Round 6 Design

## Boundaries

Round 6 uses the same parent/child structure as Round 5. The parent task records route, priorities, manual gates, and final summary. Child tasks own implementation and verification.

## Default Child Slices

1. `round-6-xunqiu-status-apk-backend-gate`: inspect Xunqiu frontend/backend workspaces, then improve main-site status/APK/backend gate semantics or a locally verifiable Xunqiu showcase gap.
2. `round-6-playlab-game-showcase-contract`: inspect game/Playlab workspace and harden main-site project/status checks for playable entries, screenshots, favicon/title, and route availability.
3. `round-6-project-detail-visual-evidence-followup`: continue project detail inline visuals, diagrams, and public-safe screenshot evidence where the previous round left generic visuals.
4. `round-6-internal-assistant-knowledge-admin-polish`: improve internal assistant admin/knowledge management with low-sensitive diagnostics and local smoke coverage.
5. `round-6-blog-knowledge-quality-backlog`: improve evidence density and reusable review gates for knowledge accumulation posts without relying on model-only polishing.

## Safety Design

- Treat all committed content as public.
- Use status values such as `unchecked`, `planned`, `credential-required`, and `release-gated` instead of overstating blocked capabilities.
- Do not wire real platform secrets, production database URLs, model relay URLs, signed APK paths, admin accounts, or raw monitoring links into Git.
- When a child touches another repository, read its own rules and run that repository's focused checks before reporting conclusions.

## Verification Shape

Each child should pick the smallest reliable validation set first, then broaden when shared UI/data contracts change:

- Main-site data/status/UI: `status:contract`, relevant `*:synthetic`, `site:status`, `project-details:check`, `check:ui`, `verify` when broad.
- Assistant/server: `server:build`, `server:smoke`, `assistant:*` focused scripts, `lint`, `build`.
- Associated projects: use each repo's scripts after reading local rules.

