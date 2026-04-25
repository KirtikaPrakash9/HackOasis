import Link from 'next/link'
import { BrutalButton } from '@/components/brutal/BrutalButton'

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10">
      <div className="card-brutal p-8">
        <p className="label-caps -rotate-2 text-sm">UAE / MENA HACKATHON HUB</p>
        <h1 className="mt-4 text-4xl font-black md:text-6xl">HACKOASIS</h1>
        <p className="mt-4 max-w-2xl text-base">
          AI-powered platform for hackathon discovery, team formation, project submissions, and talent ranking.
        </p>
      </div>

      <hr className="hr-brutal" />

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="card-brutal p-6">
          <h2 className="text-2xl font-black">Explore active hackathons</h2>
          <p className="mt-2">Browse events and register with your team.</p>
          <Link href="/events" className="mt-4 inline-block">
            <BrutalButton variant="primary">View Events</BrutalButton>
          </Link>
        </div>

        <div className="card-brutal p-6">
          <h2 className="text-xl font-black">Organiser</h2>
          <p className="mt-2">Launch a new hackathon with AI-ready judging setup.</p>
          <Link href="/organise/create" className="mt-4 inline-block">
            <BrutalButton variant="orange">Create Event</BrutalButton>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/signin">
          <BrutalButton>Sign In</BrutalButton>
        </Link>
        <Link href="/signup">
          <BrutalButton variant="primary">Sign Up</BrutalButton>
        </Link>
        <Link href="/organise/events">
          <BrutalButton variant="orange">Organiser Dashboard</BrutalButton>
        </Link>
      </div>
    </main>
  )
}
