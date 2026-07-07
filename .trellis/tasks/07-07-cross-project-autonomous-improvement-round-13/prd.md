# Cross-project autonomous improvement round 13

## Goal

Continue the long-running BIAU Port improvement goal with local-verifiable work across project details, public showcase, internal assistant, AI Daily, and reliability observation. Keep manual gates recorded without running live model/provider checks or cloud operations.

## Background

- Round 12 added AI Daily issue readiness gates and a public-safe manual gates ledger.
- The user previously emphasized that project detail pages should be visitor-readable technical case pages with richer inline screenshots, diagrams, implementation notes, architecture, tech stack, limitations, and roadmap.
- Round 11 added structural project detail checks, but asset-level quality can still be strengthened so broken, tiny, placeholder, or mismatched public images do not silently pass.
- The repository is clean, `main` is ahead of `origin/main`, and pushing remains blocked by the GitHub SSH host-key manual gate.

## Requirements

- R1. Continue local, verifiable improvements without waiting for user input unless a true manual gate appears.
- R2. Prefer work that improves project detail evidence, public showcase trust, assistant/AI Daily quality, or reliability observation.
- R3. Do not run live model/provider pings, credentialed production checks, paid tasks, cloud dashboard changes, or APK release publication without explicit user approval.
- R4. Record manual gates instead of blocking local progress.
- R5. Keep each child task independently verifiable, small enough to roll back, and backed by deterministic scripts, lint/build, docs, or local smoke checks.

## Acceptance Criteria

- [ ] At least one child task is completed, verified, committed locally, and archived.
- [ ] Manual gates found during this round are recorded in this PRD before archiving.
- [ ] No secrets, production credentials, private URLs, model relay endpoints, or unapproved APK links are committed.
- [ ] Finished child tasks are archived before the parent is archived.

## Initial Task Map

- `project-detail-asset-quality-gate`: extend project detail checks from data structure into asset quality, dimensions, and placeholder/broken-image prevention.
- `status-manual-gate-ledger-sync`: optionally align status detail pages with the new manual gates ledger if drift appears.
- `assistant-studio-artifact-link-check`: optionally strengthen internal assistant Studio draft artifact links and documentation if local checks reveal gaps.

## Manual Gates

- Round 13 child task `project-detail-asset-quality-gate` found no new manual gates.
- GitHub SSH host key verification still blocks pushing local commits.
- Cloudflare, Render, Aiven/Supabase, Qdrant, Prometheus/Grafana/ARMS, Umami/Plausible, Search Console, and scheduled monitors remain platform setup tasks.
- Live model prompts, provider diagnostics, production assistant checks, and AI Daily model-assisted generation remain opt-in real tasks only.
- Legal RAG / ERP / Xunqiu credentialed checks require approved low-privilege demo credentials or production tokens.
- Pet/Xunqiu APK/AAB signing, checksum publication, and public download approval remain release gates.
