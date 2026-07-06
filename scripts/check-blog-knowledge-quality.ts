import { getBlogPost } from '../src/data/blogContent'
import { getPublicBlogPosts } from '../src/data/blogCuration'
import type { BlogPost } from '../src/data/blogShared'

const MIN_KNOWLEDGE_POINTS = 3
const MIN_SCENARIOS = 2
const MIN_CHECKLIST_ITEMS = 3
const MIN_SECTIONS = 5
const MIN_TAKEAWAYS = 3
const MIN_SECTION_BODY_CHARS = 60

const evidenceTitlePattern = /(资料来源|来源|参考|依据|证据边界|evidence|references|sources)/iu
const evidenceBodyPattern =
  /(https?:\/\/|arxiv\.org|aclanthology\.org|docs?\.|documentation|官方文档|公开资料|公开材料|论文|src\/data\/|scripts\/|package\.json|\.trellis\/|Cloudflare Pages|Vite|Trellis)/iu
const localProjectPattern = /(blog-semi|BIAU Port|泊岸|Legal RAG|Pet Workspace|Ozon ERP|ERP|Xunqiu|寻球|Playlab|Qdrant|Supabase)/giu
const weakFramingPattern = /(学习打卡|面试|答辩|简历|项目流水账|随手记录|内部解释)/iu
const sensitivePatterns = [
  { label: 'Windows absolute path', pattern: /(^|[\s"'([{])[A-Za-z]:[\\/]/u },
  { label: 'file URL', pattern: /file:\/\//iu },
  { label: 'localhost', pattern: /localhost|127\.0\.0\.1|0\.0\.0\.0/iu },
  { label: 'private IPv4 address', pattern: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/u },
  { label: 'secret-like query string', pattern: /(?:token|key|secret|password|passwd|pwd)=/iu },
]

const issues: string[] = []
const summaries: string[] = []

function fail(slug: string, message: string) {
  issues.push(`${slug}: ${message}`)
}

function nonEmptyStrings(items: string[] | undefined) {
  return (items ?? []).map((item) => item.trim()).filter(Boolean)
}

function combinedPostText(post: BlogPost) {
  return [
    post.title,
    post.detail,
    post.tag,
    post.series,
    ...nonEmptyStrings(post.knowledgePoints),
    ...nonEmptyStrings(post.scenarios),
    ...nonEmptyStrings(post.practiceChecklist),
    ...post.sections.flatMap((section) => [section.title, section.body]),
    ...post.takeaways,
  ]
    .filter(Boolean)
    .join('\n')
}

function countLocalProjectMentions(value: string) {
  return value.match(localProjectPattern)?.length ?? 0
}

function hasEvidenceSection(post: BlogPost) {
  return post.sections.some((section) => evidenceTitlePattern.test(section.title) && evidenceBodyPattern.test(section.body))
}

function checkPost(post: BlogPost) {
  const slug = post.slug
  const knowledgePoints = nonEmptyStrings(post.knowledgePoints)
  const scenarios = nonEmptyStrings(post.scenarios)
  const checklist = nonEmptyStrings(post.practiceChecklist)
  const takeaways = nonEmptyStrings(post.takeaways)
  const fullText = combinedPostText(post)

  if (knowledgePoints.length < MIN_KNOWLEDGE_POINTS) {
    fail(slug, `needs at least ${MIN_KNOWLEDGE_POINTS} knowledgePoints, got ${knowledgePoints.length}`)
  }
  if (scenarios.length < MIN_SCENARIOS) {
    fail(slug, `needs at least ${MIN_SCENARIOS} reusable scenarios, got ${scenarios.length}`)
  }
  if (checklist.length < MIN_CHECKLIST_ITEMS) {
    fail(slug, `needs at least ${MIN_CHECKLIST_ITEMS} practiceChecklist items, got ${checklist.length}`)
  }
  if (post.sections.length < MIN_SECTIONS) {
    fail(slug, `needs at least ${MIN_SECTIONS} sections, got ${post.sections.length}`)
  }
  if (takeaways.length < MIN_TAKEAWAYS) {
    fail(slug, `needs at least ${MIN_TAKEAWAYS} takeaways, got ${takeaways.length}`)
  }

  for (const [index, section] of post.sections.entries()) {
    if (!section.title.trim()) fail(slug, `section ${index + 1} is missing a title`)
    if (section.body.trim().length < MIN_SECTION_BODY_CHARS) {
      fail(slug, `section "${section.title || index + 1}" body is too thin`)
    }
  }

  if (!hasEvidenceSection(post)) {
    fail(slug, 'needs a source/evidence section with public references, repo paths, or official/public materials')
  }

  const openingText = post.sections
    .slice(0, 2)
    .flatMap((section) => [section.title, section.body])
    .join('\n')
  if (countLocalProjectMentions(openingText) > 1) {
    fail(slug, 'knowledge post opens as project-first content; reusable concept should come before local application notes')
  }
  if (weakFramingPattern.test(fullText)) {
    fail(slug, 'contains weak public-blog framing such as study diary, interview, resume, or internal-only wording')
  }

  for (const { label, pattern } of sensitivePatterns) {
    if (pattern.test(fullText)) fail(slug, `matches sensitive public-content pattern: ${label}`)
  }

  summaries.push(`${slug}: kp=${knowledgePoints.length}, scenarios=${scenarios.length}, checklist=${checklist.length}, sections=${post.sections.length}, takeaways=${takeaways.length}`)
}

async function main() {
  const knowledgeSummaries = getPublicBlogPosts().filter((post) => post.column === 'knowledge')

  if (knowledgeSummaries.length === 0) {
    console.log('Blog knowledge quality check skipped: no public knowledge posts.')
    return
  }

  for (const summary of knowledgeSummaries) {
    const post = await getBlogPost(summary.slug)
    if (!post) {
      fail(summary.slug, 'public knowledge post is missing a loadable runtime article')
      continue
    }
    checkPost(post)
  }

  if (issues.length > 0) {
    console.error(`Blog knowledge quality check failed (${issues.length} issues):`)
    for (const issue of issues) console.error(`- ${issue}`)
    process.exitCode = 1
    return
  }

  console.log(`Blog knowledge quality check passed for ${knowledgeSummaries.length} public knowledge posts.`)
  console.log(summaries.join('\n'))
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
