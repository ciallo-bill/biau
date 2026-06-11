import { useEffect, useMemo, useState } from 'react'
import { Button, Space, Tag, Typography } from '@douyinfe/semi-ui-19'
import { IconApps, IconArticle, IconBriefcase, IconExternalOpen, IconHome } from '@douyinfe/semi-icons'
import { categoryLabels, projects, statusLabels, type Project } from './data/portfolio'
import './App.css'

const { Title, Text, Paragraph } = Typography

type ViewKey = 'home' | 'projects' | 'cases' | 'blog'
type ProjectGroupKey = 'ai' | 'fullstack' | 'games'
type SiteTheme = 'light' | 'dark'

const navItems: Array<{ key: ViewKey; label: string; icon: React.ReactNode }> = [
  { key: 'home', label: '首页', icon: <IconHome /> },
  { key: 'projects', label: '项目', icon: <IconApps /> },
  { key: 'cases', label: '案例', icon: <IconBriefcase /> },
  { key: 'blog', label: '博客', icon: <IconArticle /> },
]

const routeByView: Record<ViewKey, string> = {
  home: '/',
  projects: '/projects',
  cases: '/cases',
  blog: '/blogs',
}

const viewByRoute = new Map<string, ViewKey>([
  ...Object.entries(routeByView).map(([view, route]) => [route, view as ViewKey] as const),
  ['/resources', 'cases'],
])

function getViewFromPath(pathname: string): ViewKey {
  return viewByRoute.get(pathname) ?? 'home'
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

  return (
    <div className={`site-shell site-theme-${siteTheme} ${activeView === 'blog' ? 'is-blog-page' : ''}`}>
      <header className="site-header">
        <button className="brand" type="button" onClick={() => navigate('home')} aria-label="返回首页">
          <span>BL</span>
          <strong>Biau Labs</strong>
        </button>

        <nav className="site-nav" aria-label="主导航">
          {navItems.map((item) => (
            <button key={item.key} className={activeView === item.key ? 'is-active' : ''} type="button" onClick={() => navigate(item.key)}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <ThemeToggle theme={siteTheme} onChange={setSiteTheme} />
      </header>

      <main className="site-main">
        {activeView === 'home' ? <HomeView onOpenProject={openProject} /> : null}
        {activeView === 'projects' ? <ProjectsView selectedProject={selectedProject} onSelectProject={setSelectedId} /> : null}
        {activeView === 'cases' ? <CasesView onOpenProject={openProject} /> : null}
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

function HomeView({ onOpenProject }: { onOpenProject: (project: Project) => void }) {
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
              <Button theme="light" type="primary" onClick={() => onOpenProject(project)}>查看案例</Button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function ProjectsView({ onSelectProject, selectedProject }: { onSelectProject: (id: string) => void; selectedProject: Project }) {
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
      </section>
    </div>
  )
}

function CasesView({ onOpenProject }: { onOpenProject: (project: Project) => void }) {
  const resourceItems = [
    { title: 'Legal RAG 合同审查案例', tag: 'AI 应用', status: '重点案例', projectId: 'legal-rag', description: '展示 RAG 流程、合同审查、引用溯源、截图和面试讲解口径。' },
    { title: 'Ozon 电商 ERP 案例', tag: '全栈开发', status: '重点案例', projectId: 'ozon-erp', description: '展示后台模块、API、Worker、插件、数据库和部署说明。' },
    { title: 'Pet Workspace AI 管线案例', tag: 'AI 应用', status: '补充中', projectId: 'pet-workspace', description: '展示生成管线、审核流程、人审发布和 App API 契约。' },
    { title: 'Godot Web 游戏展示案例', tag: '游戏项目', status: '补充中', projectId: 'game-first-tetris', description: '统一游戏封面、试玩入口、操作说明和 Web 导出说明。' },
  ]

  return (
    <div className="resource-page">
      <section className="resource-hero">
        <Text type="tertiary">Cases</Text>
        <Title heading={1}>案例中心</Title>
        <Paragraph>案例页不再像资源列表，而是用矩阵方式展示重点交付：先看代表案例，再进入关联项目、截图、架构图和项目复盘。</Paragraph>
      </section>

      <section className="case-matrix-board">
        <div className="case-board-head">
          <div>
            <span className="section-pill">Case Matrix</span>
            <Title heading={2}>重点案例矩阵</Title>
            <Paragraph>从 AI 应用、全栈系统和游戏展示中抽取最适合对外说明的案例，后续每张卡片都可以扩展为独立详情页。</Paragraph>
          </div>
          <div className="case-board-stats" aria-label="案例统计">
            <span>AI 应用 2</span>
            <span>全栈开发 1</span>
            <span>游戏项目 1</span>
          </div>
        </div>

        <div className="case-library-grid">
          {resourceItems.map((item, index) => {
            const project = projects.find((entry) => entry.id === item.projectId) ?? projects[0]

            return (
              <article key={item.title} className={index === 0 ? 'case-library-card is-featured' : 'case-library-card'}>
                <div className="case-card-cover">
                  {project.image ? <img src={project.image} alt={project.title} loading="lazy" /> : <span>{item.tag}</span>}
                </div>
                <div className="case-card-body">
                  <div className="case-card-tags">
                    <Tag color={item.tag === 'AI 应用' ? 'cyan' : item.tag === '全栈开发' ? 'blue' : 'grey'}>{item.tag}</Tag>
                    <Tag color={item.status === '重点案例' ? 'green' : item.status === '补充中' ? 'orange' : 'grey'}>{item.status}</Tag>
                  </div>
                  <Title heading={index === 0 ? 3 : 4}>{item.title}</Title>
                  <Paragraph>{item.description}</Paragraph>
                  <Button theme={index === 0 ? 'solid' : 'light'} type="primary" onClick={() => onOpenProject(project)}>查看关联项目</Button>
                </div>
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



