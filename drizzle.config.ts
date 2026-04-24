import { defineConfig } from 'drizzle-kit'

// DATABASE_URL is loaded from .env.local by `bun run`. For cloud-targeted runs,
// override inline: `DATABASE_URL=... bun run db:generate`.

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/db/schema',
  out: './supabase/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  // Supabase owns the `auth` schema; we only manage `public`.
  schemaFilter: ['public'],
  // Emit Supabase-compatible filenames (<unix>_<name>.sql) so `supabase db push`
  // picks them up alongside any hand-written SQL migrations.
  migrations: {
    prefix: 'supabase',
  },
  verbose: true,
  strict: true,
})
