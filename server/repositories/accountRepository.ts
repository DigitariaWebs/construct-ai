import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@/server/db/client'
import { accounts, type Account, type NewAccount } from '@/server/db/schema'

export const accountRepository = {
  async findById(id: string): Promise<Account | null> {
    const [row] = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1)
    return row ?? null
  },

  async insert(data: NewAccount): Promise<Account> {
    const [row] = await db.insert(accounts).values(data).returning()
    return row
  },
}
