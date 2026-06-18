# Verification

Date: 2026-06-17
Task: Home case-matrix CTA label alignment

## Change Summary

- Kept the existing home-page case matrix structure and click behavior.
- Changed the CTA label to reflect the actual destination:
  - cards with a real business case keep `查看案例`
  - cards without a real case now show `查看项目`

## Commands

| Command | Result | Notes |
| --- | --- | --- |
| `npm run lint` | pass | ESLint completed successfully. |
| `npm run build` | pass | Build completed successfully. Existing `lottie-web` direct eval warning remains from dependency code. |

## Local Browser QA

WSL system Google Chrome was driven through Chrome DevTools Protocol with local proxy disabled for `127.0.0.1`.

| Route / Flow | Viewport | Result |
| --- | --- | --- |
| `/` home case matrix | 1440x900 | pass: `Legal RAG` card shows `查看案例`; `React + Semi 博客系统` card shows `查看项目`. |
| `/` home case matrix | 390x844 | pass: same as desktop. |
| `Legal RAG` CTA | 1440x900 | pass: clicking opens `/cases/legal-rag`. |
| `Legal RAG` CTA | 390x844 | pass: same as desktop. |
| `blog-semi` CTA | 1440x900 | pass: clicking opens `/projects?project=blog-semi`. |
| `blog-semi` CTA | 390x844 | pass: same as desktop. |
