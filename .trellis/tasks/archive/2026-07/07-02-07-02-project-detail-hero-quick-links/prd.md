# 项目详情首屏快速链接

## Goal

让项目详情页在标题区直接展示已有相关链接，尤其改善移动端首屏无法快速找到演示、文档、源码入口的问题。

## Requirements

- Project detail pages must surface existing `project.links` in the header area so visitors can find demos, docs, repositories, and related posts before the lower "相关链接" block.
- Quick links must reuse existing `ProjectLink` data only; do not add, remove, rename, or reorder project facts / URLs in this task.
- Internal quick links must keep SPA navigation through React Router. External quick links must keep `target="_blank"` and `rel="noopener noreferrer"`.
- The quick-link row must stay compact on mobile and desktop: wrapping is allowed, but there must be no horizontal overflow, no text overlap, and no obstruction of the screenshot/open-original affordance.
- Existing lower "相关链接" block remains available for full context and should not lose links.

## Acceptance Criteria

- [x] `/projects/legal-rag` mobile viewport shows quick links in the detail header before the project screenshot.
- [x] `/projects/xunqiu` mobile viewport shows product/docs/APK quick links before the project screenshot.
- [x] Header quick links preserve internal/external link semantics and security attributes.
- [x] Lower "相关链接" block still renders existing links.
- [x] `git diff --check`, sensitive-info scan, `npm.cmd run lint`, `npm.cmd run build`, and relevant UI check pass.

## Notes

- Keep `prd.md` focused on requirements, constraints, and acceptance criteria.
- Lightweight tasks can remain PRD-only.
- For complex tasks, add `design.md` for technical design and `implement.md` for execution planning before `task.py start`.
- Verified with `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run check:ui`, `git diff --check`, strict sensitive-info scan, and mobile screenshot inspection for `legal-rag` / `xunqiu`.
