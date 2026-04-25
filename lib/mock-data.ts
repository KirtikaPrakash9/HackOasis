import { EventStatus } from '@prisma/client'

type PublicEvent = {
  id: string
  title: string
  slug: string
  description: string
  location: string
  startDate: Date
  endDate: Date
  status: EventStatus
  tags: string[]
}

type EventWithCounts = PublicEvent & {
  organiserId: string
  submissionDeadline: Date
  maxTeamSize: number
  aiJudgingEnabled: boolean
  createdAt: Date
  _count: {
    registrations: number
    teams: number
    projects: number
  }
}

const statusPool: EventStatus[] = [EventStatus.OPEN, EventStatus.ONGOING, EventStatus.JUDGING, EventStatus.CLOSED]
const locations = ['Dubai, UAE', 'Abu Dhabi, UAE', 'Sharjah, UAE', 'Riyadh, KSA', 'Doha, Qatar']
const themes = ['AI', 'Fintech', 'Climate', 'Health', 'Web3', 'Edtech', 'GovTech', 'Mobility']

const mockEvents: EventWithCounts[] = Array.from({ length: 24 }).map((_, idx) => {
  const i = idx + 1
  const status = statusPool[idx % statusPool.length]
  const location = locations[idx % locations.length]
  const theme = themes[idx % themes.length]
  const startDate = new Date(Date.now() + i * 86_400_000 * 3)
  const endDate = new Date(startDate.getTime() + 86_400_000 * 2)
  const submissionDeadline = new Date(endDate.getTime() - 86_400_000 / 2)
  const base: EventWithCounts = {
    id: `mock-event-${i}`,
    organiserId: i % 2 === 0 ? 'mock-organiser-1' : 'mock-organiser-2',
    title: `${theme} Builder Sprint ${2026 + (idx % 2)} · #${i}`,
    slug: `mock-${theme.toLowerCase()}-sprint-${i}`,
    description: `Build ${theme.toLowerCase()} solutions for MENA startups, public sector, and community impact.`,
    location,
    startDate,
    endDate,
    submissionDeadline,
    maxTeamSize: 4 + (idx % 3),
    status,
    aiJudgingEnabled: idx % 2 === 0,
    tags: [theme.toLowerCase(), 'mena', 'hackathon'],
    createdAt: new Date(Date.now() - i * 86_400_000),
    _count: {
      registrations: 35 + i * 3,
      teams: 8 + (i % 10),
      projects: 4 + (i % 8),
    },
  }
  return base
})

export function getMockPublicEvents() {
  return mockEvents
    .filter((event) => event.status !== 'DRAFT')
    .map((event) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      status: event.status,
      tags: event.tags,
    }))
}

export function getMockEventBySlug(slug: string) {
  return mockEvents.find((event) => event.slug === slug) ?? null
}

export function getMockOwnEvents(_organiserId: string) {
  return mockEvents.slice(0, 8)
}
