import { EventStatus } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import { getMockEventBySlug, getMockOwnEvents, getMockPublicEvents } from '@/lib/mock-data'
import { slugify } from '@/lib/utils'
import { createEventSchema, PUBLIC_EVENT_STATUSES, updateEventSchema } from '@/lib/validation/events'

const allowedTransitions: Record<EventStatus, EventStatus[]> = {
  DRAFT: ['DRAFT', 'OPEN', 'CLOSED'],
  OPEN: ['OPEN', 'ONGOING', 'CLOSED'],
  ONGOING: ['ONGOING', 'JUDGING', 'CLOSED'],
  JUDGING: ['JUDGING', 'CLOSED'],
  CLOSED: ['CLOSED'],
}

export async function listPublicEvents() {
  try {
    const prisma = getPrismaClient()
    return await prisma.event.findMany({
      where: { status: { in: PUBLIC_EVENT_STATUSES.map((status) => status as EventStatus) } },
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
  } catch (error) {
    console.error('listPublicEvents fallback to mock data', error)
    return getMockPublicEvents()
  }
}

export async function listOwnEvents(organiserId: string) {
  try {
    const prisma = getPrismaClient()
    return await prisma.event.findMany({
      where: { organiserId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            registrations: true,
            teams: true,
            projects: true,
          },
        },
      },
    })
  } catch (error) {
    console.error('listOwnEvents fallback to mock data', error)
    return getMockOwnEvents(organiserId)
  }
}

export async function getEventBySlug(slug: string, viewerId?: string) {
  try {
    const prisma = getPrismaClient()
    return await prisma.event.findFirst({
      where: {
        slug,
        OR: [
          { status: { in: PUBLIC_EVENT_STATUSES.map((status) => status as EventStatus) } },
          ...(viewerId ? [{ organiserId: viewerId }] : []),
        ],
      },
      include: {
        _count: {
          select: {
            registrations: true,
            teams: true,
            projects: true,
          },
        },
      },
    })
  } catch (error) {
    console.error('getEventBySlug fallback to mock data', error)
    return getMockEventBySlug(slug)
  }
}

export async function createEvent(input: unknown, organiserId: string) {
  const prisma = getPrismaClient()
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

export async function updateEvent(eventId: string, organiserId: string, input: unknown) {
  const prisma = getPrismaClient()
  const parsed = updateEventSchema.parse(input)

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { organiserId: true, status: true },
  })

  if (!event || event.organiserId !== organiserId) {
    throw new Error('Event not found or unauthorized')
  }

  if (parsed.status && !allowedTransitions[event.status].includes(parsed.status)) {
    throw new Error(`Invalid status transition from ${event.status} to ${parsed.status}`)
  }

  const data: Record<string, unknown> = {}
  if (parsed.title !== undefined) data.title = parsed.title
  if (parsed.description !== undefined) data.description = parsed.description
  if (parsed.location !== undefined) data.location = parsed.location
  if (parsed.startDate !== undefined) data.startDate = parsed.startDate ? new Date(parsed.startDate) : null
  if (parsed.endDate !== undefined) data.endDate = parsed.endDate ? new Date(parsed.endDate) : null
  if (parsed.submissionDeadline !== undefined) data.submissionDeadline = parsed.submissionDeadline ? new Date(parsed.submissionDeadline) : null
  if (parsed.maxTeamSize !== undefined) data.maxTeamSize = parsed.maxTeamSize
  if (parsed.aiJudgingEnabled !== undefined) data.aiJudgingEnabled = parsed.aiJudgingEnabled
  if (parsed.tags !== undefined) data.tags = parsed.tags
  if (parsed.status !== undefined) data.status = parsed.status

  return prisma.event.update({
    where: { id: eventId },
    data,
  })
}

export async function registerForEvent(eventId: string, userId: string) {
  const prisma = getPrismaClient()

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { status: true },
  })

  if (!event || event.status !== EventStatus.OPEN) {
    throw new Error('Event is not open for registration')
  }

  return prisma.eventRegistration.upsert({
    where: { eventId_userId: { eventId, userId } },
    update: {},
    create: {
      eventId,
      userId,
    },
  })
}

export async function unregisterFromEvent(eventId: string, userId: string) {
  const prisma = getPrismaClient()
  return prisma.eventRegistration.deleteMany({
    where: { eventId, userId },
  })
}
