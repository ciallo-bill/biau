import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { env, hasDatabase } from './env.js'

let prisma: PrismaClient | null = null

export function getPrisma() {
  if (!hasDatabase()) return null
  prisma ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.databaseUrl }),
  })
  return prisma
}

export async function disconnectPrisma() {
  if (!prisma) return
  await prisma.$disconnect()
  prisma = null
}
