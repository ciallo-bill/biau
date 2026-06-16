分析完成。以下是只读实施计划。

## 1. 需要修改的具体位置

**A. 案例状态标签（页面可见，与素材现状矛盾）**
`docs/showcase-assets.md` 已记录 Pet Workspace、xunqiu、godot-showcase 相关素材为「无缺口/已补充」，但案例仍标 `status: '补充中'`：
- `src/App.tsx:272`（pet-workspace）
- `src/App.tsx:292`（xunqiu）
- `src/App.tsx:312`（godot-showcase）
建议统一改为 `'整理中'` 或新增「已补充」态（需同步 `:806` 的 Tag 颜色三元判断，避免出现未覆盖的灰色兜底）。

**B. 已过时的 nextSteps / integration 条目**
这些声明「补充」的截图按 `showcase-assets.md` 已上线，属事实性过时：
- `:1019` ozon-erp `'补充脱敏后台截图'`（line 20 已补充运行截图）
- `:1071` xunqiu `'补充脱敏移动端截图'`（line 21 已补充欢迎页截图）
- `:1097` `'补充 Web 试玩封面'`、`:1149` `'补充主菜单和结果页截图'`、`:1201` `'补充发布截图矩阵'`、`:1721` 关联入口
建议删除或改写为仍真实存在的缺口。

**C. 措辞统一**
`:201`、`:1161/1172/1506` 等多处「Web 试玩版/Web 试玩包」表述不一，建议统一为「Web 试玩包（计划接入）」。

## 2. 应保留为真实未来工作的词

以下指向尚未完成的真实工作，保留但应明确「计划中/待接入」语气，不能删：
- 「接入 Web 试玩入口/Web 试玩包/Web 包」：`:1149 :1175 :1201 :1292 :1501 :1512 :1527 :1534`——真实 Godot Web 包确未上线。
- 「整理 Sector/Boss 设计说明」「沉淀复盘文章」「整理操作说明」等纯内容沉淀项。
- `:1539-1543` 的兜底文案（fallback），属通用占位，保留。

## 3. Space War 避免误称 Web 包已上线

当前风险点与处理建议：
- `portfolio.ts:156` role「Web 展示」、`:158` stack「Web 导出」：技术上 Godot 支持 Web 导出属实，但易被读成「已提供网页试玩」。建议改为「Web 导出（计划）」或移除 stack 中的「Web 导出」，避免与未上线状态冲突。
- `:160` link `查看页面 /games/space-war` 指向的是站内展示页，非真实试玩。`App.tsx:1721` 详情已写明「Web 试玩接入计划」，措辞正确，应保持。
- `App.tsx:1527` stage「已形成可玩、可导出、可说明的发布质量小项目，后续重点是把 Web 试玩入口接入本站」措辞稳妥，保留。
- `showcase-assets.md:22`「真实 Godot Web 包后续单独接入」口径正确，作为全站统一口径基准。
- 核心原则：可说「Windows 已导出验证 / 站内有展示入口 / Web 试玩计划接入」，不可说「Web 试玩已上线 / 点此试玩」。

## 4. 验证命令

```bash
git status --short --branch
npm run lint
npm run build
```

建议补充自查：
```bash
grep -rn "补充中\|接入 Web\|Web 试玩\|Web 导出" src/App.tsx src/data/portfolio.ts docs/showcase-assets.md
```
用于改后复核剩余表述是否口径一致。
