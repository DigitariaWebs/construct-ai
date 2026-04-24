import 'server-only'
import { db } from '@/server/db/client'
import { users, accounts, memberships, type User } from '@/server/db/schema'
import { userRepository } from '@/server/repositories/userRepository'
import { logger } from '@/server/core/logger'

/** Shape we consume from `supabase.auth.getUser()` — only the fields we need. */
export type AuthIdentity = {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}

/**
 * First-time-login bootstrap. Creates public.users + a personal account +
 * an owner membership in a single transaction. Idempotent: if the public row
 * already exists, returns it without touching anything else.
 *
 * Called lazily from session.getCurrentUser() so signup flows don't need a
 * separate "bootstrap" HTTP round-trip. Works identically for email/password
 * and OAuth signups — we only need auth.users.id + email.
 */
export async function bootstrapUser(authUser: AuthIdentity): Promise<User> {
  const existing = await userRepository.findById(authUser.id)
  if (existing) return existing

  if (!authUser.email) {
    // auth.users guarantees an email for every real signup. Missing one means
    // we're looking at a synthetic row we shouldn't touch.
    throw new Error(`Cannot bootstrap auth user ${authUser.id}: no email`)
  }

  const metaName = readString(authUser.user_metadata, 'name')
    ?? readString(authUser.user_metadata, 'full_name')
  const displayName = metaName ?? authUser.email.split('@')[0]

  const user = await db.transaction(async (tx) => {
    const [u] = await tx
      .insert(users)
      .values({
        id: authUser.id,
        email: authUser.email!.toLowerCase(),
        name: metaName ?? null,
      })
      .returning()

    const [acc] = await tx
      .insert(accounts)
      .values({
        name: displayName,
        kind: 'individual',
      })
      .returning()

    await tx.insert(memberships).values({
      userId: u.id,
      accountId: acc.id,
      role: 'owner',
      status: 'active',
    })

    return u
  })

  logger.info({ userId: user.id, email: user.email }, 'bootstrapped new user')
  return user
}

function readString(meta: Record<string, unknown> | undefined, key: string): string | undefined {
  const v = meta?.[key]
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}
