import { NextRequest, NextResponse } from 'next/server'
import { ensureProfileExists } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { registerForEvent, unregisterFromEvent } from '@/actions/events'

async function getEventIdFromSlug(slug: string) {
  const prisma = getPrismaClient()
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { id: true },
  })
  return event?.id || null
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    await ensureProfileExists(user)
    const eventId = await getEventIdFromSlug(slug)
    if (!eventId) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    await registerForEvent(eventId, user.id)
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error('POST /api/events/[slug]/register failed', error)
    return NextResponse.json({ error: 'Failed to register for event' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const eventId = await getEventIdFromSlug(slug)
    if (!eventId) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    await unregisterFromEvent(eventId, user.id)
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/events/[slug]/register failed', error)
    return NextResponse.json({ error: 'Failed to unregister from event' }, { status: 500 })
  }
}
