import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { KnowledgeItem } from './types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const knowledgePath = path.resolve(__dirname, '../../data/public-knowledge.json')

function loadKnowledge(): KnowledgeItem[] {
  try {
    const raw = fs.readFileSync(knowledgePath, 'utf8')
    return JSON.parse(raw) as KnowledgeItem[]
  } catch {
    return [
      {
        id: 'site:intro',
        title: 'BIAU Port 站点简介',
        summary: 'BIAU Port 泊岸用于组织 AI 应用、业务系统、互动体验、移动端案例和技术知识库。',
        href: '/',
        tags: ['BIAU Port', '项目展示', '知识库'],
        visibility: 'public',
      },
    ]
  }
}

export const publicKnowledge = loadKnowledge()

export function searchKnowledge(query: string, limit = 4) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return publicKnowledge.slice(0, limit)

  const tokens = normalized.split(/\s+/).filter(Boolean)
  return publicKnowledge
    .map((item) => {
      const haystack = [item.title, item.summary, ...item.tags].join(' ').toLowerCase()
      let score = 0
      if (item.title.toLowerCase().includes(normalized)) score += 6
      if (item.summary.toLowerCase().includes(normalized)) score += 4
      if (item.tags.some((tag) => tag.toLowerCase().includes(normalized))) score += 3
      for (const token of tokens) {
        if (haystack.includes(token)) score += 1
      }
      return { item, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item)
}
