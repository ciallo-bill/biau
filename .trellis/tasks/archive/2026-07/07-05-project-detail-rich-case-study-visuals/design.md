# 项目详情页图文案例化增强 Design

## Current Problem

当前项目详情页更接近“项目资料卡”：顶部有一张主图，正文多为短文本和列表。它不足以解释项目的实现、架构、流程、质量证据和真实成熟度；同时部分配图可能与项目内容不匹配，容易削弱访客信任。

## Proposed Shape

### Data Model

在现有项目数据结构上增加正文视觉内容块，不破坏已有项目卡片和列表页字段。

推荐新增字段：

```typescript
type ProjectVisualBlock = {
  id: string
  type: 'screenshot' | 'architecture' | 'workflow' | 'data-flow' | 'status' | 'release' | 'diagram'
  title: string
  description: string
  image?: string
  alt?: string
  caption?: string
  sourceLabel?: string
  sourceUrl?: string
}

type ProjectCaseSection = {
  id: string
  title: string
  body: string[]
  visual?: ProjectVisualBlock
}
```

落点优先放在 `src/data/portfolio.ts` 或相邻数据文件；如果文件过大，再拆为 `src/data/projectCases.ts`。

### Rendering

`ProjectDetailPage.tsx` 增加正文案例区：

- 顶部 hero 保留，但只作为项目第一印象。
- 正文按 section 渲染，每个 section 可选一个视觉块。
- 视觉块样式根据类型轻微区分，但保持主站设计一致。
- 架构图/流程图可以先用本地 SVG/PNG 资产；如果用 Mermaid，只作为构建时或静态渲染方案，不在页面内引入重型运行时。

### Asset Policy

- 真实截图优先，来源必须是公开页面、公开 App 展示页或用户已允许展示的界面。
- 私有控制台、后台账号、生产密钥、私有 URL、未批准下载链接不得入图或入文。
- 无截图时使用抽象流程图/架构图，并在说明中保持诚实。
- 图片放在 `public/images/projects/` 下按项目分组。

### Consistency

项目详情页必须与以下数据保持一致：

- `src/data/statusTargets.ts`
- public status JSON
- 首页项目卡片入口和外链
- 公开助手项目知识
- APK/登录/模型/演示访问等人工门禁

### Rollback

数据模型新增字段应为可选字段。若某个项目视觉内容暂时不成熟，页面仍可回退到旧的文本渲染，不影响构建和其它项目详情页。
