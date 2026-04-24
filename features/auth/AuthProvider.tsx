'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { fetchMe, type MePayload, type CurrentUser, type CurrentMembership } from './api'
import { createBrowserSupabaseClient } from '@/lib/supabase/browser'

// Single source of truth on the client for "who is signed in".
//   - `data`         /api/me payload, or null when unauthenticated
//   - `isLoading`    true while the initial fetch is in flight
//   - `error`        non-null only if the fetch crashed (network / 5xx);
//                    a 401 is *not* an error here — it sets data to null
//   - `refresh()`    re-fetch on demand (e.g. after the user updates profile)
//
// The provider also subscribes to Supabase auth events so the React state
// stays in sync after sign-up, sign-in, sign-out, and token refresh —
// without consumers needing to call `refresh()` themselves.

export type AuthState = {
  data: MePayload | null
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MePayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const me = await fetchMe()
      setData(me)
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)))
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()

    const supabase = createBrowserSupabaseClient()
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      // INITIAL_SESSION fires immediately on subscribe — we already kicked
      // off refresh() above, so skip it to avoid a duplicate fetch.
      if (event === 'INITIAL_SESSION') return
      refresh()
    })

    return () => sub.subscription.unsubscribe()
  }, [refresh])

  return (
    <AuthContext.Provider value={{ data, isLoading, error, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>')
  return ctx
}

/** Convenience: just the current user, or null while loading / unauth. */
export function useCurrentUser(): CurrentUser | null {
  const { data } = useAuth()
  return data?.user ?? null
}

/** Convenience: the current user's active memberships. */
export function useMemberships(): CurrentMembership[] {
  const { data } = useAuth()
  return data?.memberships ?? []
}
