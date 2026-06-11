export type ProjectCategory = 'ai' | 'business' | 'interactive' | 'mobile' | 'platform'
export type ProjectStatus = 'main' | 'live' | 'mvp' | 'ongoing' | 'pending'

export interface Project {
  id: string
  title: string
  summary: string
  category: ProjectCategory
  status: ProjectStatus
  role: string
  path: string
  image?: string
  stack: string[]
  highlights: string[]
  links: {
    label: string
    href: string
    type: 'internal' | 'workspace' | 'external'
  }[]
}

export const categoryLabels: Record<ProjectCategory, string> = {
  ai: 'AI 应用',
  business: '业务系统',
  interactive: '互动体验',
  mobile: '移动端',
  platform: '博客系统',
}

export const statusLabels: Record<ProjectStatus, string> = {
  main: '重点展示',
  live: '已有页面',
  mvp: 'MVP',
  ongoing: '建设中',
  pending: '待整理',
}

export const projects: Project[] = [
  {
    id: 'legal-rag',
    title: 'Legal RAG｜法律智能机器人与合同审查',
    summary: '法律合同 RAG 全栈 MVP，包含文档导入、条款切分、引用溯源、问答和合同风险审查。',
    category: 'ai',
    status: 'main',
    role: '全栈 MVP / RAG 流程 / 合同审查工作台',
    path: 'D:\\workspace4Codex\\legal-rag',
    image: '/images/projects/showcase/legal-rag-reviewed.png',
    stack: ['Vue 3', 'Express', 'TypeScript', 'RAG', 'Mock Embedding'],
    highlights: ['知识库导入', 'RAG 问答', '合同风险审查', '引用 citations'],
    links: [
      { label: '工程目录', href: 'D:\\workspace4Codex\\legal-rag', type: 'workspace' },
      { label: '本页查看', href: '#legal-rag', type: 'internal' },
    ],
  },
  {
    id: 'pet-workspace',
    title: 'Pet Workspace｜AI 宠物生成与审核管线',
    summary: '围绕 gamer、fantasy-pet-rule、Android 与生成管线组织的 AI 宠物项目工作区。',
    category: 'ai',
    status: 'main',
    role: '生成管线 / QA gate / App API 契约 / Android 联调',
    path: 'D:\\workspace4Codex\\pet',
    image: '/images/projects/showcase/fantasy-pet-flow.png',
    stack: ['Agent', 'Worker', 'QA Gate', 'Android', 'Docker'],
    highlights: ['任务状态机', '生成审核', '人审发布', 'App-facing API'],
    links: [
      { label: '工程目录', href: 'D:\\workspace4Codex\\pet', type: 'workspace' },
      { label: '本页查看', href: '#pet-workspace', type: 'internal' },
    ],
  },
  {
    id: 'ozon-erp',
    title: 'Ozon 电商 ERP',
    summary: '面向小团队自用的 Ozon ERP，覆盖 Vue 管理后台、Node API、Prisma、BullMQ Worker 和 Chrome 采集插件。',
    category: 'business',
    status: 'main',
    role: '业务系统 / 管理后台 / API / Worker / 浏览器插件',
    path: 'D:\\workspace4Codex\\erp',
    image: '/images/projects/showcase/erp-cover.svg',
    stack: ['Vue 3', 'Express', 'Prisma', 'PostgreSQL', 'BullMQ', 'WXT'],
    highlights: ['商品与订单同步', '采集铺货', '审批中心', '审计日志'],
    links: [
      { label: '工程目录', href: 'D:\\workspace4Codex\\erp', type: 'workspace' },
      { label: '本页查看', href: '#ozon-erp', type: 'internal' },
    ],
  },
  {
    id: 'biau-playlab',
    title: 'Biau Playlab｜Astro 博客系统',
    summary: '旧博客与游戏展示站，整合 Godot 游戏项目、开发日志、系统设计文章和迁移内容。',
    category: 'platform',
    status: 'live',
    role: 'Astro 博客 / 内容审计 / Cloudflare Pages 部署',
    path: 'D:\\workspace4Codex\\blog',
    stack: ['Astro', 'Content Collections', 'Cloudflare Pages'],
    highlights: ['游戏项目展示', '开发日志', '内容审计', '静态部署'],
    links: [{ label: '旧站目录', href: 'D:\\workspace4Codex\\blog', type: 'workspace' }],
  },
  {
    id: 'blog-semi',
    title: 'Biau Blog｜React + Semi 博客系统',
    summary: '当前正在重构的博客展示系统，用 Semi Design 承载项目展示、案例说明、资源内容和部署入口。',
    category: 'platform',
    status: 'ongoing',
    role: '博客信息架构 / React 前端 / Semi 组件体系',
    path: 'D:\\workspace4Codex\\blog-semi',
    stack: ['React', 'Vite', 'TypeScript', 'Semi Design'],
    highlights: ['多视图博客系统', '项目目录', '案例展示', '后续部署'],
    links: [{ label: '当前站点', href: '#blog-semi', type: 'internal' }],
  },
  {
    id: 'game-first-tetris',
    title: 'game-first-tetris',
    summary: 'Tetris 方向的 Web 游戏项目，适合作为游戏项目入口和试玩案例展示。',
    category: 'interactive',
    status: 'live',
    role: 'Godot / Web 游戏 / 试玩入口',
    path: 'D:\\workspace4Codex\\game-first-tetris',
    stack: ['Godot', 'Web Export', 'Game Prototype'],
    highlights: ['方块玩法', 'Web 试玩', '游戏项目展示'],
    links: [{ label: '查看页面', href: 'http://127.0.0.1:4173/games/first-tetris', type: 'external' }],
  },
  {
    id: 'game-next-spacewar',
    title: 'game-next-spacewar',
    summary: 'Spacewar 方向的 Web 游戏项目，展示太空射击玩法、敌人节奏和关卡推进。',
    category: 'interactive',
    status: 'live',
    role: 'Godot / Spacewar / Web 试玩',
    path: 'D:\\workspace4Codex\\game-next-spacewar',
    stack: ['Godot', 'Spacewar', 'Web Export'],
    highlights: ['太空射击', '敌人节奏', '关卡推进'],
    links: [{ label: '查看页面', href: 'http://127.0.0.1:4173/games/next-spacewar', type: 'external' }],
  },
  {
    id: 'intespace',
    title: 'intespace',
    summary: '空间探索和战斗方向的互动项目，用于展示实时操控、视觉包装和 Web 展示能力。',
    category: 'interactive',
    status: 'live',
    role: 'Godot / 空间互动 / 展示页面',
    path: 'D:\\workspace4Codex\\intespace',
    stack: ['Godot', 'Gameplay', 'Web'],
    highlights: ['空间移动', '战斗反馈', '视觉包装'],
    links: [{ label: '查看页面', href: 'http://127.0.0.1:4173/games/intespace', type: 'external' }],
  },
  {
    id: 'raiden-prototype',
    title: 'raiden-prototype',
    summary: '纵版射击 STG 原型项目，展示弹幕节奏、关卡推进和 Web 试玩能力。',
    category: 'interactive',
    status: 'live',
    role: 'Godot / STG / 原型验证',
    path: 'D:\\workspace4Codex\\raiden-prototype',
    stack: ['Godot', 'STG', 'Prototype'],
    highlights: ['弹幕节奏', '关卡推进', '试玩页面'],
    links: [{ label: '查看页面', href: 'http://127.0.0.1:4173/games/raiden', type: 'external' }],
  },
  {
    id: 'space-war',
    title: 'space-war',
    summary: '太空战斗 Web 项目，保留战斗系统、可试玩版本和独立项目沉淀。',
    category: 'interactive',
    status: 'live',
    role: 'Godot / Combat / Web 展示',
    path: 'D:\\workspace4Codex\\space-war',
    stack: ['Godot', 'Combat', 'Web'],
    highlights: ['战斗系统', 'Web 试玩', '项目沉淀'],
    links: [{ label: '查看页面', href: 'http://127.0.0.1:4173/games/space-war', type: 'external' }],
  },
  {
    id: 'xunqiu',
    title: 'xunqiu｜移动端业务系统',
    summary: '包含 Android、服务端、发布包和历史交付资料的移动端业务系统，当前需要进一步整理展示材料。',
    category: 'mobile',
    status: 'pending',
    role: 'Android / 服务端资料 / 交付包整理',
    path: 'D:\\workspace4Codex\\xunqiu',
    stack: ['Android', 'Server', 'Release'],
    highlights: ['移动端工程', '服务端资料', '发布包整理'],
    links: [{ label: '工程目录', href: 'D:\\workspace4Codex\\xunqiu', type: 'workspace' }],
  },
]

export const capabilityTracks = [
  { title: 'AI 应用', detail: 'RAG、Agent、引用溯源、审核闭环', value: 'Legal RAG / Pet Workspace' },
  { title: '业务系统', detail: '后台、API、数据库、队列、审计日志', value: 'Ozon 电商 ERP' },
  { title: '互动体验', detail: 'Godot Web 导出、试玩入口、游戏展示页', value: '5 个游戏项目' },
  { title: '博客系统', detail: 'React + Semi、Astro、内容审计、部署准备', value: 'Biau Blog / Playlab' },
]

export const articles = [
  { title: 'Legal RAG 项目说明', tag: 'AI 应用', status: '可整理' },
  { title: 'Ozon 电商 ERP 交付说明', tag: '业务系统', status: '可整理' },
  { title: 'Pet Workspace 架构边界', tag: 'AI 应用', status: '待补图' },
  { title: 'Godot Web 游戏展示规范', tag: '互动体验', status: '待整理' },
]
