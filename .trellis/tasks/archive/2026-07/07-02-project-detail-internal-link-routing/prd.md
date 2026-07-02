# 项目详情内部链接 SPA 导航优化

## Goal

让项目详情页中的站内链接使用 React Router `Link` 导航，避免普通 `<a href>` 带来的整页刷新；外部链接继续使用 `<a target="_blank" rel="noopener noreferrer">`。

## Requirements

- 只修改项目详情页链接渲染方式，不改项目数据、链接目标、内容文案或页面视觉。
- `link.type === 'internal'` 时使用 `Link to={link.href}`。
- `link.type === 'external'` 时继续使用普通 `<a>`，保留 `target="_blank"` 与 `rel="noopener noreferrer"`。
- 覆盖项目顶部“相关链接”和案例分析段落中的 `section.links` 两处渲染。
- 复用现有 `link-badge` class、`IconLink` 图标和布局。
- 不触碰部署、模型配置、博客发布或旧文删除。

## Acceptance Criteria

- [x] 项目详情页两处 `ProjectLink` 渲染都区分 internal/external。
- [x] 内部链接保持现有样式并走 React Router `Link`。
- [x] 外部链接保持新窗口安全属性。
- [x] UI 检查覆盖项目详情页内部链接点击后能到达对应博客路由，并保留 SPA 页面上下文。
- [x] 运行 `npm.cmd run lint`、`npm.cmd run build` 和 `npm.cmd run check:ui`。

## Notes

- 这是父任务的低风险项目详情体验小步。
- 验证记录：
  - `npm.cmd run lint`：通过。
  - `npm.cmd run build`：通过；仅有现有 dynamic import chunk 提示。
  - `npm.cmd run check:ui`：通过。
  - `git diff --check`：通过；仅有工作区 LF/CRLF 转换提示。
  - 敏感信息扫描：仅命中 UI 检查脚本本地地址 `127.0.0.1:5174`，无真实敏感值。
