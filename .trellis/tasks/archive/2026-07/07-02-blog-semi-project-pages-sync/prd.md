# Blog semi project pages sync

## Goal

Update BIAU Port project data so the public project pages and assistant
knowledge reflect the overnight ERP and Pet improvements.

## Requirements

- R1. Update `src/data/portfolio.ts` for `ozon-erp` to mention the polished
  login/register/Owner setup entry, confirmation-password validation, and
  explicit production registration-disabled state.
- R2. Update `src/data/portfolio.ts` for `pet-workspace` to mention the new
  static App showcase/download-status page and its current pending APK status.
- R3. Add only verified public-facing facts. Do not expose local paths, internal
  tokens, private servers, worker/admin internals, or fake APK links in public
  project copy.
- R4. Keep assistant context aligned with project detail content.
- R5. Regenerate assistant knowledge and sitemap after public project data
  changes.

## Acceptance Criteria

- [x] ERP project detail content includes the new auth entry polish.
- [x] Pet project detail content includes the new static showcase page and
      pending public build status.
- [x] Assistant context reflects both updates without private details.
- [x] Generated assistant knowledge and sitemap are up to date.
- [x] `npm.cmd run assistant:index`, `npm.cmd run sitemap:generate`,
      `npm.cmd run blog:check`, `npm.cmd run lint`, and `npm.cmd run build`
      pass or any pre-existing warning is recorded.

## Result

- Updated `src/data/portfolio.ts`:
  - `ozon-erp` now includes login/register/Owner setup entry polish, confirmation-password validation, and explicit registration-closed UI behavior.
  - `pet-workspace` now includes the static App showcase/download-status page, real Android screenshot basis, and pending public APK build status.
- Updated assistant projection through `server/data/public-knowledge.json`.
- Regenerated `public/sitemap.xml`.

## Validation

- Passed: `npm.cmd run assistant:index` (`23` public knowledge items)
- Passed: `npm.cmd run sitemap:generate` (`25` URLs)
- Passed: `npm.cmd run blog:check`
- Passed: `npm.cmd run lint`
- Passed: `npm.cmd run build`
- Note: build still reports existing Vite `INEFFECTIVE_DYNAMIC_IMPORT` warnings for `blogCuration.ts` and `portfolio.ts`.

## Notes

- Lightweight task; PRD-only is sufficient.
