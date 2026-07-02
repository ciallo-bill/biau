# Playlab Game Showcase Entry Sync Design

## Evidence Source

- `D:/workspace4Cursor/game/blog/src/content/games/*.md`
- `D:/workspace4Cursor/game/blog/package.json`
- `npm run content:audit` output
- `D:/workspace4Cursor/blog-semi/src/data/portfolio.ts`

## Main Site Ownership

Update `src/data/portfolio.ts` only:

- project overview / workflow for visitor path;
- quality section for audit/check evidence;
- limitations/roadmap for mobile Web and content backlog;
- `assistantContext` for public assistant answers.

Regenerate `server/data/public-knowledge.json` and `public/sitemap.xml` as routine release hygiene.

## Safety Boundary

Do not write Cloudflare credentials, R2 tokens, deployment auth, local `.env`, or private worktree paths into public copy beyond already-public high-level tech facts.
