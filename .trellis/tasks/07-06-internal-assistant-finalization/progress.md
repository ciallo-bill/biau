# Progress

## 2026-07-06 member model channels

Completed a focused internal-assistant slice for per-member model channel assignment.

Implemented:

- Server-only `ASSISTANT_MODEL_CHANNELS_JSON` support for additional OpenAI-compatible model channels.
- Existing `ASSISTANT_MODEL_*` remains the default channel.
- `Member.modelChannelId` persists the selected channel id only; API keys and base URLs stay in environment variables.
- Internal chat passes the member's `modelChannelId` into `generateAnswer()`.
- Chat meta includes a sanitized `modelChannel` summary only.
- Admin APIs:
  - `GET /admin/model-channels`
  - `GET /admin/members`
  - `PATCH /admin/members/:id` for model channel assignment and member status.
- Admin UI can refresh members and assign a model channel per member.
- Assistant member card displays the assigned channel label.
- Deployment docs and `.env.example` describe the multi-channel env shape with placeholders only.

Validation:

- `npm.cmd run prisma:validate`
- `npm.cmd run prisma:generate`
- `npm.cmd run server:build`
- `npm.cmd run server:smoke`
- `npm.cmd run assistant:service-modes-smoke`
- `npm.cmd run assistant:rag-smoke`
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run check:ui`
- `git diff --check`

Sensitive scan:

- No real key, database URL, Qdrant endpoint, model relay URL, or token was found.
- The only hit was the documented placeholder `ASSISTANT_MODEL_API_KEY=<OpenAI 兼容中转 Key>`.

Manual gate:

- User must configure real `ASSISTANT_MODEL_CHANNELS_JSON` values in Render or another private environment before production use.

## 2026-07-06 internal session history

Completed the next focused internal-assistant slice for member-scoped persistent session history.

Implemented:

- Member-protected session APIs:
  - `GET /chat/internal/sessions`
  - `POST /chat/internal/sessions`
  - `GET /chat/internal/sessions/:id/messages`
  - `PATCH /chat/internal/sessions/:id`
- Internal chat now rejects cross-member or missing `sessionId` with `session-not-found` instead of creating or attaching to the wrong session.
- Internal chat rejects disabled members before persistence.
- Session previews include safe title, preview, updated time, created time, and archive state.
- `/assistant` now uses real API-backed history instead of demo sessions:
  - member profile sync
  - session list sync
  - message loading
  - new session creation
  - current session archive
  - clearer token/database degraded states
- `src/data/assistant.ts` owns session/message payload normalizers.
- Smoke tests now assert protected session route behavior and service-mode route isolation.
- Backend quality spec now records the internal session-history contract.

Validation:

- `npm.cmd run prisma:validate`
- `npm.cmd run prisma:generate`
- `npm.cmd run server:build`
- `npm.cmd run server:smoke`
- `npm.cmd run assistant:service-modes-smoke`
- `npm.cmd run assistant:rag-smoke`
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run check:ui`
- `git diff --check`

Sensitive scan:

- No real key, database URL, Qdrant endpoint, model relay URL, admin token, member token, or invite code was found.
- Hits were limited to placeholders, smoke-test values, local `127.0.0.1` mock endpoints, and code variable names.

Manual gate:

- Production validation still requires the user-managed Render database, migrations, member token, and real internal assistant API deployment. Local checks intentionally did not call live model/provider channels.

## 2026-07-06 admin invite and member controls

Completed the next focused admin-management slice for internal assistant operations.

Implemented:

- `/admin/summary` now includes invite state counts: open, revoked, expired, exhausted.
- Added admin invite APIs:
  - `GET /admin/invites`
  - `PATCH /admin/invites/:id` with `{ revoked: boolean }`
- Invite list responses expose safe metadata only and never include plaintext invite codes or `codeHash`.
- Existing invite redemption already rejects revoked invites through `revokedAt`.
- `/assistant/admin` now supports:
  - refreshing invite metadata
  - revoking/restoring invites
  - enabling/disabling members
  - displaying safe invite/member statuses
- `src/data/assistant.ts` owns invite payload normalizers.
- Smoke tests now cover admin invite auth/no-database behavior and service-mode isolation.
- Backend quality spec now records the admin-control contract.

Validation:

- `npm.cmd run prisma:validate`
- `npm.cmd run server:build`
- `npm.cmd run server:smoke`
- `npm.cmd run assistant:service-modes-smoke`
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run check:ui`

Manual gate:

- Production admin control validation still requires the deployed internal API, migrated database, and user-managed `ADMIN_TOKEN`. Local validation did not create, revoke, or inspect production invites.
