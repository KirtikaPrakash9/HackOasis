'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrutalButton } from '@/components/brutal/BrutalButton'

type Props = {
  slug: string
  initiallyRegistered: boolean
  isAuthenticated: boolean
  canRegister: boolean
}

export function EventRegistrationButton({ slug, initiallyRegistered, isAuthenticated, canRegister }: Props) {
  const router = useRouter()
  const [registered, setRegistered] = useState(initiallyRegistered)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = async () => {
    if (!canRegister) {
      setError('Registration is disabled in mock/demo mode or for this event status.')
      return
    }

    if (!isAuthenticated) {
      router.push(`/signin?next=/events/${slug}`)
      return
    }

    setSubmitting(true)
    setError(null)

    const response = await fetch(`/api/events/${slug}/register`, {
      method: registered ? 'DELETE' : 'POST',
    })
    const data = await response.json()

    if (!response.ok) {
      setError(data?.error ?? 'Request failed')
      setSubmitting(false)
      return
    }

    setRegistered((value) => !value)
    setSubmitting(false)
    router.refresh()
  }

  return (
    <div className="mt-4 space-y-2">
      <BrutalButton onClick={toggle} variant={registered ? 'neutral' : 'primary'} disabled={submitting}>
        {submitting ? 'Please wait…' : registered ? 'Unregister' : 'Register'}
      </BrutalButton>
      {error ? <p className="text-sm text-hack-orange">{error}</p> : null}
    </div>
  )
}
