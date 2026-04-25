'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BrutalButton } from '@/components/brutal/BrutalButton'
import { BrutalInput } from '@/components/brutal/BrutalInput'

const schema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  submissionDeadline: z.string().optional(),
  maxTeamSize: z.number().int().min(1).max(10),
  status: z.enum(['DRAFT', 'OPEN', 'ONGOING', 'JUDGING', 'CLOSED']),
  aiJudgingEnabled: z.boolean(),
  tags: z.string().optional(),
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
      startDate: '',
      endDate: '',
      submissionDeadline: '',
      maxTeamSize: 4,
      status: 'DRAFT',
      aiJudgingEnabled: false,
      tags: '',
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
          tags: values.tags
            ? values.tags
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
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

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label-caps text-xs">Start Date</label>
            <BrutalInput type="datetime-local" {...register('startDate')} />
          </div>
          <div>
            <label className="label-caps text-xs">End Date</label>
            <BrutalInput type="datetime-local" {...register('endDate')} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label-caps text-xs">Submission Deadline</label>
            <BrutalInput type="datetime-local" {...register('submissionDeadline')} />
          </div>
          <div>
            <label className="label-caps text-xs">Max Team Size</label>
            <BrutalInput type="number" min={1} max={10} {...register('maxTeamSize', { valueAsNumber: true })} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label-caps text-xs">Initial Status</label>
            <select className="input-brutal w-full" {...register('status')}>
              <option value="DRAFT">DRAFT</option>
              <option value="OPEN">OPEN</option>
              <option value="ONGOING">ONGOING</option>
              <option value="JUDGING">JUDGING</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <input id="aiJudgingEnabled" type="checkbox" className="h-4 w-4" {...register('aiJudgingEnabled')} />
            <label htmlFor="aiJudgingEnabled" className="label-caps text-xs">
              AI Judging Enabled
            </label>
          </div>
        </div>

        <div>
          <label className="label-caps text-xs">Tags (comma-separated)</label>
          <BrutalInput placeholder="climate, fintech, ai" {...register('tags')} />
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
