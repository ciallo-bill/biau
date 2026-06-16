# Current Task

Date: 2026-06-16
Repo: /home/zhang/workspace/blog-semi
Branch: main
Controller: Codex
Builder: Claude Code via `cc`

## Goal

Assess and, if safe, add one public-safe xunqiu 64-bit Android client runtime screenshot to close the current xunqiu showcase gap.

## Scope

- Inspect the existing `xunqiu-android64` project for a safe screenshot path.
- Prefer a real runtime screenshot from the new 64-bit client, not the old app.
- If a runtime capture requires source changes, use only a temporary copy or a capture-only path; keep reference/source projects read-only.
- Add the screenshot only if it can avoid real service login, real users, server addresses, accounts, signing details, APK hashes, and release paths.
- If runtime capture is not safe in this turn, document the blocker and switch to the next safe showcase slice rather than forcing an unsafe screenshot.

## Non-goals

- Do not modify `/home/zhang/workspace/reference-projects/xunqiu` or `/mnt/d/workspace4Codex/xunqiu`.
- Do not publish real test accounts, tokens, server IPs, API base URLs, database config, SQL details, signing passwords, keystore paths, APK hashes, release package paths, or real user/business data.
- Do not reuse screenshots from the old 32-bit app or historical backend.
- Do not start production services or log into real xunqiu service accounts.
- Do not close blog-semi versioned screenshot gaps in this slice unless xunqiu capture is rejected as unsafe.

## Allowed Paths

- public/images/projects/showcase/xunqiu-android64-runtime.png
- src/App.tsx
- src/App.css
- docs/showcase-assets.md
- .agent-work/current-task.md
- .agent-work/cc-plan.md
- .agent-work/codex-review.md
- .agent-work/verification.md

## Acceptance Criteria

- [x] `cc` produces a read-only plan before implementation.
- [x] A safe capture path is selected or explicitly rejected with evidence.
- [x] If selected, one xunqiu 64-bit client runtime screenshot is added under `public/images/projects/showcase/`.
- [x] If selected, `/cases/xunqiu` includes the new evidence card and the image decodes locally.
- [x] If selected, `docs/showcase-assets.md` marks the xunqiu screenshot gap as covered.
- [x] Sensitive/public wording scan is reviewed.
- [x] `npm run lint` and `npm run build` pass in WSL if any site files change.
- [x] Browser QA checks `/cases/xunqiu` at desktop and mobile widths if any site files change.

## Verification Plan

- Inspect build/runtime options without publishing sensitive README/build details.
- If a screenshot is captured, confirm the PNG file exists and is valid.
- Run sensitive/public wording scan over changed files.
- Run `npm run lint`.
- Run `npm run build`.
- Browser-check `/cases/xunqiu` locally at desktop and mobile widths.
- Commit and push after verification passes.
