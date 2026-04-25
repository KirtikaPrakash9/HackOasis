import { z } from 'zod'

export const EVENT_STATUSES = ['DRAFT', 'OPEN', 'ONGOING', 'JUDGING', 'CLOSED'] as const
export const PUBLIC_EVENT_STATUSES = ['OPEN', 'ONGOING', 'JUDGING', 'CLOSED'] as const

export const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  submissionDeadline: z.string().optional(),
  maxTeamSize: z.coerce.number().int().min(1).max(10).default(4),
  status: z.enum(EVENT_STATUSES).default('DRAFT'),
  aiJudgingEnabled: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
})

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(EVENT_STATUSES).optional(),
})

export const eventRegistrationSchema = z.object({
  eventId: z.string().uuid(),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
