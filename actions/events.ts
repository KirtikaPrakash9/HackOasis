import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

const createEventSchema = z.object({
  organiserId: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  submissionDeadline: z.string().optional(),
  maxTeamSize: z.coerce.number().int().min(1).max(10).default(4),
  status: z.enum(['DRAFT', 'OPEN', 'ONGOING', 'JUDGING', 'CLOSED']).default('DRAFT'),
  aiJudgingEnabled: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
})

export async function listPublicEvents() {
  try {
    return await prisma.event.findMany({
      where: { status: { not: 'DRAFT' } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        location: true,
        startDate: true,
        endDate: true,
        status: true,
        tags: true,
      },
    })
  } catch {
    return []
  }
}

export async function createEvent(input: unknown) {
  const parsed = createEventSchema.parse(input)

  const baseSlug = slugify(parsed.title)
  let slug = baseSlug
  let i = 1

  while (await prisma.event.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i}`
    i += 1
  }

  return prisma.event.create({
    data: {
      organiserId: parsed.organiserId,
      title: parsed.title,
      slug,
      description: parsed.description,
      location: parsed.location,
      startDate: parsed.startDate ? new Date(parsed.startDate) : null,
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      submissionDeadline: parsed.submissionDeadline ? new Date(parsed.submissionDeadline) : null,
      maxTeamSize: parsed.maxTeamSize,
      status: parsed.status,
      aiJudgingEnabled: parsed.aiJudgingEnabled,
      tags: parsed.tags,
    },
  })
}
