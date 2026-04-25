import Link from 'next/link'
import { redirect } from 'next/navigation'
import { listOwnEvents } from '@/actions/events'
import { BrutalCard } from '@/components/brutal/BrutalCard'
import { EventStatusForm } from '@/components/events/EventStatusForm'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function OrganiserEventsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin?next=/organise/events')
  }

  const events = await listOwnEvents(user.id)
  const showingMock = events.some((event) => event.id.startsWith('mock-'))

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h1 className="text-3xl font-black">MY EVENTS</h1>
        <Link href="/organise/create" className="underline">
          Create new event
        </Link>
      </div>
      <hr className="hr-brutal mb-8" />
      {showingMock ? <p className="mb-4 text-sm text-hack-orange">Showing demo mock organiser data.</p> : null}

      {events.length === 0 ? (
        <BrutalCard className="p-8">No events created yet.</BrutalCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <BrutalCard key={event.id}>
              <h2 className="text-2xl font-black">{event.title}</h2>
              <p className="mt-2 text-sm">{event.description ?? 'No description'}</p>
              <div className="mt-3 text-sm">
                <p>Registrations: {event._count.registrations}</p>
                <p>Teams: {event._count.teams}</p>
                <p>Projects: {event._count.projects}</p>
              </div>
              <EventStatusForm slug={event.slug} initialStatus={event.status} />
            </BrutalCard>
          ))}
        </div>
      )}
    </main>
  )
}
