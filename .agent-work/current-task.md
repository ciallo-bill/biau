# Current Task

Date: 2026-06-17
Repo: /home/zhang/workspace/blog-semi
Branch: main
Controller: Codex
Builder: Claude Code read-only plan, Codex scoped implementation

## Goal

Fix the home-page case matrix CTA labels so they match the actual destination. Projects that have a business case should keep a case-oriented CTA; projects without a case should expose a project-oriented CTA instead of pretending to open a case.

## Scope

- Audit the home-page case matrix CTA text and click behavior.
- Adjust CTA labels only in the home-page case matrix section.
- Keep existing case and project routes unchanged.

## Non-goals

- Do not redesign the home page.
- Do not change case/project detail content.
- Do not add or remove projects or cases.
- Do not edit reference project directories.
- Do not expose secrets, real accounts, IPs, API bases, or local validation paths.

## Allowed Paths

- src/App.tsx
- .agent-work/current-task.md
- .agent-work/cc-plan.md
- .agent-work/codex-review.md
- .agent-work/verification.md

## Acceptance Criteria

- [x] CC produces a read-only plan before implementation.
- [x] Home case-matrix cards with a real case use a case-oriented CTA.
- [x] Home case-matrix cards without a real case use a project-oriented CTA.
- [x] CTA click destinations still match cases vs projects.
- [x] `npm run lint` and `npm run build` pass.
- [x] Browser QA checks home-page matrix behavior on desktop and mobile.
