export type ProjectCategory = 'ai' | 'business' | 'interactive' | 'mobile' | 'platform'
export type ProjectStatus = 'main' | 'live' | 'mvp' | 'ongoing'

import { OZON_ERP_ENTRY_URL } from './siteLinks'

export interface ProjectLink {
  label: string
  href: string
  type: 'internal' | 'external'
}

export type ProjectDetailContentKey =
  | 'overview'
  | 'workflow'
  | 'architecture'
  | 'quality'
  | 'limitations'
  | 'roadmap'

export interface ProjectDetailSection {
  title: string
  body?: string
  items?: string[]
  links?: ProjectLink[]
}

export type ProjectDetailContent = Partial<Record<ProjectDetailContentKey, ProjectDetailSection[]>>

export interface Project {
  id: string
  title: string
  summary: string
  category: ProjectCategory
  status: ProjectStatus
  role: string
  image?: string
  stack: string[]
  highlights: string[]
  detailLink?: ProjectLink
  links: ProjectLink[]
  detailContent?: ProjectDetailContent
  assistantContext?: string[]
}

const GAME_SITE_URL = 'https://games.playlab.eu.cc'
const PLAY_SITE_URL = 'https://play.playlab.eu.cc'
const XUNQIU_SITE_URL = 'https://xunqiu.playlab.eu.cc'

function externalLink(label: string, href: string): ProjectLink {
  return { label, href, type: 'external' }
}

function internalLink(label: string, href: string): ProjectLink {
  return { label, href, type: 'internal' }
}

function gameSiteLink(slug: string): ProjectLink {
  return externalLink('游戏站详情', `${GAME_SITE_URL}/games/${slug}/`)
}

function gamePlayLink(slug: string): ProjectLink {
  return externalLink('Web 试玩', `${PLAY_SITE_URL}/${slug}/index.html`)
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
}

export const projectDetailGroupLabels: Record<ProjectDetailContentKey, string> = {
  overview: '案例概览',
  workflow: '工作台能力',
  architecture: '实现与架构',
  quality: '质量与验证',
  limitations: '当前边界',
  roadmap: '后续优化',
}

export const projects: Project[] = [
  {
    id: 'legal-rag',
    title: 'Legal RAG｜法律智能机器人与合同审查',
    summary: '已部署的法律文档 RAG 与合同风险审查工作台，覆盖公开安全数据集导入、引用溯源问答、合同审查、质量评测和诊断面板。',
    category: 'ai',
    status: 'main',
    role: '全栈 MVP / RAG 流程 / 合同审查工作台',
    image: '/images/projects/showcase/legal-rag-reviewed.png',
    stack: ['Vue 3', 'Express', 'TypeScript', 'PostgreSQL', 'pgvector', 'RAG'],
    highlights: ['公开安全数据集', 'Hybrid Retrieval', '引用与诊断', '规则优先合同审查'],
    links: [
      externalLink('在线工作台', 'https://legal-rag-web.onrender.com'),
      externalLink('API Health', 'https://legal-rag-api-9bki.onrender.com/api/health'),
    ],
    detailContent: {
      overview: [
        {
          title: '从“问答机器人”推进到可演示工作台',
          body:
            'Legal RAG 的重点不是把合同丢给模型后返回一段结论，而是把文档入库、检索、引用、诊断、合同风险项和质量评测组织成一个可操作的工作台。访客可以看到知识库、问答、审查结果和质量面板，理解 AI 结论来自哪些片段以及系统为什么选择回答或拒答。',
        },
        {
          title: '公开演示只使用安全材料',
          body:
            '公开演示围绕已脱敏或公开安全的数据集展开，展示登录后的知识库初始化、RAG 问答、合同审查和质量报告，不暴露演示密码、模型密钥、数据库连接串或部署后台信息。',
        },
      ],
      workflow: [
        {
          title: '知识库与问答链路',
          items: [
            '支持文本、TXT、PDF、DOCX 和公共数据集进入 ingestion job，再生成可追踪的 document 与 chunk。',
            '问答结果附带 citations 和 diagnostics，帮助用户检查命中文档、片段、召回路径和回答边界。',
            '项目空间、文档、导入任务、问答、质量报告、评测运行和审计日志在后端路由中分别建模。',
          ],
        },
        {
          title: '合同审查链路',
          items: [
            '合同审查优先由确定性规则召回付款、交付、违约责任、知识产权、争议解决和终止等风险。',
            '模型只在已召回风险上辅助改写解释和建议，输出必须通过 schema 校验；不可用或不合法时回退到规则结果。',
          ],
        },
      ],
      architecture: [
        {
          title: 'RAG pipeline',
          body:
            '导入内容会先清洗文本，再按项目作用域做 SHA-256 去重和章节感知切分；随后通过 embedding provider 写入 memory 或 PostgreSQL + pgvector。查询时先做 query rewrite，再结合向量召回和关键词召回，经过候选合并、过滤、rerank 与可回答性判断，最后生成 grounded answer 或拒答，并返回 citations 与 diagnostics。',
        },
        {
          title: '全栈与部署形态',
          body:
            '项目采用 workspace monorepo：Web 端是 Vue 3、Vite、TypeScript，API 端是 Node.js、Express、TypeScript，并通过 shared package 复用请求/响应类型。API Dockerfile 会构建 shared 与 API 输出、复制数据集并暴露服务端口，线上演示使用可替换的模型与向量存储适配器。',
        },
        {
          title: '适配器取舍',
          body:
            '本地或轻量演示可以使用 mock provider 与 memory vector store；需要持久化与线上演示时切换到 OpenAI-compatible provider、PostgreSQL 与 pgvector。这个边界让演示、开发和部署不被单一模型或向量库绑定。',
        },
      ],
      quality: [
        {
          title: '评测与质量面板',
          body:
            '仓库中保留 RAG 问答和合同审查的 eval fixtures，API 也提供 quality 与 evaluation 报告路由。页面中的质量面板用于展示检索命中、引用、结构化审查等维度，让调整 chunk、召回、rerank 或提示词时有可对比的基线。',
        },
        {
          title: '可解释性优先',
          items: [
            '问答要求基于召回片段生成，引用不足时可以拒答或返回边界说明。',
            '合同审查的高风险项来自规则命中，模型增强只改变表达，不绕过风险识别和 schema 校验。',
            '审计与诊断信息帮助复盘一次回答从导入、检索到生成的关键步骤。',
          ],
        },
      ],
      limitations: [
        {
          title: '当前边界',
          items: [
            '公开页面只展示脱敏演示能力，不提供真实法律意见，也不公开内部凭据或运营后台细节。',
            '演示数据集覆盖的是可公开展示场景，真实业务还需要更完整的权限、数据治理、人工复核和合规流程。',
            '复杂扫描件、低质量 PDF、跨文档长链推理和专业法域覆盖仍适合作为后续增强方向。',
          ],
        },
      ],
      roadmap: [
        {
          title: '下一轮版本迭代方向',
          items: [
            '补充数据库用户、邀请和更细的项目空间权限，让公开演示和团队试用边界更清楚。',
            '扩展更多脱敏法律数据集，并把评测趋势沉淀成可长期比较的质量报告。',
            '加强 OCR、rerank 模型、CI 与镜像发布，让导入质量、召回排序和部署可复现性继续提升。',
          ],
        },
      ],
    },
    assistantContext: [
      'Legal RAG 是已部署的全栈法律文档 RAG 与合同审查工作台，前端使用 Vue 3/Vite/TypeScript，后端使用 Express/TypeScript，共享类型包连接 Web 与 API。',
      '系统支持公开安全数据集和文档导入，RAG pipeline 包含清洗、项目级 SHA-256 去重、章节感知 chunk、embedding、memory/pgvector 存储、query rewrite、向量+关键词混合召回、merge/filter/rerank、grounded answer 或 refusal、citations 与 diagnostics。',
      '合同审查采用规则优先策略，规则召回付款、交付、违约责任、知识产权、争议解决和终止等风险；模型只辅助改写已召回风险的解释和建议，并在 schema 校验失败时回退到规则结果。',
      '项目包含 RAG 与合同审查 eval fixtures、quality/evaluation 报告路由和质量面板，适合说明 AI 应用如何做引用溯源、可解释风险审查和质量评测。',
      '后续优化方向包括更完整的用户/邀请权限、更多脱敏数据集、评测趋势、OCR、rerank 模型、CI 与镜像发布。',
    ],
  },
  {
    id: 'pet-workspace',
    title: 'AI 宠物生成与审核管线',
    summary: '围绕 App 端、生成规则服务、Android 验证与生成管线组织的 AI 宠物项目工作区。',
    category: 'ai',
    status: 'main',
    role: '生成管线 / 质量门禁 / App 接口契约 / Android 联调',
    image: '/images/projects/showcase/fantasy-pet-flow.png',
    stack: ['Agent', 'Worker', '质量门禁', 'Android', 'Docker'],
    highlights: ['任务状态机', '生成审核', '人审发布', 'App 接口契约'],
    links: [],
  },
  {
    id: 'ozon-erp',
    title: 'Ozon 电商 ERP',
    summary: '面向小团队自用的 Ozon ERP，覆盖 Vue 管理后台、Node API、Prisma、Redis/BullMQ Worker 和 Chrome MV3 采集插件。',
    category: 'business',
    status: 'main',
    role: '业务系统 / 管理后台 / API / Worker / 浏览器插件',
    image: '/images/projects/showcase/erp-cover.svg',
    stack: ['Vue 3', 'Express', 'Prisma', 'PostgreSQL', 'Redis', 'BullMQ', 'WXT'],
    highlights: ['店铺授权', '商品与订单同步', '采集铺货', '审计日志'],
    links: [
      externalLink('访问 ERP', OZON_ERP_ENTRY_URL),
      internalLink('架构文章', '/blog/ozon-erp-architecture'),
    ],
  },
  {
    id: 'biau-playlab',
    title: 'Biau Playlab｜游戏作品集与系统设计内容站',
    summary: '基于 Astro 的独立游戏内容站，整合六个 Godot 游戏原型、Web 试玩、系统设计文章和开发日志。',
    category: 'platform',
    status: 'live',
    role: 'Astro 作品集 / Godot 游戏展示 / 系统设计文章 / Cloudflare Pages',
    stack: ['Astro 5', 'Content Collections', 'Godot Web', 'Cloudflare Pages'],
    highlights: ['六个游戏案例', 'Web 试玩入口', '系统设计文章', '开发日志'],
    detailLink: externalLink('进入游戏站', `${GAME_SITE_URL}/`),
    links: [
      externalLink('游戏站', `${GAME_SITE_URL}/`),
      externalLink('源码仓库', 'https://github.com/ciallo-bill/blog'),
    ],
  },
  {
    id: 'blog-semi',
    title: 'React + Semi 博客系统｜当前主站',
    summary: '当前主站，用 React 与 Semi Design 组织首页、项目、案例、博客、详情路由、主题切换和自动部署。',
    category: 'platform',
    status: 'ongoing',
    role: 'React 主站 / Semi 组件体系 / 项目案例路由 / 自动部署',
    stack: ['React', 'Vite', 'TypeScript', 'Semi Design'],
    highlights: ['多视图主站', '项目详情', '案例详情', '自动部署'],
    links: [],
  },
  {
    id: 'game-first-tetris',
    title: '俄罗斯方块原型｜Tetris',
    summary: 'Godot 4 俄罗斯方块原型，包含经典计分、软降/硬降得分、combo、back-to-back、肉鸽三选一强化、触屏桥接、响应式布局和截图回归。',
    category: 'interactive',
    status: 'live',
    role: 'Godot 引擎 / Web 试玩 / 触屏适配',
    image: '/images/projects/showcase/tetris-classic-desktop.png',
    stack: ['Godot 4', 'Web 导出', '游戏原型'],
    highlights: ['经典计分', '软硬降得分', 'combo/B2B', '触屏输入'],
    detailLink: gameSiteLink('first-tetris'),
    links: [gameSiteLink('first-tetris'), gamePlayLink('first-tetris')],
  },
  {
    id: 'game-next-spacewar',
    title: '太空战机｜展示构建',
    summary: 'Godot 4.6 太空射击展示构建，补齐三波短任务、漂移/装甲目标、障碍压力、击破连击、波次奖励、主菜单、帮助、暂停、结果页和单局复盘。',
    category: 'interactive',
    status: 'live',
    role: 'Godot 展示构建 / 战斗循环 / 单局复盘',
    image: '/images/projects/showcase/next-spacewar-menu.png',
    stack: ['Godot 4.6', '太空射击', 'Web 导出'],
    highlights: ['三波短任务', '击破连击', '波次奖励', '结果复盘'],
    detailLink: gameSiteLink('next-spacewar'),
    links: [gameSiteLink('next-spacewar'), gamePlayLink('next-spacewar')],
  },
  {
    id: 'intespace',
    title: '竖屏肉鸽射击｜intespace',
    summary: '竖屏自动射击肉鸽游戏，围绕章节推进、生存挑战、Boss 试炼、武器树、局内升级、局外成长和集成试玩收口。',
    category: 'interactive',
    status: 'live',
    role: 'Godot 引擎 / 肉鸽玩法 / 武器树 / 局外成长',
    image: '/images/projects/showcase/intespace-player-hub.png',
    stack: ['Godot', '肉鸽玩法', '武器树系统', '移动端优先'],
    highlights: ['章节推进', '生存挑战', 'Boss 试炼', '局外成长'],
    detailLink: gameSiteLink('intespace'),
    links: [gameSiteLink('intespace'), gamePlayLink('intespace')],
  },
  {
    id: 'raiden-prototype',
    title: '纵版弹幕射击｜垂直切片',
    summary: 'Godot 纵版射击垂直切片，覆盖双关卡章节、火力成长、连锁击破奖励、首领相位、章节过场和试玩验证。',
    category: 'interactive',
    status: 'live',
    role: 'Godot 引擎 / 纵版射击 / 原型验证',
    image: '/images/projects/showcase/raiden-main-menu.png',
    stack: ['Godot', '纵版射击', '原型验证'],
    highlights: ['双关卡章节', '连锁击破', '首领收束', '试玩验证'],
    detailLink: gameSiteLink('raiden'),
    links: [gameSiteLink('raiden'), gamePlayLink('raiden')],
  },
  {
    id: 'space-war',
    title: '复古横版射击｜space-war',
    summary: '复古横向太空射击完整版本，包含五个 Sector、连续击破奖励、首领战、道具、高分、结果页、程序化音效和发布文档。',
    category: 'interactive',
    status: 'live',
    role: 'Godot 引擎 / 复古射击 / 发布版 / 展示入口',
    image: '/images/projects/showcase/space-war-gameplay.png',
    stack: ['Godot 4.6', '复古射击', 'Web 包计划'],
    highlights: ['五个 Sector', '连续击破', '高分结算', '发布文档'],
    detailLink: gameSiteLink('space-war'),
    links: [gameSiteLink('space-war'), gamePlayLink('space-war')],
  },
  {
    id: 'spacewar-ii',
    title: '移动纵向射击｜Spacewar II',
    summary: 'Godot 4.6 纵向移动射击续作原型，围绕差异化敌群、Boss 阶段、多向弹幕、拾取升级、炸弹、短窗口连击、清关资源结算、紧凑 HUD 和结果页接入第六个 Web 试玩位。',
    category: 'interactive',
    status: 'live',
    role: 'Godot 引擎 / 纵向射击 / Web 试玩 / 第六项目接入',
    image: '/images/projects/showcase/spacewar-ii-menu.png',
    stack: ['Godot 4.6', '移动射击', 'Web 导出'],
    highlights: ['差异化敌群', '短窗口连击', 'Boss 阶段', '结果结算'],
    detailLink: gameSiteLink('spacewar-ii'),
    links: [gameSiteLink('spacewar-ii'), gamePlayLink('spacewar-ii')],
  },
  {
    id: 'xunqiu',
    title: '寻球｜移动端与现代后端重建',
    summary: '足球社群移动端迁移案例：旧版 App 和旧后端保留历史链路，新 64 位 Android 客户端接入 Spring Boot 3、PostgreSQL、Render 与 R2 上传链路。',
    category: 'mobile',
    status: 'main',
    role: 'Android 64 位 / Spring Boot 3 / Render / R2',
    image: '/images/projects/showcase/xunqiu-android64-runtime.png',
    stack: ['Android 64', 'Java 17', 'Spring Boot 3', 'PostgreSQL', 'Flyway', 'Cloudflare R2', 'Render'],
    highlights: ['新旧链路分流', '旧接口兼容', '短视频上传播放', '测试矩阵与烟测'],
    links: [
      externalLink('产品展示页', `${XUNQIU_SITE_URL}/`),
      externalLink('新后端仓库', 'https://github.com/Drew-Z/xunqiu-backend-modern'),
    ],
    detailContent: {
      overview: [
        {
          title: '从旧足球社区 App 到可演示的新链路',
          body:
            '寻球围绕足球社群、球队管理、约赛日程、动态内容、短视频和球场信息展开。这个项目的核心不是简单升级一个 Android 包，而是把旧客户端、旧 Java WAR 后端、现代后端和 64 位新客户端拆开治理，让公开展示能说明产品路径、迁移边界和工程验证。',
        },
        {
          title: '新旧并行降低迁移风险',
          body:
            '旧版客户端继续对应旧后端和历史接口，64 位新客户端通过配置化 Host 接入现代后端。这样可以保留旧包可回滚的安全边界，同时让新客户端独立验证登录、动态、球队、约赛、球场和短视频等核心体验。',
        },
      ],
      workflow: [
        {
          title: '移动端核心工作流',
          items: [
            '新客户端以单 Activity shell 承接登录、首次偏好、首页、社区、动态、短视频、日程、赛事、球场、球币和个人页等页面。',
            '动态链路支持列表、精选、详情、点赞、评论、文字动态和单图动态发布；发布完成后可以回到内容流或个人主页。',
            '球队和约赛链路覆盖我的球队、球队主页、成员、邀请码、临时队员、队费安全页、日程、活动创建、报名、待定和请假等入口。',
          ],
        },
        {
          title: '短视频上传与播放',
          items: [
            '短视频链路包含文件选择、大小和时长校验、封面预览、上传前确认、multipart 上传、列表回流、播放、点赞和评论。',
            '播放页根据真实视频宽高适配竖屏、横屏或普通视频，避免竖屏内容被压成横屏，也避免横屏视频被强拉伸。',
            '高副作用能力如支付、保险、IM、推送、地图和外部分享先做安全等价页，不在展示环境触发真实第三方服务。',
          ],
        },
      ],
      architecture: [
        {
          title: '遗留系统拆解',
          body:
            '旧工作区包含 Android、iOS、旧 Java WAR 服务端、康复服务端、部署脚本和历史文档。旧 Android 工程依赖旧构建栈、多个业务模块和视频/IM/推送/支付等第三方能力；旧服务端依赖 Tomcat、MySQL、Redis 和历史配置。迁移前先把这些边界文档化，避免把所有风险压到一次升级里。',
        },
        {
          title: '64 位客户端重建',
          body:
            '新版 Android 工程是轻量单模块客户端，包内不引入旧 32 位 native so，接口集中在 ApiClient，登录态、异步任务、UI 工具和内容排序工具分别封装。客户端继续兼容旧接口路径和返回 envelope，把字段 fallback 与媒体 URL 归一化集中处理。',
        },
        {
          title: '现代后端与接口兼容',
          body:
            '新后端使用 Spring Boot 3、Java 17、PostgreSQL、Flyway、Docker 和 Render。服务保持 `/free_kicker` 上下文和旧客户端熟悉的接口形态，控制器覆盖账号、用户、动态、短视频、球队、比赛、球场、搜索和 fallback；尚未真实接入的旧接口返回安全空结果或安全 stub。',
        },
        {
          title: '文件与媒体存储',
          body:
            '上传由服务端接收 multipart，再通过 S3-compatible 客户端写入 Cloudflare R2；数据库记录对象 key、公开 URL、文件名、MIME 和大小。未配置 R2 时，后端仍能返回可用于链路验证的占位公开 URL，便于先验证客户端主流程。',
        },
      ],
      quality: [
        {
          title: '验证链路',
          items: [
            'Android 侧维护测试矩阵，把功能标记为已验证、需回归、兜底可用或待接入，覆盖登录、首页、动态、短视频、球队、日程、赛事、球场、球币、消息和三方安全页。',
            '旧版入口对照清单把旧 App 主要入口映射到 64 位客户端的真实接入、安全等价、待回归或不纳入主线状态。',
            '后端 MockMvc 测试覆盖健康检查、旧登录 envelope、动态发布、视频上传校验、球队、球场、fallback 和幂等社交流。',
            'PostgreSQL/Testcontainers 测试验证 Flyway seed 与核心控制器，部署烟测脚本覆盖 health、login、tweets、videos、team 和 pitches。',
          ],
        },
        {
          title: '部署和展示边界',
          body:
            '公开产品展示站由 Cloudflare Pages 承载静态页面、技术文档、素材和阶段 APK 下载；动态 API 由独立 Render 服务承载，数据库由 PostgreSQL/Flyway 初始化，文件上传走 R2。静态站和 BIAU Port 都只展示项目材料，不保存私有配置或密钥。',
        },
      ],
      limitations: [
        {
          title: '当前边界',
          items: [
            '64 位客户端仍有一部分页面处于需回归或安全等价状态，不能把所有旧版深层能力都表述为完整生产可用。',
            '支付、IM、推送、地图、分享、真实兑换、赛事创建和比分提交等高副作用能力保留边界，不在展示环境触发真实外部服务。',
            'Render 免费服务、演示数据、静态 APK 下载和 R2 配置都更适合展示和轻量验证，不应被描述为长期生产运营方案。',
          ],
        },
      ],
      roadmap: [
        {
          title: '后续优化方向',
          items: [
            '继续按测试矩阵回归真实手机、图片选择、短视频上传、球队队费、日程签到、WebView 兜底和旧接口字段兼容。',
            '逐步把更多旧 WebView 和安全等价页改成原生页面，减少旧网页质量和第三方 SDK 对核心体验的影响。',
            '强化后端权限、审计、文件治理、监控和部署策略，让 Render/R2 演示链路演进为更稳的生产部署。',
            '短视频后续可评估 ExoPlayer、缓存、多清晰度、错误恢复和更完整的信息流交互。',
          ],
        },
      ],
    },
    assistantContext: [
      '寻球是足球社群移动端迁移案例，核心是旧版 App/旧 Java WAR 后端保留历史链路，新 64 位 Android 客户端接入 Spring Boot 3 现代后端。',
      '64 位客户端是轻量单模块 Android 工程，接口集中在 ApiClient，保留旧接口路径和 response envelope，覆盖登录、动态、短视频、球队、日程、赛事、球场、球币和个人页等核心路径。',
      '现代后端使用 Spring Boot 3、Java 17、PostgreSQL、Flyway、Docker、Render 和 Cloudflare R2，控制器覆盖账号、用户、动态、视频、球队、比赛、球场、搜索和 fallback。',
      '短视频链路包含文件选择、大小/时长校验、封面、multipart 上传、R2 存储、列表回流、播放比例适配、点赞和评论，并针对小文件异常视频做了防护。',
      '项目有 Android 测试矩阵、旧版入口对照、后端 MockMvc 测试、PostgreSQL/Testcontainers 测试和部署烟测脚本；支付、IM、推送、地图、分享等高副作用能力当前以安全等价或 stub 方式收口。',
      '后续优化方向包括真实设备回归、旧 WebView 原生化、权限与审计、文件治理、监控部署、短视频播放器升级和更完整的生产化运维。',
    ],
  },
]

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
}

export function getProjectAssistantSummary(project: Project) {
  return [project.summary, ...(project.assistantContext ?? [])].join(' ')
}

export function getProjectAssistantTags(project: Project) {
  return uniqueStrings([project.category, project.status, project.role, ...project.stack, ...project.highlights])
}

export const capabilityTracks = [
  { title: 'AI 应用', detail: 'RAG、Agent、引用溯源、审核闭环', value: 'Legal RAG / Pet Workspace' },
  { title: '业务系统', detail: '后台、API、数据库、队列、审计日志', value: 'Ozon 电商 ERP' },
  { title: '互动体验', detail: 'Godot 展示入口、试玩计划、游戏展示页', value: '6 个游戏项目' },
  { title: '博客系统', detail: 'React + Semi、Astro、内容审计、部署准备', value: 'Biau Port / Playlab' },
]
