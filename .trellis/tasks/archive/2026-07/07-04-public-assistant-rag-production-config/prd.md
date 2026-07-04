# Public assistant RAG production configuration

## Goal

Configure and implement the final production architecture for BIAU Port assistants: a visitor-facing public assistant, an authenticated internal assistant, and a shared Agentic Hybrid RAG Orchestrator backed by Supabase Postgres + pgvector. The goal is not an interim fallback-only setup; the target is a formal product architecture with clear trust boundaries, scoped retrieval, citations, self-check, observability, and safe secret handling.

## Background

- The public assistant already has local Agentic Hybrid RAG groundwork: generated public knowledge, chunks, entities, relations, deterministic retrieval, rerank, citations, and answer self-check.
- The current Express API exposes `/chat/public`, `/chat/internal`, `/rag/health`, `/rag/v1/retrieve`, and `/rag/v1/sync`.
- `server/src/ragOrchestrator.ts` currently uses local generated knowledge and reports `store: 'local'`.
- `server/sql/rag-store-pgvector.sql` provides a public-safe pgvector schema template, but code-level Supabase sync/query adapters still need to be implemented.
- The user reported that Cloudflare Pages production environment variables have been filled. This is not yet verified by a non-model health check.
- The user wants the final architecture directly, not a plan centered around temporary or transitional availability.
- The user explicitly forbids model liveness checks, provider pings, doctor/diagnose commands, and tiny test prompts. Real model validation requires a user-approved real task prompt.

## Requirements

- R1. Separate the final product boundaries:
  - public assistant for visitors and public website/project/blog/status knowledge only;
  - internal assistant for authenticated users, private/member features, history, admin, and future private knowledge/tools;
  - RAG Orchestrator for retrieval, rerank, scope enforcement, citations, sync, diagnostics, and future eval.
- R2. Use Supabase Postgres + pgvector as the final first external retrieval store, with public and internal corpora separated by explicit scope/visibility controls.
- R3. Keep all model keys, RAG API keys, Supabase service keys, database URLs, admin tokens, and private endpoints out of git, chat, screenshots, logs, and Vite/browser variables.
- R4. Support production configuration for Cloudflare Pages frontend plus dedicated backend services on Render or equivalent Node hosting.
- R5. Preserve safe degradation, but treat it as reliability behavior, not as the target architecture.
- R6. Do not run live model/provider/embedding/reranker validation unless the user explicitly approves a real production-like task prompt.
- R7. Provide exact platform variable names and deployment contracts, using placeholders only.
- R8. Make public assistant answers grounded in retrieved public context with citations and self-check; never allow internal/private context to leak into public answers.
- R9. Make internal assistant capable of authenticated sessions, quota/admin controls, and future private RAG/tooling without sharing its privileged routes with the public assistant surface.
- R10. Use one repository with three Render Web Services and explicit startup modes as the final deployment shape. This keeps shared code maintainable while isolating public, internal, and retrieval runtimes.

## Acceptance Criteria

- [x] Planning artifacts describe the final architecture rather than an interim rollout.
- [x] The architecture separates public assistant, internal assistant, and RAG Orchestrator responsibilities.
- [x] Supabase pgvector is the selected external vector store and the implementation plan includes adapter, sync, query, scope, and validation work.
- [x] The Render deployment decision is recorded as one repository, three Web Services, and three explicit service modes.
- [x] Render/Cloudflare/Supabase environment variables are listed without real secret values.
- [x] Verification plan includes local deterministic checks and production health checks only after endpoint-check approval.
- [x] Live model validation remains manual-gated and uses only an approved real task prompt.

## Out Of Scope

- Pasting or storing real secrets in repo or chat.
- Model liveness tests, provider pings, doctor/diagnose commands, or artificial tiny prompts.
- Replacing Supabase with Neo4j as the primary path before retrieval quality proves graph traversal is the bottleneck.
- Building a full private enterprise knowledge-management UI in this task.

## Manual Gates

- MG1. User creates/approves the Supabase project and enters Supabase secrets in backend platform variables.
- MG2. User creates/approves Render services and enters backend secrets.
- MG3. User approves any production endpoint health checks.
- MG4. User approves any real model-assisted validation prompt.
- MG5. User approved the final direction: three service boundaries plus Supabase pgvector plus scoped RAG Orchestrator. The selected deployment shape is one repository deployed as three Render Web Services with explicit startup modes.
