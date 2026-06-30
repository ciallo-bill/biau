import type { Request } from 'express'
import type { Member } from '@prisma/client'
import { getPrisma } from './db.js'
import { createToken, sha256 } from './crypto.js'

export function requireDatabase() {
  const prisma = getPrisma()
  if (!prisma) {
    const error = new Error('database-not-configured')
    error.name = 'DatabaseNotConfigured'
    throw error
  }
  return prisma
}

export async function readBearerMember(req: Request): Promise<Member | null> {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  const token = header.slice('Bearer '.length).trim()
  if (!token) return null

  const prisma = requireDatabase()
  return prisma.member.findUnique({ where: { tokenHash: sha256(token) } })
}

export function issueMemberToken() {
  const token = createToken('biaum')
  return { token, tokenHash: sha256(token) }
}
