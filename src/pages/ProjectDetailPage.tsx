import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { IconArrowLeft, IconLink } from '@douyinfe/semi-icons'
import {
  projects,
  categoryLabels,
  projectDetailGroupLabels,
  statusLabels,
  type ProjectDetailContent,
  type ProjectDetailContentKey,
  type ProjectDetailSection,
} from '../data/portfolio'
import { OZON_ERP_ENTRY_URL } from '../data/siteLinks'
import { ResponsiveImage } from '../components/ResponsiveImage'

const ozonErpCurrentState = [
  {
    title: '可运行的自用 ERP 主链路',
    detail:
      '当前项目不是静态原型，而是包含 Web 管理后台、API 服务、数据库模型、Redis 队列和浏览器插件的完整工作区。空数据库可通过登录页创建 Owner 账号，已有账号后进入商品、店铺、采集和工具页面。',
  },
  {
    title: '外部平台写入有明确开关',
    detail:
      '项目默认可以使用 mock 适配器做演示和培训；只有显式开启真实适配器与真实写入开关后，才会执行上架、调价、库存或发货等平台写操作。',
  },
  {
    title: '插件与后台共同承担采集铺货',
    detail:
      'Chrome MV3/WXT 插件负责商品采集入口，后台承接草稿、编辑、上架记录、任务结果和错误回填，让运营动作可以继续追踪而不是停在一次性脚本里。',
  },
]

const ozonErpModules = [
  '店铺授权与 Seller Cookie / Client-Id / Api-Key 管理',
  '商品、价格、库存、订单和退货同步',
  '采集箱、草稿编辑和一键上架审批',
  'PendingAction、AuditLog 和写操作结果回读',
  '定价工具、利润计算器和选品规则配置',
  '插件版本检查、下载与发布同步脚本',
]

const ozonErpVerification = [
  '私有 GitHub 仓库已作为 HidenCloud 的代码来源，重启时自动拉取 main 分支',
  'HidenCloud 当前使用 Node 22 运行，正式入口为 erp.ciallobill.qzz.io',
  '生产 .env 保留在 Hiden 本地，JWT、刷新令牌、ERP 加密密钥和插件密钥不进入仓库',
  '启动入口 index.js 会按输入签名跳过已是最新的 build、Prisma 和佣金导入任务',
  'API 健康检查返回运行环境、插件版本、Git 提交和启动时间，便于判断线上版本',
  '公开展示只使用脱敏截图、流程图和模块说明，不公开真实账号、密钥或数据库连接信息',
]
const projectDetailContentOrder: ProjectDetailContentKey[] = [
  'overview',
  'workflow',
  'architecture',
  'quality',
  'limitations',
  'roadmap',
]

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const project = useMemo(() => projects.find((p) => p.id === id), [id])

  const related = useMemo(() => {
    if (!project) return []
    return projects
      .filter((p) => p.id !== project.id && p.category === project.category)
      .slice(0, 3)
  }, [project])

  if (!project) {
    return (
      <main className="page-stack detail-page">
        <div className="detail-missing">
          <h1 className="section-title">未找到该项目</h1>
          <p className="section-description">该项目可能已下线或链接有误。</p>
          <button className="btn" onClick={() => navigate('/projects')}>
            <IconArrowLeft />
            <span>返回项目集</span>
          </button>
        </div>
      </main>
    )
  }

  return (
    <article className="page-stack detail-page project-detail-page">
      <Link to="/projects" className="detail-back">
        <IconArrowLeft />
        <span>项目集</span>
      </Link>

      <header className="detail-header">
        <div className="detail-badges">
          <span className="tag">{categoryLabels[project.category]}</span>
          <span className="detail-status">{statusLabels[project.status]}</span>
        </div>
        <h1 className="detail-title">{project.title}</h1>
        <p className="detail-role">{project.role}</p>
        <p className="detail-summary">{project.summary}</p>
      </header>

      {project.image && (
        <div className="detail-hero-image">
          <ResponsiveImage src={project.image} alt={project.title} loading="eager" />
        </div>
      )}

      <div className="detail-body">
        <section className="detail-block">
          <h2 className="detail-block-title">核心亮点</h2>
          <ul className="detail-highlights">
            {project.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </section>

        <section className="detail-block">
          <h2 className="detail-block-title">技术栈</h2>
          <div className="detail-stack">
            {project.stack.map((tech) => (
              <span key={tech} className="stack-tag">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {project.links.length > 0 && (
          <section className="detail-block">
            <h2 className="detail-block-title">相关链接</h2>
            <div className="detail-links">
              {project.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.type === 'external' ? '_blank' : undefined}
                  rel={link.type === 'external' ? 'noopener noreferrer' : undefined}
                  className="link-badge"
                >
                  <IconLink />
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>

      {project.detailContent && <ProjectDetailContentSections content={project.detailContent} />}

      {project.id === 'ozon-erp' && <OzonErpProjectArticle />}

      {related.length > 0 && (
        <section className="detail-related">
          <h2 className="detail-block-title">同类项目</h2>
          <div className="detail-related-grid">
            {related.map((item) => (
              <Link key={item.id} to={`/projects/${item.id}`} className="detail-related-card">
                <span className="detail-related-cat">{categoryLabels[item.category]}</span>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

interface ProjectDetailContentSectionsProps {
  content: ProjectDetailContent
}

function ProjectDetailContentSections({ content }: ProjectDetailContentSectionsProps) {
  const groups = projectDetailContentOrder
    .map((key) => ({ key, sections: content[key] ?? [] }))
    .filter((group) => group.sections.length > 0)

  if (groups.length === 0) return null

  return (
    <section className="detail-body project-case-study" aria-label="项目案例分析">
      {groups.map((group) => (
        <section key={group.key} className="detail-block detail-block-wide project-case-study__group">
          <p className="project-case-study__eyebrow">{projectDetailGroupLabels[group.key]}</p>
          <div className="project-case-study__sections">
            {group.sections.map((section) => (
              <ProjectDetailContentSection key={section.title} section={section} />
            ))}
          </div>
        </section>
      ))}
    </section>
  )
}

interface ProjectDetailContentSectionProps {
  section: ProjectDetailSection
}

function ProjectDetailContentSection({ section }: ProjectDetailContentSectionProps) {
  return (
    <article className="project-case-study__section">
      <h3>{section.title}</h3>
      {section.body && <p className="blog-post-body-text">{section.body}</p>}
      {section.items && section.items.length > 0 && (
        <ul className="detail-highlights">
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {section.links && section.links.length > 0 && (
        <div className="detail-links project-case-study__links">
          {section.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.type === 'external' ? '_blank' : undefined}
              rel={link.type === 'external' ? 'noopener noreferrer' : undefined}
              className="link-badge"
            >
              <IconLink />
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      )}
    </article>
  )
}

function OzonErpProjectArticle() {
  return (
    <section className="detail-body ozon-erp-current-body" aria-label="Ozon ERP 当前项目情况">
      <section className="detail-block detail-block-wide ozon-erp-entry-block">
        <h2 className="detail-block-title">当前项目情况</h2>
        <p className="blog-post-body-text">
          Ozon 电商 ERP 当前已经整理成可接手、可部署、可演示的业务系统：前端是 Vue/Vite 管理后台，后端是
          Node/Express API，数据层使用 PostgreSQL/Prisma，异步任务使用 Redis/BullMQ，采集侧由 Chrome MV3/WXT
          插件补齐。主站这里承担项目说明和脱敏展示，实际业务入口通过独立 ERP 访问链接打开，避免把管理后台硬塞进内容站路由。
          访问链接会带上来源参数，ERP 登录页会显示来自 BIAU Port 的衔接提示。
        </p>
        <div className="ozon-erp-entry-actions">
          <a className="link-badge ozon-erp-primary-link" href={OZON_ERP_ENTRY_URL} target="_blank" rel="noopener noreferrer">
            <IconLink />
            <span>访问 ERP</span>
          </a>
          <Link className="link-badge" to="/blog/ozon-erp-architecture">
            <IconLink />
            <span>阅读架构文章</span>
          </Link>
        </div>
      </section>

      {ozonErpCurrentState.map((item) => (
        <section key={item.title} className="detail-block">
          <h2 className="detail-block-title">{item.title}</h2>
          <p className="blog-post-body-text">{item.detail}</p>
        </section>
      ))}

      <section className="detail-block">
        <h2 className="detail-block-title">模块覆盖范围</h2>
        <ul className="detail-highlights">
          {ozonErpModules.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="detail-block">
        <h2 className="detail-block-title">部署与验收状态</h2>
        <ul className="detail-highlights">
          {ozonErpVerification.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="detail-block detail-block-wide">
        <h2 className="detail-block-title">主站接入方式</h2>
        <p className="blog-post-body-text">
          首页的电商卡片作为外联入口直接打开 ERP，项目详情页则保留架构、模块和验收说明。视觉上沿用主站的项目详情容器、标签和链接样式，
          外链按钮使用独立打开提示；ERP 登录页再通过来源参数展示来自 BIAU Port 的衔接提示，让用户知道自己正从公开展示站进入独立业务系统。
        </p>
      </section>
    </section>
  )
}
