export type BlogColumn = 'knowledge' | 'project-notes' | 'resources' | 'ai-daily' | 'build-log'

export interface BlogColumnMeta {
  id: BlogColumn
  titleZh: string
  titleEn: string
  description: string
  scope: string
  avoid: string
}

export const blogColumnOrder: BlogColumn[] = [
  'knowledge',
  'project-notes',
  'resources',
  'ai-daily',
  'build-log',
]

export const blogColumnMeta: Record<BlogColumn, BlogColumnMeta> = {
  knowledge: {
    id: 'knowledge',
    titleZh: '知识积累',
    titleEn: 'Knowledge Notes',
    description: '沉淀可复用的技术理解、工程方法与 AI 应用实践。',
    scope: '适合长期有效的技术总结、架构理解、工程治理、AI 应用方法。',
    avoid: '避免写成单个项目流水账、新闻搬运或没有验证的观点堆叠。',
  },
  'project-notes': {
    id: 'project-notes',
    titleZh: '项目总结',
    titleEn: 'Project Notes',
    description: '记录项目阶段复盘、关键问题、架构取舍与后续迭代方向。',
    scope: '适合项目复盘、踩坑修复、演进路线、阶段验收与架构取舍。',
    avoid: '避免复制项目详情页已有的功能清单、技术栈、演示入口和稳定事实。',
  },
  resources: {
    id: 'resources',
    titleZh: '资源分享',
    titleEn: 'Resource Picks',
    description: '分享工具、文章、仓库、模型、课程、素材等资源与个人使用笔记。',
    scope: '适合用户主动推荐并附带判断、使用场景和适用人群的资源。',
    avoid: '避免自动生成无筛选的链接堆、资源模板或没有个人判断的清单。',
  },
  'ai-daily': {
    id: 'ai-daily',
    titleZh: 'AI 日报',
    titleEn: 'AI Daily',
    description: '记录 AI 模型、工具、行业案例和可试能力的高频动态。',
    scope: '适合有来源支撑的模型更新、工具变化、行业动态和短周期观察。',
    avoid: '避免未核实消息、长期方法论文章和无法追溯来源的快讯。',
  },
  'build-log': {
    id: 'build-log',
    titleZh: '构建手记',
    titleEn: 'Build Log',
    description: '记录网站、内容系统、AI 助手与 Trellis 工作流的构建过程。',
    scope: '适合系统演进、工作流改造、内容治理、自动化和发布过程复盘。',
    avoid: '避免与项目详情页重复的稳定展示文案或无结论的过程记录。',
  },
}

export type BlogPost = {
  slug: string
  title: string
  tag: string
  column: BlogColumn
  detail: string
  date: string
  readTime: string
  series?: string
  knowledgePoints?: string[]
  scenarios?: string[]
  practiceChecklist?: string[]
  sections: Array<{ title: string; body: string }>
  takeaways: string[]
}

export type BlogPostSummary = Pick<
  BlogPost,
  'slug' | 'title' | 'tag' | 'column' | 'detail' | 'date' | 'readTime' | 'series' | 'knowledgePoints'
>
