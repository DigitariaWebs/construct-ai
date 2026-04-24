import type { ZodError } from 'zod'
import { AppError } from './AppError'

export type FieldIssue = {
  /** Dotted path to the offending field, e.g. 'body.email' or 'query.page'. */
  path: string
  message: string
  code?: string
}

export class ValidationError extends AppError {
  readonly status = 422
  readonly code = 'VALIDATION_FAILED'
  readonly issues: readonly FieldIssue[]

  constructor(message: string, issues: FieldIssue[]) {
    super(message, { issues })
    this.issues = Object.freeze([...issues])
  }

  /**
   * Adapter from a Zod parse failure. Flattens nested paths to dot notation
   * so clients can highlight the offending input directly.
   */
  static fromZod(err: ZodError, message = 'Validation failed'): ValidationError {
    const issues: FieldIssue[] = err.issues.map((i) => ({
      path: i.path.map(String).join('.') || '(root)',
      message: i.message,
      code: i.code,
    }))
    return new ValidationError(message, issues)
  }
}
