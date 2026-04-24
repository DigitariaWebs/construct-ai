import 'server-only'
import type { Logger } from 'pino'
import { requestLogger } from './logger/request'
import { respondToError } from './errors/respond'

type HandlerCtx = {
  log: Logger
}

type Handler<T> = (req: Request, ctx: HandlerCtx) => Promise<T> | T

/**
 * Wrap a Next.js route handler so it:
 *   - mints a request-scoped logger
 *   - catches errors and funnels through respondToError
 *   - JSON-encodes non-Response return values
 *   - logs one `request completed` line per request with status + duration
 *
 * For responses that need custom headers, non-JSON bodies, or mixed success
 * statuses (e.g. 201/204), write a regular handler with try/catch + respond-
 * ToError instead of using this wrapper.
 */
export function handle<T>(fn: Handler<T>): (req: Request) => Promise<Response> {
  return async (req) => {
    const log = requestLogger(req)
    const start = performance.now()
    let response: Response
    try {
      const result = await fn(req, { log })
      response = result instanceof Response ? result : Response.json(result)
    } catch (err) {
      response = respondToError(err, { log })
    }
    log.info(
      { status: response.status, ms: Math.round(performance.now() - start) },
      'request completed',
    )
    return response
  }
}
