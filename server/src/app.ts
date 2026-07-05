import cors from 'cors'
import express from 'express'
import { Prisma, type Invite, type Member } from '@prisma/client'
import { env, hasDatabase } from './env.js'
import { sha256 } from './crypto.js'
import { issueMemberToken, readBearerMember, requireDatabase } from './auth.js'
import { generateAnswer, hasConfiguredModelChannel, listSafeModelChannels, resolveModelChannel, planAssistantAnswer } from './model.js'
import { createMetricsMiddleware, renderPrometheusMetrics } from './metrics.js'
import { retrieveAssistantContext, retrievePublicAssistantContext } from './ragClient.js'
import { createRagOrchestratorRouter } from './ragRoutes.js'
import { createStudioRouter } from './studioRoutes.js'
import type { AssistantServiceMode, ChatPayload, ChatResponse } from './types.js'

export function createApp() {
  const app = express()
  app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin }))
  app.use(express.json({ limit: '1mb' }))
  if (env.metricsEnabled) app.use(createMetricsMiddleware())
  const serviceMode = env.assistantServiceMode

  app.get('/metrics', (_req, res) => {
    if (!env.metricsEnabled) {
      res.status(404).json({ error: 'metrics-disabled' })
      return
    }

    res.type('text/plain; version=0.0.4; charset=utf-8').send(renderPrometheusMetrics())
  })

  if (serviceMode === 'rag') {
    app.use(createRagOrchestratorRouter({ requireAuth: true }))
  } else if (serviceMode === 'studio') {
    app.get('/health', (_req, res) => {
      res.json(buildStudioHealth())
    })
    app.use('/studio/api', createStudioRouter())
  } else {
    app.get('/health', (_req, res) => {
      res.json(buildAssistantHealth(serviceMode))
    })

    if (serviceMode === 'all' || serviceMode === 'public') registerPublicAssistantRoutes(app)
    if (serviceMode === 'all' || serviceMode === 'internal') registerInternalAssistantRoutes(app)
    if (serviceMode === 'all' || serviceMode === 'internal') app.use('/studio/api', createStudioRouter())
    if (serviceMode === 'all') app.use('/rag', createRagOrchestratorRouter({ requireAuth: false }))
  }

  app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    void next
    const name = error instanceof Error ? error.name : ''
    const message = error instanceof Error ? error.message : 'unknown-error'
    if (name === 'DatabaseNotConfigured') {
      res.status(503).json({ error: message })
      return
    }
    console.error(error)
    res.status(500).json({ error: 'assistant-api-error' })
  })

  return app
}

function buildStudioHealth() {
  return {
    ok: true,
    service: 'biau-content-studio-api',
    serviceMode: 'studio',
    database: Boolean(env.studioDatabaseUrl),
    authConfigured: Boolean(env.studioAdminToken),
  }
}

function buildAssistantHealth(serviceMode: AssistantServiceMode) {
  const defaultModelChannel = listSafeModelChannels()[0]
  const modelConfigured = hasConfiguredModelChannel()
  return {
    ok: true,
    service: serviceMode === 'public' ? 'biau-public-assistant-api' : serviceMode === 'internal' ? 'biau-internal-assistant-api' : 'biau-assistant-api',
    serviceMode,
    database: hasDatabase(),
    mode: modelConfigured ? 'model' : 'fallback',
    modelConfigured,
    model: defaultModelChannel?.configured ? defaultModelChannel.model : 'fallback',
    provider: defaultModelChannel?.configured ? defaultModelChannel.provider : 'local-public-knowledge',
  }
}

function registerPublicAssistantRoutes(app: express.Express) {
  app.post('/chat/public', async (req, res, next) => {
    try {
      const { message } = req.body as ChatPayload
      const question = message?.trim()
      if (!question) {
        res.status(400).json({ error: 'missing-message' })
        return
      }

      const context = await retrievePublicAssistantContext(question)
      const citations = context.citations
      const generated = await generateAnswer(question, citations, 'public', { chunks: context.chunks })
      const response: ChatResponse = {
        answer: generated.answer,
        citations,
        meta: {
          mode: generated.mode,
          model: generated.model,
          provider: generated.provider,
          reason: generated.reason,
          diagnostic: generated.diagnostic,
          modelChannel: generated.modelChannel,
          citationCount: citations.length,
          retrieval: context.retrieval,
        },
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  })
}

function registerInternalAssistantRoutes(app: express.Express) {
  app.get('/me', async (req, res, next) => {
    try {
      const member = await readBearerMember(req)
      if (!member) {
        res.status(401).json({ error: 'missing-or-invalid-token' })
        return
      }
      if (!isActiveMember(member)) {
        res.status(403).json({ error: 'member-disabled' })
        return
      }

      const prisma = requireDatabase()
      const updated = await prisma.member.update({
        where: { id: member.id },
        data: { lastSeenAt: new Date() },
      })
      res.json({ member: serializeMember(updated) })
    } catch (error) {
      next(error)
    }
  })

  app.post('/auth/redeem-invite', async (req, res, next) => {
    try {
      const code = String(req.body?.code ?? '').trim()
      const name = String(req.body?.name ?? '内部成员').trim().slice(0, 80)
      if (!code) {
        res.status(400).json({ error: 'missing-code' })
        return
      }

      const prisma = requireDatabase()
      const issued = issueMemberToken()
      const member = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const invite = await tx.invite.findUnique({ where: { codeHash: sha256(code) } })
        if (!invite || invite.revokedAt || invite.usedCount >= invite.maxUses || (invite.expiresAt && invite.expiresAt < new Date())) {
          return null
        }

        const claimedInvite = await tx.invite.updateMany({
          where: {
            id: invite.id,
            usedCount: { lt: invite.maxUses },
          },
          data: { usedCount: { increment: 1 } },
        })
        if (claimedInvite.count !== 1) return null

        return tx.member.create({
          data: {
            name,
            role: invite.role,
            dailyQuota: invite.dailyQuota,
            tokenHash: issued.tokenHash,
            inviteId: invite.id,
          },
        })
      })

      if (!member) {
        res.status(401).json({ error: 'invalid-invite' })
        return
      }

      res.json({
        token: issued.token,
        member: serializeMember(member),
      })
    } catch (error) {
      next(error)
    }
  })

  app.get('/chat/internal/sessions', async (req, res, next) => {
    try {
      const member = await readBearerMember(req)
      if (!member) {
        res.status(401).json({ error: 'missing-or-invalid-token' })
        return
      }
      if (!isActiveMember(member)) {
        res.status(403).json({ error: 'member-disabled' })
        return
      }

      const prisma = requireDatabase()
      const includeArchived = req.query.includeArchived === 'true'
      const sessions = await prisma.chatSession.findMany({
        where: {
          memberId: member.id,
          ...(includeArchived ? {} : { archivedAt: null }),
        },
        orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
        take: 100,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      })
      res.json({ sessions: sessions.map(serializeChatSession) })
    } catch (error) {
      next(error)
    }
  })

  app.post('/chat/internal/sessions', async (req, res, next) => {
    try {
      const member = await readBearerMember(req)
      if (!member) {
        res.status(401).json({ error: 'missing-or-invalid-token' })
        return
      }
      if (!isActiveMember(member)) {
        res.status(403).json({ error: 'member-disabled' })
        return
      }

      const prisma = requireDatabase()
      const title = readBoundedString(req.body?.title, 60) || '新的内部会话'
      const session = await prisma.chatSession.create({
        data: {
          memberId: member.id,
          title,
        },
        include: { messages: true },
      })
      res.json({ session: serializeChatSession(session) })
    } catch (error) {
      next(error)
    }
  })

  app.get('/chat/internal/sessions/:id/messages', async (req, res, next) => {
    try {
      const member = await readBearerMember(req)
      if (!member) {
        res.status(401).json({ error: 'missing-or-invalid-token' })
        return
      }
      if (!isActiveMember(member)) {
        res.status(403).json({ error: 'member-disabled' })
        return
      }

      const prisma = requireDatabase()
      const session = await prisma.chatSession.findFirst({
        where: { id: req.params.id, memberId: member.id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })
      if (!session) {
        res.status(404).json({ error: 'session-not-found' })
        return
      }

      res.json({
        session: serializeChatSession(session),
        messages: session.messages.map(serializeChatMessage),
      })
    } catch (error) {
      next(error)
    }
  })

  app.patch('/chat/internal/sessions/:id', async (req, res, next) => {
    try {
      const member = await readBearerMember(req)
      if (!member) {
        res.status(401).json({ error: 'missing-or-invalid-token' })
        return
      }
      if (!isActiveMember(member)) {
        res.status(403).json({ error: 'member-disabled' })
        return
      }

      const prisma = requireDatabase()
      const session = await prisma.chatSession.findFirst({ where: { id: req.params.id, memberId: member.id } })
      if (!session) {
        res.status(404).json({ error: 'session-not-found' })
        return
      }

      const title = req.body?.title === undefined ? undefined : readBoundedString(req.body?.title, 60)
      if (req.body?.title !== undefined && !title) {
        res.status(400).json({ error: 'missing-title' })
        return
      }

      const data: Prisma.ChatSessionUpdateInput = {}
      if (title) data.title = title
      if (typeof req.body?.archived === 'boolean') data.archivedAt = req.body.archived ? new Date() : null

      const updated = await prisma.chatSession.update({
        where: { id: session.id },
        data,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      })
      res.json({ session: serializeChatSession(updated) })
    } catch (error) {
      next(error)
    }
  })

  app.post('/chat/internal', async (req, res, next) => {
    try {
      const member = await readBearerMember(req)
      if (!member) {
        res.status(401).json({ error: 'missing-or-invalid-token' })
        return
      }
      if (!isActiveMember(member)) {
        res.status(403).json({ error: 'member-disabled' })
        return
      }

      const { message, sessionId } = req.body as ChatPayload
      const question = message?.trim()
      if (!question) {
        res.status(400).json({ error: 'missing-message' })
        return
      }

      const prisma = requireDatabase()
      const now = new Date()
      const session = sessionId ? await prisma.chatSession.findFirst({ where: { id: sessionId, memberId: member.id } }) : null
      if (sessionId && !session) {
        res.status(404).json({ error: 'session-not-found' })
        return
      }

      const activeSession =
        session ??
        (await prisma.chatSession.create({
          data: {
            memberId: member.id,
            title: question.slice(0, 36),
            lastMessageAt: now,
          },
        }))

      await prisma.chatMessage.create({
        data: {
          memberId: member.id,
          sessionId: activeSession.id,
          role: 'USER',
          content: question,
        },
      })

      const answerPlan = planAssistantAnswer(question, 'internal')
      const context = answerPlan.useRetrieval ? await retrieveAssistantContext(question, 'internal') : null
      const citations = context?.citations ?? []
      const generated = await generateAnswer(question, citations, 'internal', {
        chunks: context?.chunks ?? [],
        intent: answerPlan.intent,
        grounding: answerPlan.grounding,
        modelChannelId: member.modelChannelId,
      })
      const reply = await prisma.chatMessage.create({
        data: {
          memberId: member.id,
          sessionId: activeSession.id,
          role: 'ASSISTANT',
          content: generated.answer,
          citations: citations as unknown as Prisma.InputJsonValue,
        },
      })
      await prisma.usageLog.create({
        data: {
          memberId: member.id,
          scope: 'internal-chat',
          model: generated.model,
        },
      })
      await prisma.member.update({
        where: { id: member.id },
        data: { lastSeenAt: now },
      })
      await prisma.chatSession.update({
        where: { id: activeSession.id },
        data: { lastMessageAt: now },
      })

      res.json({
        answer: generated.answer,
        citations,
        meta: {
          mode: generated.mode,
          model: generated.model,
          provider: generated.provider,
          reason: generated.reason,
          diagnostic: generated.diagnostic,
          modelChannel: generated.modelChannel,
          citationCount: citations.length,
          retrieval: context?.retrieval,
          intent: answerPlan.intent,
          grounding: answerPlan.grounding,
        },
        sessionId: activeSession.id,
        messageId: reply.id,
      } satisfies ChatResponse)
    } catch (error) {
      next(error)
    }
  })

  app.get('/admin/summary', async (req, res, next) => {
    try {
      if (!isAdminRequest(req.headers.authorization)) {
        res.status(401).json({ error: 'missing-admin-token' })
        return
      }

      const prisma = requireDatabase()
      const [members, inviteRows, messages, usage, disabledMembers] = await Promise.all([
        prisma.member.count(),
        prisma.invite.findMany({
          select: {
            revokedAt: true,
            expiresAt: true,
            usedCount: true,
            maxUses: true,
          },
        }),
        prisma.chatMessage.count(),
        prisma.usageLog.count(),
        prisma.member.count({ where: { status: 'DISABLED' } }),
      ])
      const inviteSummary = summarizeInvites(inviteRows)
      res.json({
        members,
        invites: inviteSummary.total,
        openInvites: inviteSummary.open,
        revokedInvites: inviteSummary.revoked,
        expiredInvites: inviteSummary.expired,
        exhaustedInvites: inviteSummary.exhausted,
        messages,
        usage,
        disabledMembers,
        modelChannels: listSafeModelChannels(),
      })
    } catch (error) {
      next(error)
    }
  })

  app.get('/admin/model-channels', async (req, res) => {
    if (!isAdminRequest(req.headers.authorization)) {
      res.status(401).json({ error: 'missing-admin-token' })
      return
    }

    res.json({ modelChannels: listSafeModelChannels() })
  })

  app.get('/admin/members', async (req, res, next) => {
    try {
      if (!isAdminRequest(req.headers.authorization)) {
        res.status(401).json({ error: 'missing-admin-token' })
        return
      }

      const prisma = requireDatabase()
      const members = await prisma.member.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
      res.json({ members: members.map(serializeMember), modelChannels: listSafeModelChannels() })
    } catch (error) {
      next(error)
    }
  })

  app.patch('/admin/members/:id', async (req, res, next) => {
    try {
      if (!isAdminRequest(req.headers.authorization)) {
        res.status(401).json({ error: 'missing-admin-token' })
        return
      }

      const prisma = requireDatabase()
      const member = await prisma.member.findUnique({ where: { id: req.params.id } })
      if (!member) {
        res.status(404).json({ error: 'member-not-found' })
        return
      }

      const assignment = readModelChannelAssignment(req.body?.modelChannelId)
      if (!assignment.ok) {
        res.status(400).json({ error: 'unsupported-model-channel' })
        return
      }

      const status = readMemberStatus(req.body?.status)
      if (req.body?.status !== undefined && !status) {
        res.status(400).json({ error: 'unsupported-member-status' })
        return
      }

      const data: Prisma.MemberUpdateInput = {}
      if (assignment.changed) data.modelChannelId = assignment.value
      if (status) {
        data.status = status
        data.disabledAt = status === 'DISABLED' ? new Date() : null
      }

      const updated = await prisma.member.update({
        where: { id: member.id },
        data,
      })
      res.json({ member: serializeMember(updated), modelChannels: listSafeModelChannels() })
    } catch (error) {
      next(error)
    }
  })

  app.get('/admin/invites', async (req, res, next) => {
    try {
      if (!isAdminRequest(req.headers.authorization)) {
        res.status(401).json({ error: 'missing-admin-token' })
        return
      }

      const prisma = requireDatabase()
      const invites = await prisma.invite.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
      res.json({ invites: invites.map(serializeInvite) })
    } catch (error) {
      next(error)
    }
  })

  app.patch('/admin/invites/:id', async (req, res, next) => {
    try {
      if (!isAdminRequest(req.headers.authorization)) {
        res.status(401).json({ error: 'missing-admin-token' })
        return
      }

      if (typeof req.body?.revoked !== 'boolean') {
        res.status(400).json({ error: 'unsupported-invite-revocation' })
        return
      }

      const prisma = requireDatabase()
      const invite = await prisma.invite.findUnique({ where: { id: req.params.id } })
      if (!invite) {
        res.status(404).json({ error: 'invite-not-found' })
        return
      }

      const updated = await prisma.invite.update({
        where: { id: invite.id },
        data: {
          revokedAt: req.body.revoked ? new Date() : null,
        },
      })
      res.json({ invite: serializeInvite(updated) })
    } catch (error) {
      next(error)
    }
  })

  app.post('/admin/invites', async (req, res, next) => {
    try {
      if (!isAdminRequest(req.headers.authorization)) {
        res.status(401).json({ error: 'missing-admin-token' })
        return
      }

      const code = String(req.body?.code ?? '').trim()
      if (!code) {
        res.status(400).json({ error: 'missing-code' })
        return
      }

      const prisma = requireDatabase()
      const label = String(req.body?.label ?? '内部邀请码').trim().slice(0, 80) || '内部邀请码'
      const invite = await prisma.invite.create({
        data: {
          codeHash: sha256(code),
          label,
          role: req.body?.role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
          dailyQuota: readPositiveInteger(req.body?.dailyQuota, 24),
          maxUses: readPositiveInteger(req.body?.maxUses, 1),
        },
      })
      res.json({ invite: serializeInvite(invite) })
    } catch (error) {
      next(error)
    }
  })
}

function isAdminRequest(header: string | undefined) {
  if (!env.adminToken || !header?.startsWith('Bearer ')) return false
  return header.slice('Bearer '.length).trim() === env.adminToken
}

function isActiveMember(member: Pick<Member, 'status'>) {
  return member.status !== 'DISABLED'
}

function serializeMember(
  member: Pick<Member, 'id' | 'name' | 'role' | 'status' | 'dailyQuota' | 'modelChannelId' | 'disabledAt' | 'lastSeenAt' | 'createdAt'>,
) {
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    status: member.status,
    dailyQuota: member.dailyQuota,
    modelChannelId: member.modelChannelId ?? null,
    modelChannel: getMemberModelChannel(member.modelChannelId),
    disabledAt: member.disabledAt?.toISOString() ?? null,
    lastSeenAt: member.lastSeenAt?.toISOString() ?? null,
    createdAt: member.createdAt.toISOString(),
  }
}

function serializeInvite(invite: {
  id: string
  label: string
  role: string
  dailyQuota: number
  maxUses: number
  usedCount: number
  expiresAt: Date | null
  revokedAt: Date | null
  createdAt: Date
}) {
  return {
    id: invite.id,
    label: invite.label,
    role: invite.role,
    dailyQuota: invite.dailyQuota,
    maxUses: invite.maxUses,
    usedCount: invite.usedCount,
    status: getInviteStatus(invite),
    expiresAt: invite.expiresAt?.toISOString() ?? null,
    revokedAt: invite.revokedAt?.toISOString() ?? null,
    createdAt: invite.createdAt.toISOString(),
  }
}

function getInviteStatus(invite: Pick<Invite, 'revokedAt' | 'expiresAt' | 'usedCount' | 'maxUses'>) {
  if (invite.revokedAt) return 'REVOKED'
  if (invite.expiresAt && invite.expiresAt < new Date()) return 'EXPIRED'
  if (invite.usedCount >= invite.maxUses) return 'EXHAUSTED'
  return 'OPEN'
}

function summarizeInvites(invites: Array<Pick<Invite, 'revokedAt' | 'expiresAt' | 'usedCount' | 'maxUses'>>) {
  const summary = {
    total: invites.length,
    open: 0,
    revoked: 0,
    expired: 0,
    exhausted: 0,
  }
  for (const invite of invites) {
    const status = getInviteStatus(invite)
    if (status === 'OPEN') summary.open += 1
    if (status === 'REVOKED') summary.revoked += 1
    if (status === 'EXPIRED') summary.expired += 1
    if (status === 'EXHAUSTED') summary.exhausted += 1
  }
  return summary
}

function serializeChatSession(
  session: {
    id: string
    title: string
    archivedAt: Date | null
    lastMessageAt: Date | null
    createdAt: Date
    updatedAt: Date
    messages?: Array<{ content: string; createdAt: Date }>
  },
) {
  const lastMessage = session.messages?.[0]
  const updatedAt = session.lastMessageAt ?? session.updatedAt
  return {
    id: session.id,
    title: session.title,
    archived: Boolean(session.archivedAt),
    archivedAt: session.archivedAt?.toISOString() ?? null,
    updatedAt: updatedAt.toISOString(),
    createdAt: session.createdAt.toISOString(),
    preview: lastMessage ? compactPreview(lastMessage.content) : '还没有消息，打开后可以开始新的内部协作。',
  }
}

function serializeChatMessage(message: {
  id: string
  role: string
  content: string
  citations: unknown
  createdAt: Date
}) {
  const role = message.role === 'USER' ? 'user' : message.role === 'ASSISTANT' ? 'assistant' : 'assistant'
  return {
    id: message.id,
    role,
    content: message.content,
    citations: Array.isArray(message.citations) ? message.citations : [],
    timestamp: message.createdAt.toISOString(),
  }
}

function getMemberModelChannel(modelChannelId: string | null | undefined) {
  const resolved = resolveModelChannel(modelChannelId)
  const safeChannels = listSafeModelChannels()
  return safeChannels.find((channel) => channel.id === resolved.id) ?? safeChannels[0]
}

function readModelChannelAssignment(value: unknown):
  | { ok: true; changed: false; value?: never }
  | { ok: true; changed: true; value: string | null }
  | { ok: false; changed: false; value?: never } {
  if (value === undefined) return { ok: true, changed: false }
  if (value === null) return { ok: true, changed: true, value: null }
  if (typeof value !== 'string') return { ok: false, changed: false }

  const normalized = value.trim().toLowerCase()
  if (!normalized) return { ok: true, changed: true, value: null }
  const channel = listSafeModelChannels().find((item) => item.id === normalized)
  if (!channel) return { ok: false, changed: false }
  return { ok: true, changed: true, value: channel.isDefault ? null : channel.id }
}

function readMemberStatus(value: unknown) {
  if (value === 'ACTIVE' || value === 'DISABLED') return value
  return null
}

function readBoundedString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function compactPreview(value: string) {
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.length > 72 ? `${normalized.slice(0, 71)}…` : normalized
}

function readPositiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) return fallback
  return parsed
}
