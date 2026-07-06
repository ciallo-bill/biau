# AI Daily documentation current flow sync

## Goal

Bring the public developer documentation for AI Daily in line with the current
Studio-first implementation.

`docs/ai-daily-pipeline.md` still describes the first version as an offline
CLI-only manual draft flow. The code and archived production-system task now
support a richer internal Studio workflow: source pool, AI Daily issues, issue
detail route, issue-to-hidden-draft conversion, review gate, and static export
boundary. The documentation should explain the current recommended path without
claiming automated daily publication or live model generation.

## Requirements

- Update documentation only; do not change runtime behavior in this task.
- Keep AI Daily evidence-first and manually reviewed.
- Describe `/studio` as the recommended editorial workflow.
- Keep `npm.cmd run ai-daily:draft` documented as an offline compatibility /
  import helper.
- Clarify that model assistance remains a manual gate and must use an approved
  concrete content task, not provider liveness tests.
- Clarify that production setup needs Studio API URL, Studio token, Studio
  database, and migration, but never include real secrets or URLs.
- Preserve the static-public-site boundary: database issues and drafts do not
  become public until reviewed and exported into Git-tracked public blog data.

## Acceptance Criteria

- [x] `docs/ai-daily-pipeline.md` explains the Studio-first recommended flow.
- [x] The offline `ai-daily:draft` command remains documented and clearly marked
      as compatibility/manual-source flow.
- [x] The document lists the AI Daily issue -> hidden review draft -> approved
      export path.
- [x] The document keeps model calls, automatic publishing, credentials, and
      production migration as explicit gates.
- [x] `git diff --check` passes.

## Notes

- Parent task: `07-04-biau-port-continuous-improvement`.
- This is a lightweight docs-only correction.
