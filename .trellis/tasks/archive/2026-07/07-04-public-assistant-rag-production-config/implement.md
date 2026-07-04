# Public assistant RAG production configuration plan

## Implementation Checklist

1. Finalize service modes.
   - Use one repository and three Render Web Services.
   - Add `ASSISTANT_SERVICE_MODE=public|internal|rag`.
   - Add explicit runtime modes or route grouping for `public-assistant`, `internal-assistant`, and `rag-orchestrator`.
   - Ensure public mode exposes only public chat/health routes.
   - Ensure internal mode exposes auth/session/admin/internal chat routes.
   - Ensure RAG mode exposes health/retrieve/sync routes with API-key scope enforcement.

2. Implement Supabase pgvector RAG store.
   - Review and extend `server/sql/rag-store-pgvector.sql` for explicit scope/visibility separation.
   - Add Supabase/Postgres adapter for document/chunk/entity/relation sync.
   - Add vector query path, keyword query path, entity expansion, and rerank integration.
   - Preserve deterministic local adapter for tests and emergency fallback.

3. Wire scoped retrieval.
   - Public assistant calls Orchestrator with public-scoped API key.
   - Internal assistant calls Orchestrator with internal-scoped API key.
   - Orchestrator rejects missing, invalid, or scope-mismatched keys.
   - Public retrieval never returns internal/private context.

4. Configure deployment contracts.
   - Cloudflare Pages only receives public frontend variables.
   - Create three Render Web Services from the same repository:
     - `biau-public-assistant-api` with `ASSISTANT_SERVICE_MODE=public`.
     - `biau-internal-assistant-api` with `ASSISTANT_SERVICE_MODE=internal`.
     - `biau-rag-orchestrator` with `ASSISTANT_SERVICE_MODE=rag`.
   - Render services receive only their own backend-only model, RAG, database, admin, Supabase, embedding, and reranker variables.
   - Real secrets stay in platform dashboards, not in repo/chat.

5. Add verification.
   - Unit or script checks for route exposure by mode.
   - RAG adapter tests with local/mock data.
   - Sync validation against generated public knowledge without live model calls.
   - Build/lint/type checks.
   - Optional production health checks only after user approval.
   - Real model answer validation only with approved real task prompt.

## Validation Commands

```bash
npm.cmd run assistant:index
npm.cmd run assistant:kg-check
npm.cmd run assistant:rag-smoke
npm.cmd run assistant:rag-sync-local
npm.cmd run server:build
npm.cmd run lint
npm.cmd run build
```

## Manual Gates

- User creates/approves Supabase project.
- User creates/approves three Render Web Services from the same repository.
- User enters secrets in Cloudflare/Render/Supabase dashboards.
- User approves production endpoint checks.
- User approves any real model validation prompt.

## Verification Results

- `npm.cmd run assistant:index` passed.
- `npm.cmd run assistant:kg-check` passed.
- `npm.cmd run assistant:eval` passed.
- `npm.cmd run assistant:service-modes-smoke` passed.
- `npm.cmd run assistant:rag-smoke` passed.
- `npm.cmd run assistant:rag-sync-local` passed.
- `npm.cmd run prisma:validate` passed.
- `npm.cmd run server:build` passed.
- `npm.cmd run server:smoke` passed.
- `npm.cmd run cf-assistant:smoke` passed.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.
- `git diff --check` passed.
- Sensitive scan found only placeholder variable examples in `docs/deployment.md`; no real secrets were committed.

## Rollback / Safety

- Do not commit secrets.
- Keep local deterministic retrieval available as fallback and test oracle.
- If Supabase retrieval fails, return safe fallback metadata instead of inventing answers.
- If public/internal scope checks fail, block the response rather than returning mixed-scope context.
