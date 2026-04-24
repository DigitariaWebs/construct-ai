import 'server-only'
import pino, { type Logger } from 'pino'

// Structured JSON logs to stdout. Vercel, Fly, Railway, Docker etc. all
// collect stdout into their log systems. For readable dev output, pipe:
//   bun run dev | bunx pino-pretty

const defaultLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug'

export const logger: Logger = pino({
  level: process.env.LOG_LEVEL ?? defaultLevel,
  base: { env: process.env.NODE_ENV ?? 'development' },
  // Scrub obvious sensitive fields at the framework level so nothing leaks
  // through even if a caller forgets. Add more paths as new shapes appear.
  redact: {
    paths: [
      'password',
      '*.password',
      'token',
      '*.token',
      'authorization',
      '*.authorization',
      'req.headers.authorization',
      'req.headers.cookie',
      'headers.authorization',
      'headers.cookie',
    ],
    censor: '[REDACTED]',
  },
})

export type { Logger }
