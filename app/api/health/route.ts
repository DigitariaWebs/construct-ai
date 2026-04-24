import { count } from 'drizzle-orm'
import { db } from '@/server/db/client'
import { accounts } from '@/server/db/schema'
import { requestLogger } from '@/server/core/logger/request'

// Postgres driver (postgres-js) doesn't run on the edge runtime.
export const runtime = 'nodejs'

// Health endpoint intentionally bypasses the `handle()` wrapper: when the DB
// is unreachable, ops wants to see *why* ("db: unreachable") with 503 rather
// than a generic 500 envelope. Every other route uses the standard pattern.
export async function GET(req: Request) {
  const log = requestLogger(req)
  const start = performance.now()
  try {
    const [row] = await db.select({ count: count() }).from(accounts)
    const body = {
      status: 'ok',
      db: 'connected',
      accounts: Number(row?.count ?? 0),
      timestamp: new Date().toISOString(),
    }
    log.info({ status: 200, ms: Math.round(performance.now() - start) }, 'health ok')
    return Response.json(body)
  } catch (err) {
    log.error({ err }, 'health check failed: db unreachable')
    return Response.json(
      {
        status: 'error',
        db: 'unreachable',
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 503 },
    )
  }
}
