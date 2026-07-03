# BIAU Port continuous improvement design

## Role Of This Parent Task

This task is a coordination and discovery layer. It exists to keep long-running improvement work coherent across multiple child tasks and project areas, and to actively find gaps in the current project plus related projects. It should not absorb implementation detail that belongs in a specific child task.

## Task Tree Model

```text
BIAU Port continuous improvement master plan
  ├─ Public assistant frontier RAG / agentic knowledge upgrade
  └─ Cross-project release readiness round 3
       ├─ ERP production registration live verify
       ├─ Legal RAG demo access QA closure
       ├─ Pet APK public release closure
       ├─ Cross-project scheduled reliability observability
       └─ AI Daily content pipeline phase 1
```

Future child tasks should be added when a discovery has its own deliverable and validation boundary.

## Discovery Surface

The parent task should actively inspect the following surfaces:

- Main site routes, homepage cards, project pages, assistant, blog, status pages, sitemap, and generated public knowledge.
- Existing Trellis tasks and manual action queue.
- Related repositories when their behavior affects public presentation:
  - `D:\workspace4Codex\xunqiu`
  - `D:\workspace4Codex\xunqiu-backend-modern`
  - `D:\workspace4Cursor\erp`
  - `D:\workspace4Cursor\game`
  - `D:\workspace4Cursor\legal-rag`
  - `D:\workspace4Cursor\pet`

Discovery questions:

- Does the public site accurately represent each project?
- Are project cards, project details, assistant knowledge, status pages and blog references consistent?
- Are demo routes usable or clearly gated?
- Are status checks meaningful and linked to details?
- Are public claims backed by visible code/data evidence?
- Is there a local validation path?
- Does the gap require user/cloud/manual action?

## Work Selection Algorithm

When continuing autonomously:

1. Prefer already-started `in_progress` child tasks.
2. If no child is in progress, finish readiness review for existing child tasks before creating new work.
3. Prioritize existing `P1` child tasks from `07-03-cross-project-release-readiness-round-3` before opening new discovery-driven tasks, unless all of them are blocked by manual actions.
4. If existing `P1` child tasks are blocked, record the blockers and continue with the next unblocked child, such as public assistant local RAG groundwork or AI Daily draft-only planning.
5. Run discovery sweeps continuously, but treat new findings as backlog candidates until current child tasks are closed, blocked, or explicitly superseded.
6. Inspect planning child tasks and choose the one with:
   - highest user-visible impact;
   - least dependency on manual secrets/deployment actions;
   - clear local validation path;
   - low risk of broad unrelated churn.
7. If a new gap has an independent deliverable, create or update a child task for it.
8. If all active children are blocked on manual action, create or update a planning child task for the next unblocked improvement.
9. Record the blocker in `manual-actions.md` and keep moving on unrelated unblocked work.

## Existing Child Completion Bias

The parent task must not keep expanding the task tree while previously accepted work remains open. The default execution posture is:

- close or unblock existing `P1` children first;
- keep `P2` children moving only when they are locally verifiable and do not delay `P1` closure;
- create new child tasks only for issues found during evidence sweeps that are too large or risky to fold into an existing child.

This preserves the user's requested long-running discovery behavior while preventing the workstream from becoming planning-only.

## Child Task Creation Rules

Create a child task when the work:

- spans multiple files or systems;
- touches a related project repository and the main site needs to reflect it;
- needs design decisions;
- involves deployment or external service contracts;
- has manual gates;
- needs separate validation commands;
- could reasonably be completed and archived independently.

Do not create a child task for:

- a single typo or small text correction;
- a one-command local check;
- a note that belongs in `manual-actions.md`;
- speculative ideas with no clear acceptance criteria.

## Manual Action Boundary

Manual actions are not failures. They are planned handoff points. Codex should record them and continue with other work.

Manual action categories:

- Cloud platform setup: Cloudflare, Render, Supabase, Neo4j, GitHub secrets.
- Credentials: API keys, demo passwords, admin tokens, database URLs.
- Release artifacts: APK signing, download approval, checksums, virus scan results.
- Production verification: live model prompt validation, live synthetic checks, paid service choice.
- Product decisions: public wording, demo access policy, acceptable data exposure.

## Safety Model

The parent task inherits project safety rules:

- no secrets in source;
- no live model liveness checks;
- no destructive Git;
- no hidden production changes;
- no public claims without evidence;
- no real deployment URLs or credentials in public docs unless deliberately public and reviewed.

## Progress Recording

Use the following surfaces:

- Child `prd.md` / `design.md` / `implement.md` for task-specific scope.
- Parent `manual-actions.md` for user-required actions.
- Parent `prd.md` for cross-task requirements and priority rules.
- `.trellis/workspace/zhang/journal-*.md` only when finishing a session or recording broad progress through Trellis finish-work.

## Exit Criteria

The parent task should remain open while it is useful as a continuing improvement program. It can be archived only when:

- all active children are archived or intentionally moved elsewhere;
- the user no longer wants an umbrella task;
- remaining manual actions are closed or migrated to a new parent task.
