import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { createEvent, listPublicEvents } from '@/actions/events'

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
    const payload = await req.json()
    const event = await createEvent(payload)
    return NextResponse.json({ data: event }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
