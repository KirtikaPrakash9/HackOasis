'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BrutalButton } from '@/components/brutal/BrutalButton'
import { BrutalInput } from '@/components/brutal/BrutalInput'

const schema = z.object({
  organiserId: z.string().uuid('Use a valid organiser UUID'),
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  location: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function CreateEventPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    setSuccessMessage(null)

    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        maxTeamSize: 4,
        status: 'DRAFT',
        aiJudgingEnabled: false,
        tags: [],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      setServerError(data?.error?.formErrors?.[0] ?? data?.error ?? 'Failed to create event')
      return
    }

    setSuccessMessage('Event created successfully.')
    reset()
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-black">CREATE EVENT</h1>
      <hr className="hr-brutal my-6" />

      <form onSubmit={handleSubmit(onSubmit)} className="card-brutal space-y-4 p-6">
        <div>
          <label className="label-caps text-xs">Organiser ID (UUID)</label>
          <BrutalInput placeholder="00000000-0000-0000-0000-000000000000" {...register('organiserId')} />
          {errors.organiserId ? <p className="mt-1 text-sm text-hack-orange">{errors.organiserId.message}</p> : null}
        </div>

        <div>
          <label className="label-caps text-xs">Title</label>
          <BrutalInput placeholder="HackOasis Dubai 2026" {...register('title')} />
          {errors.title ? <p className="mt-1 text-sm text-hack-orange">{errors.title.message}</p> : null}
        </div>

        <div>
          <label className="label-caps text-xs">Description</label>
          <BrutalInput placeholder="Build climate-tech solutions" {...register('description')} />
        </div>

        <div>
          <label className="label-caps text-xs">Location</label>
          <BrutalInput placeholder="Dubai, UAE" {...register('location')} />
        </div>

        <BrutalButton type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Creating…' : 'Create'}
        </BrutalButton>

        {serverError ? <p className="text-sm text-hack-orange">{serverError}</p> : null}
        {successMessage ? <p className="text-sm">{successMessage}</p> : null}
      </form>
    </main>
  )
}
