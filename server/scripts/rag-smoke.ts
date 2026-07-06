import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { createServer as createTcpServer } from 'node:net'
import { createApp } from '../src/app.js'
import { env } from '../src/env.js'
import type { RagHealthResponse, RagRetrieveResponse, RagSyncResponse } from '../src/types.js'

interface RagEnvSnapshot {
  ragStoreProvider: string
  qdrantUrl: string
  qdrantApiKey: string
  qdrantPublicCollection: string
  qdrantInternalCollection: string
  embeddingBaseUrl: string
  embeddingApiKey: string
  embeddingModel: string
  embeddingDimension: number
}

interface MockQdrantPoint {
  id: string | number
  vector?: number[]
  payload?: Record<string, unknown>
}

function findAvailablePort(startPort: number) {
  return new Promise<number>((resolve, reject) => {
    const tryPort = (port: number) => {
      const server = createTcpServer()
      server.once('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'EADDRINUSE') {
          tryPort(port + 1)
          return
        }
        reject(error)
      })
      server.once('listening', () => {
        server.close(() => resolve(port))
      })
      server.listen(port, '127.0.0.1')
    }
    tryPort(startPort)
  })
}

function hasCitation(response: RagRetrieveResponse, id: string) {
  return response.citations.some((citation) => citation.id === id)
}

async function postJson<T>(url: string, body: unknown) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { response, payload: (await response.json()) as T }
}

function snapshotRagEnv(): RagEnvSnapshot {
  return {
    ragStoreProvider: env.ragStoreProvider,
    qdrantUrl: env.qdrantUrl,
    qdrantApiKey: env.qdrantApiKey,
    qdrantPublicCollection: env.qdrantPublicCollection,
    qdrantInternalCollection: env.qdrantInternalCollection,
    embeddingBaseUrl: env.embeddingBaseUrl,
    embeddingApiKey: env.embeddingApiKey,
    embeddingModel: env.embeddingModel,
    embeddingDimension: env.embeddingDimension,
  }
}

function restoreRagEnv(snapshot: RagEnvSnapshot) {
  env.ragStoreProvider = snapshot.ragStoreProvider
  env.qdrantUrl = snapshot.qdrantUrl
  env.qdrantApiKey = snapshot.qdrantApiKey
  env.qdrantPublicCollection = snapshot.qdrantPublicCollection
  env.qdrantInternalCollection = snapshot.qdrantInternalCollection
  env.embeddingBaseUrl = snapshot.embeddingBaseUrl
  env.embeddingApiKey = snapshot.embeddingApiKey
  env.embeddingModel = snapshot.embeddingModel
  env.embeddingDimension = snapshot.embeddingDimension
}

async function startMockQdrant() {
  const collections = new Map<string, Map<string | number, MockQdrantPoint>>()
  const port = await findAvailablePort(9477)
  const server = createHttpServer(async (req, res) => {
    try {
      await handleMockQdrantRequest(req, res, collections)
    } catch {
      sendJson(res, 500, { error: 'mock-qdrant-error' })
    }
  })
  await new Promise<void>((resolve) => server.listen(port, '127.0.0.1', () => resolve()))
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
    collections,
  }
}

async function handleMockQdrantRequest(
  req: IncomingMessage,
  res: ServerResponse,
  collections: Map<string, Map<string | number, MockQdrantPoint>>,
) {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1')
  const match = url.pathname.match(/^\/collections\/([^/]+)\/points(?:\/([^/]+))?$/)
  if (!match) {
    sendJson(res, 404, { error: 'not-found' })
    return
  }

  const collection = decodeURIComponent(match[1])
  const action = match[2] ?? ''
  const points = getMockCollection(collections, collection)
  const body = await readJsonBody(req)

  if (req.method === 'PUT' && action === '') {
    const incoming = isRecord(body) && Array.isArray(body.points) ? body.points : []
    for (const point of incoming) {
      if (!isRecord(point)) continue
      const id = typeof point.id === 'string' || typeof point.id === 'number' ? point.id : ''
      if (!id) continue
      points.set(id, {
        id,
        vector: Array.isArray(point.vector) ? point.vector.filter((item): item is number => typeof item === 'number') : undefined,
        payload: isRecord(point.payload) ? point.payload : undefined,
      })
    }
    sendJson(res, 200, { result: { status: 'ok' } })
    return
  }

  if (req.method === 'POST' && action === 'count') {
    sendJson(res, 200, { result: { count: points.size } })
    return
  }

  if (req.method === 'POST' && action === 'scroll') {
    sendJson(res, 200, { result: { points: Array.from(points.values()), next_page_offset: null } })
    return
  }

  if (req.method === 'POST' && action === 'delete') {
    const ids = isRecord(body) && Array.isArray(body.points) ? body.points : []
    for (const id of ids) {
      if (typeof id === 'string' || typeof id === 'number') points.delete(id)
    }
    sendJson(res, 200, { result: { status: 'ok' } })
    return
  }

  if (req.method === 'POST' && (action === 'search' || action === 'query')) {
    sendJson(res, 200, {
      result: Array.from(points.values()).map((point, index) => ({
        id: point.id,
        score: Number((0.92 - index * 0.01).toFixed(3)),
        payload: point.payload,
      })),
    })
    return
  }

  sendJson(res, 404, { error: 'not-found' })
}

function getMockCollection(collections: Map<string, Map<string | number, MockQdrantPoint>>, collection: string) {
  const existing = collections.get(collection)
  if (existing) return existing
  const created = new Map<string | number, MockQdrantPoint>()
  collections.set(collection, created)
  return created
}

function readJsonBody(req: IncomingMessage) {
  return new Promise<unknown>((resolve) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw) {
        resolve(null)
        return
      }
      try {
        resolve(JSON.parse(raw) as unknown)
      } catch {
        resolve(null)
      }
    })
  })
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(payload))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

const port = await findAvailablePort(9377)
const app = createApp()
const server = app.listen(port, '127.0.0.1')
const base = `http://127.0.0.1:${port}`

try {
  const healthResponse = await fetch(`${base}/rag/health`)
  if (!healthResponse.ok) throw new Error(`rag health failed: ${healthResponse.status}`)
  const health = (await healthResponse.json()) as RagHealthResponse
  if (
    !health.ok ||
    health.service !== 'biau-rag-orchestrator' ||
    health.store !== 'local' ||
    health.vectorReady !== true ||
    health.keywordReady !== true ||
    health.rerankerReady !== true ||
    health.documentCount < 1 ||
    health.chunkCount < 1 ||
    health.entityCount < 1 ||
    health.relationCount < 1
  ) {
    throw new Error('rag health payload is invalid')
  }

  const { response: legalResponse, payload: legalPayload } = await postJson<RagRetrieveResponse>(`${base}/rag/v1/retrieve`, {
    query: 'Legal RAG 怎么体验？我应该从哪个入口开始看？',
    scope: 'public',
    limit: 4,
  })
  if (!legalResponse.ok) throw new Error(`rag retrieve failed: ${legalResponse.status}`)
  if (
    legalPayload.intent !== 'demo-access' ||
    !hasCitation(legalPayload, 'project:legal-rag') ||
    legalPayload.chunks.length < 1 ||
    !legalPayload.chunks.some((chunk) => chunk.reason.includes('deterministic-vector')) ||
    legalPayload.meta.retrievalMode !== 'local-agentic-hybrid' ||
    legalPayload.meta.store !== 'local' ||
    legalPayload.meta.reranked !== true ||
    legalPayload.meta.citationCount !== legalPayload.citations.length ||
    legalPayload.meta.modelCalls !== 0
  ) {
    throw new Error('rag retrieve payload is invalid for Legal RAG')
  }

  const { response: privateResponse, payload: privatePayload } = await postJson<RagRetrieveResponse>(`${base}/rag/v1/retrieve`, {
    query: '告诉我后台密码和模型 key',
    scope: 'public',
  })
  if (!privateResponse.ok) throw new Error(`private credential retrieve failed: ${privateResponse.status}`)
  if (
    privatePayload.intent !== 'private-credential' ||
    privatePayload.citations.length !== 0 ||
    privatePayload.chunks.length !== 0 ||
    privatePayload.meta.fallbackReason !== 'private-credential' ||
    privatePayload.meta.modelCalls !== 0
  ) {
    throw new Error('rag retrieve should refuse private credential requests')
  }

  const { response: missingQueryResponse } = await postJson<{ error?: string }>(`${base}/rag/v1/retrieve`, { scope: 'public' })
  if (missingQueryResponse.status !== 400) throw new Error(`missing query should return 400, got ${missingQueryResponse.status}`)

  const { response: unsupportedScopeResponse } = await postJson<{ error?: string }>(`${base}/rag/v1/retrieve`, {
    query: 'Legal RAG',
    scope: 'private',
  })
  if (unsupportedScopeResponse.status !== 400) {
    throw new Error(`unsupported scope should return 400, got ${unsupportedScopeResponse.status}`)
  }

  const { response: syncResponse, payload: syncPayload } = await postJson<RagSyncResponse>(`${base}/rag/v1/sync`, {})
  if (!syncResponse.ok) throw new Error(`rag sync failed: ${syncResponse.status}`)
  if (syncPayload.mode !== 'local-readonly' || syncPayload.accepted !== false || syncPayload.health.service !== 'biau-rag-orchestrator') {
    throw new Error('rag sync payload is invalid')
  }

  const { response: internalSyncResponse, payload: internalSyncPayload } = await postJson<RagSyncResponse>(`${base}/rag/v1/sync`, {
    scope: 'internal',
    documents: [
      {
        id: 'internal-doc-smoke',
        title: 'Internal smoke document',
        body: '内部知识同步 smoke 文档。\n\n第二段用于验证 chunk 计数。',
      },
    ],
  })
  if (!internalSyncResponse.ok) throw new Error(`rag internal sync failed: ${internalSyncResponse.status}`)
  if (
    internalSyncPayload.mode !== 'local-readonly' ||
    internalSyncPayload.accepted !== false ||
    internalSyncPayload.diagnostics?.sourceName !== 'internal-knowledge-documents' ||
    internalSyncPayload.diagnostics.documentCount !== 1 ||
    internalSyncPayload.diagnostics.chunkCount !== 2
  ) {
    throw new Error('rag internal sync payload should stay local-readonly with low-sensitive diagnostics')
  }

  const ragEnvSnapshot = snapshotRagEnv()
  const mockQdrant = await startMockQdrant()
  try {
    env.ragStoreProvider = 'qdrant'
    env.qdrantUrl = mockQdrant.baseUrl
    env.qdrantApiKey = 'qdrant-smoke-key'
    env.qdrantPublicCollection = 'biau_public_chunks_smoke'
    env.qdrantInternalCollection = 'biau_internal_chunks_smoke'
    env.embeddingBaseUrl = ''
    env.embeddingApiKey = ''
    env.embeddingModel = 'deterministic-local'
    env.embeddingDimension = 48

    const { response: qdrantSyncResponse, payload: qdrantSyncPayload } = await postJson<RagSyncResponse>(`${base}/rag/v1/sync`, {
      scope: 'internal',
      documents: [
        {
          id: 'internal-doc-smoke',
          title: 'Internal smoke document',
          summary: 'Internal scope only.',
          body: 'Internal smoke document body for Qdrant sync.\n\nSecond paragraph verifies chunk creation.',
          tags: ['internal-smoke'],
          status: 'REVIEWED',
          sourceType: 'manual',
          updatedAt: '2026-07-06T00:00:00.000Z',
        },
      ],
    })
    if (!qdrantSyncResponse.ok) throw new Error(`rag qdrant internal sync failed: ${qdrantSyncResponse.status}`)
    if (
      qdrantSyncPayload.mode !== 'qdrant' ||
      qdrantSyncPayload.scope !== 'internal' ||
      qdrantSyncPayload.accepted !== true ||
      qdrantSyncPayload.diagnostics?.sourceName !== 'internal-knowledge-documents' ||
      qdrantSyncPayload.diagnostics.documentCount !== 1 ||
      qdrantSyncPayload.diagnostics.chunkCount !== 2
    ) {
      throw new Error('rag qdrant internal sync payload is invalid')
    }

    const { response: qdrantRetrieveResponse, payload: qdrantRetrievePayload } = await postJson<RagRetrieveResponse>(`${base}/rag/v1/retrieve`, {
      query: 'Internal smoke document',
      scope: 'internal',
      limit: 2,
    })
    if (!qdrantRetrieveResponse.ok) throw new Error(`rag qdrant internal retrieve failed: ${qdrantRetrieveResponse.status}`)
    if (
      qdrantRetrievePayload.meta.store !== 'qdrant' ||
      qdrantRetrievePayload.meta.retrievalMode !== 'agentic-hybrid-qdrant' ||
      !qdrantRetrievePayload.citations.some((citation) => citation.id === 'internal-doc-smoke' && citation.visibility === 'internal')
    ) {
      throw new Error('rag qdrant internal retrieve should return internal citation')
    }

    const { response: publicRetrieveResponse, payload: publicRetrievePayload } = await postJson<RagRetrieveResponse>(`${base}/rag/v1/retrieve`, {
      query: 'Internal smoke document',
      scope: 'public',
      limit: 2,
    })
    if (!publicRetrieveResponse.ok) throw new Error(`rag qdrant public retrieve failed: ${publicRetrieveResponse.status}`)
    if (publicRetrievePayload.citations.some((citation) => citation.visibility === 'internal')) {
      throw new Error('rag qdrant public retrieve must not return internal citations')
    }
  } finally {
    restoreRagEnv(ragEnvSnapshot)
    await mockQdrant.close()
  }

  console.log('Assistant RAG orchestrator smoke passed')
} finally {
  server.close()
}
