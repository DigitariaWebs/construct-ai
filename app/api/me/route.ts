import { handle } from '@/server/core/http'
import { requireUser } from '@/server/core/auth/session'
import { membershipRepository } from '@/server/repositories/membershipRepository'

// Postgres driver doesn't run on the edge runtime.
export const runtime = 'nodejs'

/**
 * Returns the current user plus their active memberships (account id, name,
 * kind, and role). Shape is stable — the client caches it and renders the
 * nav, account switcher, and role-gated UI from this single payload.
 *
 * 401 if not authenticated; 403 if the user was suspended.
 */
export const GET = handle(async () => {
  const user = await requireUser()
  const memberships = await membershipRepository.listActiveForUser(user.id)

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isPlatformAdmin: user.isPlatformAdmin,
    },
    memberships: memberships.map(({ membership, account }) => ({
      role: membership.role,
      account: {
        id: account.id,
        name: account.name,
        kind: account.kind,
      },
    })),
  }
})
