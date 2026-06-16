# Codex Controller Review

Date: 2026-06-16
Task: InteSpace real runtime screenshots

## Decision

Approved with scope changes.

CC correctly identified the public story for InteSpace: Godot 4.6, portrait-first, weapon system v1 freeze, and the current loop of 首页 -> 战斗 -> 升级 -> 结算 -> 成长 -> 下一局.

However, the plan is too broad and does not fully satisfy the requested plan format. Implementation must follow the narrowed scope below.

## Required Scope

1. Generate screenshots from the actual InteSpace Godot project through a temporary copy.
2. Do not use undocumented existing screenshots as primary evidence unless they are re-verified as generated from the actual project.
3. Publish only selected, reviewed PNGs under `public/images/projects/showcase/intespace-*.png`.
4. Use one real InteSpace screenshot as the project visual in `src/data/portfolio.ts`.
5. Add InteSpace runtime evidence to `caseImagesById['godot-showcase']` in `src/App.tsx`, while keeping the existing `godot-intespace-loop.svg`.
6. Update `docs/showcase-assets.md`, `.agent-work/current-task.md`, and `.agent-work/verification.md`.

## Screenshot Targets

Preferred targets:

- `intespace-player-hub.png`: main menu / player hub, portrait layout, showing the clean launch page and current stage framing.
- `intespace-gameplay-hud.png`: game scene after a short settled runtime, showing player, battlefield, enemies or HUD state.
- `intespace-result-loop.png`: optional only if reliably capturable without brittle timing. If not reliable, do not force it.

## Non-goals

- Do not expand unrelated content such as adding long weapon route sections unless directly needed for screenshot context.
- Do not modify `/mnt/d/workspace4Codex/intespace`.
- Do not modify `~/workspace/reference-projects`.
- Do not publish local logs, temp script output, export packages, `.import` metadata, release package names, hashes, accounts, IPs, tokens, or raw task data.
- Do not claim Raiden has real screenshots.

## Implementation Notes

- Use `/mnt/d/workspace4Codex/.tmp-godot-capture/intespace-20260616` or another clearly named temp copy.
- A temporary Godot `SceneTree` capture script is acceptable inside the temp copy only.
- Prefer Godot 4.6.1 runtime already available on the machine.
- If headless capture produces blank or invalid images, document it and use a non-headless Windows Godot capture as done for Next Spacewar.

## Verification Requirements

- Confirm PNG dimensions and file sizes.
- Run `npm run lint`.
- Run `npm run build`.
- Run sensitive/public wording scan for interview/portfolio wording and obvious secret markers.
- Browser QA local routes at desktop and mobile:
  - `/projects/intespace`
  - `/games/intespace`
  - `/cases/godot-showcase`
- Record results in `.agent-work/verification.md`.

