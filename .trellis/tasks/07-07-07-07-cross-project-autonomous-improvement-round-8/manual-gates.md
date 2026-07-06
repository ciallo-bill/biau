# Manual Gates

## M1. GitHub SSH host key verification blocks push

- Status: awaiting human verification.
- Trigger: after local commit `aa7d284 test(status): surface reliability evidence freshness`, `git push origin main` failed with `REMOTE HOST IDENTIFICATION HAS CHANGED`.
- Local state: `main` has local commits ahead of `origin/main`; run `git status --short --branch` for the current count.
- Remote shape: `origin` uses SSH alias `github.com-bill`, which resolves to `hostname github.com`, `user git`, `port 22`.
- Security note: do not automatically edit `C:\Users\zhang\.ssh\known_hosts` or bypass `StrictHostKeyChecking`.
- Needed from user: verify the GitHub SSH host key through the official GitHub fingerprint documentation or another trusted channel, then update the local `known_hosts` entry intentionally.

## M2. Production and live checks remain manual

- Credentialed Legal RAG / ERP / Xunqiu checks still need approved production tokens or demo credentials.
- Public/internal assistant live model prompts remain opt-in only; do not add them to default liveness checks.
- Prometheus, Grafana, ARMS, Umami/Plausible, Cloudflare dashboards, and alert routing remain human platform setup.
- Pet/Xunqiu APK/AAB signing, checksum publication, and public download approval remain human release gates.
