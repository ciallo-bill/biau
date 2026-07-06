# Cross-project Autonomous Improvement Round 7 Design

## Operating Model

Round 7 is a parent task. It should not directly carry broad code changes. Each meaningful deliverable becomes a child task with its own PRD/design/implementation notes and validation record.

## Default Direction

1. Internal assistant Agentic Workspace polish
   - Audit current workspace/admin UI, server API, knowledge sync, member model channels, diagnostics, and smoke scripts.
   - Prefer local contract checks and UI clarity over production-only validation.
   - Keep model channels and member tokens out of Git.

2. Blog knowledge quality backlog
   - Improve knowledge-accumulation posts with evidence, definitions, tradeoffs, and source-backed context.
   - Do not depend on multi-model writing if it reduces reliability.
   - Use model calls only for meaningful content tasks approved by the user.

3. Reliability observation
   - Strengthen status contracts and synthetic outputs when a project status can be checked locally or through already-public endpoints.
   - Represent unknown/gated states explicitly instead of pretending online status.

4. Cross-project polish
   - When touching ERP, Legal RAG, Pet, Xunqiu, or Playlab, read that repo's local instructions first.
   - Only make changes that improve public demonstration, reliability, release gates, or operational clarity.

## Safety Boundaries

- Public repo data must stay sanitized.
- Production credentials and real cloud settings remain manual gates.
- No provider liveness calls.
- No unsupported final-state claims; status pages and project pages must distinguish implemented, gated, planned, unchecked, and degraded states.

## Rollback Shape

Each child task must be independently revertible through a focused commit. Parent task updates only track route, manual gates, and summary.
