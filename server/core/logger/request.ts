import 'server-only'
import { randomUUID } from 'node:crypto'
import { logger, type Logger } from './index'

/**
 * Build a child logger bound to a single request's metadata.
 * Accepts upstream `X-Request-Id` (propagates trace IDs across services);
 * otherwise mints a fresh UUID.
 */
export function requestLogger(req: Request): Logger {
  const url = new URL(req.url)
  const requestId = req.headers.get('x-request-id') ?? randomUUID()
  return logger.child({
    requestId,
    method: req.method,
    path: url.pathname,
  })
}
