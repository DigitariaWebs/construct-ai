import type { ExtractedQuote } from '../types'

export type ProviderId = 'openai' | 'anthropic' | 'gemini' | 'mock'

export type ProviderError =
  | { code: 'missing_key';  message: string }
  | { code: 'bad_request';  message: string; status?: number }
  | { code: 'provider';     message: string; status?: number }

export type ProviderResult =
  | { ok: true;  quote: ExtractedQuote }
  | { ok: false; error: ProviderError }

/** A provider takes the uploaded PDF and returns a structured quote. */
export type ExtractProvider = (file: File) => Promise<ProviderResult>

export function isProviderId(v: string | null | undefined): v is ProviderId {
  return v === 'openai' || v === 'anthropic' || v === 'gemini' || v === 'mock'
}
