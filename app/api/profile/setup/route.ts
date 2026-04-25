import { Role } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { ensureProfileExists } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { profileSetupSchema } from '@/lib/validation/profile'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const profile = await ensureProfileExists(user)
    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error('GET /api/profile/setup failed', error)
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    await ensureProfileExists(user)
    const payload = profileSetupSchema.parse(await req.json())
    const prisma = getPrismaClient()

    const usernameConflict = await prisma.profile.findFirst({
      where: {
        username: payload.username,
        id: { not: user.id },
      },
      select: { id: true },
    })

    if (usernameConflict) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 })
    }

    const profile = await prisma.profile.update({
      where: { id: user.id },
      data: {
        username: payload.username,
        fullName: payload.fullName || null,
        role: payload.role === 'ORGANISER' ? Role.ORGANISER : Role.HACKER,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
      },
    })

    return NextResponse.json({ data: profile })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 })
    }
    console.error('PATCH /api/profile/setup failed', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
