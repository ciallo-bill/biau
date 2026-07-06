import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { projects, type ProjectDetailSection, type ProjectVisualBlock } from '../src/data/portfolio'

interface ProjectEvidenceSummary {
  id: string
  sections: number
  visuals: number
}

const MIN_DETAIL_SECTIONS = 5
const MIN_BODY_VISUALS = 2

const issues: string[] = []
const summaries: ProjectEvidenceSummary[] = []

function fail(projectId: string, message: string) {
  issues.push(`${projectId}: ${message}`)
}

function flattenSections(sections: Record<string, ProjectDetailSection[] | undefined> | undefined) {
  return Object.values(sections ?? {}).flatMap((items) => items ?? [])
}

function checkVisual(projectId: string, visual: ProjectVisualBlock) {
  if (!visual.title.trim()) fail(projectId, `visual ${visual.id} is missing a title`)
  if (!visual.description.trim()) fail(projectId, `visual ${visual.id} is missing a description`)

  if (!visual.image) return
  if (!visual.image.startsWith('/images/projects/')) {
    fail(projectId, `visual ${visual.id} must use a public /images/projects/ asset`)
    return
  }
  if (!visual.alt?.trim()) fail(projectId, `visual ${visual.id} image is missing alt text`)

  const publicPath = join(process.cwd(), 'public', visual.image.replace(/^\//u, ''))
  if (!existsSync(publicPath)) fail(projectId, `visual ${visual.id} references a missing asset: ${visual.image}`)
}

for (const project of projects) {
  if (!project.detailContent) {
    fail(project.id, 'missing detailContent')
    continue
  }

  const sections = flattenSections(project.detailContent)
  const visuals = sections.map((section) => section.visual).filter((visual): visual is ProjectVisualBlock => Boolean(visual))
  summaries.push({ id: project.id, sections: sections.length, visuals: visuals.length })

  if (sections.length < MIN_DETAIL_SECTIONS) {
    fail(project.id, `needs at least ${MIN_DETAIL_SECTIONS} detail sections, got ${sections.length}`)
  }
  if (visuals.length < MIN_BODY_VISUALS) {
    fail(project.id, `needs at least ${MIN_BODY_VISUALS} in-body visuals, got ${visuals.length}`)
  }

  for (const section of sections) {
    const hasBody = typeof section.body === 'string' && section.body.trim().length > 0
    const hasItems = Array.isArray(section.items) && section.items.length > 0
    if (!section.title.trim()) fail(project.id, 'a detail section is missing a title')
    if (!hasBody && !hasItems) fail(project.id, `section "${section.title}" needs body text or bullet items`)
  }

  for (const visual of visuals) checkVisual(project.id, visual)
}

if (issues.length > 0) {
  console.error('Project detail evidence check failed:')
  for (const issue of issues) console.error(`- ${issue}`)
  process.exitCode = 1
} else {
  const compact = summaries.map((item) => `${item.id}:${item.sections}/${item.visuals}`).join(', ')
  console.log(`Project detail evidence check passed for ${projects.length} projects.`)
  console.log(`sections/visuals: ${compact}`)
}

