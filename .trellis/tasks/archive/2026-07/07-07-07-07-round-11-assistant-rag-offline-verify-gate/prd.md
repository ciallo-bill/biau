# Round 11 assistant RAG offline verify gate

## Goal

Make the default full-project verification path guard the assistant and RAG final-shape contracts with offline deterministic checks, so public/internal assistant retrieval quality, service-mode boundaries, local sync planning, and scoped RAG behavior do not regress silently.

## Requirements

- R1. Extend the existing `npm.cmd run verify` path rather than creating a parallel release command.
- R2. Add only checks that are deterministic and local: no live model calls, provider pings, production prompt tests, cloud dashboards, external vector databases, or credentialed services.
- R3. Cover public assistant retrieval evaluation, RAG orchestrator smoke, local RAG sync planning, and service-mode route isolation.
- R4. Keep the verification order understandable: generate assistant knowledge before checks that consume generated knowledge.
- R5. Update docs/spec notes so future assistant/RAG work knows these gates are part of the normal verification contract.

## Acceptance Criteria

- [x] `npm.cmd run verify` runs `assistant:eval`, `assistant:rag-smoke`, `assistant:rag-sync-local`, and `assistant:service-modes-smoke` in the appropriate order.
- [x] Each added check is confirmed to be local/offline and not a model-provider test.
- [x] Relevant docs/spec mention the expanded verify coverage.
- [x] `npm.cmd run verify` passes.
- [x] No secrets, model relay endpoints, production tokens, database URLs, private URLs, or real provider diagnostics are added.

## Results

- Added `assistant:eval` and `assistant:rag-sync-local` immediately after assistant knowledge generation in `scripts/verify.mjs`.
- Added `assistant:service-modes-smoke` and `assistant:rag-smoke` after server build/smoke, before Cloudflare function smoke.
- Updated `.trellis/spec/backend/quality-guidelines.md`, `.trellis/spec/frontend/quality-guidelines.md`, and `docs/deployment.md` to describe the expanded offline verification contract.
- Verified candidate commands individually and then ran the full `npm.cmd run verify`; all added checks passed without live model/provider calls.

## Manual Gates

- Production RAG sync to Qdrant/Aiven/Supabase, real embedding/reranker/model validation, Render service checks, and credentialed internal assistant acceptance remain explicit user-approved tasks.
