# Legal RAG Demo Access And QA Monitoring Design

## Scope

This task spans two repositories:

- `D:/workspace4Cursor/legal-rag`: improve the existing Web e2e smoke so it verifies the core RAG Q&A flow after auth.
- `D:/workspace4Cursor/blog-semi`: update public showcase copy/assistant knowledge so visitors understand how the demo is accessed and what can be verified.

## Safety Boundary

Do not commit real credentials. The only acceptable public credential shape is a user-approved, intentionally low-privilege demo account. Until the user provides/approves that account, public copy must say that the demo workspace is protected and credentials are provided separately.

## Monitoring Shape

Extend `apps/web/scripts/e2e-smoke.mjs` rather than creating a detached script. It already owns:

- `WEB_E2E_BASE_URL`
- `WEB_E2E_HEALTH_URL`
- `WEB_E2E_EMAIL`
- `WEB_E2E_PASSWORD`
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE`

Add API-level helpers that derive the API origin from `WEB_E2E_HEALTH_URL`, keep a simple cookie jar, and run:

1. `GET /api/health`
2. `GET /api/auth/status`
3. `POST /api/auth/login` when auth is enabled
4. `POST /api/ingestion-jobs/seed`
5. Poll `GET /api/ingestion-jobs/:id`
6. `POST /api/rag/query`

Then keep the current browser smoke for Web rendering/login visibility.

## Main Site Copy

Use `src/data/portfolio.ts` as the source of truth for Legal RAG project detail and assistant context. If a blog post is touched, keep it visitor-readable and avoid exact production secrets.

## Human Review Gate

Publishing actual demo email/password remains gated. This task may add a clearly marked “credentials pending / provided separately” line, but must not invent or expose a password.
