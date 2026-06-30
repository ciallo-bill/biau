import { createApp } from './app.js'
import { env } from './env.js'
import { disconnectPrisma } from './db.js'

const app = createApp()
const server = app.listen(env.port, () => {
  console.log(`BIAU assistant API listening on :${env.port}`)
})

async function shutdown() {
  server.close()
  await disconnectPrisma()
}

process.on('SIGINT', () => {
  void shutdown().then(() => process.exit(0))
})

process.on('SIGTERM', () => {
  void shutdown().then(() => process.exit(0))
})
