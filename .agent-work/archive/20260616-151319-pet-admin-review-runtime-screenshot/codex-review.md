# Codex Review

Date: 2026-06-16
Task: Pet Workspace admin-review runtime screenshot

## Review Summary

The Builder plan correctly identifies `gamer/apps/admin-review` as the runtime source and correctly avoids real community API, pet-generator, cloud services, databases, Android, and deployment scripts.

Two details need correction before implementation:

- `admin-review/server.js` defaults to port 4200, not 3010.
- GA candidate data is read from `GA_PET_RUN_ROOT/<runId>/`, not from `tasks/<taskId>/`. A valid run needs `package-manifest.json` and/or `source/generation/prompt-plan.json`, plus optional `previews/preview.png`, `meta/motion_map.json`, `review-card.md`, and package/evidence files.

## Approved Slice

Implement one narrow slice:

1. Copy the `gamer` workspace into a temporary capture directory.
2. Run `npm ci --ignore-scripts` only in the temporary copy.
3. Create a temporary `GA_PET_RUN_ROOT` with demo run directories, generated placeholder preview/motion images, and public-safe metadata.
4. Start `apps/admin-review/server.js` from the temporary copy with `PORT` and `GA_PET_RUN_ROOT` set.
5. Use browser automation to mock non-GA community API requests if needed, while letting `/ga-review/candidates` read the real temporary run root.
6. Capture the real admin-review UI to `public/images/projects/showcase/fantasy-pet-admin-review-runtime.png`.
7. Add the image as one more `/cases/pet-workspace` evidence card.
8. Update `docs/showcase-assets.md` to mark the Pet Workspace admin-review screenshot gap as covered.

## Rejected Scope

- Do not use real run directories or generated task packages.
- Do not publish real task JSON, prompts, model config, cloud endpoints, storage keys, local paths, candidate packages, or private assets.
- Do not modify Pet reference/source files.
- Do not close xunqiu or blog-semi screenshot gaps in this slice.

## Required Verification

- PNG decodes and visually represents the real admin-review UI with safe demo data.
- `npm run lint` and `npm run build` pass in `blog-semi`.
- Sensitive/public wording scan over changed files passes.
- Browser QA checks `/cases/pet-workspace` at desktop and mobile widths.
