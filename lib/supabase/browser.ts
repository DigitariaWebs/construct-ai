import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for use in Client Components.
 * Reads/writes the Supabase auth cookies via `document.cookie`.
 *
 * Safe to call multiple times — @supabase/ssr handles the singleton internally.
 * Env vars are inlined at build time by Next (`NEXT_PUBLIC_` prefix).
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
