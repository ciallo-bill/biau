# Implement

## Checklist

1. Read applicable specs via `trellis-before-dev`.
2. Start this task with `task.py start`.
3. In `legal-rag`:
   - Add public demo env parsing in Web app.
   - Update `LoginPanel.vue` props/events/UI.
   - Add CSS for demo credential block.
   - Update README and `.env.docker.example` public env shape without real values.
   - Copy `eval/` into the API Docker runtime image.
   - Add missing-fixture fallback for RAG and contract-review evaluation services.
   - Add regression tests for missing eval fixture paths.
4. In `blog-semi`:
   - Update Legal RAG project detail / assistant context.
   - Regenerate assistant knowledge.
5. Validate.
6. Commit/push changed repos, archive child task, journal.

## Validation

Legal RAG:

- `npm.cmd --workspace apps/api run test:unit`
- `npm.cmd --workspace apps/api run validate`
- `npm.cmd run typecheck`
- `npm.cmd run build`
- `git diff --check`
- Sensitive scan on changed files.

Validation completed:

- `npm.cmd --workspace apps/api run test:unit` passed.
- `npm.cmd --workspace apps/api run validate` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed.

Blog Semi:

- `npm.cmd run assistant:index`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`
- Sensitive scan on changed files.

Validation completed:

- `npm.cmd run assistant:index` passed and generated 23 public knowledge items.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed with existing Vite chunk/timing warnings.
- `git diff --check` passed in both repositories.
- Sensitive scans found only variable names/placeholders and no real secret values.

Optional UI check:

- Run a local preview with `VITE_PUBLIC_DEMO_PASSWORD` set to a fake test value and verify the login panel shows the demo block.

## Human Gates

- Real public demo password must be decided and configured by the user/deployment environment.
- Do not deploy Render services in this task.
- Do not publish real admin credentials in the main site or Legal RAG repository.

## Rollback

- Remove public demo env usage from `legal-rag` Web app.
- Remove README/env example additions.
- Revert `blog-semi` project copy and regenerate assistant knowledge.
