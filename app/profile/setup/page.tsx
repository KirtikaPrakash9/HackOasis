'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BrutalButton } from '@/components/brutal/BrutalButton'
import { BrutalInput } from '@/components/brutal/BrutalInput'
import { profileSetupSchema } from '@/lib/validation/profile'

type FormValues = z.infer<typeof profileSetupSchema>

export default function ProfileSetupPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      username: '',
      fullName: '',
      role: 'HACKER',
    },
  })

  useEffect(() => {
    const run = async () => {
      const response = await fetch('/api/profile/setup')
      const data = await response.json()
      if (response.ok && data?.data) {
        reset({
          username: data.data.username || '',
          fullName: data.data.fullName || '',
          role: data.data.role === 'ORGANISER' ? 'ORGANISER' : 'HACKER',
        })
      }
      setLoading(false)
    }

    run()
  }, [reset])

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    const response = await fetch('/api/profile/setup', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    const data = await response.json()
    if (!response.ok) {
      setServerError(data?.error?.formErrors?.[0] ?? data?.error ?? 'Failed to update profile')
      return
    }
    router.push(values.role === 'ORGANISER' ? '/organise/events' : '/events')
    router.refresh()
  }

  if (loading) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10">
        <div className="card-brutal p-8">Loading profile…</div>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-black">PROFILE SETUP</h1>
      <hr className="hr-brutal my-6" />
      <form onSubmit={handleSubmit(onSubmit)} className="card-brutal space-y-4 p-6">
        <div>
          <label className="label-caps text-xs">Username</label>
          <BrutalInput {...register('username')} />
          {errors.username ? <p className="mt-1 text-sm text-hack-orange">{errors.username.message}</p> : null}
        </div>
        <div>
          <label className="label-caps text-xs">Full name</label>
          <BrutalInput {...register('fullName')} />
        </div>
        <div>
          <label className="label-caps text-xs">Role</label>
          <select className="input-brutal w-full" {...register('role')}>
            <option value="HACKER">Hacker</option>
            <option value="ORGANISER">Organiser</option>
          </select>
        </div>
        <BrutalButton type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save profile'}
        </BrutalButton>
        {serverError ? <p className="text-sm text-hack-orange">{serverError}</p> : null}
      </form>
    </main>
  )
}
