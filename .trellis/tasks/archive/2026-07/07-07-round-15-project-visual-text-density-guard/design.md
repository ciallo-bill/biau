# Design

## Scope

Modify:

- `scripts/check-project-detail-evidence.ts`
- `src/data/portfolio.ts`
- `.trellis/spec/frontend/quality-guidelines.md`

## Approach

Add conservative constants to the project detail evidence checker:

- image-backed visual `alt` minimum length: 16 characters;
- image-backed visual `caption` minimum length: 30 characters.

These values catch generic labels while keeping concise technical captions acceptable. Update only the existing visual copy that falls below the new threshold.

## Compatibility

The data shape and renderer do not change. The stricter check is offline and uses existing public data only.
