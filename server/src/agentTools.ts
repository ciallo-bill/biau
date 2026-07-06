import fs from 'node:fs'
import path from 'node:path'
import { retrieveKnowledge, publicKnowledge } from './knowledge.js'
import { retrieveAssistantContext } from './ragClient.js'
import { canUsePermission, sanitizeToolTrace } from './agentGuardrails.js'
import type {
  AgentToolContext,
  AgentToolDefinition,
  AgentToolExecutionResult,
  AgentToolPayload,
} from './agentTypes.js'
import type { AgentToolId, AgentToolTrace, Citation } from './types.js'

type AgentToolExecutor = (context: AgentToolContext) => Promise<AgentToolPayload> | AgentToolPayload

interface AgentToolRuntimeDefinition extends AgentToolDefinition {
  execute: AgentToolExecutor
}

const statusSnapshotPath = path.resolve(process.cwd(), 'public/status/site-status.json')

const toolDefinitions: AgentToolRuntimeDefinition[] = [
  {
    id: 'rag.retrieve',
    label: 'Scoped RAG',
    permission: 'read',
    description: '检索 public/internal 范围内的项目、博客、状态和知识证据。',
    execute: executeRagRetrieve,
  },
  {
    id: 'status.query',
    label: 'Status Query',
    permission: 'read',
    description: '读取公开状态页、synthetic 检查和 manual gate 摘要。',
    execute: executeStatusQuery,
  },
  {
    id: 'project.lookup',
    label: 'Project Lookup',
    permission: 'read',
    description: '读取公开项目事实、技术栈、展示入口和项目详情摘要。',
    execute: executeProjectLookup,
  },
  {
    id: 'knowledge.search',
    label: 'Knowledge Search',
    permission: 'read',
    description: '搜索公开知识条目和当前内部已审核知识文档摘要。',
    execute: executeKnowledgeSearch,
  },
  {
    id: 'studio.draft',
    label: 'Studio Draft',
    permission: 'draft-write',
    description: '生成需要人工审核的 Studio 草稿计划，不直接发布公开内容。',
    execute: executeStudioDraft,
  },
  {
    id: 'memory.search',
    label: 'Session Memory',
    permission: 'read',
    description: '读取当前成员当前会话的低敏历史摘要，不能跨成员读取。',
    execute: executeMemorySearch,
  },
  {
    id: 'memory.write',
    label: 'Memory Note',
    permission: 'draft-write',
    description: '未来写入低敏会话偏好或摘要；当前实现只返回待审核计划。',
    execute: executeMemoryWritePlan,
  },
  {
    id: 'answer.direct',
    label: 'Direct Answer',
    permission: 'read',
    description: '无需外部工具时直接回答或写作。',
    execute: executeDirectAnswer,
  },
]

export const agentToolRegistry = new Map<AgentToolId, AgentToolRuntimeDefinition>(
  toolDefinitions.map((definition) => [definition.id, definition]),
)

export function listAgentToolMenu(): AgentToolDefinition[] {
  return toolDefinitions.map(({ id, label, permission, description }) => ({ id, label, permission, description }))
}

export async function executeAgentTool(toolId: AgentToolId, context: AgentToolContext): Promise<AgentToolExecutionResult> {
  const definition = agentToolRegistry.get(toolId)
  const startedAt = Date.now()
  if (!definition) {
    return failedToolResult(toolId, 'Unknown tool', startedAt, 'tool_error')
  }

  if (!canUsePermission(definition.permission)) {
    return {
      citations: [],
      chunks: [],
      contextBlocks: [],
      summary: `${definition.label} 被权限策略阻止。`,
      trace: sanitizeToolTrace({
        id: definition.id,
        label: definition.label,
        permission: definition.permission,
        status: 'blocked',
        durationMs: Date.now() - startedAt,
        summary: `${definition.label} 被权限策略阻止。`,
        errorClass: 'policy_blocked',
      }),
    }
  }

  try {
    const payload = await definition.execute(context)
    const trace: AgentToolTrace = {
      id: definition.id,
      label: definition.label,
      permission: definition.permission,
      status: 'completed',
      durationMs: Date.now() - startedAt,
      summary: payload.summary,
      citationCount: payload.citations.length,
      itemCount: payload.itemCount,
    }
    return {
      ...payload,
      trace: sanitizeToolTrace(trace),
    }
  } catch {
    return failedToolResult(definition.id, definition.label, startedAt, 'tool_error')
  }
}

async function executeRagRetrieve(context: AgentToolContext): Promise<AgentToolPayload> {
  const result = await retrieveAssistantContext(context.question, 'internal', 5)
  return {
    citations: result.citations,
    chunks: result.chunks,
    retrieval: result.retrieval,
    contextBlocks: [
      `RAG 检索：${result.retrieval.sufficiency}，候选 ${result.retrieval.candidateCount}，引用 ${result.citations.length}。`,
      ...result.chunks.slice(0, 4).map((chunk) => `${chunk.section}：${compactText(chunk.text, 360)}`),
    ],
    summary: `RAG 返回 ${result.citations.length} 条引用，证据充分性为 ${result.retrieval.sufficiency}。`,
    itemCount: result.retrieval.candidateCount,
  }
}

function executeStatusQuery(context: AgentToolContext): AgentToolPayload {
  const snapshot = readStatusSnapshot()
  const citations = publicKnowledge.filter((item) => item.id === 'site:status').map(toCitation)
  if (!isRecord(snapshot)) {
    return {
      citations,
      chunks: [],
      contextBlocks: ['当前没有读取到公开状态快照；可参考站点状态页和最近的 synthetic 输出。'],
      summary: '未读取到公开状态快照，已降级到状态页知识条目。',
      itemCount: 0,
    }
  }

  const targetSummaries = readRecordArray(snapshot.targets)
    .map(readStatusTargetSummary)
    .filter((item): item is string => Boolean(item))
    .filter((item) => matchesQuery(item, context.question))
    .slice(0, 5)
  const projectSummaries = readRecordArray(snapshot.reliabilityProjects)
    .flatMap((project) => readReliabilityProjectSummary(project, context.question))
    .slice(0, 8)
  const summary = readStatusSummary(snapshot.summary)
  const contextBlocks = [
    summary ? `状态页汇总：${summary}` : '',
    ...targetSummaries,
    ...projectSummaries,
  ].filter(Boolean)

  return {
    citations,
    chunks: [],
    contextBlocks: contextBlocks.length > 0 ? contextBlocks : ['状态页存在，但没有命中与问题直接相关的检查项。'],
    summary: summary ? `状态页快照可用：${summary}` : '状态页快照可用。',
    itemCount: targetSummaries.length + projectSummaries.length,
  }
}

function executeProjectLookup(context: AgentToolContext): AgentToolPayload {
  const retrieval = retrieveKnowledge(context.question, 6)
  let citations = retrieval.citations.filter((item) => item.id.startsWith('project:')).map(toCitation)
  if (citations.length === 0 && mentionsProjectSurface(context.question)) {
    citations = publicKnowledge.filter((item) => item.id.startsWith('project:')).slice(0, 4).map(toCitation)
  }
  return {
    citations,
    chunks: retrieval.chunks,
    contextBlocks: citations.map((citation) => `${citation.title}：${citation.summary}`),
    summary: citations.length > 0 ? `命中 ${citations.length} 个项目事实。` : '没有命中明确项目事实。',
    itemCount: citations.length,
  }
}

async function executeKnowledgeSearch(context: AgentToolContext): Promise<AgentToolPayload> {
  const retrieval = retrieveKnowledge(context.question, 5)
  const publicCitations = retrieval.citations.map(toCitation)
  const internalDocuments = await context.prisma.internalKnowledgeDocument.findMany({
    where: { status: { in: ['REVIEWED', 'ACTIVE'] } },
    orderBy: { updatedAt: 'desc' },
    take: 40,
  })
  const matchedInternal = internalDocuments
    .filter((document) => matchesInternalDocument(document, context.question))
    .slice(0, 3)
    .map((document): Citation => ({
      id: `internal-knowledge:${document.slug}`,
      title: document.title,
      summary: document.summary,
      href: '/assistant/admin',
      tags: readJsonStringArray(document.tags),
      visibility: 'internal',
    }))
  const citations = dedupeCitations([...matchedInternal, ...publicCitations]).slice(0, 6)
  return {
    citations,
    chunks: retrieval.chunks,
    contextBlocks: citations.map((citation) => `${citation.title}：${citation.summary}`),
    summary: `知识搜索返回 ${citations.length} 条安全摘要，其中内部知识 ${matchedInternal.length} 条。`,
    itemCount: citations.length,
  }
}

function executeStudioDraft(context: AgentToolContext): AgentToolPayload {
  const draftKind = inferDraftKind(context.question)
  const plan = [
    `草稿类型：${draftKind}`,
    '写入边界：只生成 Studio 草稿计划，公开发布、导出、部署和 admin 设置都需要人工审核。',
    '建议结构：标题、摘要、正文区块、知识点、关联项目、review checklist、发布前验证命令。',
  ]
  return {
    citations: [],
    chunks: [],
    contextBlocks: plan,
    summary: `已生成 ${draftKind} 的 draft-write 计划，等待人工进入 Studio 创建或审核。`,
    itemCount: plan.length,
  }
}

async function executeMemorySearch(context: AgentToolContext): Promise<AgentToolPayload> {
  const messages = await context.prisma.chatMessage.findMany({
    where: {
      memberId: context.member.id,
      sessionId: context.sessionId,
    },
    orderBy: { createdAt: 'desc' },
    take: 8,
  })
  const snippets = messages
    .reverse()
    .map((message) => `${message.role === 'USER' ? '用户' : '助手'}：${compactText(message.content, 220)}`)
  return {
    citations: [],
    chunks: [],
    contextBlocks: snippets,
    summary: snippets.length > 0 ? `读取当前会话 ${snippets.length} 条低敏历史摘要。` : '当前会话暂无可用历史摘要。',
    itemCount: snippets.length,
  }
}

function executeMemoryWritePlan(): AgentToolPayload {
  return {
    citations: [],
    chunks: [],
    contextBlocks: ['当前版本不直接写入长期记忆；如需保留偏好，应先生成低敏摘要并由成员确认。'],
    summary: '长期记忆写入被限制为待审核计划。',
    itemCount: 1,
  }
}

function executeDirectAnswer(): AgentToolPayload {
  return {
    citations: [],
    chunks: [],
    contextBlocks: ['无需调用外部检索工具；可以由成员模型渠道直接回答。'],
    summary: '直接回答路径已选择。',
    itemCount: 0,
  }
}

function failedToolResult(
  toolId: AgentToolId,
  label: string,
  startedAt: number,
  errorClass: NonNullable<AgentToolTrace['errorClass']>,
): AgentToolExecutionResult {
  const summary = `${label} 执行失败，已记录为低敏工具错误。`
  return {
    citations: [],
    chunks: [],
    contextBlocks: [],
    summary,
    trace: sanitizeToolTrace({
      id: toolId,
      label,
      permission: 'read',
      status: 'failed',
      durationMs: Date.now() - startedAt,
      summary,
      errorClass,
    }),
  }
}

function readStatusSnapshot() {
  try {
    return JSON.parse(fs.readFileSync(statusSnapshotPath, 'utf8')) as unknown
  } catch {
    return null
  }
}

function readStatusSummary(value: unknown) {
  if (!isRecord(value)) return ''
  const total = readNumber(value.total)
  const online = readNumber(value.online)
  const degraded = readNumber(value.degraded)
  const offline = readNumber(value.offline)
  const unchecked = readNumber(value.unchecked)
  if (total === null) return ''
  return `total=${total}, online=${online ?? 0}, degraded=${degraded ?? 0}, offline=${offline ?? 0}, unchecked=${unchecked ?? 0}`
}

function readStatusTargetSummary(value: Record<string, unknown>) {
  const label = readString(value.label)
  const status = readString(value.status)
  const description = readString(value.description)
  const issues = readStringArray(value.issues).slice(0, 3)
  if (!label || !status) return ''
  return `${label}：${status}。${compactText(description, 160)}${issues.length > 0 ? ` 问题：${issues.join('；')}` : ''}`
}

function readReliabilityProjectSummary(project: Record<string, unknown>, query: string) {
  const title = readString(project.title)
  const summary = readString(project.summary)
  const checks = readRecordArray(project.checks)
    .filter((check) => matchesQuery(`${title} ${readString(check.label)} ${readString(check.description)}`, query))
    .slice(0, 4)
    .map((check) => `${title} / ${readString(check.label)}：${readString(check.status)}。${compactText(readString(check.evidence), 220)}`)
  if (checks.length > 0) return checks
  if (matchesQuery(`${title} ${summary}`, query)) return [`${title}：${compactText(summary, 260)}`]
  return []
}

function matchesInternalDocument(
  document: { title: string; summary: string; body: string; tags: unknown },
  query: string,
) {
  const haystack = normalizeText([document.title, document.summary, document.body, ...readJsonStringArray(document.tags)].join(' '))
  const terms = extractTerms(query)
  if (terms.length === 0) return false
  return terms.some((term) => haystack.includes(term))
}

function matchesQuery(value: string, query: string) {
  const normalized = normalizeText(value)
  const terms = extractTerms(query)
  if (terms.length === 0) return true
  return terms.some((term) => normalized.includes(term))
}

function extractTerms(value: string) {
  const normalized = normalizeText(value)
  const ascii = normalized.match(/[a-z0-9+#.]{2,}/gu) ?? []
  const chinese = normalized.match(/[\u4e00-\u9fa5]{2,}/gu) ?? []
  return Array.from(new Set([...ascii, ...chinese])).slice(0, 12)
}

function mentionsProjectSurface(value: string) {
  return /项目|案例|技术栈|架构|实现|入口|演示|legal|rag|erp|pet|xunqiu|寻球|playlab|game/iu.test(value)
}

function inferDraftKind(value: string) {
  const normalized = normalizeText(value)
  if (normalized.includes('日报') || normalized.includes('ai daily')) return 'AI 日报草稿'
  if (normalized.includes('项目') || normalized.includes('案例')) return '项目总结 / 详情页草稿'
  if (normalized.includes('状态') || normalized.includes('可靠性')) return '状态页说明草稿'
  if (normalized.includes('资源')) return '资源分享草稿'
  return '知识积累草稿'
}

function toCitation(item: Citation): Citation {
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    href: item.href,
    tags: item.tags ?? [],
    visibility: item.visibility ?? 'public',
  }
}

function dedupeCitations(citations: Citation[]) {
  const seen = new Set<string>()
  return citations.filter((citation) => {
    if (seen.has(citation.id)) return false
    seen.add(citation.id)
    return true
  })
}

function readJsonStringArray(value: unknown) {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string').slice(0, 12)
  return []
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map(readString).filter(Boolean)
}

function readRecordArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter(isRecord)
}

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function readNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function compactText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1)}…`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
