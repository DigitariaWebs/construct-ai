import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@/server/db/client'
import { users, type User, type NewUser } from '@/server/db/schema'

// Thin data-access wrappers. No authorization here — callers (services /
// route handlers) are responsible for whether the *current* user is allowed
// to fetch this row.

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return row ?? null
  },

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)
    return row ?? null
  },

  async insert(data: NewUser): Promise<User> {
    const [row] = await db.insert(users).values(data).returning()
    return row
  },
}
