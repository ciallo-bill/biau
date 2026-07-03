# Implementation Plan

## Steps

1. Inspect existing assistant widget, assistant data helpers, backend model call, env example, and UI regression checks.
2. Update backend model prompt and request payload for GLM/OpenAI-compatible compatibility and concise public-answer behavior.
3. Refine public widget initial state, suggestions, status copy, loading/error copy, and citation display rules.
4. Adjust CSS only where needed for compact product-like layout and mobile safety.
5. Regenerate assistant knowledge if public selectors or copy require it.
6. Run validation and fix regressions.
7. Update relevant `.trellis/spec/` if a durable convention is learned.
8. Commit, push `main`, archive task, and push archive commit.

## Validation

- `npm.cmd run assistant:index`
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd run check:ui`
- `git diff --check`
- Sensitive scan over changed/untracked files, including checks for the previously shared GLM key and real relay URLs.

## Risk Notes

- Do not run arbitrary “test live model” requests just to prove a key works; if testing a provider later, use a small real task and keep credentials in local/deployment env only.
- `check:ui` currently expects no initial citation cards and at least one citation after clicking a suggestion; preserve that behavioral contract.
