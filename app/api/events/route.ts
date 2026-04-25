import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { createEvent, listPublicEvents } from '@/actions/events'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const events = await listPublicEvents()
    return NextResponse.json({ data: events })
  } catch {
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

    const payload = await req.json()
    const event = await createEvent(payload, user.id)
    return NextResponse.json({ data: event }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
