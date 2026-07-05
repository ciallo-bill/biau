import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { env, hasDatabase, hasStudioDatabase } from './env.js'

let prisma: PrismaClient | null = null
let studioPrisma: PrismaClient | null = null

export function getPrisma() {
  if (!hasDatabase()) return null
  prisma ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.databaseUrl }),
  })
  return prisma
}

export function getStudioPrisma() {
  if (!hasStudioDatabase()) return null
  studioPrisma ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.studioDatabaseUrl }),
  })
  return studioPrisma
}

export function requireStudioDatabase() {
  const client = getStudioPrisma()
  if (!client) {
    const error = new Error('database-not-configured')
    error.name = 'DatabaseNotConfigured'
    throw error
  }
  return client
}

export async function disconnectPrisma() {
  await Promise.all([
    prisma?.$disconnect(),
    studioPrisma?.$disconnect(),
  ])
  prisma = null
  studioPrisma = null
}
