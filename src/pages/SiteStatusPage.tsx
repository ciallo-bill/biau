import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconExternalOpen, IconLink } from '@douyinfe/semi-icons'
import { SITE_STATUS_BASE_URL, siteStatusTargets, type SiteStatusTarget } from '../data/statusTargets'

type SiteStatusValue = 'online' | 'degraded' | 'offline' | 'unchecked'

interface SiteStatusCheck extends SiteStatusTarget {
  status: SiteStatusValue
  httpStatus: number
  durationMs: number
  checkedAt: string
  finalUrl: string
  issues: string[]
}

interface SiteStatusSummary {
  total: number
  online: number
  degraded: number
  offline: number
  unchecked: number
}

interface SiteStatusPayload {
  checkedAt: string
  base: string
  ok: boolean
  summary: SiteStatusSummary
  targets: SiteStatusCheck[]
}

const statusMeta: Record<SiteStatusValue, { label: string; tone: string; hint: string }> = {
  online: { label: '可用', tone: 'online', hint: '公开入口已响应' },
  degraded: { label: '受限', tone: 'degraded', hint: '入口响应但可能需要登录、重试或人工说明' },
  offline: { label: '异常', tone: 'offline', hint: '最近一次检测未能确认入口可达' },
  unchecked: { label: '未检测', tone: 'unchecked', hint: '尚未生成公开检测数据' },
}

const expectationLabels: Record<SiteStatusTarget['expectation'], string> = {
  'public-entry': '公开入口',
  'login-gated': '登录门禁',
  'static-site': '静态展示',
}

function createUncheckedTarget(target: SiteStatusTarget): SiteStatusCheck {
  return {
    ...target,
    status: 'unchecked',
    httpStatus: 0,
    durationMs: 0,
    checkedAt: '',
    finalUrl: target.url,
    issues: ['status data not generated'],
  }
}

function buildSummary(targets: SiteStatusCheck[]): SiteStatusSummary {
  return targets.reduce<SiteStatusSummary>(
    (summary, target) => {
      summary.total += 1
      summary[target.status] += 1
      return summary
    },
    { total: 0, online: 0, degraded: 0, offline: 0, unchecked: 0 },
  )
}

function mergePayload(payload: SiteStatusPayload | null): SiteStatusPayload {
  const payloadTargets = Array.isArray(payload?.targets) ? payload.targets : []
  const generatedTargets = new Map(payloadTargets.map((target) => [target.id, target]))
  const targets = siteStatusTargets.map((target) => generatedTargets.get(target.id) ?? createUncheckedTarget(target))
  const summary = payload?.summary && payloadTargets.length === targets.length ? payload.summary : buildSummary(targets)

  return {
    checkedAt: payload?.checkedAt ?? '',
    base: payload?.base ?? SITE_STATUS_BASE_URL,
    ok: payload?.ok ?? false,
    summary,
    targets,
  }
}

function formatCheckedAt(value: string) {
  if (!value) return '未生成'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '时间不可读'
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    hour12: false,
  }).format(date)
}

function formatDuration(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '未记录'
  if (value < 1000) return `${Math.round(value)} ms`
  return `${(value / 1000).toFixed(2)} s`
}

function formatHttpStatus(value: number) {
  return value > 0 ? `HTTP ${value}` : '未记录'
}

export function SiteStatusPage() {
  const [payload, setPayload] = useState<SiteStatusPayload | null>(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true
    fetch('/status/site-status.json', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<SiteStatusPayload>
      })
      .then((data) => {
        if (!active) return
        setPayload(data)
        setLoadError('')
      })
      .catch((error) => {
        if (!active) return
        setLoadError(error instanceof Error ? error.message : String(error))
      })
    return () => {
      active = false
    }
  }, [])

  const status = useMemo(() => mergePayload(payload), [payload])
  const allClear = status.summary.offline === 0 && status.summary.unchecked === 0

  return (
    <main className="site-status-page page-stack">
      <section className="section-header page-hero status-hero">
        <p className="section-subtitle">SITE STATUS</p>
        <h1 className="section-title">站点入口状态</h1>
        <p className="section-description">最近一次公开项目入口检测，帮助访客判断哪些页面可以直接打开。</p>
      </section>

      <section className="status-overview glass-card">
        <div className="status-overview__lead">
          <span className={`status-pulse ${allClear ? 'online' : 'degraded'}`} aria-hidden />
          <div>
            <p className="section-subtitle">LAST CHECK</p>
            <h2>{allClear ? '主要入口可访问' : '部分入口需要关注'}</h2>
          </div>
        </div>
        <dl className="status-metrics" aria-label="站点入口状态摘要">
          <div>
            <dt>检测时间</dt>
            <dd>{formatCheckedAt(status.checkedAt)}</dd>
          </div>
          <div>
            <dt>检测基准</dt>
            <dd>{status.base}</dd>
          </div>
          <div>
            <dt>可用入口</dt>
            <dd>
              {status.summary.online}/{status.summary.total}
            </dd>
          </div>
        </dl>
        {loadError && <p className="status-load-error">状态数据暂未读取成功：{loadError}</p>}
      </section>

      <section className="status-summary-grid" aria-label="状态统计">
        {(['online', 'degraded', 'offline', 'unchecked'] as const).map((key) => (
          <div key={key} className={`status-summary-card glass-card is-${statusMeta[key].tone}`}>
            <span>{statusMeta[key].label}</span>
            <strong>{status.summary[key]}</strong>
            <p>{statusMeta[key].hint}</p>
          </div>
        ))}
      </section>

      <section className="status-targets" aria-label="主页外链检测结果">
        {status.targets.map((target) => {
          const meta = statusMeta[target.status]
          return (
            <article key={target.id} className={`status-target glass-card is-${meta.tone}`}>
              <div className="status-target__main">
                <div className="status-target__titleline">
                  <span className={`status-badge is-${meta.tone}`}>{meta.label}</span>
                  <span>{expectationLabels[target.expectation]}</span>
                </div>
                <h2>{target.label}</h2>
                <p>{target.description}</p>
              </div>

              <dl className="status-target__facts">
                <div>
                  <dt>HTTP</dt>
                  <dd>{formatHttpStatus(target.httpStatus)}</dd>
                </div>
                <div>
                  <dt>耗时</dt>
                  <dd>{formatDuration(target.durationMs)}</dd>
                </div>
                <div>
                  <dt>单项检测</dt>
                  <dd>{formatCheckedAt(target.checkedAt)}</dd>
                </div>
              </dl>

              <p className="status-target__note">{target.issues[0] ?? target.note}</p>
              <p className="status-target__note is-soft">{target.note}</p>

              <div className="status-target__actions">
                <Link to={`/projects/${target.projectId}`} className="btn">
                  <IconLink aria-hidden />
                  <span>项目详情</span>
                </Link>
                <a className="btn btn-primary" href={target.url} target="_blank" rel="noopener noreferrer">
                  <span>打开入口</span>
                  <IconExternalOpen aria-hidden />
                </a>
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}
