# 项目详情页图文案例化增强 Implement

## Step 1. Audit

- 阅读 `src/data/portfolio.ts`、`src/pages/ProjectDetailPage.tsx`、项目图片目录和状态数据。
- 列出每个重点项目当前 hero 图、正文长度、外链、状态、可用截图来源。
- 标记错误/无关/缺失的图片。

## Step 2. Model

- 为项目详情增加可选 `caseSections` / `visualBlocks` 数据结构。
- 保持旧项目数据兼容；没有视觉块的项目也能正常渲染。
- 若 TypeScript 类型集中定义，补充类型并保证字段命名清楚。

## Step 3. UI

- 在详情页正文中渲染多个案例 section。
- 增加视觉块组件样式：截图、架构、流程、状态证据等。
- 检查移动端响应式、图片比例、标题长度、按钮区不溢出。

## Step 4. Content

- 先补核心项目：
  - BIAU Port / 公开助手。
  - Legal RAG。
  - ERP。
  - Pet。
  - Xunqiu。
  - Game/Playlab。
- 每个项目至少补：
  - 一个真实 UI/展示截图或明确 diagram。
  - 一个流程/架构/数据流视觉块。
  - 当前状态和后续优化方向。

## Step 5. Consistency

- 对照状态页和外链，避免把 gated/planned/unchecked 写成 online。
- 对照公开助手知识数据，必要时重新生成或更新知识摘要。
- 不暴露敏感平台、账号、密钥、后台截图和未批准下载。

## Step 6. Validation

- `npm.cmd run lint`
- `npm.cmd run build`
- 如有相关脚本，运行项目页、外链、状态页或 UI 检查。
- `git diff --check`
- 手动检查桌面和移动端关键项目详情页。

## Commit Plan

- 第一提交：数据模型和渲染能力。
- 第二提交：核心项目内容和视觉资产。
- 第三提交：一致性/状态/助手知识同步，如需要。
