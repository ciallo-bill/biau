# Cross-project Autonomous Improvement Round 6 Implementation Plan

## Default Order

1. [x] Finish parent artifacts.
2. [x] Start parent task.
3. [x] Create and start `round-6-xunqiu-status-apk-backend-gate`.
4. [x] Complete that child if locally possible; otherwise record its manual gate and move to the next child.
5. [x] Continue with Playlab/game, project-detail visuals, internal assistant knowledge admin, or blog quality depending on what is locally actionable.

## Per-child Protocol

- Read child `prd.md`, `design.md`, and `implement.md`.
- Load `trellis-before-dev` before code edits.
- Read affected repo rules and scripts before touching associated projects.
- Keep changes small, reversible, and public-safe.
- Update `manual-gates.md` whenever a platform, credential, release, model, or signed artifact decision is required.
- Run focused validation; run full `verify` for shared UI/status/data changes.

## Default Validation

- `npm.cmd run status:contract`
- `npm.cmd run project-details:check` when project detail data changes.
- Relevant `*:synthetic` and `site:status` when status data changes.
- `npm.cmd run check:ui` when routes, project cards, status pages, or project detail UI change.
- `npm.cmd run verify` before broad main-site commits.
- `git diff --check` and targeted sensitive-value scan before commit.

## Completion

Round 6 is complete when at least one P1 child is completed, pushed, and archived, and this parent task records completed work, validation, manual gates, and the recommended next round.

## Completed Work

- `35cc6cb test(status): enforce xunqiu release gates`
- `08aa4f2 chore(task): archive 07-07-round-6-xunqiu-status-apk-backend-gate`
- `26f3f3f test(status): enforce playlab playable checks`
- `73741cd chore(task): archive 07-07-round-6-playlab-game-showcase-contract`
- `b0eeaed test(projects): require visual evidence captions`
- `0bb8a69 chore(task): archive 07-07-round-6-project-detail-visual-evidence-followup`

## Validation Record

- Xunqiu slice: focused status/APK contract checks and `verify` passed in child task.
- Playlab slice: `site:status`, generated status JSON, Playlab synthetic assertions, and `verify` passed in child task.
- Project detail visual slice: `project-details:check`, `assistant:index`, `lint`, `build`, `check:ui`, `verify`, `git diff --check`, and sensitive-value scan passed.

## Recommended Next Round

- Continue with internal assistant knowledge-admin polish and Agentic Workspace operational checks.
- Continue blog knowledge quality backlog with evidence-first articles, but avoid model-provider liveness checks.
- Continue public status reliability observation only where local synthetic checks can run without production credentials; platform issues remain manual gates.
