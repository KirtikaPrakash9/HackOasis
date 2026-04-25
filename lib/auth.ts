import { Role } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import type { User } from '@supabase/supabase-js'

function buildBootstrapUsername(user: User) {
  const emailPrefix = user.email?.split('@')[0]?.replace(/[^a-z0-9_]/gi, '') || 'user'
  const suffix = user.id.replace(/-/g, '').slice(0, 8)
  return `${emailPrefix.toLowerCase()}_${suffix}`.slice(0, 24)
}

export async function ensureProfileExists(user: User) {
  const prisma = getPrismaClient()
  const existing = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true, username: true, role: true },
  })

  if (existing) return existing

  const baseUsername = buildBootstrapUsername(user)
  let username = baseUsername
  let suffix = 1

  while (true) {
    const taken = await prisma.profile.findUnique({
      where: { username },
      select: { id: true },
    })
    if (!taken) break
    username = `${baseUsername.slice(0, Math.max(1, 22 - String(suffix).length))}_${suffix}`
    suffix += 1
  }

  return prisma.profile.create({
    data: {
      id: user.id,
      username,
      fullName: user.user_metadata?.full_name || null,
      role: Role.HACKER,
    },
    select: { id: true, username: true, role: true },
  })
}
