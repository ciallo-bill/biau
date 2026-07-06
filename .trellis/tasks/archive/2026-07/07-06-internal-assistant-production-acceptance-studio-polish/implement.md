# Internal Assistant Production Acceptance and Studio Workflow Polish Implementation Plan

## Checklist

- [x] Start task with `python ./.trellis/scripts/task.py start ./.trellis/tasks/07-06-internal-assistant-production-acceptance-studio-polish` after review approval.
- [x] Load `trellis-before-dev` before editing code.
- [x] Update shared artifact types to allow safe Studio deep links while preserving legacy `/studio`.
- [x] Update `buildStudioDraftArtifact()` to emit `/studio?draft=<id>` after a draft is created.
- [x] Update artifact sanitization/normalization so only safe same-site Studio links are accepted.
- [x] Improve `/assistant` tool trace copy for created drafts and failed/degraded `studio.draft` states without raw JSON or secrets.
- [x] Add `/studio?draft=<id-or-slug>` selection behavior after draft list load.
- [x] Add an Agentic Workspace marker for drafts where `aiAssistance === "agentic-workspace"`.
- [x] Add or adjust no-live smoke coverage for artifact href safety and Studio query selection behavior where practical.
- [x] Update `.trellis/spec/` if the artifact contract changes.
- [x] Record manual production acceptance gates in task notes or final summary.

## Validation Commands

Run the narrow commands first, then full UI checks:

```powershell
npm.cmd run prisma:validate
npm.cmd run server:build
npm.cmd run server:smoke
npm.cmd run assistant:service-modes-smoke
npm.cmd run studio:smoke
npm.cmd run lint
npm.cmd run build
npm.cmd run check:ui
git diff --check
```

Also run a changed-file sensitive scan before commit. The scan must not print or persist secrets.

## Verification Results

- `npm.cmd run prisma:validate` passed.
- `npm.cmd run server:build` passed.
- `npm.cmd run server:smoke` passed, including no-live artifact deep-link sanitizer assertions.
- `npm.cmd run assistant:service-modes-smoke` passed.
- `npm.cmd run studio:smoke` passed without live model calls or tracked draft output.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.
- `npm.cmd run check:ui` passed for 12 routes across 2 viewports.
- `git diff --check` passed.
- Changed-file sensitive scan found no real secrets, tokens, database URLs, private provider URLs, or production credentials.

## Risk Points

- `AssistantStudioDraftArtifact.href` currently uses the literal `/studio`; type changes must be mirrored in backend and frontend.
- `StudioPage` state is form-heavy; query selection should not reset unsaved editor fields unexpectedly after the user starts editing.
- Stored assistant messages may contain old artifacts. The normalizer must keep those renderable.
- Error messages must help diagnosis without exposing API base URLs, database URLs, endpoints, tokens, private provider details, or stack traces.

## Manual Production Acceptance

These are intentionally left for the user:

- Confirm Render env variables for internal assistant service and Studio service.
- Use a real member token to create a draft in production.
- Use a Studio token to open the generated `/studio?draft=<id>` link and verify hidden + review-needed state.
- Approve any real model call if production content quality must be checked.

## Commit Plan

After validation, archive the task, record the journal entry, commit the planning/code/spec changes, and push `origin main` if still on `main`.
