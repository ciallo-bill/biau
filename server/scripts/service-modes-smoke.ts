import { createServer as createTcpServer } from 'node:net'
import { createApp } from '../src/app.js'
import { env } from '../src/env.js'
import type { AssistantServiceMode } from '../src/types.js'

interface EnvSnapshot {
  assistantServiceMode: AssistantServiceMode
  assistantModelApiKey: string
  assistantRagApiBaseUrl: string
  assistantRagApiKey: string
  openaiApiKey: string
  ragPublicApiKey: string
  ragInternalApiKey: string
  ragSyncToken: string
}

let nextServicePort = 9577

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

function snapshotEnv(): EnvSnapshot {
  return {
    assistantServiceMode: env.assistantServiceMode,
    assistantModelApiKey: env.assistantModelApiKey,
    assistantRagApiBaseUrl: env.assistantRagApiBaseUrl,
    assistantRagApiKey: env.assistantRagApiKey,
    openaiApiKey: env.openaiApiKey,
    ragPublicApiKey: env.ragPublicApiKey,
    ragInternalApiKey: env.ragInternalApiKey,
    ragSyncToken: env.ragSyncToken,
  }
}

function restoreEnv(snapshot: EnvSnapshot) {
  env.assistantServiceMode = snapshot.assistantServiceMode
  env.assistantModelApiKey = snapshot.assistantModelApiKey
  env.assistantRagApiBaseUrl = snapshot.assistantRagApiBaseUrl
  env.assistantRagApiKey = snapshot.assistantRagApiKey
  env.openaiApiKey = snapshot.openaiApiKey
  env.ragPublicApiKey = snapshot.ragPublicApiKey
  env.ragInternalApiKey = snapshot.ragInternalApiKey
  env.ragSyncToken = snapshot.ragSyncToken
}

async function withService(mode: AssistantServiceMode, run: (base: string) => Promise<void>) {
  env.assistantServiceMode = mode
  env.assistantModelApiKey = ''
  env.openaiApiKey = ''
  env.assistantRagApiBaseUrl = ''
  env.assistantRagApiKey = ''
  env.ragPublicApiKey = 'public-rag-smoke-key'
  env.ragInternalApiKey = 'internal-rag-smoke-key'
  env.ragSyncToken = 'sync-rag-smoke-token'

  const port = await findAvailablePort(nextServicePort)
  nextServicePort = port + 20
  const app = createApp()
  const server = app.listen(port, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', () => resolve()))
  try {
    await run(`http://127.0.0.1:${port}`)
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
}

async function getJson<T>(url: string) {
  const response = await fetch(url)
  return { response, payload: (await response.json().catch(() => null)) as T | null }
}

async function postJson<T>(url: string, body: unknown, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  return { response, payload: (await response.json().catch(() => null)) as T | null }
}

const snapshot = snapshotEnv()

try {
  await withService('public', async (base) => {
    const health = await getJson<{ serviceMode?: string }>(`${base}/health`)
    if (!health.response.ok || health.payload?.serviceMode !== 'public') throw new Error('public mode health is invalid')

    const publicChat = await postJson<{ answer?: string }>(`${base}/chat/public`, { message: 'RAG 项目' })
    if (!publicChat.response.ok || !publicChat.payload?.answer) throw new Error('public mode should expose public chat')

    const internalChat = await postJson(`${base}/chat/internal`, { message: '内部助手' })
    if (internalChat.response.status !== 404) throw new Error(`public mode should not expose internal chat, got ${internalChat.response.status}`)

    const ragHealth = await fetch(`${base}/rag/health`)
    if (ragHealth.status !== 404) throw new Error(`public mode should not expose /rag, got ${ragHealth.status}`)
  })

  await withService('internal', async (base) => {
    const health = await getJson<{ serviceMode?: string }>(`${base}/health`)
    if (!health.response.ok || health.payload?.serviceMode !== 'internal') throw new Error('internal mode health is invalid')

    const publicChat = await postJson(`${base}/chat/public`, { message: 'RAG 项目' })
    if (publicChat.response.status !== 404) throw new Error(`internal mode should not expose public chat, got ${publicChat.response.status}`)

    const internalChat = await postJson(`${base}/chat/internal`, { message: '内部助手' })
    if (internalChat.response.status !== 401) throw new Error(`internal mode should require auth, got ${internalChat.response.status}`)

    const adminSummary = await fetch(`${base}/admin/summary`)
    if (adminSummary.status !== 401) throw new Error(`internal mode should expose protected admin routes, got ${adminSummary.status}`)

    const ragHealth = await fetch(`${base}/rag/health`)
    if (ragHealth.status !== 404) throw new Error(`internal mode should not expose /rag, got ${ragHealth.status}`)
  })

  await withService('rag', async (base) => {
    const health = await getJson<{ service?: string; store?: string }>(`${base}/health`)
    if (!health.response.ok || health.payload?.service !== 'biau-rag-orchestrator' || !health.payload.store) {
      throw new Error('rag mode health is invalid')
    }

    const publicChat = await postJson(`${base}/chat/public`, { message: 'RAG 项目' })
    if (publicChat.response.status !== 404) throw new Error(`rag mode should not expose chat, got ${publicChat.response.status}`)

    const unauthorizedRetrieve = await postJson(`${base}/v1/retrieve`, { query: 'RAG 项目', scope: 'public' })
    if (unauthorizedRetrieve.response.status !== 401) throw new Error(`rag mode should require retrieve key, got ${unauthorizedRetrieve.response.status}`)

    const publicRetrieve = await postJson(`${base}/v1/retrieve`, { query: 'RAG 项目', scope: 'public' }, 'public-rag-smoke-key')
    if (!publicRetrieve.response.ok) throw new Error(`rag mode public retrieve failed: ${publicRetrieve.response.status}`)

    const mismatchedRetrieve = await postJson(`${base}/v1/retrieve`, { query: 'RAG 项目', scope: 'internal' }, 'public-rag-smoke-key')
    if (mismatchedRetrieve.response.status !== 401) {
      throw new Error(`rag mode should reject scope-mismatched key, got ${mismatchedRetrieve.response.status}`)
    }

    const internalRetrieve = await postJson(`${base}/v1/retrieve`, { query: 'RAG 项目', scope: 'internal' }, 'internal-rag-smoke-key')
    if (!internalRetrieve.response.ok) throw new Error(`rag mode internal retrieve failed: ${internalRetrieve.response.status}`)

    const sync = await postJson(`${base}/v1/sync`, {}, 'sync-rag-smoke-token')
    if (!sync.response.ok) throw new Error(`rag mode sync failed: ${sync.response.status}`)
  })

  console.log('Assistant service mode smoke passed')
} finally {
  restoreEnv(snapshot)
}
