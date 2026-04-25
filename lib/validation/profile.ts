import { z } from 'zod'

export const profileSetupSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-z0-9_]+$/i, 'Username can only contain letters, numbers, and underscores'),
  fullName: z.string().max(80).optional().or(z.literal('')),
  role: z.enum(['HACKER', 'ORGANISER']),
})

export type ProfileSetupInput = z.infer<typeof profileSetupSchema>
