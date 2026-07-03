import { env, hasModelProvider } from './env.js'
import type { KnowledgeItem } from './types.js'

interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string } }>
}

export type AssistantFallbackReason = 'not_configured' | 'provider_error' | 'empty_response' | 'no_public_context'

export interface GeneratedAnswer {
  answer: string
  mode: 'model' | 'fallback'
  model: string
  provider: string
  reason?: AssistantFallbackReason
}

function buildFallbackAnswer(question: string, citations: KnowledgeItem[], scope: 'public' | 'internal') {
  if (citations.length === 0) {
    return scope === 'public'
      ? `我只回答本站公开内容。关于“${question}”，这次没有命中足够资料；可以换成项目名、技术词，或从项目页、知识库继续找。`
      : `关于“${question}”，内部助手当前没有找到足够的站点资料。可以换成项目名、博客主题或交付相关问题继续试试。`
  }

  const intro = scope === 'public' ? '我先按本站公开资料给你一个方向：' : '我先基于当前站点知识整理一个方向：'
  const lines = citations.slice(0, 3).map((item) => `- ${item.title}：${item.summary}`)
  return `${intro}\n${lines.join('\n')}`
}

function readModelConfig() {
  return {
    apiKey: env.assistantModelApiKey || env.openaiApiKey,
    baseUrl: env.assistantModelBaseUrl || env.openaiBaseUrl,
    model: env.assistantModelName || env.openaiModel,
    provider: env.assistantModelProvider || 'openai-compatible',
  }
}

function fallbackResult(
  question: string,
  citations: KnowledgeItem[],
  scope: 'public' | 'internal',
  reason: AssistantFallbackReason,
  model = 'fallback',
  provider = 'local-public-knowledge',
): GeneratedAnswer {
  return {
    answer: buildFallbackAnswer(question, citations, scope),
    mode: 'fallback',
    model,
    provider,
    reason,
  }
}

export async function generateAnswer(question: string, citations: KnowledgeItem[], scope: 'public' | 'internal'): Promise<GeneratedAnswer> {
  if (scope === 'public' && citations.length === 0) return fallbackResult(question, citations, scope, 'no_public_context')
  if (!hasModelProvider()) return fallbackResult(question, citations, scope, 'not_configured')

  const modelConfig = readModelConfig()
  if (!modelConfig.apiKey) return fallbackResult(question, citations, scope, 'not_configured')

  const context = citations.map((item, index) => `${index + 1}. ${item.title}\n${item.summary}\n${item.href}`).join('\n\n')
  const system =
    scope === 'public'
      ? '你是 BIAU Port 泊岸公开助手。只能基于提供的公开站点资料回答，不要使用外部常识补造事实。回答要自然、简洁，先给结论，再给 2-3 个可继续查看的方向。'
      : '你是 BIAU Port 泊岸内部助手。基于提供的站点资料帮助内部成员整理项目、提纲和交付检查，避免宣称已执行真实写操作。'

  const abort = new AbortController()
  const timeout = setTimeout(() => abort.abort(), 12000)
  const response = await fetch(`${modelConfig.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${modelConfig.apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: abort.signal,
    body: JSON.stringify({
      model: modelConfig.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `公开资料：\n${context}\n\n问题：${question}` },
      ],
    }),
  })
    .catch(() => null)
    .finally(() => clearTimeout(timeout))

  if (!response?.ok) {
    return fallbackResult(question, citations, scope, 'provider_error', modelConfig.model, modelConfig.provider)
  }

  const payload = (await response.json().catch(() => null)) as OpenAIResponse | null
  const answer = payload?.choices?.[0]?.message?.content?.trim()
  if (!answer) return fallbackResult(question, citations, scope, 'empty_response', modelConfig.model, modelConfig.provider)

  return {
    answer,
    mode: 'model',
    model: modelConfig.model,
    provider: modelConfig.provider,
  }
}
