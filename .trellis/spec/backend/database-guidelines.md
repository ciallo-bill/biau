# Backend Database Guidelines

## ORM and Driver

The backend uses Prisma 7 with PostgreSQL and `@prisma/adapter-pg`. The Prisma client is created lazily in `server/src/db.ts` only when `DATABASE_URL` is configured.

```ts
prisma ??= new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.databaseUrl }),
})
```

Use `getPrisma()` when a route can gracefully degrade without a database. Use `requireDatabase()` when the route cannot proceed without persistence and should return the standardized database-not-configured response.

## Schema Ownership

Database models live in `prisma/schema.prisma`. Current persisted concepts are invites, members, chat sessions, chat messages, usage logs, and the `MemberRole` / `MessageRole` enums.

Migrations live under `prisma/migrations/`. Validate schema changes with:

```powershell
npm.cmd run prisma:validate
```

Deployment migrations use:

```powershell
npm.cmd run prisma:migrate
```

When deploying to Render with Supabase Postgres / Supavisor pooler, keep the real
connection string in platform environment variables and include the Prisma 7
`@prisma/adapter-pg` compatibility query parameters:

```text
?sslmode=require&uselibpqcompat=true
```

If the URI already has query parameters, append them with `&`. Without
`uselibpqcompat=true`, Prisma can fail database writes with `P1011` and
`self-signed certificate in certificate chain` even when `/health` reports that
`DATABASE_URL` is present.

## Query Patterns

Keep route queries explicit and scoped to the authenticated subject. `server/src/app.ts` uses `findFirst({ where: { id: sessionId, memberId: member.id } })` for internal chat session reuse so one member cannot attach to another member's session.

Use `Promise.all` for independent admin summary counts, as in `/admin/summary`.

When storing generated citations, convert to Prisma JSON input intentionally: `citations as unknown as Prisma.InputJsonValue`. Avoid spreading arbitrary request bodies into Prisma writes.

## Secrets and Tokens

Never store invite codes or member tokens in plaintext. `server/src/auth.ts` and `server/src/crypto.ts` issue opaque tokens and store `sha256` hashes (`Invite.codeHash`, `Member.tokenHash`).

## Naming

Prisma models use PascalCase singular names (`Invite`, `Member`, `ChatSession`). Fields use lower camel case (`dailyQuota`, `usedCount`, `createdAt`). Enum values are uppercase (`MEMBER`, `ADMIN`, `USER`, `ASSISTANT`, `SYSTEM`).

## Avoid

- Do not instantiate Prisma clients inside request handlers.
- Do not make database availability mandatory for public routes.
- Do not commit real `DATABASE_URL` values; use `.env.example` for structure.
- Do not store raw invite codes, bearer tokens, API keys, or private chat secrets.

## Scenario: Content Studio Dedicated Database

### 1. Scope / Trigger

- Trigger: changing `/studio/api`, Studio Prisma access, content draft persistence, AI Daily source storage, or Render deployment variables for the content workbench.
- Goal: keep internal assistant member/chat data and Content Studio editorial data separately maintainable.

### 2. Signatures

- Main assistant database:
  - Env: `DATABASE_URL`
  - Client: `getPrisma()`
  - Required guard: `requireDatabase()`
  - Migration: `npm.cmd run prisma:migrate`
- Content Studio database:
  - Env: `STUDIO_DATABASE_URL`
  - Client: `getStudioPrisma()`
  - Required guard: `requireStudioDatabase()`
  - Migration: `npm.cmd run prisma:migrate:studio`
- Studio-only service mode:
  - `ASSISTANT_SERVICE_MODE=studio`
  - `GET /health`
  - `/studio/api/*`

### 3. Contracts

- `/studio/api` must use `STUDIO_DATABASE_URL` when present.
- If `STUDIO_DATABASE_URL` is empty, Studio may fall back to `DATABASE_URL` for local/simple deployments.
- `STUDIO_DATABASE_URL` is server-only; never expose it through `VITE_*`.
- `STUDIO_ADMIN_TOKEN` protects Studio writes; if empty, the backend may fall back to `ADMIN_TOKEN`.
- `ASSISTANT_SERVICE_MODE=studio` exposes Studio routes only. It must not expose `/chat/public`, `/chat/internal`, `/admin/*`, `/rag/*`, or RAG sync routes.
- `VITE_STUDIO_API_BASE_URL` is only the public browser-facing base URL of the Studio API service. It is not a secret.

### 4. Validation & Error Matrix

- Missing `STUDIO_ADMIN_TOKEN` and `ADMIN_TOKEN` -> `503 { error: "studio-auth-not-configured" }`.
- Missing bearer token -> `401 { error: "missing-studio-token" }`.
- Bad bearer token -> `401 { error: "missing-studio-token" }`.
- Missing `STUDIO_DATABASE_URL` and `DATABASE_URL` for a DB route -> `503 { error: "database-not-configured" }`.
- `ASSISTANT_SERVICE_MODE=studio` request to `/chat/public` or `/chat/internal` -> route not mounted.
- `STUDIO_DATABASE_URL` differs from `DATABASE_URL` -> Studio health reports a dedicated database role.

### 5. Good/Base/Bad Cases

- Good: a dedicated `biau-content-studio-api` Render service sets `ASSISTANT_SERVICE_MODE=studio`, `STUDIO_DATABASE_URL`, and `STUDIO_ADMIN_TOKEN`; Cloudflare Pages sets `VITE_STUDIO_API_BASE_URL` to that service URL.
- Base: local development leaves `STUDIO_DATABASE_URL` empty and Studio falls back to `DATABASE_URL`.
- Bad: frontend code reads `STUDIO_DATABASE_URL`, `DATABASE_URL`, `STUDIO_ADMIN_TOKEN`, or `ADMIN_TOKEN`.
- Bad: Studio route imports `requireDatabase()` and writes editorial drafts into the internal assistant member/chat database by accident.
- Bad: internal assistant deployment runs only Studio migrations, leaving member/invite tables missing.

### 6. Tests Required

- Run `npm.cmd run prisma:validate` after schema/env changes.
- Run `npm.cmd run server:build`.
- Run `npm.cmd run server:smoke` to assert Studio auth and missing-database behavior.
- Run `npm.cmd run assistant:service-modes-smoke` to assert `studio` mode route isolation.
- Run `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check`.
- Sensitive scan changed files for real database URLs, admin tokens, bearer tokens, and provider keys.

### 7. Wrong vs Correct

#### Wrong

```ts
const prisma = requireDatabase()
await prisma.contentDraft.create({ data })
```

This writes Studio content through the assistant database client, so a split deployment silently stores editorial data in the wrong database.

#### Correct

```ts
const prisma = requireStudioDatabase()
await prisma.contentDraft.create({ data })
```

The Studio route uses the Studio database boundary and returns the same standardized `database-not-configured` error when no Studio database is available.
