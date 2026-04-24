import { sql } from 'drizzle-orm'
import { pgTable, pgEnum, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const accountKindEnum = pgEnum('account_kind', ['individual', 'company'])
export const accountStatusEnum = pgEnum('account_status', ['active', 'suspended', 'archived'])

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  kind: accountKindEnum('kind').notNull(),
  status: accountStatusEnum('status').notNull().default('active'),

  // French legal identity. All optional in the DB; app-layer validation
  // requires them before issuing a devis (legally mandatory on French quotes).
  // Format validators live in shared/validation/siret.ts; real identity check
  // via the INSEE Sirene API is wired in later.
  siret: text('siret'),                         // 14 digits, stored digits-only
  vatIntra: text('vat_intra'),                  // 'FR' + 11 chars; null if VAT-exempt
  legalName: text('legal_name'),                // registered business name
  addressLine1: text('address_line1'),
  addressLine2: text('address_line2'),          // complément (bâtiment, escalier, etc.)
  postalCode: text('postal_code'),              // 5 digits for FR
  city: text('city'),
  country: text('country').notNull().default('FR'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert
