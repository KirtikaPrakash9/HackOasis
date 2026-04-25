import { BrutalCard } from '@/components/brutal/BrutalCard'

export default function LoadingEventsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-black">EVENTS</h1>
      <hr className="hr-brutal my-6" />
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <BrutalCard key={idx} className="h-40 animate-pulse bg-hack-concrete" />
        ))}
      </div>
    </main>
  )
}
