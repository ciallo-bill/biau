# CC Plan

## Findings

- Home case-matrix cards currently reuse a single `查看案例` button label for both real case pages and non-case project previews.
- `blog-semi` does not have a business case entry in `caseStudies`, so its button currently jumps to project selection even though the label says case.
- Other projects in the matrix have real case entries and should keep a case-oriented CTA.

## Recommended Slice

- Keep the home case matrix.
- Change the CTA label dynamically:
  - real case exists -> `查看案例`
  - no real case exists -> `查看项目`
- Keep the existing click behavior, only align the label with the actual destination.

## Files To Touch

- `src/App.tsx`
- `.agent-work/*`

## Verification

- `blog-semi` card shows `查看项目` and selects the project list view.
- case-backed cards still show `查看案例` and open `/cases/:id`.
- Run `npm run lint` and `npm run build`.
- Browser QA checks the home matrix on desktop and mobile.
