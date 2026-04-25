import Link from 'next/link'
import { BrutalButton } from '@/components/brutal/BrutalButton'

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10">
      <div className="card-brutal p-8">
        <h1 className="text-3xl font-black">UNAUTHORIZED</h1>
        <p className="mt-2">You do not have permission to access this page.</p>
        <Link href="/events" className="mt-4 inline-block">
          <BrutalButton variant="primary">Back to Events</BrutalButton>
        </Link>
      </div>
    </main>
  )
}
