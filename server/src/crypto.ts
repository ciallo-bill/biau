import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

export function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export function createToken(prefix: string) {
  return `${prefix}_${randomBytes(24).toString('base64url')}`
}

export function safeEqualHash(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  if (leftBuffer.byteLength !== rightBuffer.byteLength) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}
