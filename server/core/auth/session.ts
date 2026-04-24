import 'server-only'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ForbiddenError, UnauthorizedError } from '@/server/core/errors'
import { bootstrapUser } from '@/server/services/auth/bootstrapUser'
import { membershipRepository } from '@/server/repositories/membershipRepository'
import type { Membership, User } from '@/server/db/schema'

// Session helpers used by every route handler that touches authed data.
// The contract:
//
//   getCurrentUser()       — returns User | null. No throw. Lazy-bootstraps
//                            public rows on first call.
//   requireUser()          — returns User or throws 401/403.
//   requirePlatformAdmin() — returns User or throws 401/403.
//   requireRole(...)       — returns the Membership or throws 403.

/**
 * Returns the current authenticated user, or `null` if no valid session.
 * If auth.users exists but our public rows don't, creates them atomically.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser()
  if (error || !authUser) return null
  return bootstrapUser({
    id: authUser.id,
    email: authUser.email,
    user_metadata: authUser.user_metadata,
  })
}

/** Throws 401 if not authenticated, 403 if the user account is suspended. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) throw new UnauthorizedError()
  if (user.status !== 'active') {
    throw new ForbiddenError('Your account has been suspended')
  }
  return user
}

/** Convenience: require an authenticated user AND the platform-admin flag. */
export async function requirePlatformAdmin(): Promise<User> {
  const user = await requireUser()
  if (!user.isPlatformAdmin) throw new ForbiddenError()
  return user
}

/**
 * Require an active membership in the given account with one of the allowed
 * roles. Used when a mutation touches account-scoped data (create a quote,
 * invite a member, etc.). Platform admins bypass the membership check.
 */
export async function requireRole(
  user: User,
  accountId: string,
  allowed: ReadonlyArray<Membership['role']>,
): Promise<Membership | null> {
  if (user.isPlatformAdmin) return null
  const membership = await membershipRepository.findActive(user.id, accountId)
  if (!membership) throw new ForbiddenError('Not a member of this account')
  if (!allowed.includes(membership.role)) {
    throw new ForbiddenError(`This action requires one of: ${allowed.join(', ')}`)
  }
  return membership
}
