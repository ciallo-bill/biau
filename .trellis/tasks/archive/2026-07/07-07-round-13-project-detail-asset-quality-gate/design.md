# Design

## Scope

Modify:

- `scripts/check-project-detail-evidence.ts`
- `docs/showcase-assets.md`
- `.trellis/spec/frontend/quality-guidelines.md`

## Asset Contract

Every project detail `project.image` and every `ProjectVisualBlock.image` should:

- live under `/images/projects/`;
- exist under `public/images/projects/`;
- be parseable by the image pipeline;
- include width/height metadata;
- be at least `320px` wide and `240px` tall;
- have enough area to avoid icon-sized or placeholder assets;
- for raster formats (`png`, `jpg`, `jpeg`, `webp`), have a matching `.webp` optimized sidecar unless the asset itself is already `.webp`;
- keep SVG diagrams exempt from WebP sidecars but still parseable for dimensions.

## Implementation Shape

Keep existing synchronous structural checks intact. Queue asset-quality checks from `checkAsset()` and `checkVisual()`, then run them after the project loop through `sharp(...).metadata()`.

The checker should report project/context-specific failures rather than throwing raw image parser errors.

## Compatibility

Current assets pass with the measured minimums. The gate should not require exact aspect ratios because mobile full-page screenshots and tall app screens are valid evidence.
