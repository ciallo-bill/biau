# Design

## Decision Model

The task has two valid outcomes:

1. **Publishable APK found**: copy or reference the verified public APK, expose it on the static showcase page, and sync main-site/status copy.
2. **No publishable APK found**: keep the download gate closed, record the missing release conditions, and do not expose any APK href.

The second outcome is a successful safe result when evidence is insufficient.

## Public APK Conditions

A candidate APK is publishable only when all conditions are true:

- It is a release or equivalent public build, not a debug build.
- It has version metadata or release notes.
- File size and SHA-256 are recorded.
- The public file location is under a static/public path or another approved public download location.
- The showcase page includes Android install caveats, checksum, rollback/next-version direction, and current maturity.
- No signing key path, keystore password, internal API URL, account, private token, or local absolute path is exposed.

## Data Flow

```text
D:\workspace4Cursor\pet / pet/gamer evidence
  -> candidate APK audit
  -> public/pet-app-showcase/downloads/* only if publishable
  -> public/pet-app-showcase/index.html
  -> src/data/portfolio.ts and statusTargets if public state changes
  -> pet:synthetic / lint / build
```

## Rollback

If a file is published and later fails review, remove the public href/file, restore the gate copy, rerun `npm.cmd run pet:synthetic`, and commit the rollback.
