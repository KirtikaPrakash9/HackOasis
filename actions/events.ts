import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

const createEventSchema = z.object({
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

export async function createEvent(input: unknown, organiserId: string) {
  const parsed = createEventSchema.parse(input)

  const baseSlug = slugify(parsed.title)
  const existingSlugs = await prisma.event.findMany({
    where: { slug: { startsWith: baseSlug } },
    select: { slug: true },
  })

  const used = new Set(existingSlugs.map((item) => item.slug))
  const suffixes = [...used]
    .map((value) => {
      if (value === baseSlug) return 0
      const match = value.match(new RegExp(`^${baseSlug}-(\\d+)$`))
      return match ? Number.parseInt(match[1], 10) : null
    })
    .filter((value): value is number => value !== null)
  const nextSuffix = suffixes.length > 0 ? Math.max(...suffixes) + 1 : 0
  const slug = nextSuffix === 0 && !used.has(baseSlug) ? baseSlug : `${baseSlug}-${nextSuffix || 1}`

  if (used.has(slug)) {
    throw new Error('Could not generate unique event slug')
  }

  return prisma.event.create({
    data: {
      organiserId,
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
