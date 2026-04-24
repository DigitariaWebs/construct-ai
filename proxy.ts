import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Runs on every non-asset request (see matcher at the bottom). Two jobs:
//
//   1. Refresh the Supabase auth cookie if it's near expiry, so sessions
//      survive idle users without a forced re-login.
//   2. Gate workspace routes — anonymous users hitting /dashboard etc. are
//      bounced to /auth; signed-in users hitting /auth go to /dashboard.
//
// /api/* requests are NEVER redirected — route handlers handle their own
// 401 via requireUser(). Redirecting an XHR would corrupt the response
// shape downstream code expects.

const PROTECTED_PATHS = [
  '/dashboard',
  '/projects',
  '/quote',
  '/catalog',
  '/processing',
  '/profile',
  '/settings',
  '/service-clients',
]

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
}

export async function proxy(request: NextRequest) {
  // Buffer cookies that Supabase wants to write so we can attach them to
  // *whichever* response we end up returning (passthrough OR redirect).
  // Without this, a redirect would silently drop the refreshed session.
  const cookiesToWrite: { name: string; value: string; options: Parameters<NextResponse['cookies']['set']>[2] }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Mirror to the request so any downstream handler in this same
          // request sees the fresh cookies.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // Buffer for the outgoing response.
          cookiesToSet.forEach((c) => cookiesToWrite.push(c))
        },
      },
    },
  )

  // IMPORTANT: triggers the cookie refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  let response: NextResponse
  if (pathname.startsWith('/api')) {
    response = NextResponse.next({ request })
  } else if (!user && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    response = NextResponse.redirect(url)
  } else if (user && pathname === '/auth') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    response = NextResponse.redirect(url)
  } else {
    response = NextResponse.next({ request })
  }

  // Write any refreshed cookies onto whatever response we chose above.
  cookiesToWrite.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })

  return response
}

export const config = {
  // Match everything except Next internals and static assets. API routes
  // ARE included so the session refreshes on XHR too — we just skip the
  // redirect logic for them in the handler above.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
