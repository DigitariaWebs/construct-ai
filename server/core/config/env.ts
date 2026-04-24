import 'server-only'
import { z } from 'zod'

const Env = z.object({
  // Supabase — client-safe (bundled into the browser)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // Supabase — server-only. Bypasses RLS; never expose to the browser.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Postgres direct connection for Drizzle
  DATABASE_URL: z.string().url(),

  // AI providers. Each is optional; extractionService validates at call time
  // that the selected provider has a key.
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  EXTRACTION_PROVIDER: z.enum(['openai', 'anthropic', 'gemini', 'mock']).default('mock'),
})

function load(): z.infer<typeof Env> {
  const parsed = Env.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n')
    throw new Error(`Invalid environment variables:\n${issues}`)
  }
  return parsed.data
}

export const env = load()
export type Env = z.infer<typeof Env>
