import express from 'express'
import { getRagOrchestratorHealth, retrieveRagContext, syncLocalRagStore } from './ragOrchestrator.js'
import type { RagRetrievePayload } from './types.js'

export function createRagOrchestratorRouter() {
  const router = express.Router()

  router.get('/health', (_req, res) => {
    res.json(getRagOrchestratorHealth())
  })

  router.post('/v1/retrieve', (req, res) => {
    const payload = req.body as RagRetrievePayload
    const query = typeof payload?.query === 'string' ? payload.query.trim() : ''
    if (!query) {
      res.status(400).json({ error: 'missing-query' })
      return
    }

    const scope = payload.scope ?? 'public'
    if (scope !== 'public') {
      res.status(400).json({ error: 'unsupported-scope' })
      return
    }

    res.json(retrieveRagContext({ ...payload, query, scope }))
  })

  router.post('/v1/sync', (_req, res) => {
    res.json(syncLocalRagStore())
  })

  return router
}
