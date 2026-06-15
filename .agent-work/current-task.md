# Current Task

Date: 2026-06-15
Repo: /home/zhang/workspace/blog-semi
Branch: main
Controller: Codex
Builder: Codex

## Goal

Run a full online showcase audit after the latest Legal RAG, Pet Workspace, Ozon ERP, and xunqiu evidence updates.

## Scope

- Verify Cloudflare production routes for home, project list, case list, blog list, key project details, key case details, blog details, and game detail pages.
- Check desktop and mobile rendering for console errors, horizontal overflow, broken images, blank pages, and route title mismatches.
- Run public wording checks for `面试` / `作品集` and sensitive terms over source/docs/public artifacts.
- Record durable QA evidence in `.agent-work/verification.md`.

## Non-goals

- Do not redesign pages unless the audit finds a concrete issue.
- Do not modify `~/workspace/reference-projects`.
- Do not add new projects or new showcase assets in this audit slice.
- Do not push before verification evidence is recorded.

## Allowed Paths

- `.agent-work/current-task.md`
- `.agent-work/verification.md`

## Acceptance Criteria

- [x] Production routes load with expected titles on desktop and mobile.
- [x] Production pages show no browser console errors or warnings in the audited routes.
- [x] Production pages have no horizontal overflow at 1440x900 and 390x844.
- [x] All production images present on audited routes load with non-zero natural dimensions.
- [x] Source/docs/public scan does not show public `面试` / `作品集` wording or real sensitive values.
- [x] WSL local and `origin/main` are aligned after recording the audit.

## Verification Plan

- Use Chrome browser automation against `https://biau.playlab.eu.cc`.
- Visit base routes: `/`, `/projects`, `/cases`, `/blogs`.
- Visit key project routes: `/projects/legal-rag`, `/projects/ozon-erp`, `/projects/pet-workspace`, `/projects/xunqiu`, `/projects/blog-semi`, `/projects/space-war`.
- Visit key case routes: `/cases/legal-rag`, `/cases/ozon-erp`, `/cases/pet-workspace`, `/cases/xunqiu`, `/cases/godot-showcase`.
- Visit blog routes: `/blogs/legal-rag-review`, `/blogs/ozon-erp-architecture`, `/blogs/pet-workspace-pipeline`, `/blogs/xunqiu-android64-rebuild`, `/blogs/game-showcase-standard`.
- Visit game routes: `/games/first-tetris`, `/games/next-spacewar`, `/games/intespace`, `/games/raiden`, `/games/space-war`.
- Run `git status`, sensitive wording scan, and commit the audit record if clean.
