# Public assistant RAG production configuration design

## Final Architecture

The final target is three explicit product/runtime boundaries:

```text
Cloudflare Pages frontend
  -> Public Assistant API
       -> RAG Orchestrator with scope=public
       -> public answer model channel

  -> Internal Assistant API
       -> member auth / sessions / admin / quota
       -> RAG Orchestrator with scope=internal
       -> internal answer model channel

RAG Orchestrator
  -> Supabase Postgres + pgvector
  -> keyword + vector + entity expansion
  -> rerank
  -> citations
  -> sufficiency/self-check metadata
```

This replaces the earlier staged framing. Local retrieval remains useful as a deterministic test/fallback path, but the production target is Supabase-backed Agentic Hybrid RAG.

## Service Boundary Recommendation

Recommended final deployment: one repository, three Render Web Services, and three explicit startup modes.

- `biau-public-assistant-api`: public-facing API surface, no internal/admin routes, no private corpus access, strict public scope.
- `biau-internal-assistant-api`: authenticated API surface, member token, session history, admin/invite routes, future private tools.
- `biau-rag-orchestrator`: shared retrieval service, scope-aware, only callable by trusted assistant APIs with server-side tokens.

These live in the same repository to reuse shared TypeScript contracts, model clients, RAG types, validation helpers, tests, and build tooling. They run as separate Render services so runtime routes, secrets, logs, scaling, failures, and blast radius stay isolated. The separation matters because public traffic, internal data, and retrieval administration have different threat models.

Avoid three separate repositories for now: that would duplicate contracts and make cross-service RAG changes harder to keep consistent. Avoid one all-in-one Render service for the final shape: route hiding is weaker than route absence, and internal/admin/RAG secrets should not live in the public runtime.

The service mode should be selected through a backend-only environment variable such as:

```text
ASSISTANT_SERVICE_MODE=public
ASSISTANT_SERVICE_MODE=internal
ASSISTANT_SERVICE_MODE=rag
```

The server must expose only the route group for its selected mode.

## Data Store

Use Supabase Postgres + pgvector as the first final retrieval store:

- `rag_documents`: document metadata, public/internal scope, source, project/blog/status identity, content hash.
- `rag_chunks`: chunk text, embedding, section, source metadata, content hash.
- `rag_entities`: entities and aliases for light graph/entity expansion.
- `rag_relations`: relation edges with evidence document ids.
- `rag_sync_runs`: sync diagnostics.
- `rag_eval_runs`: retrieval/eval diagnostics.

The existing `server/sql/rag-store-pgvector.sql` is the starting schema, but it must be reviewed/extended during implementation for explicit public/internal scope separation before enabling internal private material.

## Retrieval Flow

```text
question
  -> intent/scope routing
  -> keyword candidates
  -> vector candidates from pgvector
  -> entity/relationship expansion
  -> deterministic/reranker ordering
  -> sufficiency check
  -> citations/chunks
  -> model answer
  -> self-check against citations
```

Public assistant must only retrieve `visibility=public` context. Internal assistant may retrieve internal/member context only after authentication and only through the internal API.

## Platform Configuration Contracts

Cloudflare Pages frontend:

```text
VITE_CHAT_API_BASE_URL=<public assistant API base or /api facade>
```

Public Assistant API:

```text
PORT=10000
CORS_ORIGIN=https://biau.playlab.eu.cc
ASSISTANT_SERVICE_MODE=public
ASSISTANT_MODEL_BASE_URL=<OpenAI-compatible /v1 base URL>
ASSISTANT_MODEL_API_KEY=<secret>
ASSISTANT_MODEL_NAME=<model name>
ASSISTANT_MODEL_PROVIDER=mimo-compatible
ASSISTANT_RAG_API_BASE_URL=<RAG Orchestrator base URL>
ASSISTANT_RAG_API_KEY=<secret scoped for public retrieval>
ASSISTANT_RAG_TIMEOUT_MS=3000
ASSISTANT_SCOPE=public
```

Internal Assistant API:

```text
PORT=10000
CORS_ORIGIN=https://biau.playlab.eu.cc
ASSISTANT_SERVICE_MODE=internal
DATABASE_URL=<member/session/admin database URL>
ADMIN_TOKEN=<secret>
ASSISTANT_MODEL_BASE_URL=<OpenAI-compatible /v1 base URL>
ASSISTANT_MODEL_API_KEY=<secret>
ASSISTANT_MODEL_NAME=<model name>
ASSISTANT_MODEL_PROVIDER=mimo-compatible
ASSISTANT_RAG_API_BASE_URL=<RAG Orchestrator base URL>
ASSISTANT_RAG_API_KEY=<secret scoped for internal retrieval>
ASSISTANT_RAG_TIMEOUT_MS=3000
ASSISTANT_SCOPE=internal
```

RAG Orchestrator:

```text
PORT=10000
ASSISTANT_SERVICE_MODE=rag
RAG_STORE_PROVIDER=supabase
SUPABASE_URL=<project URL>
SUPABASE_SERVICE_ROLE_KEY=<secret>
RAG_PUBLIC_API_KEY=<secret accepted from public assistant API>
RAG_INTERNAL_API_KEY=<secret accepted from internal assistant API>
RAG_SYNC_TOKEN=<secret>
EMBEDDING_BASE_URL=<OpenAI-compatible embedding /v1 base URL>
EMBEDDING_API_KEY=<secret>
EMBEDDING_MODEL=<embedding model>
RERANKER_BASE_URL=<optional reranker base URL>
RERANKER_API_KEY=<optional secret>
RERANKER_MODEL=<optional reranker model>
```

## Security Rules

- No secret may be exposed through `VITE_*`.
- Public assistant cannot call internal routes or request internal retrieval scope.
- RAG Orchestrator authenticates callers before retrieval/sync.
- Internal routes require member token or admin token as appropriate.
- Public answer generation must cite public sources and self-check against retrieved chunks.
- If retrieval fails, the assistant may degrade safely, but must not fabricate details.

## Verification Strategy

- Local deterministic verification remains allowed: indexing, kg check, rag smoke, build, lint.
- Production HTTP health checks require user approval for target endpoints.
- Model validation requires a real user-approved task prompt; no liveness prompts or model pings.
