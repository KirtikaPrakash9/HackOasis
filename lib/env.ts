import { z } from 'zod'

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
})

const serverEnvSchema = publicEnvSchema.extend({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required'),
})

type PublicEnv = z.infer<typeof publicEnvSchema>
type ServerEnv = z.infer<typeof serverEnvSchema>

let publicEnvCache: PublicEnv | null = null
let serverEnvCache: ServerEnv | null = null

export function getPublicEnv(): PublicEnv {
  if (publicEnvCache) return publicEnvCache
  publicEnvCache = publicEnvSchema.parse(process.env)
  return publicEnvCache
}

export function getServerEnv(): ServerEnv {
  if (serverEnvCache) return serverEnvCache
  serverEnvCache = serverEnvSchema.parse(process.env)
  return serverEnvCache
}
