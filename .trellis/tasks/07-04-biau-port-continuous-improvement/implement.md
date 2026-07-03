# BIAU Port continuous improvement implementation plan

## Phase 1: Parent Task Setup

- [x] Create parent task.
- [x] Link public assistant frontier RAG task as child.
- [x] Link cross-project release readiness parent task as child.
- [x] Write parent `prd.md`.
- [x] Write parent `design.md`.
- [x] Write parent `implement.md`.
- [x] Write parent `manual-actions.md`.
- [x] Run `git diff --check`.
- [x] Report the task tree and manual-action queue to the user.

## Phase 2: Review Child Task Readiness

- [ ] Apply child-first stabilization rule: do not create new implementation work until existing `P1` children are reviewed, started, blocked, or intentionally deferred.
- [ ] Review public assistant frontier RAG artifacts.
- [ ] Review cross-project release readiness tree.
- [ ] Review `P1` child readiness in this order:
  - [ ] ERP production registration live verify.
  - [ ] Legal RAG demo access QA closure.
  - [ ] Pet APK public release closure.
  - [ ] Cross-project scheduled reliability observability.
- [ ] Run a discovery sweep across main site data/routes and related project references.
- [ ] Identify which child tasks can proceed without manual actions.
- [ ] Identify which child tasks are blocked by manual actions.
- [ ] Create or update child tasks for discovered gaps with independent deliverables.
- [ ] Update `manual-actions.md`.

## Phase 3: Continuous Autonomous Work Loop

Repeat while the user is away and context/time allows:

1. Check `git status --short`.
2. Check Trellis active tasks.
3. Run a discovery sweep when no obvious in-progress child is available.
4. Pick the highest-value unblocked child task or create/update one for a newly found gap.
5. Load relevant specs before editing.
6. Implement in a small, verifiable slice.
7. Run local validation.
8. Update task artifacts and specs if a reusable rule was learned.
9. Commit and push on `main` when checks pass and the project rules allow it.
10. Record any manual action encountered.

## Discovery Sweep Checklist

- [ ] Compare homepage/project cards with `src/data/portfolio.ts`.
- [ ] Compare project detail content with assistant knowledge projections.
- [ ] Compare status targets/checks with project external links and detail pages.
- [ ] Inspect blog curation for project-related gaps or stale references.
- [ ] Inspect public assistant suggestions and retrieval coverage.
- [ ] Review related repo paths only as needed for evidence, not for broad unrelated refactors.
- [ ] Record manual blockers in `manual-actions.md`.
- [ ] Create child tasks for gaps that need separate planning/validation.

## Recommended First Autonomous Work Items

1. ERP registration display and main-site sync review
   - Why: user repeatedly called out registration availability and demo usability.
   - Manual dependency: live production verification if credentials/deployment needed.
   - Risk: medium.
2. Legal RAG demo access and status wording closure
   - Why: user reported the demo route was still blocked by login and wants legal Q&A monitored.
   - Manual dependency: public credential/access policy if live checks are needed.
   - Risk: medium.
3. Pet showcase APK gate page/data cleanup
   - Why: user requested homepage connection to Pet showcase and APK public release readiness.
   - Manual dependency: release APK/signing/checksum approval.
   - Risk: medium.
4. Reliability/status page route and detail polish
   - Why: user already requested status card buttons and detail routes.
   - Manual dependency: none for local UI/data changes.
   - Risk: low to medium.
5. Public assistant answer style cleanup
   - Why: visible quality issue already observed, but it is `P2` after current release-readiness blockers.
   - Manual dependency: none for local prompt/style/data changes; no model liveness checks.
   - Risk: low.
6. Public assistant knowledge export V2 planning / local deterministic export
   - Why: foundation for Agentic Hybrid RAG.
   - Manual dependency: none if kept local and mockable.
   - Risk: medium.

## Validation Commands By Work Type

Planning-only changes:

```powershell
git diff --check
```

Frontend/data changes:

```powershell
npm.cmd run lint
npm.cmd run build
```

Assistant changes:

```powershell
npm.cmd run assistant:index
npm.cmd run cf-assistant:smoke
npm.cmd run server:smoke
npm.cmd run server:build
npm.cmd run lint
npm.cmd run build
```

Blog/content curation:

```powershell
npm.cmd run blog:audit
npm.cmd run assistant:index
npm.cmd run sitemap:generate
npm.cmd run lint
npm.cmd run build
```

Broad release checks:

```powershell
npm.cmd run verify
```

## Stop Conditions

Stop and record a manual action instead of continuing when work requires:

- creating or changing cloud resources;
- entering or rotating secrets;
- live model/provider liveness checks;
- production database access;
- APK signing or public release approval;
- real demo credentials;
- paid service selection;
- irreversible public deployment setting changes.

## Commit Policy

- Commit only after relevant validation passes.
- Push `main` after successful commit unless the user says not to.
- Keep unrelated dirty files out of commits.
- Do not install automatic Git hooks.
