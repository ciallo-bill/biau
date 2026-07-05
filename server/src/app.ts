import cors from 'cors'
import express from 'express'
import { Prisma, type Member } from '@prisma/client'
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

  app.post('/chat/internal', async (req, res, next) => {
    try {
      const member = await readBearerMember(req)
      if (!member) {
        res.status(401).json({ error: 'missing-or-invalid-token' })
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
      const session =
        sessionId
          ? await prisma.chatSession.findFirst({ where: { id: sessionId, memberId: member.id } })
          : await prisma.chatSession.create({
              data: {
                memberId: member.id,
                title: question.slice(0, 36),
                lastMessageAt: now,
              },
            })

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
      const [members, invites, messages, usage, disabledMembers] = await Promise.all([
        prisma.member.count(),
        prisma.invite.count(),
        prisma.chatMessage.count(),
        prisma.usageLog.count(),
        prisma.member.count({ where: { status: 'DISABLED' } }),
      ])
      res.json({ members, invites, messages, usage, disabledMembers, modelChannels: listSafeModelChannels() })
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
      res.json({ id: invite.id, label: invite.label, role: invite.role, dailyQuota: invite.dailyQuota, maxUses: invite.maxUses })
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

function readPositiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) return fallback
  return parsed
}
