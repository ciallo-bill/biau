import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ASSISTANT_STORAGE_KEYS,
  demoInternalMessages,
  demoInternalSessions,
  internalAssistantSuggestions,
  normalizeAssistantCitations,
  normalizeAssistantMember,
  publicKnowledgeBase,
  searchPublicKnowledge,
  type AssistantKnowledgeItem,
  type AssistantMemberProfile,
  type AssistantMessage,
} from '../data/assistant'
import { ASSISTANT_API_ENV_NAMES, INTERNAL_ASSISTANT_API_BASE } from '../utils/assistantApi'

const API_BASE = INTERNAL_ASSISTANT_API_BASE
const MAX_MESSAGE_LENGTH = 1000

interface AssistantResponse {
  content: string
  citations: AssistantKnowledgeItem[]
  sessionId?: string
  errorCode?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readStoredMember() {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(ASSISTANT_STORAGE_KEYS.member)
  if (!raw) return null

  try {
    return normalizeAssistantMember(JSON.parse(raw) as unknown)
  } catch {
    return null
  }
}

function readStoredValue(key: string) {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(key) ?? ''
}

function getErrorCode(payload: unknown) {
  return isRecord(payload) && typeof payload.error === 'string' ? payload.error : ''
}

function buildLocalInternalAnswer(question: string, prefix = ''): AssistantResponse {
  const citations = searchPublicKnowledge(question)
  if (citations.length === 0) {
    return {
      content: `${prefix}当前内部助手还处于首版工作台阶段，现在只连接已脱敏的公开站点知识。这个问题暂时没有足够资料，可以换成项目名、博客主题或交付相关问题继续试。`,
      citations: publicKnowledgeBase.slice(0, 2),
    }
  }

  return {
    content: `${prefix}我先基于当前站点知识帮你整理一个方向：${citations
      .map((item) => `${item.title} 可以作为参考，重点是 ${item.summary}`)
      .join(' ')}`,
    citations,
  }
}

function explainInternalApiError(question: string, status: number, errorCode: string): AssistantResponse {
  const fallback = buildLocalInternalAnswer(question)
  if (status === 401 || errorCode === 'missing-or-invalid-token') {
    return {
      ...fallback,
      content: `成员 token 缺失或无效，内部 API 没有接受这次请求。本地回退继续：${fallback.content}`,
      errorCode: errorCode || 'missing-or-invalid-token',
    }
  }

  if (status === 503 || errorCode === 'database-not-configured') {
    return {
      ...fallback,
      content: `内部 API 还没有可用数据库，邀请码和持久化会话暂时不可用。本地回退继续：${fallback.content}`,
      errorCode: errorCode || 'database-not-configured',
    }
  }

  return {
    ...fallback,
    content: `内部 API 返回 ${status}，当前先使用本地公开知识回退：${fallback.content}`,
    errorCode: errorCode || 'internal-chat-request-failed',
  }
}

async function requestInternalAnswer(
  question: string,
  memberToken: string,
  sessionId: string,
): Promise<AssistantResponse> {
  if (!API_BASE || !memberToken) return buildLocalInternalAnswer(question)

  const response = await fetch(`${API_BASE}/chat/internal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${memberToken}`,
    },
    body: JSON.stringify({
      message: question,
      ...(sessionId ? { sessionId } : {}),
    }),
  })

  const payload = (await response.json().catch(() => ({}))) as unknown
  if (!response.ok) {
    return explainInternalApiError(question, response.status, getErrorCode(payload))
  }

  const answer = isRecord(payload) && typeof payload.answer === 'string' ? payload.answer.trim() : ''
  const nextSessionId = isRecord(payload) && typeof payload.sessionId === 'string' ? payload.sessionId : undefined
  const citations = isRecord(payload) ? normalizeAssistantCitations(payload.citations) : []

  return {
    content:
      answer ||
      '内部助手没有返回内容。你可以检查后端服务是否已部署，或先用本地回退模式继续整理页面。',
    citations,
    sessionId: nextSessionId,
  }
}

export function AssistantPage() {
  const [messages, setMessages] = useState<AssistantMessage[]>(demoInternalMessages)
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState(demoInternalSessions[0]?.id ?? 'demo-session')
  const [memberToken, setMemberToken] = useState(() => readStoredValue(ASSISTANT_STORAGE_KEYS.memberToken))
  const [member, setMember] = useState<AssistantMemberProfile | null>(() => readStoredMember())
  const [apiSessionId, setApiSessionId] = useState(() => readStoredValue(ASSISTANT_STORAGE_KEYS.sessionId))
  const [inviteCode, setInviteCode] = useState('')
  const [memberName, setMemberName] = useState('')
  const [inviteStatus, setInviteStatus] = useState('')
  const [isRedeeming, setIsRedeeming] = useState(false)
  const messageSeq = useRef(0)

  const createMessage = (
    role: AssistantMessage['role'],
    content: string,
    citations?: AssistantKnowledgeItem[],
  ): AssistantMessage => {
    messageSeq.current += 1
    return {
      id: `assistant-${role}-${messageSeq.current}`,
      role,
      content,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      citations,
    }
  }

  const selectedSession = useMemo(
    () => demoInternalSessions.find((session) => session.id === selectedSessionId) ?? demoInternalSessions[0],
    [selectedSessionId],
  )

  const persistMember = (token: string, nextMember: AssistantMemberProfile) => {
    setMemberToken(token)
    setMember(nextMember)
    window.localStorage.setItem(ASSISTANT_STORAGE_KEYS.memberToken, token)
    window.localStorage.setItem(ASSISTANT_STORAGE_KEYS.member, JSON.stringify(nextMember))
  }

  const clearMember = () => {
    setMemberToken('')
    setMember(null)
    setApiSessionId('')
    window.localStorage.removeItem(ASSISTANT_STORAGE_KEYS.memberToken)
    window.localStorage.removeItem(ASSISTANT_STORAGE_KEYS.member)
    window.localStorage.removeItem(ASSISTANT_STORAGE_KEYS.sessionId)
    setInviteStatus('已清除本地成员 token。')
  }

  const redeemInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const code = inviteCode.trim()
    const name = memberName.trim() || '内部成员'

    if (!API_BASE) {
      setInviteStatus(`当前没有配置 ${ASSISTANT_API_ENV_NAMES.internal}，无法兑换邀请码；聊天会继续使用本地公开知识回退。`)
      return
    }

    if (!code) {
      setInviteStatus('请输入邀请码。')
      return
    }

    setIsRedeeming(true)
    setInviteStatus('')

    try {
      const response = await fetch(`${API_BASE}/auth/redeem-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name }),
      })
      const payload = (await response.json().catch(() => ({}))) as unknown

      if (!response.ok) {
        const errorCode = getErrorCode(payload)
        const message =
          errorCode === 'database-not-configured'
            ? '后端数据库尚未配置，暂时不能兑换邀请码。'
            : errorCode === 'invalid-invite'
              ? '邀请码无效、已用完或已过期。'
              : '邀请码兑换失败，请稍后再试。'
        setInviteStatus(message)
        return
      }

      const token = isRecord(payload) && typeof payload.token === 'string' ? payload.token : ''
      const nextMember = isRecord(payload) ? normalizeAssistantMember(payload.member) : null
      if (!token || !nextMember) {
        setInviteStatus('后端返回的成员信息不完整，请检查 API 版本。')
        return
      }

      persistMember(token, nextMember)
      setInviteCode('')
      setMemberName('')
      setInviteStatus('邀请码已兑换，后续消息会优先调用内部助手 API。')
    } catch {
      setInviteStatus('无法连接内部助手 API，当前仍可使用本地公开知识回退。')
    } finally {
      setIsRedeeming(false)
    }
  }

  const sendMessage = async (content: string) => {
    const trimmed = content.trim().slice(0, MAX_MESSAGE_LENGTH)
    if (!trimmed || isLoading) return

    const userMessage = createMessage('user', trimmed)

    setMessages((current) => [...current, userMessage])
    setDraft('')
    setIsLoading(true)

    try {
      const result = await requestInternalAnswer(trimmed, memberToken, apiSessionId)
      if (result.sessionId) {
        setApiSessionId(result.sessionId)
        window.localStorage.setItem(ASSISTANT_STORAGE_KEYS.sessionId, result.sessionId)
      }
      setMessages((current) => [
        ...current,
        createMessage('assistant', result.content, result.citations),
      ])
    } catch {
      const fallback = buildLocalInternalAnswer(trimmed, '内部助手 API 暂时不可用，本地回退继续：')
      setMessages((current) => [
        ...current,
        createMessage('assistant', fallback.content, fallback.citations),
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const chatMode = API_BASE && memberToken ? 'API 当前会话' : '本地公开知识回退'

  return (
    <main className="assistant-page page-stack">
      <section className="assistant-shell">
        <aside className="assistant-sidebar">
          <div className="assistant-sidebar__header">
            <p className="section-subtitle">INTERNAL ASSISTANT</p>
            <h1 className="assistant-sidebar__title">内部助手</h1>
            <p className="assistant-sidebar__description">
              给内部小伙伴使用的协作入口。第一版先围绕公开站点知识、提纲整理和交付辅助，不冒充完整私有知识库。
            </p>
          </div>

          <div className="assistant-sidebar__status">
            <span className="assistant-chip">{API_BASE ? 'API 已配置' : '本地回退'}</span>
            <span className="assistant-chip">{member ? '已兑换 token' : '未兑换邀请码'}</span>
            <span className="assistant-chip">公开知识边界</span>
          </div>

          <section className="assistant-auth" aria-label="成员访问">
            {member ? (
              <div className="assistant-member-card">
                <p className="assistant-panel__eyebrow">MEMBER</p>
                <strong>{member.name}</strong>
                <span>{member.role} · {member.dailyQuota} / day</span>
                <span>模型渠道：{member.modelChannel?.label ?? '默认模型通道'}</span>
                <button type="button" onClick={clearMember}>
                  清除本地 token
                </button>
              </div>
            ) : (
              <form className="assistant-auth-form" onSubmit={redeemInvite}>
                <p className="assistant-panel__eyebrow">INVITE</p>
                <label className="assistant-field">
                  <span>邀请码</span>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(event) => setInviteCode(event.target.value)}
                    placeholder="BIAU-PORT-ALPHA"
                    autoComplete="off"
                  />
                </label>
                <label className="assistant-field">
                  <span>显示名</span>
                  <input
                    type="text"
                    value={memberName}
                    onChange={(event) => setMemberName(event.target.value)}
                    placeholder="你的名字"
                    maxLength={80}
                  />
                </label>
                <button type="submit" disabled={isRedeeming || !API_BASE}>
                  {isRedeeming ? '兑换中…' : '兑换邀请码'}
                </button>
              </form>
            )}
            {inviteStatus && <p className="assistant-status-text">{inviteStatus}</p>}
          </section>

          <section className="assistant-session-list" aria-label="示例工作流">
            <p className="assistant-panel__eyebrow">EXAMPLES, NOT HISTORY</p>
            {demoInternalSessions.map((session) => (
              <button
                key={session.id}
                type="button"
                className={`assistant-session ${session.id === selectedSessionId ? 'is-active' : ''}`}
                onClick={() => setSelectedSessionId(session.id)}
              >
                <strong>{session.title}</strong>
                <span>{session.preview}</span>
                <em>{session.updatedAt}</em>
              </button>
            ))}
          </section>

          <div className="assistant-sidebar__footer">
            <Link to="/assistant/admin" className="assistant-link-card">
              <strong>管理员入口</strong>
              <span>隐藏页用于手动保存 admin token、查看摘要和创建邀请码。</span>
            </Link>
          </div>
        </aside>

        <section className="assistant-main">
          <header className="assistant-main__header">
            <div>
              <p className="assistant-main__eyebrow">CURRENT SESSION</p>
              <h2>{selectedSession?.title ?? '当前会话'}</h2>
            </div>
            <div className="assistant-main__meta">
              <span>{member ? `成员：${member.name}` : '未兑换：本地回退'}</span>
              <span>{chatMode}</span>
              <span>{apiSessionId ? '已保存当前 sessionId' : '浏览器临时会话'}</span>
            </div>
          </header>

          <div className="assistant-thread" aria-live="polite">
            {messages.map((message) => (
              <article key={message.id} className={`assistant-bubble is-${message.role}`}>
                <div className="assistant-bubble__meta">
                  <strong>{message.role === 'assistant' ? '泊岸助手' : '你'}</strong>
                  <span>{message.timestamp}</span>
                </div>
                <p>{message.content}</p>
                {message.citations && message.citations.length > 0 && (
                  <div className="assistant-bubble__citations">
                    {message.citations.map((item) => (
                      <Link key={item.id} to={item.href} className="assistant-citation-card">
                        <strong>{item.title}</strong>
                        <span>{item.summary}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </article>
            ))}

            {isLoading && <div className="assistant-loading">正在整理内部助手回复…</div>}
          </div>

          <div className="assistant-suggestions" aria-label="建议动作">
            {internalAssistantSuggestions.map((suggestion) => (
              <button key={suggestion.id} type="button" onClick={() => void sendMessage(suggestion.prompt)}>
                {suggestion.label}
              </button>
            ))}
          </div>

          <form
            className="assistant-composer"
            onSubmit={(event) => {
              event.preventDefault()
              void sendMessage(draft)
            }}
          >
            <label className="sr-only" htmlFor="assistant-composer-input">
              向内部助手发送消息
            </label>
            <textarea
              id="assistant-composer-input"
              value={draft}
              maxLength={MAX_MESSAGE_LENGTH}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="描述你的问题、提纲需求或要整理的项目方向"
              rows={4}
            />
            <div className="assistant-composer__actions">
              <p>当前只保留本页对话。兑换邀请码后可写入当前 session，但历史列表和私有知识库还不在本版范围内。</p>
              <button type="submit" disabled={isLoading || draft.trim().length === 0}>
                发送到内部助手
              </button>
            </div>
          </form>
        </section>

        <aside className="assistant-inspector">
          <section className="assistant-panel">
            <p className="assistant-panel__eyebrow">BOUNDARY</p>
            <h3>第一版边界</h3>
            <ul>
              <li>公开助手只回答本站公开内容。</li>
              <li>内部助手先做协作入口和当前会话。</li>
              <li>不声明已接入私有文档或完整历史记录。</li>
            </ul>
          </section>

          <section className="assistant-panel">
            <p className="assistant-panel__eyebrow">DEPLOY</p>
            <h3>部署结构</h3>
            <ul>
              <li>Cloudflare Pages：当前主站</li>
              <li>Render：聊天 API</li>
              <li>PostgreSQL：邀请码和会话写入</li>
            </ul>
          </section>

          <section className="assistant-panel">
            <p className="assistant-panel__eyebrow">NEXT</p>
            <h3>后续再做</h3>
            <ul>
              <li>历史会话列表与检索</li>
              <li>私有知识源接入</li>
              <li>更完整的成员管理与导出</li>
            </ul>
          </section>
        </aside>
      </section>
    </main>
  )
}
