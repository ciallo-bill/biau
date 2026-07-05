import { spawn } from 'node:child_process'

const studioDatabaseUrl = process.env.STUDIO_DATABASE_URL?.trim()

if (!studioDatabaseUrl) {
  console.log('Studio database migration skipped: STUDIO_DATABASE_URL is not configured.')
  process.exit(0)
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const child = spawn(command, ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL: studioDatabaseUrl,
  },
})

child.on('exit', (code) => {
  process.exit(code ?? 1)
})

child.on('error', (error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
