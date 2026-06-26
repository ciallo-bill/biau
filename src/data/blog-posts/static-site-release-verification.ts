import type { BlogPost } from '../blogShared'

const post: BlogPost = {
  "slug": "static-site-release-verification",
  "title": "静态站发布验证：构建、缓存、资源指纹与线上检查",
  "tag": "全栈开发",
  "category": "tech",
  "detail": "静态站上线不只是 push 代码。本文讨论如何用构建产物、资源指纹、缓存刷新、内容扫描和线上 bundle 抽查确认发布真的生效。",
  "date": "2026-06-20",
  "readTime": "9 min",
  "series": "公开站点与内容系统",
  "knowledgePoints": [
    "静态站部署",
    "构建验证",
    "线上检查"
  ],
  "scenarios": [
    "Cloudflare Pages 发布",
    "Vite 静态站",
    "内容站持续更新"
  ],
  "practiceChecklist": [
    "每次发布前运行 build、lint、diff check 和公开禁用词扫描",
    "记录新的 assets/index-*.js 资源指纹",
    "上线后检查 HTML 是否引用新资源，并抽查 bundle 内容"
  ],
  "sections": [
    {
      "title": "问题背景：代码推送不等于线上更新",
      "body": "静态站点通常由构建产物和 CDN 缓存共同决定线上内容。代码已经 push，不代表用户立刻看到新页面；构建失败、缓存未刷新、资源指纹未切换或旧 bundle 仍被引用，都可能让线上内容停留在旧版本。发布验证就是把这些不确定性变成可检查步骤。"
    },
    {
      "title": "本地验证：先保证产物能生成",
      "body": "发布前至少运行类型检查、构建、lint 和格式检查。对于内容站，还要扫描公开不适合的词、私有路径、服务地址和敏感配置。构建产物中的 assets/index-*.js 是重要线索，它能帮助后续确认线上 HTML 是否已经切到新版本。"
    },
    {
      "title": "资源指纹：用文件名判断版本切换",
      "body": "Vite 构建会为 JS 和 CSS 生成带 hash 的资源文件。内容变更后，新的 index-*.js 文件名通常会变化。发布时记录这个资源名，线上验证时读取首页 HTML，检查是否包含新资源。如果 HTML 仍引用旧资源，说明部署或缓存还没有完成。"
    },
    {
      "title": "线上抽查：检查页面和 bundle 内容",
      "body": "首页 HTML 切到新资源后，还可以直接读取线上 JS bundle，检查新文章 slug、新项目标识或关键文案是否存在，同时确认禁用词和敏感短语没有进入产物。这个检查比只刷新浏览器更可靠，也方便记录发布证据。"
    },
    {
      "title": "工程取舍：验证流程要轻但稳定",
      "body": "小型静态站不一定需要复杂 CI，但每次内容更新都应该有固定验证顺序：build、lint、扫描、diff check、commit、push、等待部署、检查 HTML、抽查 bundle。步骤清楚后，内容更新就不会变成凭感觉发布。"
    },
    {
      "title": "项目例子：blog-semi 的发布闭环",
      "body": "blog-semi 每次公开文章更新后，会先在本地构建并记录新资源，再提交推送到远程，等待 Cloudflare Pages 部署完成后检查线上 HTML 是否引用新资源，最后读取线上 bundle 确认新 slug 存在且不包含不适合公开的信息。这样公开内容更新有完整证据链。"
    }
  ],
  "takeaways": [
    "静态站发布要验证构建产物、资源指纹和线上 HTML。",
    "内容站还要扫描公开信息边界，避免敏感内容进入 bundle。",
    "固定发布检查流程能让每次更新都有证据，而不是只依赖浏览器刷新。"
  ]
}

export default post
