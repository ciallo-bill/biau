# Current Task

Date: 2026-06-16
Repo: /home/zhang/workspace/blog-semi
Branch: main
Controller: Codex
Builder: Claude Code via `cc`

## Goal

Add versioned public-safe screenshots for the current blog-semi site itself, covering the homepage, projects page, and blogs page at desktop and mobile widths.

## Scope

- Capture the current deployed-style site UI from the local dev server.
- Add six versioned screenshots:
  - homepage desktop
  - homepage mobile
  - projects desktop
  - projects mobile
  - blogs desktop
  - blogs mobile
- Store screenshots under `public/images/projects/showcase/`.
- Update `docs/showcase-assets.md` so the blog-semi row lists the screenshots and no longer has this gap.
- Preserve the existing public/product positioning and do not rewrite page content in this slice.

## Non-goals

- Do not redesign the homepage, projects page, cases page, or blogs page.
- Do not modify reference projects.
- Do not add real user data, credentials, local paths, private browser state, cookies, tokens, or deployment secrets.
- Do not capture admin panels or logged-in third-party pages.
- Do not close unrelated project asset gaps in this slice.

## Allowed Paths

- public/images/projects/showcase/blog-semi-home-desktop.png
- public/images/projects/showcase/blog-semi-home-mobile.png
- public/images/projects/showcase/blog-semi-projects-desktop.png
- public/images/projects/showcase/blog-semi-projects-mobile.png
- public/images/projects/showcase/blog-semi-blogs-desktop.png
- public/images/projects/showcase/blog-semi-blogs-mobile.png
- docs/showcase-assets.md
- .agent-work/current-task.md
- .agent-work/cc-plan.md
- .agent-work/codex-review.md
- .agent-work/verification.md

## Acceptance Criteria

- [x] Current xunqiu task artifacts are archived before this task overwrites `.agent-work` files.
- [x] `cc` produces a read-only plan before implementation.
- [x] Codex reviews and narrows the plan.
- [x] Six screenshots are captured from the current site at desktop and mobile widths.
- [x] All screenshot files exist, decode as PNG, and show the intended route.
- [x] `docs/showcase-assets.md` marks the blog-semi versioned screenshot gap as covered.
- [x] Sensitive/public wording scan is reviewed.
- [x] `npm run lint` and `npm run build` pass if source/docs change.
- [x] Browser QA confirms `/`, `/projects`, and `/blogs` still load at desktop and mobile widths with no console errors, failed requests, or horizontal overflow.

## Verification Plan

- Use system Chrome/browser automation against the local dev server.
- Capture screenshots at 1440x900 and 390x844.
- Confirm PNG dimensions and decode status.
- Run sensitive/public wording scan over changed files.
- Run `npm run lint`.
- Run `npm run build`.
- Browser-check `/`, `/projects`, and `/blogs` locally at desktop and mobile widths.
- Commit and push after verification passes.
