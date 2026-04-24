import 'server-only'
import { and, eq } from 'drizzle-orm'
import { db } from '@/server/db/client'
import {
  memberships,
  accounts,
  type Membership,
  type NewMembership,
  type Account,
} from '@/server/db/schema'

export type MembershipWithAccount = {
  membership: Membership
  account: Account
}

export const membershipRepository = {
  /**
   * Active memberships for a user, joined with the account so the nav can
   * render the account switcher in one round-trip.
   */
  async listActiveForUser(userId: string): Promise<MembershipWithAccount[]> {
    return db
      .select({ membership: memberships, account: accounts })
      .from(memberships)
      .innerJoin(accounts, eq(memberships.accountId, accounts.id))
      .where(and(eq(memberships.userId, userId), eq(memberships.status, 'active')))
  },

  async findActive(userId: string, accountId: string): Promise<Membership | null> {
    const [row] = await db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.userId, userId),
          eq(memberships.accountId, accountId),
          eq(memberships.status, 'active'),
        ),
      )
      .limit(1)
    return row ?? null
  },

  async insert(data: NewMembership): Promise<Membership> {
    const [row] = await db.insert(memberships).values(data).returning()
    return row
  },
}
