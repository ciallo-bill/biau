# RAG manual gate and env copy refresh

## Goal

Refresh RAG-related documentation/config copy so the long-running manual queue,
`.env.example`, and deployment docs agree on the current final architecture:
three service boundaries plus a scoped RAG Orchestrator using Qdrant collections
for external vector retrieval.

This task must not change runtime code or reveal any real endpoint, key, token,
or database URL.

## Requirements

- Keep `docs/deployment.md` as the source of current architecture wording.
- Update `.env.example` comments that still describe the RAG runtime as an
  undecided Supabase/Render/Neo4j/Vectorize choice.
- Update parent `manual-actions.md` so already-decided RAG platform choices are
  not presented as still open; remaining manual gates should focus on secrets,
  production env values, sync approval, and live retrieval/model validation.
- Preserve manual gates for live model calls, Qdrant/API keys, embedding keys,
  Render env vars, and production health/retrieval checks.
- Do not run live RAG sync, model calls, provider checks, or cloud operations.

## Acceptance Criteria

- [x] `.env.example` describes Qdrant-backed RAG Orchestrator variables without
      implying the runtime is still undecided.
- [x] Parent `manual-actions.md` distinguishes completed platform choice from
      remaining secret/config/live-check gates.
- [x] No real secret, endpoint, or private URL is added.
- [x] `git diff --check` passes.

## Notes

- Parent task: `07-04-biau-port-continuous-improvement`.
- This is a docs/config copy refresh only.
