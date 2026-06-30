import { useState, type FormEvent } from 'react'
import { ASSISTANT_STORAGE_KEYS } from '../data/assistant'

const API_BASE = import.meta.env.VITE_CHAT_API_BASE_URL?.trim()

interface AdminSummary {
  members: number
  invites: number
  messages: number
  usage: number
}

interface InviteFormState {
  code: string
  label: string
  role: 'MEMBER' | 'ADMIN'
  dailyQuota: string
  maxUses: string
}

const emptySummary: AdminSummary = {
  members: 0,
  invites: 0,
  messages: 0,
  usage: 0,
}

const defaultInviteForm: InviteFormState = {
  code: '',
  label: '内部邀请码',
  role: 'MEMBER',
  dailyQuota: '24',
  maxUses: '1',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readStoredAdminToken() {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(ASSISTANT_STORAGE_KEYS.adminToken) ?? ''
}

function normalizeSummary(value: unknown): AdminSummary | null {
  if (!isRecord(value)) return null
  const { members, invites, messages, usage } = value
  if (
    typeof members !== 'number' ||
    typeof invites !== 'number' ||
    typeof messages !== 'number' ||
    typeof usage !== 'number'
  ) {
    return null
  }
  return { members, invites, messages, usage }
}

function getErrorCode(value: unknown) {
  return isRecord(value) && typeof value.error === 'string' ? value.error : ''
}

function explainAdminError(status: number, errorCode: string) {
  if (status === 401 || errorCode === 'missing-admin-token') return 'admin token 缺失或不匹配。'
  if (status === 503 || errorCode === 'database-not-configured') return '后端数据库尚未配置，管理接口暂不可用。'
  if (errorCode === 'missing-code') return '请输入邀请码。'
  return `管理接口返回 ${status}，请检查 API 服务。`
}

export function AssistantAdminPage() {
  const [adminToken, setAdminToken] = useState(() => readStoredAdminToken())
  const [draftToken, setDraftToken] = useState(() => readStoredAdminToken())
  const [summary, setSummary] = useState<AdminSummary>(emptySummary)
  const [summaryStatus, setSummaryStatus] = useState('')
  const [inviteStatus, setInviteStatus] = useState('')
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [isCreatingInvite, setIsCreatingInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState<InviteFormState>(defaultInviteForm)

  const saveAdminToken = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const token = draftToken.trim()
    setAdminToken(token)
    if (token) {
      window.localStorage.setItem(ASSISTANT_STORAGE_KEYS.adminToken, token)
      setSummaryStatus('admin token 已保存在当前浏览器。')
    } else {
      window.localStorage.removeItem(ASSISTANT_STORAGE_KEYS.adminToken)
      setSummaryStatus('admin token 已清除。')
    }
  }

  const clearAdminToken = () => {
    setDraftToken('')
    setAdminToken('')
    window.localStorage.removeItem(ASSISTANT_STORAGE_KEYS.adminToken)
    setSummaryStatus('admin token 已清除。')
  }

  const loadSummary = async () => {
    if (!API_BASE) {
      setSummaryStatus('当前没有配置 VITE_CHAT_API_BASE_URL，无法调用管理 API。')
      return
    }
    if (!adminToken) {
      setSummaryStatus('请先保存 admin token。')
      return
    }

    setIsLoadingSummary(true)
    setSummaryStatus('')
    try {
      const response = await fetch(`${API_BASE}/admin/summary`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const payload = (await response.json().catch(() => ({}))) as unknown
      if (!response.ok) {
        setSummaryStatus(explainAdminError(response.status, getErrorCode(payload)))
        return
      }

      const nextSummary = normalizeSummary(payload)
      if (!nextSummary) {
        setSummaryStatus('管理 API 返回的摘要格式不完整。')
        return
      }

      setSummary(nextSummary)
      setSummaryStatus('摘要已更新。')
    } catch {
      setSummaryStatus('无法连接管理 API。')
    } finally {
      setIsLoadingSummary(false)
    }
  }

  const updateInviteField = <K extends keyof InviteFormState>(field: K, value: InviteFormState[K]) => {
    setInviteForm((current) => ({ ...current, [field]: value }))
  }

  const createInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const code = inviteForm.code.trim()
    if (!code) {
      setInviteStatus('请输入邀请码。')
      return
    }
    if (!API_BASE) {
      setInviteStatus('当前没有配置 VITE_CHAT_API_BASE_URL，无法创建邀请码。')
      return
    }
    if (!adminToken) {
      setInviteStatus('请先保存 admin token。')
      return
    }

    setIsCreatingInvite(true)
    setInviteStatus('')

    try {
      const response = await fetch(`${API_BASE}/admin/invites`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          label: inviteForm.label.trim() || '内部邀请码',
          role: inviteForm.role,
          dailyQuota: Number(inviteForm.dailyQuota || 24),
          maxUses: Number(inviteForm.maxUses || 1),
        }),
      })
      const payload = (await response.json().catch(() => ({}))) as unknown
      if (!response.ok) {
        setInviteStatus(explainAdminError(response.status, getErrorCode(payload)))
        return
      }

      const label = isRecord(payload) && typeof payload.label === 'string' ? payload.label : inviteForm.label
      setInviteStatus(`邀请码已创建：${label}`)
      setInviteForm({ ...defaultInviteForm, label: inviteForm.label || defaultInviteForm.label })
      void loadSummary()
    } catch {
      setInviteStatus('无法连接管理 API。')
    } finally {
      setIsCreatingInvite(false)
    }
  }

  return (
    <main className="assistant-admin-page page-stack">
      <section className="assistant-admin-shell">
        <header className="assistant-admin-hero">
          <p className="section-subtitle">HIDDEN ADMIN</p>
          <h1 className="section-title">内部助手管理页</h1>
          <p className="section-description">
            这是第一版 owner-only 管理面：手动保存 admin token，读取服务摘要，并创建少量内部邀请码。
          </p>
        </header>

        <section className="assistant-admin-grid">
          <article className="assistant-admin-card">
            <h2>API 连接</h2>
            <p>admin token 只保存在当前浏览器本地，用于调用隐藏管理接口。</p>

            <form className="assistant-admin-form" onSubmit={saveAdminToken}>
              <label className="assistant-field">
                <span>Admin token</span>
                <input
                  type="password"
                  value={draftToken}
                  onChange={(event) => setDraftToken(event.target.value)}
                  placeholder="粘贴 ADMIN_TOKEN"
                  autoComplete="off"
                />
              </label>
              <div className="assistant-admin-actions">
                <button type="submit">保存 token</button>
                <button type="button" onClick={clearAdminToken}>
                  清除
                </button>
              </div>
            </form>

            <div className="assistant-admin-actions">
              <button type="button" onClick={() => void loadSummary()} disabled={isLoadingSummary || !adminToken}>
                {isLoadingSummary ? '读取中…' : '刷新摘要'}
              </button>
            </div>

            {summaryStatus && <p className="assistant-status-text">{summaryStatus}</p>}

            <div className="assistant-admin-summary" aria-label="管理摘要">
              <span>
                <strong>{summary.members}</strong>
                成员
              </span>
              <span>
                <strong>{summary.invites}</strong>
                邀请码
              </span>
              <span>
                <strong>{summary.messages}</strong>
                消息
              </span>
              <span>
                <strong>{summary.usage}</strong>
                用量
              </span>
            </div>
          </article>

          <article className="assistant-admin-card">
            <h2>创建邀请码</h2>
            <p>用于少量内部小伙伴兑换成员 token，不开放公共注册入口。</p>

            <form className="assistant-admin-form" onSubmit={createInvite}>
              <label className="assistant-field">
                <span>邀请码</span>
                <input
                  type="text"
                  value={inviteForm.code}
                  onChange={(event) => updateInviteField('code', event.target.value)}
                  placeholder="BIAU-PORT-ALPHA"
                  autoComplete="off"
                />
              </label>
              <label className="assistant-field">
                <span>标签</span>
                <input
                  type="text"
                  value={inviteForm.label}
                  onChange={(event) => updateInviteField('label', event.target.value)}
                  placeholder="内部邀请码"
                  maxLength={80}
                />
              </label>
              <div className="assistant-form-grid">
                <label className="assistant-field">
                  <span>角色</span>
                  <select
                    value={inviteForm.role}
                    onChange={(event) => updateInviteField('role', event.target.value === 'ADMIN' ? 'ADMIN' : 'MEMBER')}
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </label>
                <label className="assistant-field">
                  <span>每日额度</span>
                  <input
                    type="number"
                    min="1"
                    value={inviteForm.dailyQuota}
                    onChange={(event) => updateInviteField('dailyQuota', event.target.value)}
                  />
                </label>
                <label className="assistant-field">
                  <span>可用次数</span>
                  <input
                    type="number"
                    min="1"
                    value={inviteForm.maxUses}
                    onChange={(event) => updateInviteField('maxUses', event.target.value)}
                  />
                </label>
              </div>
              <button type="submit" disabled={isCreatingInvite || !adminToken}>
                {isCreatingInvite ? '创建中…' : '创建邀请码'}
              </button>
            </form>

            {inviteStatus && <p className="assistant-status-text">{inviteStatus}</p>}
          </article>

          <article className="assistant-admin-card">
            <h2>MVP 边界</h2>
            <p>这个页面只证明管理 API 链路可用，完整后台放到后续任务。</p>
            <ul className="assistant-admin-list">
              <li>不展示完整成员列表和历史消息。</li>
              <li>不提供删除、禁用、导出和分析面板。</li>
              <li>admin token 本地保存只是 MVP 方案。</li>
              <li>生产环境必须继续依赖后端 `ADMIN_TOKEN` 校验。</li>
            </ul>
          </article>
        </section>
      </section>
    </main>
  )
}
