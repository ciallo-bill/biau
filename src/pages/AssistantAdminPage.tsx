import { useState, type FormEvent } from 'react'
import {
  ASSISTANT_STORAGE_KEYS,
  normalizeAssistantInvites,
  normalizeAssistantMember,
  normalizeAssistantModelChannels,
  type AssistantInviteSummary,
  type AssistantMemberProfile,
  type AssistantModelChannelSummary,
} from '../data/assistant'
import { ASSISTANT_API_ENV_NAMES, INTERNAL_ASSISTANT_API_BASE } from '../utils/assistantApi'

const API_BASE = INTERNAL_ASSISTANT_API_BASE

interface AdminSummary {
  members: number
  disabledMembers: number
  invites: number
  openInvites: number
  revokedInvites: number
  expiredInvites: number
  exhaustedInvites: number
  messages: number
  usage: number
  modelChannels: AssistantModelChannelSummary[]
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
  disabledMembers: 0,
  invites: 0,
  openInvites: 0,
  revokedInvites: 0,
  expiredInvites: 0,
  exhaustedInvites: 0,
  messages: 0,
  usage: 0,
  modelChannels: [],
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
  const { members, disabledMembers, invites, openInvites, revokedInvites, expiredInvites, exhaustedInvites, messages, usage, modelChannels } = value
  if (
    typeof members !== 'number' ||
    typeof invites !== 'number' ||
    typeof messages !== 'number' ||
    typeof usage !== 'number'
  ) {
    return null
  }
  return {
    members,
    disabledMembers: typeof disabledMembers === 'number' ? disabledMembers : 0,
    invites,
    openInvites: typeof openInvites === 'number' ? openInvites : 0,
    revokedInvites: typeof revokedInvites === 'number' ? revokedInvites : 0,
    expiredInvites: typeof expiredInvites === 'number' ? expiredInvites : 0,
    exhaustedInvites: typeof exhaustedInvites === 'number' ? exhaustedInvites : 0,
    messages,
    usage,
    modelChannels: normalizeAssistantModelChannels(modelChannels),
  }
}

function normalizeMembers(value: unknown): AssistantMemberProfile[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => normalizeAssistantMember(item))
    .filter((item): item is AssistantMemberProfile => item !== null)
}

function getErrorCode(value: unknown) {
  return isRecord(value) && typeof value.error === 'string' ? value.error : ''
}

function explainAdminError(status: number, errorCode: string) {
  if (status === 401 || errorCode === 'missing-admin-token') return 'admin token 缺失或不匹配。'
  if (status === 503 || errorCode === 'database-not-configured') return '后端数据库尚未配置，管理接口暂不可用。'
  if (errorCode === 'missing-code') return '请输入邀请码。'
  if (errorCode === 'unsupported-model-channel') return '模型渠道不存在或未在服务端配置。'
  if (errorCode === 'member-not-found') return '成员不存在或已被删除。'
  if (errorCode === 'invite-not-found') return '邀请码不存在或已被删除。'
  if (errorCode === 'unsupported-invite-revocation') return '邀请码撤销参数不正确。'
  if (errorCode === 'unsupported-member-status') return '成员状态参数不正确。'
  return `管理接口返回 ${status}，请检查 API 服务。`
}

function formatAdminDate(value?: string | null) {
  if (!value) return '未设置'
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return value
  return new Date(parsed).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const inviteStatusLabels: Record<AssistantInviteSummary['status'], string> = {
  OPEN: '可用',
  EXHAUSTED: '已用尽',
  EXPIRED: '已过期',
  REVOKED: '已撤销',
}

export function AssistantAdminPage() {
  const [adminToken, setAdminToken] = useState(() => readStoredAdminToken())
  const [draftToken, setDraftToken] = useState(() => readStoredAdminToken())
  const [summary, setSummary] = useState<AdminSummary>(emptySummary)
  const [summaryStatus, setSummaryStatus] = useState('')
  const [inviteStatus, setInviteStatus] = useState('')
  const [invitesStatus, setInvitesStatus] = useState('')
  const [membersStatus, setMembersStatus] = useState('')
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [isCreatingInvite, setIsCreatingInvite] = useState(false)
  const [isLoadingInvites, setIsLoadingInvites] = useState(false)
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [updatingMemberId, setUpdatingMemberId] = useState('')
  const [updatingInviteId, setUpdatingInviteId] = useState('')
  const [inviteForm, setInviteForm] = useState<InviteFormState>(defaultInviteForm)
  const [invites, setInvites] = useState<AssistantInviteSummary[]>([])
  const [members, setMembers] = useState<AssistantMemberProfile[]>([])
  const [modelChannels, setModelChannels] = useState<AssistantModelChannelSummary[]>([])

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
      setSummaryStatus(`当前没有配置 ${ASSISTANT_API_ENV_NAMES.internal}，无法调用管理 API。`)
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
      setModelChannels(nextSummary.modelChannels)
      setSummaryStatus('摘要已更新。')
    } catch {
      setSummaryStatus('无法连接管理 API。')
    } finally {
      setIsLoadingSummary(false)
    }
  }

  const loadMembers = async () => {
    if (!API_BASE) {
      setMembersStatus(`当前没有配置 ${ASSISTANT_API_ENV_NAMES.internal}，无法调用成员 API。`)
      return
    }
    if (!adminToken) {
      setMembersStatus('请先保存 admin token。')
      return
    }

    setIsLoadingMembers(true)
    setMembersStatus('')
    try {
      const response = await fetch(`${API_BASE}/admin/members`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const payload = (await response.json().catch(() => ({}))) as unknown
      if (!response.ok) {
        setMembersStatus(explainAdminError(response.status, getErrorCode(payload)))
        return
      }

      if (!isRecord(payload)) {
        setMembersStatus('成员 API 返回格式不完整。')
        return
      }

      setMembers(normalizeMembers(payload.members))
      setModelChannels(normalizeAssistantModelChannels(payload.modelChannels))
      setMembersStatus('成员列表已更新。')
    } catch {
      setMembersStatus('无法连接成员 API。')
    } finally {
      setIsLoadingMembers(false)
    }
  }

  const loadInvites = async () => {
    if (!API_BASE) {
      setInvitesStatus(`当前没有配置 ${ASSISTANT_API_ENV_NAMES.internal}，无法调用邀请码 API。`)
      return
    }
    if (!adminToken) {
      setInvitesStatus('请先保存 admin token。')
      return
    }

    setIsLoadingInvites(true)
    setInvitesStatus('')
    try {
      const response = await fetch(`${API_BASE}/admin/invites`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      const payload = (await response.json().catch(() => ({}))) as unknown
      if (!response.ok) {
        setInvitesStatus(explainAdminError(response.status, getErrorCode(payload)))
        return
      }
      if (!isRecord(payload)) {
        setInvitesStatus('邀请码 API 返回格式不完整。')
        return
      }

      setInvites(normalizeAssistantInvites(payload.invites))
      setInvitesStatus('邀请码列表已更新。')
    } catch {
      setInvitesStatus('无法连接邀请码 API。')
    } finally {
      setIsLoadingInvites(false)
    }
  }

  const updateMemberModelChannel = async (memberId: string, modelChannelId: string) => {
    if (!API_BASE || !adminToken) {
      setMembersStatus('请先保存 admin token 并确认 API base 已配置。')
      return
    }

    setUpdatingMemberId(memberId)
    setMembersStatus('')
    try {
      const response = await fetch(`${API_BASE}/admin/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelChannelId }),
      })
      const payload = (await response.json().catch(() => ({}))) as unknown
      if (!response.ok) {
        setMembersStatus(explainAdminError(response.status, getErrorCode(payload)))
        return
      }
      if (!isRecord(payload)) {
        setMembersStatus('成员更新 API 返回格式不完整。')
        return
      }

      const updated = normalizeAssistantMember(payload.member)
      if (!updated) {
        setMembersStatus('成员更新 API 返回的成员格式不完整。')
        return
      }

      setMembers((current) => current.map((member) => (member.id === updated.id ? updated : member)))
      setModelChannels(normalizeAssistantModelChannels(payload.modelChannels))
      setMembersStatus(`已为 ${updated.name} 分配模型渠道：${updated.modelChannel?.label ?? '默认模型通道'}`)
    } catch {
      setMembersStatus('无法连接成员更新 API。')
    } finally {
      setUpdatingMemberId('')
    }
  }

  const updateMemberStatus = async (memberId: string, status: 'ACTIVE' | 'DISABLED') => {
    if (!API_BASE || !adminToken) {
      setMembersStatus('请先保存 admin token 并确认 API base 已配置。')
      return
    }

    setUpdatingMemberId(memberId)
    setMembersStatus('')
    try {
      const response = await fetch(`${API_BASE}/admin/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      const payload = (await response.json().catch(() => ({}))) as unknown
      if (!response.ok) {
        setMembersStatus(explainAdminError(response.status, getErrorCode(payload)))
        return
      }
      if (!isRecord(payload)) {
        setMembersStatus('成员更新 API 返回格式不完整。')
        return
      }

      const updated = normalizeAssistantMember(payload.member)
      if (!updated) {
        setMembersStatus('成员更新 API 返回的成员格式不完整。')
        return
      }

      setMembers((current) => current.map((member) => (member.id === updated.id ? updated : member)))
      setMembersStatus(`${updated.name} 已${status === 'DISABLED' ? '禁用' : '启用'}。`)
      void loadSummary()
    } catch {
      setMembersStatus('无法连接成员更新 API。')
    } finally {
      setUpdatingMemberId('')
    }
  }

  const updateInviteRevocation = async (inviteId: string, revoked: boolean) => {
    if (!API_BASE || !adminToken) {
      setInvitesStatus('请先保存 admin token 并确认 API base 已配置。')
      return
    }

    setUpdatingInviteId(inviteId)
    setInvitesStatus('')
    try {
      const response = await fetch(`${API_BASE}/admin/invites/${inviteId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ revoked }),
      })
      const payload = (await response.json().catch(() => ({}))) as unknown
      if (!response.ok) {
        setInvitesStatus(explainAdminError(response.status, getErrorCode(payload)))
        return
      }
      if (!isRecord(payload)) {
        setInvitesStatus('邀请码更新 API 返回格式不完整。')
        return
      }

      const updated = normalizeAssistantInvites([payload.invite])[0]
      if (!updated) {
        setInvitesStatus('邀请码更新 API 返回格式不完整。')
        return
      }

      setInvites((current) => current.map((invite) => (invite.id === updated.id ? updated : invite)))
      setInvitesStatus(`邀请码已${revoked ? '撤销' : '恢复'}：${updated.label}`)
      void loadSummary()
    } catch {
      setInvitesStatus('无法连接邀请码更新 API。')
    } finally {
      setUpdatingInviteId('')
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
      setInviteStatus(`当前没有配置 ${ASSISTANT_API_ENV_NAMES.internal}，无法创建邀请码。`)
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

      const invite = isRecord(payload) ? normalizeAssistantInvites([payload.invite])[0] : null
      const label = invite?.label ?? inviteForm.label
      if (invite) {
        setInvites((current) => [invite, ...current.filter((item) => item.id !== invite.id)])
      }
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
                <strong>{summary.disabledMembers}</strong>
                已禁用
              </span>
              <span>
                <strong>{summary.invites}</strong>
                邀请码
              </span>
              <span>
                <strong>{summary.openInvites}</strong>
                可用邀请
              </span>
              <span>
                <strong>{summary.revokedInvites}</strong>
                已撤销邀请
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

            <div className="assistant-admin-actions">
              <button type="button" onClick={() => void loadInvites()} disabled={isLoadingInvites || !adminToken}>
                {isLoadingInvites ? '读取中…' : '刷新邀请码'}
              </button>
            </div>
            {invitesStatus && <p className="assistant-status-text">{invitesStatus}</p>}
            <div className="assistant-admin-table" aria-label="邀请码列表">
              {invites.map((invite) => (
                <div key={invite.id} className="assistant-admin-row assistant-admin-row--member">
                  <div>
                    <strong>{invite.label}</strong>
                    <span>
                      {invite.role} · {inviteStatusLabels[invite.status]} · {invite.usedCount}/{invite.maxUses} 次
                    </span>
                    <span>
                      创建：{formatAdminDate(invite.createdAt)} · 过期：{formatAdminDate(invite.expiresAt)}
                    </span>
                  </div>
                  <div className="assistant-admin-actions">
                    <button
                      type="button"
                      disabled={updatingInviteId === invite.id}
                      onClick={() => void updateInviteRevocation(invite.id, invite.status !== 'REVOKED')}
                    >
                      {invite.status === 'REVOKED' ? '恢复' : '撤销'}
                    </button>
                  </div>
                </div>
              ))}
              {invites.length === 0 && <p className="assistant-status-text">刷新后会显示最近的邀请码；不会展示明文邀请码或 hash。</p>}
            </div>
          </article>

          <article className="assistant-admin-card">
            <h2>成员模型渠道</h2>
            <p>为每个内部成员分配服务端已配置的模型渠道；这里只显示渠道名称、模型和 provider，不展示 key 或 base URL。</p>
            <div className="assistant-admin-actions">
              <button type="button" onClick={() => void loadMembers()} disabled={isLoadingMembers || !adminToken}>
                {isLoadingMembers ? '读取中…' : '刷新成员'}
              </button>
            </div>
            {membersStatus && <p className="assistant-status-text">{membersStatus}</p>}
            <div className="assistant-admin-table" aria-label="成员模型渠道列表">
              {members.map((member) => (
                <div key={member.id} className="assistant-admin-row assistant-admin-row--member">
                  <div>
                    <strong>{member.name}</strong>
                    <span>
                      {member.role} · {member.status ?? 'ACTIVE'} · {member.dailyQuota} / day
                    </span>
                    <span>
                      当前渠道：{member.modelChannel?.label ?? '默认模型通道'} / {member.modelChannel?.model ?? 'fallback'}
                    </span>
                  </div>
                  <label className="assistant-field assistant-field--compact">
                    <span>模型渠道</span>
                    <select
                      value={member.modelChannel?.id ?? 'default'}
                      disabled={updatingMemberId === member.id || modelChannels.length === 0}
                      onChange={(event) => void updateMemberModelChannel(member.id, event.target.value)}
                    >
                      {modelChannels.map((channel) => (
                        <option key={channel.id} value={channel.id}>
                          {channel.label} · {channel.model}{channel.configured ? '' : '（未配置）'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="assistant-admin-actions">
                    <button
                      type="button"
                      disabled={updatingMemberId === member.id}
                      onClick={() => void updateMemberStatus(member.id, member.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED')}
                    >
                      {member.status === 'DISABLED' ? '启用' : '禁用'}
                    </button>
                  </div>
                </div>
              ))}
              {members.length === 0 && <p className="assistant-status-text">刷新后会显示已兑换邀请码的内部成员。</p>}
            </div>
          </article>

          <article className="assistant-admin-card">
            <h2>安全边界</h2>
            <p>模型渠道密钥和服务地址只在服务端环境变量中维护；成员表只保存渠道 id。</p>
            <ul className="assistant-admin-list">
              <li>页面不会展示模型 key、base URL、token hash 或邀请码 hash。</li>
              <li>成员被分配到未配置渠道时，后端会安全回退并返回低敏状态。</li>
              <li>后续还需要补齐完整历史消息、禁用/导出和内部知识源管理。</li>
              <li>生产环境必须继续依赖后端 `ADMIN_TOKEN` 校验。</li>
            </ul>
          </article>
        </section>
      </section>
    </main>
  )
}
