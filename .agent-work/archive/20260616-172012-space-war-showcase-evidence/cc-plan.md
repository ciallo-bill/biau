好的，我已读取当前任务和相关文件。现在输出只读分析计划：

## Space War 任务只读分析结果

### 1. 真实 Web export 状态
- **需要确认**：`/home/zhang/workspace/reference-projects/space-war` 是否存在 Godot Web 导出包
- **已知**：从 `App.tsx` 看，`/games/space-war` 路由已存在，但尚未确认是否接入真实 Web 构建产物
- **计划**：需要运行 `ls` 检查 `reference-projects/space-war` 目录，重点查找 `.html`/`.wasm`/`.pck` 等 Web 导出标志文件

### 2. 应该截图的站内路由
- **首选**：`/games/space-war` — 独立游戏展示页，符合任务"site-level Web playtest/showcase entry"描述
- **备选**：如果 `/games/space-war` 渲染异常，可截 `/projects`（选中 space-war 项目的状态）
- **不可行**：不能截 `/cases/godot-showcase`，因为它是游戏项目集合案例，不是 Space War 专属入口

### 3. 文件命名
- **建议**：`public/images/projects/showcase/space-war-web-showcase.png`
- **理由**：任务文档中明确列出此路径，与现有 `space-war-menu.png`/`space-war-gameplay.png`/`space-war-result.png` 保持命名一致性
- **备选**：如果首选名称语义不清，可用 `space-war-game-page.png` 或 `space-war-showcase-entry.png`

### 4. 是否需要接入证据矩阵
- **需要**：`docs/showcase-assets.md` 第 22 行已将 Space War 列入 Godot 项目覆盖表，但"缺口"列为"Web 试玩入口截图"
- **行动**：截图后更新该表，将"Web 试玩入口截图"从缺口移到"已上线素材"，并在已上线文件清单中追加新截图路径
- **位置**：`App.tsx` 中 `GameShowcaseView` 和 `caseImagesById['godot-showcase']` 可能也需要补充新截图，但需先确认是否已有 Space War 专属展示

### 5. 安全风险
- ✅ **无敏感路径风险**：截图目标是站内公开路由 `/games/space-war`，不涉及 `reference-projects` 或 `/mnt/d/workspace4Codex` 的私有路径
- ✅ **无构建产物泄漏**：不发布 `.pck`/`.wasm` 文件路径，只截浏览器渲染后的页面
- ✅ **无真实数据**：Space War 是游戏项目，不涉及用户凭据、服务地址或业务数据
- ⚠️ **需验证**：截图前需确认 `/games/space-war` 页面是否包含本地路径、临时文件路径或"under construction"提示

### 6. 验证命令
```bash
# 1. 确认 reference-projects/space-war 是否有 Web export
ls -lh /home/zhang/workspace/reference-projects/space-war/*.{html,wasm,pck} 2>/dev/null

# 2. 启动本地开发服务器
npm run dev  # 在后台运行，监听端口通常为 5173

# 3. 使用 Playwright MCP 或系统 Chrome 截图 /games/space-war
# (具体命令由 Builder 执行)

# 4. 验证截图文件
file public/images/projects/showcase/space-war-web-showcase.png
identify public/images/projects/showcase/space-war-web-showcase.png  # 如果有 ImageMagick

# 5. 运行 lint 和 build
npm run lint
npm run build

# 6. 浏览器手动验证（如果修改了 App.tsx）
# 打开 http://localhost:5173/games/space-war（桌面宽度）
# 打开 http://localhost:5173/games/space-war（移动端宽度 393px）
```

---

## 关键决策点

1. **是否有真实 Web export**：需先运行 `ls` 确认；如果不存在，本次只截站内展示页，不构建 Godot Web 包
2. **截图内容**：`/games/space-war` 页面应展示游戏封面、玩法说明、系统介绍和"试玩入口"按钮（即使按钮暂时不可点击）
3. **证据矩阵位置**：新截图应出现在 `docs/showcase-assets.md` 的 Space War 行和已上线文件清单中

---

**下一步**：由 Codex 审查此计划，确认是否需要调整，然后由 Builder 执行 `ls` 确认 Web export 状态。
