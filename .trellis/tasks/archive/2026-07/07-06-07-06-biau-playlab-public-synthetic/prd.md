# BIAU Playlab public synthetic reliability

## Goal

Add a safe BIAU Playlab synthetic reliability check so the status page can move
Playlab beyond entry-only monitoring without requiring accounts, secrets, model
calls, or new playable release approval.

The current status model already has planned Playlab checks for Web playable
resources and mobile hints, but `reliability:check` does not run a dedicated
Playlab synthetic report.

## Requirements

- Add a public-only synthetic script for the BIAU Playlab site.
- Check the public site base, games listing, and at least one known game detail
  route without using credentials or hidden endpoints.
- Validate low-risk public page evidence such as HTML response, BIAU Playlab /
  BIAU Port visible branding, and public game/showcase wording.
- If playable/embed/resource paths can be discovered from public HTML, check
  their public responses without treating a missing new release as a failure.
- Write a sanitized report to `public/status/biau-playlab-synthetic.json`.
- Merge the report into `site:status` / `/status` through existing synthetic
  status aggregation.
- Add the script to `reliability:check`.
- Do not claim new Web playable builds are production-ready unless the public
  synthetic actually verifies them.
- Do not edit the related `game` repository in this slice.

## Acceptance Criteria

- [x] `npm.cmd run playlab:synthetic` writes a low-sensitive public report.
- [x] `npm.cmd run reliability:check -- --strict` includes the Playlab step.
- [x] `/status` data reflects Playlab synthetic evidence without leaking private
      URLs, local paths, tokens, or raw page bodies.
- [x] `npm.cmd run site:status` passes.
- [x] `npm.cmd run lint` passes.
- [x] `npm.cmd run build` passes.
- [x] `git diff --check` passes.

## Notes

- Parent task: `07-04-biau-port-continuous-improvement`.
- If the public site shape differs from expected paths, record a sanitized
  `degraded` or `unchecked` result instead of hard-failing the whole suite.
