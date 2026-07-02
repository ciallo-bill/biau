import { heroContent } from './hero'
import { MAIN_SITE_URL } from './siteLinks'

export type SiteStatusTargetKind = 'workbench' | 'business' | 'showcase' | 'mobile'
export type SiteStatusExpectation = 'public-entry' | 'login-gated' | 'static-site'

export interface SiteStatusTarget {
  id: string
  projectId: string
  projectTitle: string
  label: string
  url: string
  kind: SiteStatusTargetKind
  expectation: SiteStatusExpectation
  description: string
  note: string
}

const targetMeta: Record<
  string,
  Pick<SiteStatusTarget, 'label' | 'kind' | 'expectation' | 'description' | 'note'>
> = {
  'legal-rag': {
    label: 'Legal RAG 在线工作台',
    kind: 'workbench',
    expectation: 'login-gated',
    description: '法律 RAG 与合同审查演示工作台入口。',
    note: '工作台可能有登录门禁或 Render 冷启动；入口可达不代表公开凭据已开放。',
  },
  'ozon-erp': {
    label: 'Ozon ERP 演示入口',
    kind: 'business',
    expectation: 'login-gated',
    description: '电商业务系统登录与演示入口。',
    note: '生产注册与演示账号属于人工 gate；状态页只检查公开入口是否响应。',
  },
  'biau-playlab': {
    label: 'BIAU Playlab 游戏站',
    kind: 'showcase',
    expectation: 'static-site',
    description: 'Godot 游戏项目展示、详情与 Web 试玩入口。',
    note: '静态站可用不代表每个 Web 试玩资源都已完成运行检查。',
  },
  xunqiu: {
    label: '寻球产品展示页',
    kind: 'mobile',
    expectation: 'static-site',
    description: '寻球 Android 64 位迁移展示页、文档和阶段包入口。',
    note: '阶段 APK 是否公开发布仍需人工确认；这里只检查展示页入口。',
  },
}

export const SITE_STATUS_BASE_URL = MAIN_SITE_URL

export const siteStatusTargets: SiteStatusTarget[] = heroContent.projects
  .filter((project) => Boolean(project.externalLink))
  .map((project) => {
    const meta = targetMeta[project.id]
    return {
      id: `${project.id}-entry`,
      projectId: project.id,
      projectTitle: project.title,
      label: meta?.label ?? project.title,
      url: project.externalLink ?? '',
      kind: meta?.kind ?? 'showcase',
      expectation: meta?.expectation ?? 'public-entry',
      description: meta?.description ?? project.description,
      note: meta?.note ?? '公开项目入口，状态页只展示最近一次可达性检查。',
    }
  })

