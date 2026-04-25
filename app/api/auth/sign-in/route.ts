import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { signInSchema } from '@/lib/validation/auth'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const rate = checkRateLimit(`auth:sign-in:${ip}`, 20, 60_000)
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const payload = signInSchema.parse(await req.json())
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }

    console.error('POST /api/auth/sign-in failed', error)
    return NextResponse.json({ error: 'Sign in failed' }, { status: 500 })
  }
}
