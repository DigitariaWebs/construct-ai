// Base class for every error that maps to a specific HTTP response.
// Subclasses are HTTP-status-specific (http.ts) or domain-specific (defined
// next to each feature's service). The invariants:
//
//   - `status` is the HTTP status code returned by respondToError
//   - `code` is a stable string the client can switch on
//     (e.g. `if (err.code === 'SUBSCRIPTION_REQUIRED')`)
//   - `message` is user-safe; no secrets or internal details
//   - `details` is optional, typed per-error, serialized in the response

export abstract class AppError extends Error {
  abstract readonly status: number
  abstract readonly code: string
  readonly details?: Readonly<Record<string, unknown>>

  constructor(message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = this.constructor.name
    this.details = details ? Object.freeze({ ...details }) : undefined
    Error.captureStackTrace?.(this, this.constructor)
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    }
  }
}
