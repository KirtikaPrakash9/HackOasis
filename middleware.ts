import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const protectedPrefixes = ['/organise', '/profile']
const organiserOnlyPrefixes = ['/organise']
const authPages = ['/signin', '/signup']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname
  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  const isOrganiserOnly = organiserOnlyPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  const isAuthPage = authPages.includes(pathname)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/events', request.url))
  }

  if (isProtected && !user) {
    const redirectUrl = new URL('/signin', request.url)
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user && (isProtected || isOrganiserOnly)) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    if (!profile && pathname !== '/profile/setup') {
      return NextResponse.redirect(new URL('/profile/setup', request.url))
    }

    if (isOrganiserOnly && profile && profile.role !== 'organiser' && profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
