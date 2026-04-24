import 'server-only'
import { ZodError } from 'zod'
import type { Logger } from 'pino'
import { logger as rootLogger } from '../logger'
import { AppError } from './AppError'
import { InternalError } from './http'
import { ValidationError } from './validation'

type RespondContext = {
  log?: Logger
}

/**
 * The single funnel from thrown error to HTTP response. Every route that
 * doesn't use `handle()` still calls this from its catch block.
 *
 *  - AppError instances: their status + envelope, logged at warn/error
 *  - ZodError: auto-adapted to ValidationError (422)
 *  - anything else: logged with full detail, returned as a generic 500
 *    (no stack, no SQL, no internal state leaked to the client)
 */
export function respondToError(err: unknown, ctx: RespondContext = {}): Response {
  const log = ctx.log ?? rootLogger

  if (err instanceof ZodError) {
    err = ValidationError.fromZod(err)
  }

  if (err instanceof AppError) {
    const level = err.status >= 500 ? 'error' : 'warn'
    log[level](
      { err: { code: err.code, status: err.status, message: err.message, details: err.details } },
      'request failed',
    )
    return Response.json(err.toJSON(), { status: err.status })
  }

  // Unknown — log everything, return generic 500
  const serialized = err instanceof Error
    ? { name: err.name, message: err.message, stack: err.stack }
    : { message: String(err) }
  log.error({ err: serialized }, 'unhandled error')

  const safe = new InternalError()
  return Response.json(safe.toJSON(), { status: 500 })
}
