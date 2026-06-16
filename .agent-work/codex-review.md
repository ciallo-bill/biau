# Codex Review

Date: 2026-06-16
Task: Ozon ERP runtime/admin screenshot

## Review Summary

The Builder correctly identified the open gap: Ozon ERP already has diagrams, but still lacks a public-safe runtime/admin screenshot.

The Builder's safest suggestion, a pure static HTML mock, is too weak for this task because the showcase standard asks for real runtime screenshots when feasible. The approved implementation should instead capture the real ERP Vue frontend from a temporary copy while intercepting API requests with public-safe mock data.

## Approved Slice

Implement one narrow slice:

1. Copy the ERP project into a temporary capture directory outside `reference-projects` and `/mnt/d`.
2. Install/run only the web frontend from the temporary copy.
3. Do not start the real API, PostgreSQL, Redis, Ozon API, extension release scripts, or deployment scripts.
4. Use browser automation to set a fake local login token/user and intercept `/api/products/online-stats` and `/api/shops` with desensitized data.
5. Capture the real Vue overview/admin shell to `public/images/projects/showcase/ozon-erp-admin-runtime.png`.
6. Add the image as one more `/cases/ozon-erp` evidence card.
7. Update `docs/showcase-assets.md` to mark the Ozon runtime screenshot gap as covered.

## Rejected Scope

- Do not create a screenshot from a standalone HTML mock.
- Do not modify ERP source/reference files.
- Do not publish real operational data, deployment details, local temp paths, credentials, API keys, database URLs, server names, shop/order/product IDs, or extension package metadata.
- Do not close Pet Workspace or xunqiu screenshot gaps in this slice.

## Required Verification

- PNG decodes and visually represents the ERP admin runtime with safe demo data.
- `npm run lint` and `npm run build` pass in `blog-semi`.
- Sensitive/public wording scan over changed files passes.
- Browser QA checks `/cases/ozon-erp` at desktop and mobile widths.
