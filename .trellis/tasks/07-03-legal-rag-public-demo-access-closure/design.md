# Design

## Boundary

This task spans two repositories:

- `D:\workspace4Cursor\legal-rag`
  - Add an optional public demo credential hint to the Web login page.
  - Keep quality/evaluation report routes available in hosted demos when eval fixtures are missing.
  - Document deployment env keys.
- `D:\workspace4Cursor\blog-semi`
  - Sync public project copy and assistant knowledge.
  - Track task artifacts and journal under Trellis.

## Legal RAG Web Contract

The Web app reads only Vite public env keys:

- `VITE_PUBLIC_DEMO_EMAIL`
  - Optional; defaults to the existing `demo@legal-rag.local` login email.
- `VITE_PUBLIC_DEMO_PASSWORD`
  - Optional; if missing, no password is shown and no fill button appears.
  - If present, it is treated as public by design and must be a low-risk, revocable demo password configured in deployment, not a real admin password.
- `VITE_PUBLIC_DEMO_NOTE`
  - Optional explanatory text for public demo constraints.

The API continues to own authentication via:

- `AUTH_ENABLED=true`
- `AUTH_PASSWORD` or `AUTH_USERS_JSON`

Deployment must keep the public demo web password aligned with the API demo password when a public demo is intended.

## UI Behavior

- Without `VITE_PUBLIC_DEMO_PASSWORD`:
  - Login page remains a controlled-access form.
  - It can show a short note that access requires a demo credential, but does not display a password.
- With `VITE_PUBLIC_DEMO_PASSWORD`:
  - Login page shows a compact demo credential block.
  - A button fills both email and password.
  - The password may be visible because the env name explicitly marks it public.
  - Text clarifies it is not an admin credential.

## Main Site Copy

`blog-semi/src/data/portfolio.ts` should describe the real behavior:

- If the Legal RAG login page displays demo credentials, visitors can use those to try the workbench.
- If it does not, the online workbench remains a controlled demo.
- No real password appears in main-site source.

Run `assistant:index` after changing project data so `server/data/public-knowledge.json` stays aligned.

## Quality / Evaluation Degradation

The hosted API currently serves quality panels through:

- `/api/quality/report`
- `/api/evaluation/report`
- `/api/review/evaluation/report`

These routes depend on root `eval/*.json` fixtures. Docker runtime images must copy `eval/` alongside `datasets/`.

If another deployment path still omits the files, only `ENOENT` should degrade:

- RAG eval returns `total=0`, `passed=0`, `failed=0`, empty `results`.
- Contract review eval returns `total=0`, `passed=0`, `failed=0`, empty `results`.
- Quality checks report warn details for unavailable fixtures.
- JSON parse errors and real evaluation logic errors still throw so bad fixtures are not hidden.

## Safety

- Do not read `.env` files.
- Do not commit real passwords.
- Do not deploy or change Render/Supabase settings in this task.
- Sensitive scan must include both repositories' changed files.
