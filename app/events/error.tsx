'use client'

import { BrutalButton } from '@/components/brutal/BrutalButton'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <div className="card-brutal p-8">
        <h1 className="text-3xl font-black">Could not load events</h1>
        <p className="mt-2">Please try again.</p>
        {error?.message ? <p className="mt-2 text-sm text-hack-orange">{error.message}</p> : null}
        <BrutalButton className="mt-4" onClick={() => reset()}>
          Retry
        </BrutalButton>
      </div>
    </main>
  )
}
