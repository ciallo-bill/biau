# Design

## Boundaries

- Frontend: `src/components/PublicAssistantWidget.tsx` and existing assistant CSS in `src/styles/flow-pages.css`.
- Backend: `server/src/model.ts`, `server/src/app.ts` response shape if needed, and `.env.example` env contract.
- Knowledge: reuse `src/data/assistant.ts` and generated `server/data/public-knowledge.json`; do not add private facts.

## Data Flow

1. Visitor opens public widget.
2. Widget shows a compact greeting, product status, a small set of suggestions, and an input.
3. If `VITE_CHAT_API_BASE_URL` is configured, browser calls backend `/chat/public`.
4. Backend searches public knowledge, then calls `ASSISTANT_MODEL_*` OpenAI-compatible chat completions when configured.
5. Backend returns answer, citations, and `{ mode, model, provider, reason }`.
6. Widget displays concise answer and citations only for actual assistant responses.
7. If API or provider fails, frontend or backend falls back to local public knowledge.

## Model Contract

- System prompt should instruct the model to answer in Simplified Chinese by default, keep answers concise, and use only provided public context.
- If evidence is insufficient, answer with uncertainty and suggest a public page/status page to inspect.
- Never output secrets, environment values, private URLs, token-like strings, or deployment-only details.
- Model parameters should remain minimal for relay compatibility; avoid requiring `temperature` from users.

## UI Contract

- Initial assistant message should be one short greeting, not a documentation block.
- Product state badge communicates whether model enhancement is active.
- Hints should be short and operational, not a long paragraph.
- Suggestions should be button-like prompts that trigger real messages and still pass current UI checks.

## Rollback

- Revert frontend widget/CSS changes to restore old interaction.
- Revert `server/src/model.ts` prompt/parameter changes if provider compatibility regresses.
- Since secrets are not committed, rollback does not require key rotation.
