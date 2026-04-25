'use client'

import { useState } from 'react'
import { BrutalButton } from '@/components/brutal/BrutalButton'

const statuses = ['DRAFT', 'OPEN', 'ONGOING', 'JUDGING', 'CLOSED'] as const

type Props = {
  slug: string
  initialStatus: (typeof statuses)[number]
}

export function EventStatusForm({ slug, initialStatus }: Props) {
  const [status, setStatus] = useState<(typeof statuses)[number]>(initialStatus)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const submit = async () => {
    setSaving(true)
    setMessage(null)
    const response = await fetch(`/api/events/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const data = await response.json()
      setMessage(data?.error ?? 'Failed to update')
      setSaving(false)
      return
    }

    setSaving(false)
    setMessage('Updated')
  }

  return (
    <div className="mt-4 space-y-2">
      <select className="input-brutal w-full max-w-xs" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
        {statuses.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <BrutalButton onClick={submit} disabled={saving}>
        {saving ? 'Saving…' : 'Update status'}
      </BrutalButton>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  )
}
