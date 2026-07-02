import { useEffect, useRef, useState } from 'react'
import { IconClose, IconSend } from '@douyinfe/semi-icons'
import { Link } from 'react-router-dom'
import {
  publicAssistantSuggestions,
  publicKnowledgeBase,
  normalizeAssistantCitations,
  searchPublicKnowledge,
  type AssistantKnowledgeItem,
} from '../data/assistant'
import { trackAnalyticsEvent } from '../utils/analytics'

interface WidgetMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: AssistantKnowledgeItem[]
  meta?: AssistantAnswerMeta
}

interface AssistantAnswerMeta {
  mode: 'model' | 'fallback'
  model: string
  provider?: string
  reason?: AssistantFallbackReason
  citationCount: number
}

type AssistantFallbackReason = 'not_configured' | 'provider_error' | 'empty_response' | 'request_error'
type AssistantServiceState = 'api-ready' | 'local' | 'model' | 'fallback' | 'error'

const API_BASE = import.meta.env.VITE_CHAT_API_BASE_URL?.trim()
const MAX_MESSAGE_LENGTH = 500

const introMessage: WidgetMessage = {
  id: 'intro',
  role: 'assistant',
  content: '你好，我是泊岸公开助手。我只使用本站公开项目、文章和能力说明来回答，适合快速了解案例、技术方向和后续路线。',
  citations: publicKnowledgeBase.slice(0, 2),
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

interface PublicAnswerResult {
  content: string
  citations: AssistantKnowledgeItem[]
  meta: AssistantAnswerMeta
}

function isAssistantFallbackReason(value: unknown): value is AssistantFallbackReason {
  return value === 'not_configured' || value === 'provider_error' || value === 'empty_response'
}

async function requestPublicAnswer(question: string): Promise<PublicAnswerResult> {
  if (!API_BASE) {
    const citations = searchPublicKnowledge(question)
    if (citations.length === 0) {
      return {
        content:
          '我目前只回答本站公开内容。这个问题暂时没有命中相关资料；可以换一个项目名、技术词，或先浏览项目页和知识库。',
        citations: [] as AssistantKnowledgeItem[],
        meta: {
          mode: 'fallback' as const,
          model: 'local-public-knowledge',
          provider: 'browser-local',
          reason: 'not_configured',
          citationCount: 0,
        },
      }
    }

    const summary = citations
      .map((item) => `${item.title}：${item.summary}`)
      .join(' ')

    return {
      content: `根据当前公开内容，我优先找到了这些信息：${summary}`,
      citations,
      meta: {
        mode: 'fallback' as const,
        model: 'local-public-knowledge',
        provider: 'browser-local',
        reason: 'not_configured',
        citationCount: citations.length,
      },
    }
  }

  const response = await fetch(`${API_BASE}/chat/public`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: question }),
  })

  if (!response.ok) {
    throw new Error('public-chat-request-failed')
  }

  const payload = (await response.json()) as unknown
  const answer = isRecord(payload) && typeof payload.answer === 'string' ? payload.answer.trim() : ''
  const citations = isRecord(payload) ? normalizeAssistantCitations(payload.citations) : []
  const rawMeta = isRecord(payload) && isRecord(payload.meta) ? payload.meta : undefined
  const mode: AssistantAnswerMeta['mode'] = rawMeta?.mode === 'model' ? 'model' : 'fallback'
  const model = typeof rawMeta?.model === 'string' && rawMeta.model.trim() ? rawMeta.model.trim() : mode
  const provider = typeof rawMeta?.provider === 'string' && rawMeta.provider.trim() ? rawMeta.provider.trim() : undefined
  const reason = isAssistantFallbackReason(rawMeta?.reason) ? rawMeta.reason : undefined
  const citationCount = typeof rawMeta?.citationCount === 'number' ? rawMeta.citationCount : citations.length

  return {
    content:
      answer ||
      '公开助手暂时没有返回内容。你可以稍后重试，或者先去项目页和知识库查看详细资料。',
    citations,
    meta: {
      mode,
      model,
      provider,
      reason,
      citationCount,
    },
  }
}

function getFallbackLabel(reason?: AssistantFallbackReason) {
  if (reason === 'provider_error') return '模型通道失败，已回退'
  if (reason === 'empty_response') return '模型无内容，已回退'
  if (reason === 'request_error') return '站内 API 暂不可用'
  return '公开知识兜底'
}

function formatAnswerMeta(meta?: AssistantAnswerMeta) {
  if (!meta) return ''
  const modeLabel = meta.mode === 'model' ? 'AI 辅助' : getFallbackLabel(meta.reason)
  return [modeLabel, meta.provider, meta.model, `${meta.citationCount} 条引用`].filter(Boolean).join(' · ')
}

function getServiceStatus(state: AssistantServiceState) {
  if (state === 'model') return { className: 'is-model', label: 'AI 辅助已启用' }
  if (state === 'error') return { className: 'is-error', label: '服务暂不可用' }
  if (state === 'fallback') return { className: 'is-fallback', label: '公开知识兜底' }
  if (state === 'api-ready') return { className: 'is-ready', label: '站内 API 已连接' }
  return { className: 'is-local', label: '本地公开知识' }
}

export function PublicAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<WidgetMessage[]>([introMessage])
  const [serviceState, setServiceState] = useState<AssistantServiceState>(API_BASE ? 'api-ready' : 'local')
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const messageSeq = useRef(0)
  const serviceStatus = getServiceStatus(serviceState)

  const createMessageId = (role: WidgetMessage['role']) => {
    messageSeq.current += 1
    return `public-${role}-${messageSeq.current}`
  }

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isOpen])

  const toggleWidget = () => {
    if (!isOpen) {
      trackAnalyticsEvent('public_assistant_open', {
        source: 'floating-widget',
      })
    }
    setIsOpen((value) => !value)
  }

  const submitQuestion = async (question: string) => {
    const trimmed = question.trim()
    if (!trimmed || isLoading) return

    trackAnalyticsEvent('public_assistant_question', {
      source: 'floating-widget',
      questionLength: Math.min(trimmed.length, MAX_MESSAGE_LENGTH),
    })

    const userMessage: WidgetMessage = {
      id: createMessageId('user'),
      role: 'user',
      content: trimmed.slice(0, MAX_MESSAGE_LENGTH),
    }

    setMessages((current) => [...current, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const result = await requestPublicAnswer(trimmed)
      setServiceState(result.meta.mode === 'model' ? 'model' : API_BASE ? 'fallback' : 'local')
      setMessages((current) => [
        ...current,
        {
          id: createMessageId('assistant'),
          role: 'assistant',
          content: result.content,
          citations: result.citations,
          meta: result.meta,
        },
      ])
    } catch {
      const citations = searchPublicKnowledge(trimmed)
      const fallbackSummary = citations.map((item) => `${item.title}：${item.summary}`).join(' ')
      setServiceState('error')
      setMessages((current) => [
        ...current,
        {
          id: createMessageId('assistant'),
          role: 'assistant',
          content: fallbackSummary
            ? `站内助手 API 暂时不可用，我先用浏览器本地公开知识保留这些线索：${fallbackSummary}`
            : '站内助手 API 暂时不可用。我不会编造答案；可以先浏览项目页、博客页，或稍后再试。',
          citations,
          meta: {
            mode: 'fallback',
            model: 'local-public-knowledge',
            provider: 'browser-local',
            reason: 'request_error',
            citationCount: citations.length,
          },
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`public-assistant ${isOpen ? 'is-open' : ''}`}>
      <button
        type="button"
        className="public-assistant__trigger"
        aria-expanded={isOpen}
        aria-controls="public-assistant-panel"
        onClick={toggleWidget}
      >
        <span className="public-assistant__trigger-mark" aria-hidden="true">
          B
        </span>
        <span className="public-assistant__trigger-text">公开知识问答</span>
      </button>

      {isOpen && (
        <section className="public-assistant__panel" id="public-assistant-panel" aria-label="公开助手">
          <header className="public-assistant__header">
            <div>
              <p className="public-assistant__eyebrow">PUBLIC KNOWLEDGE</p>
              <h2>泊岸公开助手</h2>
              <span className={`public-assistant__status ${serviceStatus.className}`}>
                {serviceStatus.label}
              </span>
            </div>
            <button type="button" className="public-assistant__close" onClick={() => setIsOpen(false)} aria-label="关闭公开助手">
              <IconClose aria-hidden />
            </button>
          </header>

          <p className="public-assistant__hint">
            用于查找本站项目、文章和公开能力边界；不访问私有仓库、后台、账号或未公开部署。
            <Link to="/assistant">内部成员入口</Link>
          </p>

          <div className="public-assistant__messages" ref={scrollRef}>
            {messages.map((message) => (
              <article key={message.id} className={`public-assistant__message is-${message.role}`}>
                <p>{message.content}</p>
                {message.role === 'assistant' && message.meta && (
                  <small className="public-assistant__meta">{formatAnswerMeta(message.meta)}</small>
                )}
                {message.citations && message.citations.length > 0 && (
                  <div className="public-assistant__citations">
                    {message.citations.map((item) => (
                      <Link key={item.id} to={item.href} className="public-assistant__citation">
                        <strong>{item.title}</strong>
                        <span>{item.summary}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </article>
            ))}

            {isLoading && (
              <div className="public-assistant__loading" aria-live="polite">
                正在检索公开知识并组织回答…
              </div>
            )}
          </div>

          <div className="public-assistant__suggestions" aria-label="建议提问">
            {publicAssistantSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                className="public-assistant__suggestion"
                onClick={() => void submitQuestion(suggestion.prompt)}
              >
                {suggestion.label}
              </button>
            ))}
          </div>

          <form
            className="public-assistant__composer"
            onSubmit={(event) => {
              event.preventDefault()
              void submitQuestion(input)
            }}
          >
            <label className="sr-only" htmlFor="public-assistant-input">
              向公开助手提问
            </label>
            <input
              id="public-assistant-input"
              type="text"
              maxLength={MAX_MESSAGE_LENGTH}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="问项目、文章或技术方向"
            />
            <button type="submit" disabled={isLoading || input.trim().length === 0}>
              <IconSend aria-hidden />
              <span>发送</span>
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
