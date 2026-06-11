import { useEffect, useMemo, useState } from 'react'
import { Button, Space, Tag, Typography } from '@douyinfe/semi-ui-19'
import { IconApps, IconArticle, IconBriefcase, IconExternalOpen, IconHome } from '@douyinfe/semi-icons'
import { categoryLabels, projects, statusLabels, type Project } from './data/portfolio'
import './App.css'

const { Title, Text, Paragraph } = Typography

type ViewKey = 'home' | 'projects' | 'cases' | 'caseDetail' | 'blog'
type NavViewKey = Exclude<ViewKey, 'caseDetail'>
type ProjectGroupKey = 'ai' | 'fullstack' | 'games'
type SiteTheme = 'light' | 'dark'

const navItems: Array<{ key: NavViewKey; label: string; icon: React.ReactNode }> = [
  { key: 'home', label: '首页', icon: <IconHome /> },
  { key: 'projects', label: '项目', icon: <IconApps /> },
  { key: 'cases', label: '案例', icon: <IconBriefcase /> },
  { key: 'blog', label: '博客', icon: <IconArticle /> },
]

const routeByView: Record<ViewKey, string> = {
  home: '/',
  projects: '/projects',
  cases: '/cases',
  caseDetail: '/cases/legal-rag',
  blog: '/blogs',
}

const viewByRoute = new Map<string, ViewKey>([
  ...Object.entries(routeByView).map(([view, route]) => [route, view as ViewKey] as const),
  ['/resources', 'cases'],
])

function getViewFromPath(pathname: string): ViewKey {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return viewByRoute.get(normalizedPath) ?? 'home'
}

const heroSlides = [
  {
    id: 'legal-rag',
    title: 'Legal RAG',
    subtitle: '法律智能机器人与合同审查',
    description: '文档导入、RAG 问答、引用溯源和合同风险审查的全栈 MVP。',
    image: '/images/projects/showcase/legal-rag-reviewed.png',
  },
  {
    id: 'pet-workspace',
    title: 'Pet Workspace',
    subtitle: 'AI 宠物生成与审核管线',
    description: '围绕生成、审核、人审发布和 App API 契约组织的 AI 项目工作区。',
    image: '/images/projects/showcase/fantasy-pet-flow.png',
  },
  {
    id: 'ozon-erp',
    title: 'Ozon 电商 ERP',
    subtitle: '全栈业务系统',
    description: '管理后台、Node API、Prisma、Worker 和浏览器采集插件组合成的业务系统。',
    image: '/images/projects/showcase/erp-cover.svg',
  },
]

const projectGroups: Array<{ key: ProjectGroupKey; title: string; description: string; projectIds: string[] }> = [
  { key: 'ai', title: 'AI 应用', description: 'RAG、Agent、生成审核、人审闭环相关项目。', projectIds: ['legal-rag', 'pet-workspace'] },
  { key: 'fullstack', title: '全栈开发', description: '管理后台、API、数据库、队列、移动端和博客系统。', projectIds: ['ozon-erp', 'blog-semi', 'biau-playlab', 'xunqiu'] },
  { key: 'games', title: '游戏项目', description: 'Godot Web 导出、试玩入口和互动体验项目。', projectIds: ['game-first-tetris', 'game-next-spacewar', 'intespace', 'raiden-prototype', 'space-war'] },
]

function getGroupKeyByProjectId(projectId: string): ProjectGroupKey {
  return projectGroups.find((group) => group.projectIds.includes(projectId))?.key ?? 'ai'
}

const homeCaseProjectIds = ['legal-rag', 'pet-workspace', 'ozon-erp', 'blog-semi', 'game-first-tetris', 'xunqiu']

function App() {
  const [activeView, setActiveView] = useState<ViewKey>(() => getViewFromPath(window.location.pathname))
  const [selectedId, setSelectedId] = useState(projects[0].id)
  const [siteTheme, setSiteTheme] = useState<SiteTheme>('light')

  const selectedProject = projects.find((project) => project.id === selectedId) ?? projects[0]

  useEffect(() => {
    const handlePopState = () => setActiveView(getViewFromPath(window.location.pathname))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (view: ViewKey) => {
    const nextPath = routeByView[view]
    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, '', nextPath)
    }
    setActiveView(view)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openProject = (project: Project) => {
    setSelectedId(project.id)
    navigate('projects')
  }

  const openLegalCase = () => navigate('caseDetail')

  return (
    <div className={`site-shell site-theme-${siteTheme} ${activeView === 'blog' ? 'is-blog-page' : ''}`}>
      <header className="site-header">
        <button className="brand" type="button" onClick={() => navigate('home')} aria-label="返回首页">
          <span>BL</span>
          <strong>Biau Labs</strong>
        </button>

        <nav className="site-nav" aria-label="主导航">
          {navItems.map((item) => (
            <button key={item.key} className={(activeView === item.key || (activeView === 'caseDetail' && item.key === 'cases')) ? 'is-active' : ''} type="button" onClick={() => navigate(item.key)}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <ThemeToggle theme={siteTheme} onChange={setSiteTheme} />
      </header>

      <main className="site-main">
        {activeView === 'home' ? <HomeView onOpenCase={openLegalCase} onOpenProject={openProject} /> : null}
        {activeView === 'projects' ? <ProjectsView onOpenCase={openLegalCase} selectedProject={selectedProject} onSelectProject={setSelectedId} /> : null}
        {activeView === 'cases' ? <CasesView onOpenCase={openLegalCase} onOpenProject={openProject} /> : null}
        {activeView === 'caseDetail' ? <LegalRagCaseView onBack={() => navigate('cases')} onOpenProject={() => openProject(projects.find((project) => project.id === 'legal-rag') ?? projects[0])} /> : null}
        {activeView === 'blog' ? <BlogView theme={siteTheme} /> : null}
      </main>

      <footer className="site-footer">
        <span>Biau Labs</span>
        <span>React + Semi Design 博客系统</span>
        <span>© 2026</span>
      </footer>
    </div>
  )
}

function ThemeToggle({ onChange, theme }: { onChange: (theme: SiteTheme) => void; theme: SiteTheme }) {
  const isDark = theme === 'dark'

  return (
    <div className="site-theme-toggle" role="group" aria-label="全站主题切换">
      <button className={!isDark ? 'is-active' : ''} type="button" onClick={() => onChange('light')}>浅色</button>
      <button className={isDark ? 'is-active' : ''} type="button" onClick={() => onChange('dark')}>暗色</button>
    </div>
  )
}

function HomeView({ onOpenCase, onOpenProject }: { onOpenCase: () => void; onOpenProject: (project: Project) => void }) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeHomeGroup, setActiveHomeGroup] = useState<ProjectGroupKey>('ai')
  const slide = heroSlides[activeSlide]
  const slideProject = projects.find((project) => project.id === slide.id) ?? projects[0]
  const activeGroup = projectGroups.find((group) => group.key === activeHomeGroup) ?? projectGroups[0]
  const activeProjects = activeGroup.projectIds
    .map((id) => projects.find((project) => project.id === id))
    .filter((project): project is Project => Boolean(project))
  const caseProjects = homeCaseProjectIds
    .map((id) => projects.find((project) => project.id === id))
    .filter((project): project is Project => Boolean(project))

  return (
    <div className="home-page">
      <section className="semi-hero-carousel">
        <div className="hero-copy">
          <Text type="tertiary">AI applications, full-stack systems and playable web projects</Text>
          <Title className="hero-title-lines" heading={1}><span>真实项目</span><span>展示系统</span></Title>
          <Paragraph>
            参考 Semi Design 的首页节奏，用更大的首屏、更明确的项目运行图和更清晰的分类，把已有项目组织成可展示、可学习、可部署的博客系统。
          </Paragraph>
          <Space wrap>
            <Button theme="solid" type="primary" icon={<IconApps />} onClick={() => onOpenProject(slideProject)}>
              查看当前项目
            </Button>
            <Button onClick={() => setActiveSlide((activeSlide + 1) % heroSlides.length)}>下一张</Button>
          </Space>
          <div className="tech-row" aria-label="技术栈">
            <span>React</span>
            <span>Vite</span>
            <span>Semi</span>
            <span>Astro</span>
            <span>Godot</span>
          </div>
        </div>

        <div className="hero-carousel-stage" aria-label="项目运行图轮播">
          <div className="carousel-window">
            <img src={slide.image} alt={slide.title} />
            <div className="carousel-caption">
              <Text type="tertiary">{slide.subtitle}</Text>
              <strong>{slide.title}</strong>
              <span>{slide.description}</span>
            </div>
          </div>
          <div className="carousel-dots" role="tablist" aria-label="选择项目运行图">
            {heroSlides.map((item, index) => (
              <button key={item.id} className={activeSlide === index ? 'is-active' : ''} type="button" onClick={() => setActiveSlide(index)}>
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="home-project-showcase">
        <div className="home-section-title is-centered">
          <Text type="tertiary">Project Categories</Text>
          <Title heading={2}>三类项目方向</Title>
          <Paragraph>用标签切换把项目能力组织成 AI 应用、全栈开发和游戏项目三条主线，先给方向，再进入具体案例。</Paragraph>
        </div>

        <div className="home-category-tabs" role="tablist" aria-label="首页项目分类">
          {projectGroups.map((group) => (
            <button key={group.key} className={activeHomeGroup === group.key ? 'is-active' : ''} type="button" onClick={() => setActiveHomeGroup(group.key)}>
              <strong>{group.title}</strong>
              <span>{group.description}</span>
            </button>
          ))}
        </div>

        <div className="home-project-panel">
          <div className="panel-window-bar" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className="home-panel-layout">
            <aside className="home-panel-sidebar">
              <Text type="tertiary">当前方向</Text>
              <Title heading={3}>{activeGroup.title}</Title>
              <Paragraph>{activeGroup.description}</Paragraph>
              <div className="panel-metrics">
                <div>
                  <strong>{activeProjects.length}</strong>
                  <span>项目数量</span>
                </div>
                <div>
                  <strong>{activeGroup.key === 'ai' ? 'RAG' : activeGroup.key === 'fullstack' ? 'API' : 'Web'}</strong>
                  <span>核心关键词</span>
                </div>
              </div>
            </aside>

            <div className="home-panel-main">
              <div className="panel-section-head">
                <div>
                  <Text type="tertiary">Selected Projects</Text>
                  <Title heading={3}>{activeGroup.title}项目清单</Title>
                </div>
                <Button theme="solid" type="primary" onClick={() => onOpenProject(activeProjects[0] ?? projects[0])}>进入项目页</Button>
              </div>

              <div className="home-project-grid">
                {activeProjects.map((project) => (
                  <HomeProjectCard key={project.id} project={project} onOpen={() => onOpenProject(project)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-case-matrix-section">
        <div className="home-section-title is-centered">
          <Text type="tertiary">Case Matrix</Text>
          <Title heading={2}>案例矩阵</Title>
          <Paragraph>把重点项目压缩成可浏览的案例入口，每个案例保留真实项目名、方向标签、技术栈和跳转动作。</Paragraph>
        </div>

        <div className="case-matrix-grid">
          {caseProjects.map((project, index) => (
            <article key={project.id} className={index === 0 ? 'case-matrix-card is-featured' : 'case-matrix-card'}>
              <span className="section-pill">{categoryLabels[project.category]}</span>
              <Title heading={3}>{project.title}</Title>
              <Paragraph>{project.summary}</Paragraph>
              <div className="case-matrix-meta">
                {project.stack.slice(0, 4).map((item) => <span key={item}>{item}</span>)}
              </div>
              <Button theme="light" type="primary" onClick={() => { if (project.id === 'legal-rag') onOpenCase(); else onOpenProject(project) }}>查看案例</Button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function ProjectsView({ onOpenCase, onSelectProject, selectedProject }: { onOpenCase: () => void; onSelectProject: (id: string) => void; selectedProject: Project }) {
  const [activeGroup, setActiveGroup] = useState<ProjectGroupKey>(() => getGroupKeyByProjectId(selectedProject.id))
  const currentGroup = projectGroups.find((group) => group.key === activeGroup) ?? projectGroups[0]
  const groupedProjects = useMemo(
    () => currentGroup.projectIds.map((id) => projects.find((project) => project.id === id)).filter((project): project is Project => Boolean(project)),
    [currentGroup],
  )

  const detailProject = groupedProjects.find((project) => project.id === selectedProject.id) ?? groupedProjects[0] ?? selectedProject

  return (
    <div className="project-page">
      <section className="project-hero">
        <Text type="tertiary">Projects</Text>
        <Title heading={1}>项目系统</Title>
        <Paragraph>按 AI 应用、全栈开发和游戏项目三条能力线组织项目，让访问者第一屏就能看到主体展示、项目截图、技术栈和可跳转入口。</Paragraph>
      </section>

      <section className="project-stage">
        <div className="project-stage-head">
          <div>
            <span className="section-pill">Project Categories</span>
            <Title heading={2}>{currentGroup.title}展示台</Title>
            <Paragraph>{currentGroup.description}</Paragraph>
          </div>

          <div className="project-tab-strip" role="tablist" aria-label="项目分类">
            {projectGroups.map((group) => (
              <button key={group.key} className={activeGroup === group.key ? 'is-active' : ''} type="button" onClick={() => { setActiveGroup(group.key); onSelectProject(group.projectIds[0]) }}>
                <strong>{group.title}</strong>
                <span>{group.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="project-stage-main">
          <div className="project-stage-preview">
            <div className="project-stage-frame">
              <div className="panel-window-bar" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="project-stage-screen">
                {detailProject.image ? <img src={detailProject.image} alt={detailProject.title} loading="lazy" /> : <span>{categoryLabels[detailProject.category]}</span>}
              </div>
              <div className="project-preview-caption">
                <div>
                  <Text type="tertiary">Selected Project</Text>
                  <strong>{detailProject.title}</strong>
                </div>
                <Tag color={detailProject.status === 'main' ? 'red' : detailProject.status === 'live' ? 'green' : detailProject.status === 'pending' ? 'grey' : 'orange'}>{statusLabels[detailProject.status]}</Tag>
              </div>
            </div>
          </div>

          <ProjectDetail project={detailProject} />
        </div>

        <div className="project-thumb-strip" aria-label={`${currentGroup.title}项目列表`}>
          {groupedProjects.map((project) => (
            <button key={project.id} className={detailProject.id === project.id ? 'project-thumb-card is-active' : 'project-thumb-card'} type="button" onClick={() => onSelectProject(project.id)}>
              <span>{categoryLabels[project.category]}</span>
              <strong>{project.title}</strong>
              <em>{project.summary}</em>
            </button>
          ))}
        </div>

        <ProjectNarrative project={detailProject} onOpenCase={onOpenCase} />
      </section>
    </div>
  )
}

function CasesView({ onOpenCase, onOpenProject }: { onOpenCase: () => void; onOpenProject: (project: Project) => void }) {
  const resourceItems = [
    { title: 'Legal RAG 合同审查案例', tag: 'AI 应用', status: '重点案例', projectId: 'legal-rag', description: '从法律合同审查场景切入，展示 RAG 流程、引用溯源、风险归因和面试讲解口径。', outcome: '可解释的合同审查 MVP' },
    { title: 'Ozon 电商 ERP 案例', tag: '全栈开发', status: '整理中', projectId: 'ozon-erp', description: '适合沉淀后台模块、API、Worker、插件、数据库和部署说明。', outcome: '业务系统交付说明' },
    { title: 'Pet Workspace AI 管线案例', tag: 'AI 应用', status: '补充中', projectId: 'pet-workspace', description: '适合展示生成管线、审核流程、人审发布和 App API 契约。', outcome: 'AI 生成闭环案例' },
    { title: 'Godot Web 游戏展示案例', tag: '游戏项目', status: '补充中', projectId: 'game-first-tetris', description: '适合统一游戏封面、试玩入口、操作说明和 Web 导出说明。', outcome: '互动项目展示规范' },
  ]
  const featuredItem = resourceItems[0]
  const featuredProject = projects.find((entry) => entry.id === featuredItem.projectId) ?? projects[0]
  const secondaryItems = resourceItems.slice(1)

  return (
    <div className="resource-page">
      <section className="resource-hero">
        <Text type="tertiary">Cases</Text>
        <Title heading={1}>案例中心</Title>
        <Paragraph>案例页负责讲清楚一个项目为什么值得看：业务场景、交付成果、截图证据、技术解释和面试讲述入口；完整项目介绍则放在项目页下方。</Paragraph>
      </section>

      <section className="case-matrix-board">
        <div className="case-board-head">
          <div>
            <span className="section-pill">Case Library</span>
            <Title heading={2}>从项目到可讲述案例</Title>
            <Paragraph>这里不堆完整项目说明，而是提炼“场景、证据、结果、讲法”。访问者可以先看案例，再跳到项目页查看工程信息。</Paragraph>
          </div>
          <div className="case-board-stats" aria-label="案例统计">
            <span>业务场景</span>
            <span>交付成果</span>
            <span>面试口径</span>
          </div>
        </div>

        <div className="case-showcase-layout">
          <article className="case-featured-card">
            <div className="case-featured-media">
              <img src={featuredProject.image} alt={featuredItem.title} loading="lazy" />
            </div>
            <div className="case-featured-body">
              <div className="case-card-tags">
                <Tag color="cyan">{featuredItem.tag}</Tag>
                <Tag color="green">{featuredItem.status}</Tag>
              </div>
              <Title heading={3}>{featuredItem.title}</Title>
              <Paragraph>{featuredItem.description}</Paragraph>
              <div className="case-outcome-box">
                <Text type="tertiary">案例成果</Text>
                <strong>{featuredItem.outcome}</strong>
              </div>
              <Space wrap>
                <Button theme="solid" type="primary" onClick={onOpenCase}>查看完整案例</Button>
                <Button onClick={() => onOpenProject(featuredProject)}>项目完整介绍</Button>
              </Space>
            </div>
          </article>

          <aside className="case-guide-card">
            <span className="section-pill">What Goes Here</span>
            <Title heading={3}>案例页推荐放什么</Title>
            <div>
              <strong>场景</strong>
              <p>为什么要做这个项目，解决谁的什么问题。</p>
            </div>
            <div>
              <strong>证据</strong>
              <p>运行截图、关键流程、输入输出和真实页面。</p>
            </div>
            <div>
              <strong>讲法</strong>
              <p>面试或对外展示时如何讲业务价值、技术取舍和后续扩展。</p>
            </div>
          </aside>
        </div>

        <div className="case-secondary-grid">
          {secondaryItems.map((item) => {
            const project = projects.find((entry) => entry.id === item.projectId) ?? projects[0]

            return (
              <article key={item.title} className="case-secondary-card">
                <div>
                  <Tag color={item.tag === 'AI 应用' ? 'cyan' : item.tag === '全栈开发' ? 'blue' : 'grey'}>{item.tag}</Tag>
                  <Tag color={item.status === '整理中' ? 'blue' : item.status === '补充中' ? 'orange' : 'grey'}>{item.status}</Tag>
                </div>
                <Title heading={4}>{item.title}</Title>
                <Paragraph>{item.description}</Paragraph>
                <span>{item.outcome}</span>
                <Button theme="light" type="primary" onClick={() => onOpenProject(project)}>查看项目介绍</Button>
              </article>
            )
          })}
        </div>

        <div className="case-route-strip">
          <div>
            <strong>01</strong>
            <span>补运行截图和核心流程</span>
          </div>
          <div>
            <strong>02</strong>
            <span>补架构图、技术栈和数据流</span>
          </div>
          <div>
            <strong>03</strong>
            <span>沉淀博客复盘和演示入口</span>
          </div>
        </div>
      </section>
    </div>
  )
}

function ProjectNarrative({ onOpenCase, project }: { onOpenCase: () => void; project: Project }) {
  const isLegalRag = project.id === 'legal-rag'
  const narrative = isLegalRag
    ? {
        title: '项目完整介绍',
        paragraphs: [
          '这个项目是一个面向合同审查的 RAG 全栈 MVP。项目目标不是做通用聊天机器人，而是把法律合同审查拆成“导入合同、切分条款、检索上下文、生成审查结论、给出引用来源”的业务闭环。',
          '项目展示重点包括文档知识库、引用溯源问答、合同风险列表和修改建议。项目页保留工程信息、技术栈和实现范围；案例页则进一步讲清楚业务场景、截图证据和面试讲解口径。',
        ],
        outcome: '完整闭环：文档导入 + RAG 问答 + 合同审查 + citations',
      }
    : {
        title: '项目完整介绍',
        paragraphs: [
          `${project.title} 当前用于展示 ${project.role} 方向的工程能力。项目页保留项目背景、技术栈、交付范围、关键亮点和后续可扩展方向。`,
          '后续如果该项目需要对外讲述，会在案例页补充业务场景、运行截图、架构图和复盘内容，避免项目页和案例页重复。',
        ],
        outcome: project.highlights.join(' / '),
      }

  return (
    <section className="project-narrative-panel">
      <div>
        <span className="section-pill">Project Brief</span>
        <Title heading={3}>{narrative.title}</Title>
      </div>
      <div className="project-narrative-content">
        {narrative.paragraphs.map((item) => <Paragraph key={item}>{item}</Paragraph>)}
      </div>
      <div className="project-narrative-footer">
        <div>
          <Text type="tertiary">核心成果</Text>
          <strong>{narrative.outcome}</strong>
        </div>
        {isLegalRag ? <Button theme="solid" type="primary" onClick={onOpenCase}>查看 Legal RAG 完整案例</Button> : null}
      </div>
    </section>
  )
}

function LegalRagCaseView({ onBack, onOpenProject }: { onBack: () => void; onOpenProject: () => void }) {
  const caseStats = [
    { label: '核心流程', value: '4', detail: '导入 / 切分 / 检索 / 审查' },
    { label: '展示截图', value: '3', detail: '知识库、问答、合同审查' },
    { label: '技术关键词', value: 'RAG', detail: '引用溯源与风险归因' },
  ]
  const workflow = ['文档导入', '条款切分', '向量检索', 'RAG 问答', '合同风险审查']
  const caseImages = [
    { title: '合同审查工作台', image: '/images/projects/showcase/legal-rag-reviewed.png', detail: '按风险类型展示付款条款、交付标准、解除条款等审查结果。' },
    { title: '知识库导入', image: '/images/projects/showcase/legal-rag-knowledge.png', detail: '沉淀合同文本、条款切片和可追踪的知识库材料。' },
    { title: '引用溯源问答', image: '/images/projects/showcase/legal-rag-qa.png', detail: '回答法律问题时给出来源片段，便于解释和复核。' },
  ]
  const architecture = [
    { title: '前端工作台', detail: '用 Vue 3 构建文档导入、知识库问答和合同审查界面。' },
    { title: 'Node API', detail: 'Express 提供文档、问答、审查和引用结果接口。' },
    { title: 'RAG 管线', detail: '围绕 chunk、检索、回答生成和 citations 组织最小可演示闭环。' },
    { title: '风险输出', detail: '将合同问题整理成风险等级、触发条款、修改建议和来源引用。' },
  ]
  const talkingPoints = [
    '这个项目的重点不是简单聊天，而是把合同审查拆成可解释的业务流程。',
    '我把 RAG 输出和引用来源绑定起来，面试时可以讲清楚为什么答案可信。',
    'MVP 阶段使用 Mock Embedding 降低外部依赖，先保证产品流程、接口边界和展示体验完整。',
    '后续可以替换真实向量数据库、接入权限体系，并加入合同版本对比和审查报告导出。',
  ]

  return (
    <div className="case-detail-page">
      <section className="case-detail-hero">
        <div className="case-detail-copy">
          <Text type="tertiary">Legal RAG Case Study</Text>
          <Title heading={1}>法律智能机器人与合同审查 RAG 应用</Title>
          <Paragraph>
            一个面向合同审查场景的全栈 MVP：从文档导入、条款切分、RAG 问答到风险审查，把 AI 能力落到可解释、可复核、可演示的法律业务流程里。
          </Paragraph>
          <Space wrap>
            <Button theme="solid" type="primary" onClick={onOpenProject}>查看项目展示</Button>
            <Button onClick={onBack}>返回案例中心</Button>
          </Space>
        </div>

        <div className="case-detail-hero-panel">
          <div className="panel-window-bar" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <img src="/images/projects/showcase/legal-rag-reviewed.png" alt="Legal RAG 合同审查工作台" />
        </div>
      </section>

      <section className="case-detail-stats" aria-label="案例关键指标">
        {caseStats.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
            <em>{item.detail}</em>
          </div>
        ))}
      </section>

      <section className="case-detail-section case-problem-section">
        <div>
          <span className="section-pill">Problem</span>
          <Title heading={2}>要解决什么问题</Title>
        </div>
        <div className="case-problem-grid">
          <article>
            <strong>合同文本长，人工审查慢</strong>
            <p>合同中风险点分散在不同条款里，人工逐条查找和整理修改建议效率低。</p>
          </article>
          <article>
            <strong>AI 答案需要可追溯</strong>
            <p>法律类场景不能只给结论，还需要说明答案来自哪些原文片段，便于复核。</p>
          </article>
          <article>
            <strong>面试展示需要完整闭环</strong>
            <p>项目需要能讲清楚业务流程、技术架构、数据流和后续扩展，而不是只展示一个聊天框。</p>
          </article>
        </div>
      </section>

      <section className="case-detail-section">
        <div className="case-section-head">
          <span className="section-pill">Workflow</span>
          <Title heading={2}>RAG 审查流程</Title>
        </div>
        <div className="case-workflow">
          {workflow.map((item, index) => (
            <div key={item}>
              <strong>{String(index + 1).padStart(2, '0')}</strong>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="case-detail-section case-architecture-section">
        <div className="case-section-head">
          <span className="section-pill">Architecture</span>
          <Title heading={2}>实现结构</Title>
        </div>
        <div className="case-architecture-grid">
          {architecture.map((item) => (
            <article key={item.title}>
              <Title heading={3}>{item.title}</Title>
              <Paragraph>{item.detail}</Paragraph>
            </article>
          ))}
        </div>
      </section>

      <section className="case-detail-section">
        <div className="case-section-head">
          <span className="section-pill">Evidence</span>
          <Title heading={2}>运行截图</Title>
        </div>
        <div className="case-image-grid">
          {caseImages.map((item) => (
            <article key={item.title}>
              <img src={item.image} alt={item.title} loading="lazy" />
              <div>
                <Title heading={3}>{item.title}</Title>
                <Paragraph>{item.detail}</Paragraph>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="case-detail-section case-talking-section">
        <div>
          <span className="section-pill">Interview</span>
          <Title heading={2}>面试讲解口径</Title>
        </div>
        <div className="case-talking-list">
          {talkingPoints.map((item) => <p key={item}>{item}</p>)}
        </div>
      </section>
    </div>
  )
}

function BlogView({ theme }: { theme: SiteTheme }) {
  const blogPosts = [
    { title: 'Legal RAG 项目复盘', tag: 'AI 应用', detail: '记录合同审查、引用溯源和 RAG 问答的实现路径。', date: '2026-06-11' },
    { title: 'Ozon ERP 架构整理', tag: '全栈开发', detail: '整理后台、API、Worker、插件和数据库的边界。', date: '2026-06-12' },
    { title: '游戏项目展示规范', tag: '游戏项目', detail: '统一试玩入口、封面图、操作说明和导出流程。', date: '2026-06-13' },
  ]

  return (
    <div className={`blog-view blog-view-${theme}`}>
      <section className="blog-hero">
        <Text type="tertiary">Blog</Text>
        <Title heading={1}>博客系统</Title>
        <Paragraph>参考 Vercel Blog 的精选文章和最新文章结构，用统一的浅色/暗色风格记录项目复盘、学习路线和面试准备。</Paragraph>
      </section>

      <section className="blog-magazine">
        <div className="blog-magazine-head">
          <div>
            <span className="section-pill">Featured / Latest</span>
            <Title heading={2}>项目复盘与学习记录</Title>
          </div>
          <div className="blog-topic-pills" aria-label="博客栏目">
            <span>项目复盘</span>
            <span>AI 应用学习</span>
            <span>全栈工程记录</span>
            <span>面试知识点</span>
          </div>
        </div>

        <article className="blog-featured-layout">
          <div className="blog-featured-main">
            <Text type="tertiary">示例博客 / 2026-06-11</Text>
            <Title heading={2}>从项目目录到博客系统：一次展示层重构记录</Title>
            <Paragraph>这次重构的核心不是把页面做得更满，而是把真实项目按照访问者能理解的方式重新组织。首页负责建立第一印象，项目页负责说明能力边界，案例页沉淀展示材料，博客页则记录持续学习和项目复盘。</Paragraph>
            <Button theme="solid" type="primary">阅读示例文章</Button>
          </div>
          <aside className="blog-featured-aside">
            <Text type="tertiary">Article Index</Text>
            <strong>展示系统</strong>
            <span>项目目录</span>
            <span>案例矩阵</span>
            <span>学习记录</span>
          </aside>
        </article>

        <div className="blog-latest-head">
          <Title heading={3}>Latest Notes</Title>
          <Text type="tertiary">后续每天可以继续把知识点追加到这里。</Text>
        </div>

        <div className="blog-latest-grid">
          {blogPosts.map((post) => (
            <article key={post.title} className="blog-latest-card">
              <Text type="tertiary">{post.date}</Text>
              <Tag color={post.tag === 'AI 应用' ? 'cyan' : post.tag === '全栈开发' ? 'blue' : 'grey'}>{post.tag}</Tag>
              <Title heading={4}>{post.title}</Title>
              <Paragraph>{post.detail}</Paragraph>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function HomeProjectCard({ onOpen, project }: { onOpen: () => void; project: Project }) {
  return (
    <article className="home-project-card">
      <div className="home-project-cover">
        {project.image ? <img src={project.image} alt={project.title} loading="lazy" /> : <span>{categoryLabels[project.category]}</span>}
      </div>
      <div className="home-project-body">
        <Tag color={project.category === 'ai' ? 'cyan' : project.category === 'business' ? 'blue' : 'grey'}>{categoryLabels[project.category]}</Tag>
        <Title heading={4}>{project.title}</Title>
        <Paragraph>{project.summary}</Paragraph>
        <div className="home-project-stack">
          {project.stack.slice(0, 4).map((item) => <span key={item}>{item}</span>)}
        </div>
        <Button theme="light" type="primary" onClick={onOpen}>查看项目</Button>
      </div>
    </article>
  )
}

function ProjectDetail({ project }: { project: Project }) {
  return (
    <aside className="project-stage-detail">
      <Space wrap>
        <Tag color="blue">{categoryLabels[project.category]}</Tag>
        <Tag color={project.status === 'main' ? 'red' : project.status === 'live' ? 'green' : project.status === 'pending' ? 'grey' : 'orange'}>{statusLabels[project.status]}</Tag>
      </Space>
      <Title heading={2}>{project.title}</Title>
      <Paragraph>{project.summary}</Paragraph>

      <div className="meta-grid">
        <div><Text type="tertiary">交付范围</Text><strong>{project.role}</strong></div>
        <div><Text type="tertiary">本地路径</Text><code>{project.path}</code></div>
      </div>

      <div className="stack-list">{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
      <ul className="highlight-list">{project.highlights.map((item) => <li key={item}>{item}</li>)}</ul>

      <Space wrap>
        {project.links.map((link) => (
          <Button key={`${project.id}-${link.label}`} icon={link.type === 'external' ? <IconExternalOpen /> : <IconBriefcase />} onClick={() => { if (link.type === 'external') window.open(link.href, '_blank', 'noopener,noreferrer') }}>
            {link.label}
          </Button>
        ))}
      </Space>
    </aside>
  )
}

export default App



