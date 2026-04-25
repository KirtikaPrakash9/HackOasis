import { notFound } from 'next/navigation'
import { getEventBySlug } from '@/actions/events'
import { EventRegistrationButton } from '@/components/events/EventRegistrationButton'
import { createClient } from '@/lib/supabase/server'
import { getPrismaClient } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let userId: string | undefined
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    userId = user?.id
  } catch (error) {
    console.error('EventDetailPage auth unavailable, continuing with anonymous mode', error)
  }

  const event = await getEventBySlug(slug, userId)

  if (!event) {
    notFound()
  }

  let initiallyRegistered = false
  if (userId && !event.id.startsWith('mock-')) {
    const prisma = getPrismaClient()
    const registration = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId,
        },
      },
      select: { id: true },
    })
    initiallyRegistered = Boolean(registration)
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10">
      <div className="card-brutal p-8">
        <h1 className="text-4xl font-black">{event.title}</h1>
        <p className="mt-2">{event.description ?? 'No description provided.'}</p>
        <div className="mt-4 grid gap-2 text-sm">
          <p>
            <span className="font-bold">Status:</span> {event.status}
          </p>
          {event.location ? (
            <p>
              <span className="font-bold">Location:</span> {event.location}
            </p>
          ) : null}
          <p>
            <span className="font-bold">Registrations:</span> {event._count.registrations}
          </p>
        </div>
        <EventRegistrationButton
          slug={slug}
          initiallyRegistered={initiallyRegistered}
          isAuthenticated={Boolean(userId)}
          canRegister={!event.id.startsWith('mock-') && event.status === 'OPEN'}
        />
      </div>
    </main>
  )
}
