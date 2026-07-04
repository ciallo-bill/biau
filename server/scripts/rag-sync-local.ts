import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type SourceType = 'site' | 'project' | 'blog' | 'status'

interface PublicDocument {
  id: string
  title: string
  summary: string
  href: string
  tags: string[]
  visibility: 'public'
  sourceType: SourceType
  projectId?: string
}

interface KnowledgeChunk {
  id: string
  documentId: string
  text: string
  section: string
  metadata: {
    sourceType: SourceType
    projectId?: string
    tags: string[]
  }
}

interface KnowledgeEntity {
  id: string
  name: string
  aliases: string[]
  metadata: Record<string, unknown>
}

interface KnowledgeRelation {
  fromEntityId: string
  toEntityId: string
  evidenceDocumentIds: string[]
}

interface PublicKnowledgeV2 {
  public_documents: PublicDocument[]
  knowledge_chunks: KnowledgeChunk[]
  entities: KnowledgeEntity[]
  relations: KnowledgeRelation[]
}

interface RagSyncLocalReport {
  schemaVersion: 'rag-sync-local-v1'
  generatedAt: string
  mode: 'local-readonly'
  source: string
  sourceChecksum: string
  counts: {
    documents: number
    chunks: number
    entities: number
    relations: number
  }
  tablePlan: {
    rag_documents: number
    rag_chunks: number
    rag_entities: number
    rag_relations: number
    rag_sync_runs: 1
  }
  issues: string[]
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')
const sourcePath = path.join(repoRoot, 'server/data/public-knowledge-v2.json')

const args = process.argv.slice(2)
const outputPath = readArgValue('--output')
const checkMode = args.includes('--check')

const raw = await readFile(sourcePath, 'utf8')
const knowledge = JSON.parse(raw) as PublicKnowledgeV2
const report = buildReport(knowledge, raw)

if (outputPath) {
  await writeFile(path.resolve(repoRoot, outputPath), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
}

if (!checkMode || report.issues.length > 0) {
  console.log(JSON.stringify(report, null, 2))
} else {
  console.log(
    `RAG local sync plan passed (${report.counts.documents} docs, ${report.counts.chunks} chunks, ${report.counts.entities} entities, ${report.counts.relations} relations)`,
  )
}

if (report.issues.length > 0) process.exit(1)

function buildReport(knowledge: PublicKnowledgeV2, raw: string): RagSyncLocalReport {
  const issues = validateKnowledge(knowledge)
  return {
    schemaVersion: 'rag-sync-local-v1',
    generatedAt: new Date().toISOString(),
    mode: 'local-readonly',
    source: 'server/data/public-knowledge-v2.json',
    sourceChecksum: createHash('sha256').update(raw).digest('hex'),
    counts: {
      documents: knowledge.public_documents.length,
      chunks: knowledge.knowledge_chunks.length,
      entities: knowledge.entities.length,
      relations: knowledge.relations.length,
    },
    tablePlan: {
      rag_documents: knowledge.public_documents.length,
      rag_chunks: knowledge.knowledge_chunks.length,
      rag_entities: knowledge.entities.length,
      rag_relations: knowledge.relations.length,
      rag_sync_runs: 1,
    },
    issues,
  }
}

function validateKnowledge(knowledge: PublicKnowledgeV2) {
  const issues: string[] = []
  const documentIds = new Set<string>()
  const chunkIds = new Set<string>()
  const entityIds = new Set<string>()

  for (const document of knowledge.public_documents) {
    if (document.visibility !== 'public') issues.push(`document ${document.id} is not public`)
    if (documentIds.has(document.id)) issues.push(`duplicate document id: ${document.id}`)
    documentIds.add(document.id)
    scanPublicText(`document ${document.id}`, [document.title, document.summary, document.href, ...document.tags], issues)
  }

  for (const chunk of knowledge.knowledge_chunks) {
    if (chunkIds.has(chunk.id)) issues.push(`duplicate chunk id: ${chunk.id}`)
    chunkIds.add(chunk.id)
    if (!documentIds.has(chunk.documentId)) issues.push(`chunk ${chunk.id} references missing document ${chunk.documentId}`)
    scanPublicText(`chunk ${chunk.id}`, [chunk.text, chunk.section, ...chunk.metadata.tags], issues)
  }

  for (const entity of knowledge.entities) {
    if (entityIds.has(entity.id)) issues.push(`duplicate entity id: ${entity.id}`)
    entityIds.add(entity.id)
    scanPublicText(`entity ${entity.id}`, [entity.name, ...entity.aliases], issues)
    const documentId = entity.metadata.documentId
    if (typeof documentId === 'string' && !documentIds.has(documentId)) {
      issues.push(`entity ${entity.id} references missing document ${documentId}`)
    }
  }

  for (const relation of knowledge.relations) {
    if (!entityIds.has(relation.fromEntityId)) issues.push(`relation references missing fromEntityId ${relation.fromEntityId}`)
    if (!entityIds.has(relation.toEntityId)) issues.push(`relation references missing toEntityId ${relation.toEntityId}`)
    for (const documentId of relation.evidenceDocumentIds) {
      if (!documentIds.has(documentId)) issues.push(`relation references missing evidence document ${documentId}`)
    }
  }

  return issues
}

function scanPublicText(label: string, values: string[], issues: string[]) {
  const combined = values.join('\n')
  const sensitivePatterns = [
    /sk-[A-Za-z0-9_-]{16,}/,
    /Bearer\s+[A-Za-z0-9._-]{12,}/i,
    /postgres(?:ql)?:\/\/[^"'\s]+/i,
    /mysql:\/\/[^"'\s]+/i,
    /mongodb(?:\+srv)?:\/\/[^"'\s]+/i,
    /-----BEGIN [A-Z ]+PRIVATE KEY-----/,
  ]
  if (sensitivePatterns.some((pattern) => pattern.test(combined))) {
    issues.push(`${label} contains a sensitive-looking value`)
  }
}

function readArgValue(name: string) {
  const index = args.indexOf(name)
  if (index === -1) return undefined
  const value = args[index + 1]
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value`)
  return value
}
