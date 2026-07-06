# Manual Gates

Use this file for user/platform actions that cannot be safely completed from the repo.

## Current Queue

- Internal assistant production verification requires user-approved member token, production service URL, database migration confirmation, and a meaningful business task if a real model call is needed.
- Member-level model provider changes require user/platform configuration; keys, provider base URLs, and token values must stay outside Git.
- Cloudflare, Render, Aiven, Qdrant, Supabase, Grafana, Umami/Plausible, Search Console, and ARMS configuration changes require user/platform action and must not be written into Git.
- Pet APK public download requires signed release evidence, version notes, checksum, scan/regression evidence, rollback note, and explicit approval.
- Xunqiu APK public download and backend production URL confirmation require platform-side review if local or public status evidence is insufficient.
- Legal RAG protected QA, contract review, and quality panel synthetic checks require low-permission demo credentials through environment variables only.
- ERP production demo registration/login and plugin/sync smoke require low-permission demo account or desensitized fixtures.
- AI Daily automatic publishing and content source policy require user approval before public scheduled publishing.
- Any real model call must be attached to a meaningful business task, not a liveness probe.

## Resolved Gates

- None yet for Round 7.
