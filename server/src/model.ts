import { env, hasModelProvider } from './env.js'
import type { KnowledgeItem } from './types.js'

interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string } }>
}

export type AssistantFallbackReason = 'not_configured' | 'provider_error' | 'empty_response'

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
      ? `关于“${question}”，我目前只回答本站公开内容。这个问题暂时没有命中相关资料，你可以换一个项目名、技术词或去知识库继续查找。`
      : `关于“${question}”，内部助手当前没有找到足够的站点资料。可以换成项目名、博客主题或交付相关问题继续试试。`
  }

  const prefix = scope === 'public' ? '根据本站公开内容，我找到这些线索：' : '我先基于当前站点知识整理一个方向：'
  return `${prefix}${citations.map((item) => `${item.title}：${item.summary}`).join(' ')}`
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
  if (!hasModelProvider()) return fallbackResult(question, citations, scope, 'not_configured')

  const modelConfig = readModelConfig()
  if (!modelConfig.apiKey) return fallbackResult(question, citations, scope, 'not_configured')

  const context = citations.map((item, index) => `${index + 1}. ${item.title}\n${item.summary}\n${item.href}`).join('\n\n')
  const system =
    scope === 'public'
      ? '你是 BIAU Port 泊岸公开助手。只能基于提供的公开站点资料回答，回答要简洁，并提醒用户可打开引用链接继续阅读。'
      : '你是 BIAU Port 泊岸内部助手。基于提供的站点资料帮助内部成员整理项目、提纲和交付检查，避免宣称已执行真实写操作。'

  const response = await fetch(`${modelConfig.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${modelConfig.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelConfig.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `资料：\n${context || '暂无命中资料'}\n\n问题：${question}` },
      ],
    }),
  }).catch(() => null)

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
