import fs from 'node:fs'
import path from 'node:path'
import { publicKnowledgeBase, publicKnowledgeV2, type AssistantKnowledgeItem } from '../src/data/assistant'

type KnowledgeItem = AssistantKnowledgeItem & { visibility: 'public' }

const outputPath = path.resolve('server/data/public-knowledge.json')
const v2OutputPath = path.resolve('server/data/public-knowledge-v2.json')

const items: KnowledgeItem[] = publicKnowledgeBase.filter((item): item is KnowledgeItem => item.visibility === 'public')

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify(items, null, 2)}\n`)
fs.writeFileSync(v2OutputPath, `${JSON.stringify(publicKnowledgeV2, null, 2)}\n`)
console.log(`Generated ${items.length} public knowledge items at ${outputPath}`)
console.log(
  `Generated public knowledge V2 at ${v2OutputPath} (${publicKnowledgeV2.public_documents.length} docs, ${publicKnowledgeV2.knowledge_chunks.length} chunks, ${publicKnowledgeV2.entities.length} entities, ${publicKnowledgeV2.relations.length} relations)`,
)
