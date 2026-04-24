// HTTP-status-specific error classes. One per status code we actually use.
// Domain-specific errors (e.g. AccountSuspendedError) subclass these and
// override `code` to something more specific; see features that need them.

import { AppError } from './AppError'

export class BadRequestError extends AppError {
  readonly status = 400
  readonly code = 'BAD_REQUEST'
}

export class UnauthorizedError extends AppError {
  readonly status = 401
  readonly code = 'UNAUTHORIZED'
  constructor(message = 'Authentication required') {
    super(message)
  }
}

export class ForbiddenError extends AppError {
  readonly status = 403
  readonly code = 'FORBIDDEN'
  constructor(message = 'You do not have permission to perform this action') {
    super(message)
  }
}

export class NotFoundError extends AppError {
  readonly status = 404
  readonly code = 'NOT_FOUND'
  constructor(resource?: string) {
    super(resource ? `${resource} not found` : 'Resource not found')
  }
}

export class ConflictError extends AppError {
  readonly status = 409
  readonly code = 'CONFLICT'
}

export class RateLimitError extends AppError {
  readonly status = 429
  readonly code = 'RATE_LIMITED'
  constructor(message = 'Too many requests') {
    super(message)
  }
}

export class InternalError extends AppError {
  readonly status = 500
  readonly code = 'INTERNAL_ERROR'
  constructor(message = 'An unexpected error occurred') {
    super(message)
  }
}

export class ServiceUnavailableError extends AppError {
  readonly status = 503
  readonly code = 'SERVICE_UNAVAILABLE'
  constructor(message = 'Service temporarily unavailable') {
    super(message)
  }
}
