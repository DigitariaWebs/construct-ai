import 'server-only'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/server/core/config/env'
import * as schema from './schema'

// `prepare: false` so the same code path works with Supabase's transaction
// pooler (port 6543). Direct connections (54322 local, 5432 cloud) accept
// either setting — keeping it off avoids a production footgun.
const client = postgres(env.DATABASE_URL, { prepare: false })

export const db = drizzle(client, { schema })
export type DB = typeof db
