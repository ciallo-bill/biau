import { readdir, stat } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import sharp from 'sharp'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = resolve(repoRoot, 'public/images/projects/showcase')
const force = process.argv.includes('--force')
const supportedExts = new Set(['.png', '.jpg', '.jpeg'])

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)))
      continue
    }

    if (supportedExts.has(extname(entry.name).toLowerCase())) {
      files.push(fullPath)
    }
  }

  return files
}

async function shouldOptimize(inputPath, outputPath) {
  if (force) return true

  try {
    const [input, output] = await Promise.all([stat(inputPath), stat(outputPath)])
    return input.mtimeMs > output.mtimeMs
  } catch {
    return true
  }
}

const files = await walk(sourceDir)
const results = []

for (const inputPath of files) {
  const outputPath = inputPath.replace(/\.(png|jpe?g)$/i, '.webp')
  if (!(await shouldOptimize(inputPath, outputPath))) {
    results.push({ inputPath, outputPath, skipped: true })
    continue
  }

  await sharp(inputPath).webp({ quality: 82, effort: 5 }).toFile(outputPath)
  results.push({ inputPath, outputPath, skipped: false })
}

const optimized = results.filter((item) => !item.skipped).length
const skipped = results.length - optimized

console.log(`Image optimization complete: ${optimized} optimized, ${skipped} skipped, ${results.length} total.`)
