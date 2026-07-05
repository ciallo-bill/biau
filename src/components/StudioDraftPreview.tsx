import { Link } from 'react-router-dom'
import { blogColumnMeta, type BlogColumn } from '../data/blog'
import type { StudioContentBlock, StudioContentBody } from '../data/studio'
import { projects } from '../data/portfolio'

interface StudioDraftPreviewProps {
  title: string
  slug: string
  column: BlogColumn
  tag: string
  detail: string
  readTime: string
  date: string
  body: StudioContentBody
  knowledgePoints: string[]
  projectIds: string[]
  statusLabel: string
  visibilityLabel: string
  aiAssistance: string
}

interface PreviewSection {
  title: string
  blocks: StudioContentBlock[]
}

export function StudioDraftPreview({
  title,
  slug,
  column,
  tag,
  detail,
  readTime,
  date,
  body,
  knowledgePoints,
  projectIds,
  statusLabel,
  visibilityLabel,
  aiAssistance,
}: StudioDraftPreviewProps) {
  const sections = groupPreviewSections(body)
  const relatedProjects = projects.filter((project) => projectIds.includes(project.id))

  return (
    <article className="studio-card studio-preview">
      <div className="studio-card__header">
        <div>
          <p className="assistant-panel__eyebrow">PUBLIC PREVIEW</p>
          <h2>公开文章预览</h2>
        </div>
        <span className="studio-status-pill">{visibilityLabel}</span>
      </div>

      <div className="studio-preview-toolbar">
        <span>{statusLabel}</span>
        <span>{aiAssistance || 'none'}</span>
        <span>{slug || 'unsaved-slug'}</span>
      </div>

      <div className="studio-preview-article blog-post-page">
        <header className="detail-header">
          <div className="detail-badges">
            <span className="tag">{blogColumnMeta[column].titleZh}</span>
            <span className="blog-series">Studio Draft</span>
          </div>
          <h1 className="detail-title">{title || '未命名草稿'}</h1>
          <p className="detail-summary">{detail || '这里会显示公开列表和文章详情页使用的摘要。'}</p>
          <div className="blog-meta detail-meta">
            <span className="blog-read-time">{readTime || '8 min'}</span>
            <span className="blog-divider">·</span>
            <span className="blog-date">{date}</span>
            <span className="blog-divider">·</span>
            <span className="tag">{tag || blogColumnMeta[column].titleZh}</span>
          </div>
        </header>

        <div className="detail-body blog-post-body">
          {knowledgePoints.length > 0 && (
            <section className="detail-block">
              <h2 className="detail-block-title">知识点</h2>
              <ul className="detail-highlights">
                {knowledgePoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          )}

          {sections.map((section) => (
            <section key={section.title} className="detail-block blog-post-section">
              <h2 className="detail-block-title">{section.title}</h2>
              <div className="studio-preview-blocks">
                {section.blocks.length > 0 ? (
                  section.blocks.map((block, index) => renderPreviewBlock(block, `${section.title}-${index}`))
                ) : (
                  <p className="blog-post-body-text">正文内容会在这里按公开文章样式预览。</p>
                )}
              </div>
            </section>
          ))}
        </div>

        {relatedProjects.length > 0 && (
          <section className="detail-related studio-preview-related">
            <h2 className="detail-block-title">关联项目</h2>
            <div className="detail-related-grid">
              {relatedProjects.map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`} className="detail-related-card">
                  <span className="detail-related-cat">{project.role}</span>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}

function groupPreviewSections(body: StudioContentBody): PreviewSection[] {
  const sections: PreviewSection[] = [{ title: '正文', blocks: [] }]

  for (const block of body.blocks) {
    if (block.type === 'heading' && block.text) {
      sections.push({ title: block.text, blocks: [] })
      continue
    }
    sections[sections.length - 1].blocks.push(block)
  }

  return sections.filter((section, index) => section.blocks.length > 0 || (index === 0 && sections.length === 1))
}

function renderPreviewBlock(block: StudioContentBlock, key: string) {
  if (block.type === 'list') {
    return (
      <ul key={key} className="detail-highlights">
        {(block.items ?? []).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  }

  if (block.type === 'image') {
    return (
      <figure key={key} className="studio-preview-figure">
        {block.src && <img src={block.src} alt={block.alt || block.caption || '文章配图预览'} loading="lazy" />}
        {(block.caption || block.alt) && <figcaption>{block.caption || block.alt}</figcaption>}
      </figure>
    )
  }

  if (block.type === 'flow') {
    return (
      <figure key={key} className="studio-preview-flow">
        <pre>{block.mermaid}</pre>
        {block.caption && <figcaption>{block.caption}</figcaption>}
      </figure>
    )
  }

  if (block.type === 'source-card') {
    return (
      <div key={key} className="studio-preview-source-card">
        <span>Source</span>
        <strong>{block.caption || block.sourceItemId || '未绑定来源'}</strong>
      </div>
    )
  }

  return (
    <p key={key} className="blog-post-body-text">
      {block.text}
    </p>
  )
}
