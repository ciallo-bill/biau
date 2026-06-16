# Codex Review

Provider order was followed for planning.

- `a` was attempted first and timed out after 7 minutes with no output.
- `b` produced a valid read-only plan and is accepted as builder input.

## Workflow Adjustment

For future CC calls, do a short `OK` smoke test for each provider before running a long planning prompt. If the smoke test is slow, times out, or returns invalid output, immediately try the next provider in the `a -> b -> c -> d` order. This avoids waiting several minutes on a provider that is already unhealthy.

## Accepted

- Update the blog featured area so it no longer labels the main article as an example.
- Update the case discovery strip so it reads like a public presentation path instead of internal backlog tasks.
- Lightly soften generic “补充真实运行截图” wording where it could imply current assets are not real.

## Narrowing

- Do not touch layout, routes, visual structure, or screenshots.
- Do not edit unused `articles` data in `src/data/portfolio.ts`; it is not rendered and can be cleaned separately if needed.
- Keep legitimate roadmap language such as real model integration, queues, Godot Web package integration, deployment notes, and future postmortems.
- Browser QA should use the actual route `/blogs`, not `/blog`.
