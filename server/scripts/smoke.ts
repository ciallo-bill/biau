import { createServer } from 'node:net'
import { createApp } from '../src/app.js'

function findAvailablePort(startPort: number) {
  return new Promise<number>((resolve, reject) => {
    const tryPort = (port: number) => {
      const server = createServer()
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

const port = await findAvailablePort(8977)
const app = createApp()
const server = app.listen(port, '127.0.0.1')
const base = `http://127.0.0.1:${port}`

try {
  const health = await fetch(`${base}/health`)
  if (!health.ok) throw new Error(`health failed: ${health.status}`)

  const publicChat = await fetch(`${base}/chat/public`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'RAG 项目' }),
  })
  if (!publicChat.ok) throw new Error(`public chat failed: ${publicChat.status}`)
  const publicPayload = (await publicChat.json()) as { answer?: string; citations?: unknown[] }
  if (!publicPayload.answer || !Array.isArray(publicPayload.citations)) {
    throw new Error('public chat returned invalid payload')
  }

  const internalChat = await fetch(`${base}/chat/internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '内部助手' }),
  })
  if (internalChat.status !== 401) {
    throw new Error(`internal chat should require auth, got ${internalChat.status}`)
  }

  if (!process.env.DATABASE_URL?.trim()) {
    const internalWithToken = await fetch(`${base}/chat/internal`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer smoke-test-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: '内部助手' }),
    })
    if (internalWithToken.status !== 503) {
      throw new Error(`internal chat should report missing database when token is present, got ${internalWithToken.status}`)
    }
  }

  console.log('Assistant API smoke passed')
} finally {
  server.close()
}
