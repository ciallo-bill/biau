export type BlogCategory = 'tech' | 'project' | 'news' | 'resource' | 'daily'

export const categoryLabels: Record<BlogCategory, string> = {
  tech: '技术',
  project: '项目',
  news: '新闻',
  resource: '资源',
  daily: '日常',
}

export type BlogPost = {
  slug: string
  title: string
  tag: string
  category: BlogCategory
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
  'slug' | 'title' | 'tag' | 'category' | 'detail' | 'date' | 'readTime' | 'series' | 'knowledgePoints'
>
