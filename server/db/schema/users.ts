import { pgTable, pgEnum, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const userStatusEnum = pgEnum('user_status', ['active', 'suspended'])

// The FK `public.users.id -> auth.users.id ON DELETE CASCADE` is added
// in a hand-written migration (supabase/migrations/*_auth_users_fk.sql).
// Drizzle can't see auth.users without trying to manage it, so the FK is
// applied out-of-band and enforced at the DB level just the same.
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  isPlatformAdmin: boolean('is_platform_admin').notNull().default(false),
  status: userStatusEnum('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
