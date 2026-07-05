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
