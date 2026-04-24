import { sql } from 'drizzle-orm'
import { pgTable, pgEnum, uuid, text, timestamp, unique, index } from 'drizzle-orm/pg-core'
import { users } from './users'
import { accounts } from './accounts'

export const membershipRoleEnum = pgEnum('membership_role', ['owner', 'member'])
export const membershipStatusEnum = pgEnum('membership_status', ['active', 'pending', 'revoked'])

export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    // Nullable while the row represents a pending invite (no user yet).
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    role: membershipRoleEnum('role').notNull(),
    status: membershipStatusEnum('status').notNull().default('active'),
    // Populated when status='pending' and user_id is null (invite-by-email).
    invitedEmail: text('invited_email'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // A given user has at most one membership row per account.
    // Postgres treats NULL user_id as distinct, so multiple pending invites
    // to the same account can coexist — intended.
    unique('memberships_user_account_unique').on(table.userId, table.accountId),
    // Fast "list members of an account" lookup without needing user_id.
    index('memberships_account_idx').on(table.accountId),
  ],
)

export type Membership = typeof memberships.$inferSelect
export type NewMembership = typeof memberships.$inferInsert
