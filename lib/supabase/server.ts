import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { env } from '@/server/core/config/env'

/**
 * Supabase client for use in Server Components and Route Handlers.
 * Reads/writes the Supabase auth cookies via Next's cookie store.
 * Each request should create its own client — don't cache the instance.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component where cookies are read-only.
            // Silently ignore — middleware.ts refreshes session on every
            // request, so the client's cookies stay fresh regardless.
          }
        },
      },
    },
  )
}
