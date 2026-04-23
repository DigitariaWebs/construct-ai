import type { ExtractedQuote, ExtractedToc } from '../types'

export type ProviderId = 'openai' | 'anthropic' | 'gemini'

export type ProviderError =
  | { code: 'missing_key';  message: string }
  | { code: 'bad_request';  message: string; status?: number }
  | { code: 'provider';     message: string; status?: number }

export type ProviderResult =
  | { ok: true;  quote: ExtractedQuote }
  | { ok: false; error: ProviderError }

export type TocResult =
  | { ok: true;  toc: ExtractedToc }
  | { ok: false; error: ProviderError }

export type ExtractOptions = {
  /** Model id within the selected provider. Falls back to provider default. */
  model?: string
  /** Optional scope instruction from the TOC pass — prepended to the user message. */
  scope?: string | null
}

/** A provider takes the uploaded PDF and returns a structured quote. */
export type ExtractProvider = (file: File, opts?: ExtractOptions) => Promise<ProviderResult>

/** A TOC provider returns the lot index for a CCTP PDF. */
export type TocProvider = (file: File, opts?: { model?: string }) => Promise<TocResult>

export function isProviderId(v: string | null | undefined): v is ProviderId {
  return v === 'openai' || v === 'anthropic' || v === 'gemini'
}
