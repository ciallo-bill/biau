# Backend Observability Guidelines

## Scope

Use this guide before adding metrics endpoints, Prometheus instrumentation, OpenTelemetry exporters, RUM hooks, Sentry, ARMS, Grafana, or alerting integration.

## Current Contract

The assistant API exposes a default-off Prometheus endpoint:

- `METRICS_ENABLED=false` by default.
- `GET /metrics` returns `404 { "error": "metrics-disabled" }` unless explicitly enabled.
- `METRICS_ENABLED=true`, `1`, `yes`, or `on` enables Prometheus text output.
- `/health` remains public and independent of metrics.

## Safe Metrics

Allowed labels are low-cardinality and low-sensitivity:

- `method`
- `route` as an Express route template, not full URL.
- `status_class` such as `2xx`, `4xx`, or `5xx`.
- Histogram `le`.

Allowed metrics include:

- process start timestamp.
- process uptime.
- HTTP request counters.
- HTTP request duration histograms.

## Prohibited Metrics Data

Never include these in metrics, logs, traces, tags, or labels:

- IP addresses, User-Agent, cookies, raw headers, or Authorization values.
- Invite codes, bearer tokens, admin tokens, token hashes, or signing material.
- Member id, session id, message id, customer/user names, or exact private business counts.
- Chat message text, assistant prompt text, model responses, citations as raw JSON, or uploaded document content.
- Database URLs, model provider endpoints, provider names derived from private config, or cloud dashboard URLs.
- Full URL query strings or dynamic path ids that can create high-cardinality labels.

## Rollout Rules

- Keep new observability integrations default-off unless the task explicitly includes a production rollout gate.
- Do not add real provider DSNs, site IDs, API keys, scrape URLs, or dashboard links to the repository.
- Document real provider setup as a human gate.
- Prefer a minimal local smoke check before adding dashboards or alerts.
- Prometheus/Grafana should observe backend services first; static frontend traffic should use Cloudflare/Search Console/Plausible/Umami.

## Validation

After changing metrics or observability code:

```powershell
npm.cmd run server:build
npm.cmd run server:smoke
$env:METRICS_ENABLED='true'; npm.cmd run server:smoke; Remove-Item Env:\METRICS_ENABLED
npm.cmd run lint
npm.cmd run build
```

Also run a sensitive scan on changed files and manually inspect hits that mention token, key, bearer, database URL, private IP, or connection strings.

## Scenario: Public Synthetic Status Reports

### 1. Scope / Trigger

- Trigger: adding a project reliability smoke check that writes into `public/status/` and is rendered by `/status`.
- Use this for cross-project checks such as Legal RAG, ERP, xunqiu backend, game static resources, and future assistant production smoke checks.

### 2. Signatures

- `npm.cmd run <project>:synthetic` runs a project-specific script.
- Script output path: `public/status/<project>-synthetic.json`.
- Status aggregation: `npm.cmd run site:status` loads every `public/status/*-synthetic.json` file and merges checks by `id`.

### 3. Contracts

- Environment keys must be optional by default. Missing API base URL writes `unchecked` results and exits successfully.
- Public report shape:
  - `checkedAt: string`
  - `apiBaseConfigured: boolean`
  - `hasCredentials: boolean`
  - `ok: boolean`
  - `checks: Array<{ id, status, httpStatus, durationMs, checkedAt, summary, issues }>`
- Allowed statuses are `online`, `degraded`, `offline`, and `unchecked`. Static data may still use `planned`.
- Do not persist API base URLs, usernames, passwords, bearer tokens, private dashboard links, shop/SKU/order data, exact business metrics, or model-provider secrets.

### 4. Validation & Error Matrix

- Missing base URL -> all live checks `unchecked`; exit code `0`.
- Missing credentials -> run public health/bootstrap checks only; protected checks `unchecked`; exit code `0`.
- Failed attempted request -> check becomes `offline` or `degraded` based on HTTP status; `--strict` may exit non-zero.
- Malformed synthetic JSON -> `site:status` ignores that file and keeps static status data.

### 5. Good/Base/Bad Cases

- Good: health endpoint returns a wrapped low-sensitive payload; script records status, HTTP status, duration, and a short summary.
- Base: no environment configured; script records only `unchecked` placeholders so fresh clones still build.
- Bad: report includes real hostnames, tokens, account names, raw response bodies, SKU/order metrics, or provider keys.

### 6. Tests Required

- Run the synthetic script with no env and assert it writes `unchecked` output.
- Use an ephemeral local API to verify configured-base paths when adding protected smoke logic.
- Run `npm.cmd run site:status` and confirm `/status` receives merged check statuses.
- Run `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run check:ui`, `git diff --check`, and a sensitive scan over changed files.

### 7. Wrong vs Correct

#### Wrong

```json
{
  "apiBaseUrl": "https://private.example.internal",
  "token": "real-token",
  "checks": [{ "id": "erp", "rawResponse": { "orders": 12345 } }]
}
```

#### Correct

```json
{
  "apiBaseConfigured": true,
  "hasCredentials": true,
  "checks": [
    {
      "id": "ozon-erp-auth",
      "status": "online",
      "httpStatus": 200,
      "durationMs": 120,
      "checkedAt": "2026-07-03T00:00:00.000Z",
      "summary": "Auth bootstrap and login returned expected low-sensitive structures",
      "issues": []
    }
  ]
}
```
