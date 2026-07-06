# Xunqiu Status APK Backend Gate Implementation Plan

## Steps

1. [x] Inspect Xunqiu frontend repo rules, README, scripts, git state.
2. [x] Inspect Xunqiu backend repo rules, README, scripts, git state.
3. [x] Inspect main-site Xunqiu project/status/synthetic data and checks.
4. [x] Choose the smallest public-safe improvement based on evidence.
5. [x] Implement and run focused validation.
6. [x] Update task notes and Round 6 manual gates.
7. [x] Commit and push `blog-semi`.

## Validation Candidates

- `npm.cmd run xunqiu:synthetic`
- `npm.cmd run site:status`
- `npm.cmd run status:contract`
- `npm.cmd run project-details:check`
- `npm.cmd run check:ui`
- `npm.cmd run verify` if shared status/project UI changes.

## Rollback

Revert main-site data/script changes and task notes. Do not alter Xunqiu production configuration or release artifacts.

## Result

- Added a Xunqiu-specific status contract in `scripts/check-status-contract.ts`.
- The contract requires `xunqiu-synthetic.json` to expose boolean `apiBaseConfigured`, `hasCredentials=false`, `apkGate`, and the three required checks: backend health, compat API, and APK gate.
- If `apiBaseConfigured=false`, backend health and compat API cannot be marked `online`.
- APK gate status must be one of the allowed public-safe states; `publicDownloadApproved=false` prevents `xunqiu-apk-gate` from being marked `online`.
- A future approved public release must explicitly use `apkGate.status=approved-release` and an online APK gate check.

## Validation

- `npm.cmd run status:contract` passed.
- `npm.cmd run xunqiu:synthetic` passed and preserved the existing report because API base URL and artifact roots are not configured in the local environment.
- `npm.cmd run verify` passed after stabilizing `check:ui` route navigation with a bounded retry.

## Manual Gates

- Configure `XUNQIU_SYNTHETIC_API_BASE_URL` only after confirming the public backend base is safe to check.
- Public APK download still needs release approval, signing/version/checksum/scan/regression/rollback evidence, and explicit user confirmation.
- Do not expose old backend IPs, test credentials, signed artifact paths, database strings, R2 variables, or private Render URLs.
