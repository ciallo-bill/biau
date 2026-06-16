# Builder Plan: Pet Workspace Admin-Review Runtime Screenshot

## Goal

Add one public-safe Pet Workspace admin-review runtime screenshot for the existing `/cases/pet-workspace` evidence matrix.

## Read-Only Findings

- `gamer/apps/admin-review` is the correct source for a real review-console screenshot.
- The app can list GA review candidates from `GA_PET_RUN_ROOT`.
- A valid demo candidate can be represented with:
  - `package-manifest.json`
  - `source/generation/prompt-plan.json`
  - `previews/preview.png`
  - `meta/motion_map.json`
  - optional feedback and rework records
- The server also proxies community API routes, so capture should mock or intercept those requests instead of starting real backend services.

## Approved Implementation Shape

1. Use a temporary copy of the `gamer` workspace.
2. Install dependencies in the temporary copy with scripts disabled.
3. Create a temporary GA run root containing only demo candidates and generated placeholder images.
4. Start only `apps/admin-review/server.js` with the temporary run root.
5. Use browser automation to intercept unrelated API routes with empty public-safe responses.
6. Capture the real admin-review GA panel as:
   - `public/images/projects/showcase/fantasy-pet-admin-review-runtime.png`
7. Add the screenshot to the Pet Workspace case evidence cards.
8. Update `docs/showcase-assets.md`.

## Safety Rules

- Do not modify Pet reference/source projects.
- Do not start real community API, pet-generator, database, Supabase, Android, cloud services, or deployment scripts.
- Do not publish real run paths, task payloads, prompts, model settings, storage identifiers, endpoints, candidate packages, logs, or private assets.
- Use demo names, generated placeholder images, and redacted metadata only.

## Verification

- Confirm PNG file type and dimensions.
- Run sensitive/public wording scan over changed public source/docs.
- Run `npm run lint`.
- Run `npm run build`.
- Browser QA `/cases/pet-workspace` at desktop and mobile widths.
