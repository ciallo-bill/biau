# Codex Review

CC provider `a` did not produce a usable plan for this prompt. Provider `b` produced a valid read-only plan and is accepted as the builder input for this slice.

## Accepted

- Remove stale public wording where screenshots/evidence now exist.
- Reuse existing status language instead of adding a new status taxonomy.
- Keep real future work such as Godot Web package integration, but phrase it as planned work.
- Include `src/data/portfolio.ts` because Space War project metadata is public-facing.

## Narrowing

- Do not redesign pages or touch layout in this slice.
- Do not add new projects, cases, screenshots, or reference-project changes.
- Do not claim Space War has a playable Godot Web build online. The current public state is: site-level showcase route exists; real Godot Web package remains a separate future integration.

## Implementation Targets

- `src/App.tsx`: case statuses, stale nextSteps/integration labels, and visible game wording.
- `src/data/portfolio.ts`: Space War metadata and broad capability wording where it could imply already-live Web exports.
- `docs/showcase-assets.md`: only if the scan reveals a stale gap statement.
