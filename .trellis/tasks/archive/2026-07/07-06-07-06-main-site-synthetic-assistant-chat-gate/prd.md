# Main-site synthetic assistant chat gate

## Goal

Make main-site reliability checks respect the "no model liveness test by
default" rule.

`scripts/check-main-site-synthetic.mjs` currently posts to
`/api/chat/public` every time `main-site:synthetic` or `reliability:check`
runs. Once the public assistant is connected to a real provider, that can
become an accidental live model validation. The script should still verify the
public site and low-sensitive `/api/health`, but live assistant chat should be
an explicit opt-in.

## Requirements

- Keep route, sitemap, robots, and assistant `/api/health` checks enabled by
  default.
- Do not call `/api/chat/public` unless the user/operator explicitly opts in
  through a CLI flag or environment variable.
- When chat is not enabled, write the assistant synthetic check as
  `unchecked` if health is valid, with a summary explaining that live chat was
  skipped by policy.
- Preserve the current model/fallback/citation assertions when chat is
  explicitly enabled.
- Update reliability documentation and public status wording so scheduled
  monitoring does not imply model validation happens by default.
- Do not run a live assistant chat request while implementing this task.

## Acceptance Criteria

- [x] `main-site:synthetic` defaults to route + health checks only and does not
      post to `/api/chat/public`.
- [x] An explicit opt-in flag/env keeps the existing chat validation behavior.
- [x] `reliability:check` inherits the safe default.
- [x] Status docs/data distinguish assistant health from model-backed chat
      validation.
- [x] Safe synthetic/status commands are run without live chat.
- [x] `npm.cmd run lint` passes.
- [x] `npm.cmd run build` passes.
- [x] `git diff --check` passes.

## Notes

- Parent task: `07-04-biau-port-continuous-improvement`.
- This task is specifically about avoiding accidental live model calls; local
  mocked assistant smoke tests are still allowed.
