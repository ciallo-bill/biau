import { spawn } from 'node:child_process'

const previewPort = 4174
const previewBase = `http://127.0.0.1:${previewPort}`
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function spawnNpm(args, options = {}) {
  if (process.platform !== 'win32') {
    return spawn(npmCommand, args, { shell: false, ...options })
  }

  return spawn('cmd.exe', ['/d', '/s', '/c', [npmCommand, ...args].join(' ')], {
    shell: false,
    ...options,
  })
}

function run(args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawnNpm(args, {
      stdio: 'inherit',
      ...options,
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${npmCommand} ${args.join(' ')} exited with code ${code}`))
    })
  })
}

function startPreview() {
  return spawnNpm(['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(previewPort)], {
    stdio: 'inherit',
  })
}

async function waitForPreview() {
  const startedAt = Date.now()
  while (Date.now() - startedAt < 30_000) {
    try {
      const response = await fetch(previewBase)
      if (response.ok) return
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  throw new Error(`Preview did not start at ${previewBase}`)
}

function stopPreview(child) {
  if (!child.pid || child.killed) return
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' })
    return
  }
  child.kill('SIGTERM')
}

await run(['run', 'lint'])
await run(['run', 'build'])
await run(['run', 'blog:check'])

const preview = startPreview()
try {
  await waitForPreview()
  await run(['run', 'check:ui'], {
    env: { ...process.env, UI_CHECK_BASE: previewBase },
  })
} finally {
  stopPreview(preview)
}
