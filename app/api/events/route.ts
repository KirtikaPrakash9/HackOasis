import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { createEvent, listPublicEvents } from '@/actions/events'
import { ensureProfileExists } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const rate = checkRateLimit(`events:get:${ip}`, 60, 60_000)
    if (!rate.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const events = await listPublicEvents()
    return NextResponse.json({ data: events })
  } catch (error) {
    console.error('GET /api/events failed', error)
    return NextResponse.json({ error: 'Failed to load events' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    await ensureProfileExists(user)

    const payload = await req.json()
    const event = await createEvent(payload, user.id)
    return NextResponse.json({ data: event }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }

    console.error('POST /api/events failed', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
