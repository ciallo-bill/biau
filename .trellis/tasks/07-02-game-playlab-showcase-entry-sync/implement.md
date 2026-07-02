# Playlab Game Showcase Entry Sync Implement Plan

## 1. Context

- [x] Read `game/blog` repo rules.
- [x] Inspect package scripts and game content files.
- [x] Run `npm run content:audit` in `game/blog`.

## 2. Main Site Sync

- [x] Update Biau Playlab detail content with Spacewar II and mobile/Web试玩边界.
- [x] Update quality evidence with content audit counts and endpoint/build checks.
- [x] Update assistant context with current facts.
- [x] Regenerate assistant index and sitemap.

## 3. Validation

- [x] `game/blog`: `npm run content:audit`
- [x] `blog-semi`: `npm.cmd run assistant:index`
- [x] `blog-semi`: `npm.cmd run sitemap:generate`
- [x] `blog-semi`: `npm.cmd run blog:check`
- [x] `blog-semi`: `npm.cmd run lint`
- [x] `blog-semi`: `npm.cmd run build`
- [x] `blog-semi`: `npm.cmd run check:ui`
- [x] `git diff --check`
- [x] changed-file sensitive scan

## 4. Finish

- [ ] Commit/push `blog-semi/main`.
- [ ] Archive child task and record journal.
