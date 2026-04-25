import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { signUpSchema } from '@/lib/validation/auth'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const rate = checkRateLimit(`auth:sign-up:${ip}`, 10, 60_000)
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const payload = signUpSchema.parse(await req.json())
    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }

    console.error('POST /api/auth/sign-up failed', error)
    return NextResponse.json({ error: 'Sign up failed' }, { status: 500 })
  }
}
