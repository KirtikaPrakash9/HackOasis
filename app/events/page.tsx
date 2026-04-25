import { listPublicEvents } from '@/actions/events'
import { BrutalBadge } from '@/components/brutal/BrutalBadge'
import { BrutalCard } from '@/components/brutal/BrutalCard'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const events = await listPublicEvents()

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h1 className="text-3xl font-black">EVENTS</h1>
        <p className="label-caps rotate-2 text-xs">PHASE 2 · CORE MVP</p>
      </div>
      <hr className="hr-brutal mb-8" />

      {events.length === 0 ? (
        <BrutalCard className="p-8">
          <h2 className="text-2xl font-black">No events yet</h2>
          <p className="mt-2">Once organisers publish open events, they will appear here.</p>
        </BrutalCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <BrutalCard key={event.id}>
              <h2 className="text-2xl font-black">{event.title}</h2>
              <p className="mt-2 text-sm">{event.description ?? 'No description yet.'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <BrutalBadge>{event.status}</BrutalBadge>
                {event.location ? <BrutalBadge tone="primary">{event.location}</BrutalBadge> : null}
              </div>
            </BrutalCard>
          ))}
        </div>
      )}
    </main>
  )
}
