import fs from 'node:fs'
import path from 'node:path'
import { publicKnowledgeBase, type AssistantKnowledgeItem } from '../src/data/assistant'

type KnowledgeItem = AssistantKnowledgeItem & { visibility: 'public' }

const outputPath = path.resolve('server/data/public-knowledge.json')

const items: KnowledgeItem[] = publicKnowledgeBase.filter((item): item is KnowledgeItem => item.visibility === 'public')

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify(items, null, 2)}\n`)
console.log(`Generated ${items.length} public knowledge items at ${outputPath}`)
