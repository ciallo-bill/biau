# Internal assistant finalization implementation plan

## Preconditions

- Task status must be moved from `planning` to `in_progress` before code edits:

```bash
python ./.trellis/scripts/task.py start ./.trellis/tasks/07-06-internal-assistant-finalization
```

- Before editing, load `trellis-before-dev` and read the relevant backend/frontend specs.
- Do not run live model pings, doctor checks, provider liveness tests, or tiny test prompts.

## Step 1: Baseline And Specs

- Read:
  - `.trellis/spec/backend/database-guidelines.md`
  - `.trellis/spec/backend/quality-guidelines.md`
  - `.trellis/spec/backend/observability-guidelines.md`
  - `.trellis/spec/frontend/component-guidelines.md`
  - `.trellis/spec/frontend/state-management.md`
  - `.trellis/spec/frontend/quality-guidelines.md`
  - `docs/deployment.md`
- Re-check current code before editing:
  - `src/pages/AssistantPage.tsx`
  - `src/pages/AssistantAdminPage.tsx`
  - `src/data/assistant.ts`
  - `server/src/app.ts`
  - `server/src/ragRoutes.ts`
  - `server/src/ragQdrantStore.ts`
  - `prisma/schema.prisma`

## Step 2: Schema And Types

- Add additive Prisma fields/models:
  - `Member.status`, `Member.disabledAt`, `Member.lastSeenAt`
  - `Member.modelChannelId`
  - `ChatSession.archivedAt`, `ChatSession.lastMessageAt`
  - optional `Invite.revokedAt`
  - `InternalKnowledgeDocument`
  - `InternalKnowledgeSyncRun`
- Add enums for member status and internal document status.
- Update generated Prisma client.
- Add type guards/normalizers for new API payloads.

Validation:

```bash
npm.cmd run prisma:validate
npm.cmd run prisma:generate
```

Rollback point: schema is additive; if migration risk appears, keep API/UI work behind code paths that tolerate missing data until migration is resolved.

## Step 3: Member Session APIs

- Add safe model-channel parsing in `server/src/env.ts` / `server/src/model.ts`:
  - default channel from existing `ASSISTANT_MODEL_*`
  - optional extra channels from `ASSISTANT_MODEL_CHANNELS_JSON`
  - sanitized summaries for admin/member responses
- Route internal chat through the member's `modelChannelId`.
- Add member helper functions:
  - read bearer member
  - assert active member
  - scope session by current member
- Add routes:
  - `GET /me`
  - `GET /chat/internal/sessions`
  - `POST /chat/internal/sessions`
  - `GET /chat/internal/sessions/:id/messages`
  - `PATCH /chat/internal/sessions/:id`
- Update `POST /chat/internal` to maintain `lastMessageAt` and reject disabled members.
- Include only safe selected-channel meta in internal responses.
- Keep stable error codes: `missing-or-invalid-token`, `member-disabled`, `session-not-found`, `database-not-configured`.

Validation:

```bash
npm.cmd run server:build
npm.cmd run server:smoke
```

## Step 4: Internal Workspace UI

- Replace demo session rail with API-backed sessions.
- Keep unauthenticated state focused: invite form, concise value proposition, no giant default explanation.
- Add:
  - new chat
  - session selection
  - session rename or archive
  - history message loading
  - member profile/status panel
  - source/citation panel
- Preserve local fallback only as a clearly labeled degraded mode.
- Ensure no token is printed in UI or console.

Validation:

```bash
npm.cmd run lint
npm.cmd run build
npm.cmd run check:ui
```

## Step 5: Admin Management APIs

- Expand `/admin/summary`.
- Add:
  - `GET /admin/model-channels`
  - `GET /admin/members`
  - `PATCH /admin/members/:id`
  - `GET /admin/invites`
  - `PATCH /admin/invites/:id`
- Keep `POST /admin/invites` compatible.
- Do not return invite code hash, member token hash, raw auth headers, model API keys, or model base URLs.

Validation:

```bash
npm.cmd run server:build
npm.cmd run server:smoke
npm.cmd run assistant:service-modes-smoke
```

## Step 6: Internal Knowledge Admin And Sync

- Add admin APIs:
  - `GET /admin/knowledge-documents`
  - `POST /admin/knowledge-documents`
  - `PATCH /admin/knowledge-documents/:id`
  - `POST /admin/knowledge/sync`
- Implement chunking for active/reviewed internal docs.
- Add server-only env support if needed:
  - `ASSISTANT_RAG_SYNC_TOKEN`
  - optional `ASSISTANT_RAG_SYNC_TIMEOUT_MS`
- Internal service calls RAG `/v1/sync` with sync token; browser never sees sync token.
- Record sync run summary in `InternalKnowledgeSyncRun`.

Validation:

```bash
npm.cmd run server:build
npm.cmd run server:smoke
npm.cmd run assistant:rag-smoke
```

## Step 7: RAG Orchestrator Internal Sync

- Extend RAG `/v1/sync` payload parsing to accept `scope=internal` and `documents`.
- Implement Qdrant internal upsert/delete-stale for `biau_internal_chunks`.
- Keep current no-payload public sync behavior intact.
- Ensure public retrieve never queries internal collection.
- Ensure internal retrieve returns public + internal citations with visibility metadata.
- Add local/mock smoke coverage without external credentials.

Validation:

```bash
npm.cmd run assistant:service-modes-smoke
npm.cmd run assistant:rag-smoke
npm.cmd run assistant:rag-sync-local
```

## Step 8: Admin UI Finalization

- Convert `/assistant/admin` from MVP cards into tabs:
  - Overview
  - Invites
  - Members
  - Knowledge
  - Sync / Diagnostics
- Add safe empty/error/loading states.
- Mask token input and avoid exposing secrets in status text.
- Add manual gate copy for production env vars and first internal corpus approval.

Validation:

```bash
npm.cmd run lint
npm.cmd run build
npm.cmd run check:ui
```

## Step 9: Docs, Status, And Observability

- Update `docs/deployment.md` with final internal assistant variables and route map.
- Update `docs/observability-strategy.md` or status data if service health/status cards need new internal assistant checks.
- Add/adjust smoke scripts for:
  - member session history
  - admin list/revoke
  - internal knowledge sync mock
  - scope isolation
- Add manual gates to the task notes or docs.

Validation:

```bash
npm.cmd run docs:observability-check
npm.cmd run site:status
```

## Final Verification

Run the broadest feasible local checks:

```bash
npm.cmd run prisma:validate
npm.cmd run server:build
npm.cmd run server:smoke
npm.cmd run assistant:service-modes-smoke
npm.cmd run assistant:rag-smoke
npm.cmd run assistant:index
npm.cmd run assistant:kg-check
npm.cmd run lint
npm.cmd run build
npm.cmd run check:ui
git diff --check
```

Then scan changed files for:

- real API keys
- database URLs
- admin/member tokens
- invite codes
- model relay URLs
- Qdrant endpoints
- raw internal/private document content

## Manual Gates To Carry Forward

- User configures production Render env vars and migrations.
- User approves first internal corpus source and脱敏标准.
- User approves any live Qdrant/embedding sync.
- User approves any real model quality validation prompt.
- User decides whether to expose internal assistant entry publicly as hidden route only or navigation-visible internal entry.
