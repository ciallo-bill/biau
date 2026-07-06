import type {
  AgentGuardrailSummary,
  AgentToolPermission,
  AgentToolTrace,
  AssistantGroundingMode,
  Citation,
} from './types.js'

const NORMAL_CHAT_ALLOWED_PERMISSIONS = new Set<AgentToolPermission>(['read', 'draft-write'])

export function canUsePermission(permission: AgentToolPermission) {
  return NORMAL_CHAT_ALLOWED_PERMISSIONS.has(permission)
}

export function sanitizeToolTrace(trace: AgentToolTrace): AgentToolTrace {
  return stripUndefinedJson({
    id: trace.id,
    label: trace.label,
    permission: trace.permission,
    status: trace.status,
    durationMs: Math.max(0, Math.trunc(trace.durationMs)),
    summary: compactText(trace.summary, 180),
    citationCount: trace.citationCount,
    itemCount: trace.itemCount,
    errorClass: trace.errorClass,
  })
}

export function summarizeGuardrails(input: {
  traces: AgentToolTrace[]
  citations: Citation[]
  grounding: AssistantGroundingMode
  answer: string
}): AgentGuardrailSummary {
  const blockedPermissions = input.traces
    .filter((trace) => !canUsePermission(trace.permission) || trace.status === 'blocked')
    .map((trace) => trace.permission)
  const allowedPermissions = Array.from(NORMAL_CHAT_ALLOWED_PERMISSIONS)
  const sensitiveOutputBlocked = containsSensitiveText(input.answer)
  const citationSufficiency = summarizeCitationSufficiency(input.citations, input.grounding)
  const issues = [
    ...new Set([
      ...input.traces.filter((trace) => trace.status === 'failed').map((trace) => `${trace.id}:tool_error`),
      ...blockedPermissions.map((permission) => `${permission}:blocked`),
      ...(sensitiveOutputBlocked ? ['sensitive-output-blocked'] : []),
      ...(input.grounding !== 'none' && citationSufficiency === 'none' ? ['citation-sufficiency:none'] : []),
    ]),
  ].slice(0, 8)

  return {
    status: sensitiveOutputBlocked || blockedPermissions.length > 0 ? 'blocked' : issues.length > 0 ? 'warned' : 'passed',
    allowedPermissions,
    blockedPermissions: Array.from(new Set(blockedPermissions)),
    citationSufficiency,
    sensitiveOutputBlocked,
    issues,
  }
}

export function containsSensitiveText(value: string) {
  const patterns = [
    /sk-[A-Za-z0-9_-]{16,}/u,
    /Bearer\s+[A-Za-z0-9._-]{12,}/iu,
    /postgres(?:ql)?:\/\/[^"'\s]+/iu,
    /mysql:\/\/[^"'\s]+/iu,
    /mongodb(?:\+srv)?:\/\/[^"'\s]+/iu,
    /-----BEGIN [A-Z ]+PRIVATE KEY-----/u,
    /ASSISTANT_MODEL_API_KEY|ASSISTANT_RAG_API_KEY|RAG_SYNC_TOKEN|DATABASE_URL/u,
  ]
  return patterns.some((pattern) => pattern.test(value))
}

function summarizeCitationSufficiency(citations: Citation[], grounding: AssistantGroundingMode) {
  if (grounding === 'none') return 'enough'
  if (citations.length >= 2) return 'enough'
  if (citations.length === 1) return 'weak'
  return 'none'
}

function compactText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1)}…`
}

function stripUndefinedJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
