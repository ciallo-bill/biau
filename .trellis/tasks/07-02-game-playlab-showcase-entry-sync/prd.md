# Playlab game showcase entry sync

## Goal

让主站 Biau Playlab 项目详情更准确地对齐当前游戏站事实：六个 Godot Web 游戏、独立试玩入口、移动端/浏览器体验提示、Spacewar II 第六项目接入、内容审计和公开端点检查。

## Requirements

- 基于 `D:/workspace4Cursor/game/blog` 当前内容模型和审计结果，不只看 README。
- 不发布游戏站、不上传试玩包、不改 R2/Cloudflare 配置。
- 主站项目页需要说明：
  - 六个游戏都在内容模型中，Spacewar II 已作为第六个 Web 试玩项目接入。
  - Godot Web 试玩由独立试玩域名承载，首次加载慢、移动端输入/性能需要持续回归。
  - 内容审计当前通过，统计 6 个游戏、5 篇开发日志、4 篇公开文章。
  - 博客/文章工作区仍不是主线成熟内容，主站不能包装成完整内容产品。
- 更新公开助手知识，避免主站与 Playlab 站点事实漂移。

## Acceptance Criteria

- [ ] `game/blog` 内容审计结果已记录并用于主站同步。
- [ ] 主站 Playlab 项目页和 assistantContext 同步 Spacewar II、移动端提示、试玩入口和内容审计事实。
- [ ] 不新增真实密钥、私有配置、上传凭据或部署 token。
- [ ] `blog-semi` 公开助手索引和 sitemap 根据需要重新生成。
- [ ] 最小验证、`git diff --check` 和敏感扫描通过。

## Notes

- `game/blog` 本轮不需要修改：`npm run content:audit` 已通过，内容模型可作为证据。
