# Pet app showcase download page

## Goal

Add a visitor-readable static App showcase/download page for the Pet/Gamer
Android community app, similar in purpose to the Xunqiu app display page, while
truthfully showing the current work-in-progress state.

## Requirements

- R1. Target repository: `D:/workspace4Cursor/pet/gamer`.
- R2. Add a self-contained static showcase directory that can be opened directly
  in a browser without a build step.
- R3. Use existing real Android emulator screenshots from
  `D:/workspace4Cursor/pet/artifacts/android-e2e-*.png`.
- R4. Do not provide or fake an APK download. If no verified public APK is
  available, show `待公开构建` / pending public build.
- R5. Explain the current App scope: desktop pet shell, hatch/generation entry,
  community showcase/review path, profile/pet shelf, and app/community gateway
  boundary.
- R6. Keep private generation worker, admin, token, server, and internal artifact
  details out of the public page.
- R7. Do not touch existing dirty `gamer` API pagination files.

## Acceptance Criteria

- [x] Static showcase page and README are added under `gamer`.
- [x] The page renders the four real screenshots with useful alt text.
- [x] APK area clearly says the public build is pending and has no active fake
      download.
- [x] The page can be opened locally as plain HTML.
- [x] Only the new showcase files are staged/committed from `gamer`; existing
      unrelated dirty files remain untouched.

## Result

- Added `D:/workspace4Cursor/pet/gamer/pet-app-showcase-site/`.
- Added static `index.html`, `styles.css`, `README.md`, and four copied Android
  E2E screenshots.
- APK download remains disabled and labeled `APK 待公开构建`.
- Gamer repo commit: `56a1812 feat(app): add pet showcase download page`
- Push: `origin/cursor-windows-migration`

## Validation

- Passed: local Playwright file check through blog-semi's installed Playwright:
  title, disabled APK button, 5 rendered images, and no horizontal overflow.
- Passed: desktop and mobile viewport static checks.
- Passed: `git diff --check -- pet-app-showcase-site`
- Sensitive scan: no API keys, private keys, secret tokens, database URLs, or
  private endpoint patterns found in new text files.
- Note: `D:/workspace4Cursor/pet/gamer` still has unrelated pre-existing dirty
  pagination files and `test-out.txt`; they were not staged or committed.

## Notes

- Lightweight task; PRD-only is sufficient.
