'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BrutalButton } from '@/components/brutal/BrutalButton'
import { BrutalInput } from '@/components/brutal/BrutalInput'
import { signUpSchema } from '@/lib/validation/auth'

type FormValues = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    setSuccessMessage(null)
    const response = await fetch('/api/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    const data = await response.json()
    if (!response.ok) {
      setServerError(data?.error ?? 'Failed to sign up')
      return
    }

    setSuccessMessage('Account created. You can sign in now.')
    router.push('/signin')
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-6 py-10">
      <h1 className="text-3xl font-black">SIGN UP</h1>
      <hr className="hr-brutal my-6" />

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
          {isSubmitting ? 'Creating…' : 'Create account'}
        </BrutalButton>
        {serverError ? <p className="text-sm text-hack-orange">{serverError}</p> : null}
        {successMessage ? <p className="text-sm">{successMessage}</p> : null}
      </form>

      <p className="mt-4 text-sm">
        Already have an account?{' '}
        <Link href="/signin" className="underline">
          Sign in
        </Link>
      </p>
    </main>
  )
}
