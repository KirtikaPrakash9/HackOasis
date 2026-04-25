import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { EventStatus } from '@prisma/client'
import { ensureProfileExists } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { PUBLIC_EVENT_STATUSES, updateEventSchema } from '@/lib/validation/events'
import { updateEvent } from '@/actions/events'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const prisma = getPrismaClient()
    const event = await prisma.event.findFirst({
      where: {
        slug,
        OR: [
          {
            status: { in: PUBLIC_EVENT_STATUSES.map((status) => status as EventStatus) },
          },
          ...(user ? [{ organiserId: user.id }] : []),
        ],
      },
      include: {
        _count: {
          select: {
            registrations: true,
            teams: true,
            projects: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ data: event })
  } catch (error) {
    console.error('GET /api/events/[slug] failed', error)
    return NextResponse.json({ error: 'Failed to load event' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
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
    const payload = updateEventSchema.parse(await req.json())
    const prisma = getPrismaClient()
    const event = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const updated = await updateEvent(event.id, user.id, payload)
    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }
    console.error('PATCH /api/events/[slug] failed', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}
