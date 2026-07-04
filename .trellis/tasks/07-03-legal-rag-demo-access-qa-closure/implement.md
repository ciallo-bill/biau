# Legal RAG Demo Access Implement

## Checklist

- [x] Confirm current task is `in_progress` and read Trellis/spec context.
- [x] Review existing Legal RAG project page, status targets, synthetic script, and generated status JSON.
- [x] Add explicit `demoAccessStatus` metadata to the Legal RAG synthetic report without exposing credentials or endpoints.
- [x] Run a public-safe synthetic check against the known Legal RAG API base without demo credentials.
- [x] Regenerate `public/status/site-status.json`.
- [x] Update task acceptance evidence and manual-action notes.
- [x] Run focused quality checks for the changed scripts/data.
- [ ] Commit and push the Legal RAG closure slice on `blog-semi/main`.

## Current Evidence

- `npm.cmd run legal-rag:synthetic` with the public Legal RAG API base and no credentials generated `demoAccessStatus=credential-required`.
- `npm.cmd run site:status` generated five online public entry targets and merged Legal RAG synthetic evidence into `/status`.
- `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check` passed.
- Sensitive scan found only placeholder variable names and code identifiers, not real secrets.
- Protected RAG QA, contract review, and quality report checks remain intentionally `unchecked` until the user approves safe demo credentials.

## Validation Commands

Use public URL values only when they are already published project links. Do not print or commit credentials.

```powershell
$env:LEGAL_RAG_API_BASE_URL='https://legal-rag-api-9bki.onrender.com'; npm.cmd run legal-rag:synthetic; Remove-Item Env:\LEGAL_RAG_API_BASE_URL
npm.cmd run site:status
npm.cmd run lint
npm.cmd run build
git diff --check
```

If credentials are not configured, the expected result is API health checked and protected checks marked `unchecked` with `demoAccessStatus=credential-required`.

## Manual Gate

Before claiming self-serve public Legal RAG demo access, the user must create or approve a low-permission demo account, configure the API-side login password, configure `VITE_PUBLIC_DEMO_EMAIL` and `VITE_PUBLIC_DEMO_PASSWORD` in the Legal RAG web deployment, redeploy, and allow a credentialed synthetic check using that safe account.
