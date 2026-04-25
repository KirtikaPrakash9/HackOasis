'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BrutalButton } from '@/components/brutal/BrutalButton'
import { BrutalInput } from '@/components/brutal/BrutalInput'
import { signInSchema } from '@/lib/validation/auth'

type FormValues = z.infer<typeof signInSchema>

export function SignInForm({ nextPath }: { nextPath: string }) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    const response = await fetch('/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    const data = await response.json()
    if (!response.ok) {
      setServerError(data?.error ?? 'Failed to sign in')
      return
    }

    router.push(nextPath || '/events')
    router.refresh()
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="card-brutal space-y-4 p-6">
        <div>
          <label className="label-caps text-xs">Email</label>
          <BrutalInput type="email" {...register('email')} />
          {errors.email ? <p className="mt-1 text-sm text-hack-orange">{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="label-caps text-xs">Password</label>
          <BrutalInput type="password" {...register('password')} />
          {errors.password ? <p className="mt-1 text-sm text-hack-orange">{errors.password.message}</p> : null}
        </div>
        <BrutalButton type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </BrutalButton>
        {serverError ? <p className="text-sm text-hack-orange">{serverError}</p> : null}
      </form>

      <p className="mt-4 text-sm">
        New here?{' '}
        <Link href="/signup" className="underline">
          Create an account
        </Link>
      </p>
    </>
  )
}
