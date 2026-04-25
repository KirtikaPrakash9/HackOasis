import { PrismaClient } from '@prisma/client'
import { getServerEnv } from '@/lib/env'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export function getPrismaClient() {
  getServerEnv()

  const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

  return prisma
}
