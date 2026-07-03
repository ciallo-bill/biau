# Implement

## Steps

- [x] Inspect current `public/pet-app-showcase/` download/gate implementation.
- [x] Inspect Pet workspace for APK candidates, release notes, version metadata, file size, and SHA-256 evidence.
- [x] Decide publishable vs blocked using the conditions in `design.md`.
- [ ] If publishable:
  - [ ] Copy or link the APK into the approved public static path.
  - [ ] Update static showcase copy with version, size, SHA-256, install caveat, and rollback/next-version direction.
  - [ ] Sync main-site project/status copy and synthetic expectations.
- [x] If blocked:
  - [x] Keep the download gate closed.
  - [x] Record missing conditions and next actions in task notes and, if helpful, public-safe showcase copy.
- [x] Run `npm.cmd run pet:synthetic`, `npm.cmd run lint`, `npm.cmd run build`.
- [x] Run `git diff --check` and sensitive scan.
- [ ] Update PRD checkboxes, commit, push, archive.

## Validation Notes

The task should not use hidden signing material or private env files as evidence. If a candidate APK path reveals local user paths, only record sanitized file name, size, hash, and build classification.

## Audit Notes

- Current public showcase page already uses a disabled APK button and contains no `.apk` link.
- Pet workspace file scan found no release APK/AAB candidate. The only APK-like artifact discovered is a debug build, which is explicitly documented as not approved for public distribution.
- Android build metadata currently shows version `0.1.0`, but the checked build evidence is debug-only and does not satisfy the public APK release gate.
