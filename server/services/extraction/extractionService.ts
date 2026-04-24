// Two-pass extraction pipeline: TOC detection → scoped extraction.
//
// The TOC pass is a cheap/fast call that maps the lot structure of the CCTP
// and flags plumbing-relevant lots. The main extraction is then scoped to
// those lots only — sharpening the model's focus on the estimator's trade
// and cutting output noise.
//
// Fallback behaviour:
// - Small files (< TOC_MIN_BYTES) skip the TOC pass entirely; round-trip
//   isn't worth it.
// - If TOC detection fails, we fall through to unscoped extraction rather
//   than surfacing the TOC error to the user.
// - If the TOC has zero lots, or every lot is plumbing, the scope instruction
//   collapses to null and the extraction runs as before.

import type { ExtractedQuote, ExtractedToc, QuoteValidation } from '@/features/quote/types'
import type { ProviderError, ProviderId } from '@/features/quote/providers/types'
import { buildScopeInstruction } from '@/features/quote/schema'
import { validateQuote } from '@/features/quote/validators/validate'
import { extractWithOpenAI, detectTocWithOpenAI } from './providers/openai'
import { extractWithAnthropic, detectTocWithAnthropic } from './providers/anthropic'
import { extractWithGemini, detectTocWithGemini } from './providers/gemini'
import type { ExtractProvider, TocProvider } from '@/features/quote/providers/types'

const EXTRACTORS: Record<ProviderId, ExtractProvider> = {
  openai:    extractWithOpenAI,
  anthropic: extractWithAnthropic,
  gemini:    extractWithGemini,
}

const TOC_DETECTORS: Record<ProviderId, TocProvider> = {
  openai:    detectTocWithOpenAI,
  anthropic: detectTocWithAnthropic,
  gemini:    detectTocWithGemini,
}

// Below this size we assume the CCTP is small enough that a single-shot
// extraction is cheaper than paying for a TOC round-trip.
const TOC_MIN_BYTES = 200 * 1024

export type PipelineOptions = {
  provider: ProviderId
  model?: string
  /** Force-disable TOC detection (debug / small docs / user opt-out). */
  skipToc?: boolean
}

export type PipelineResult =
  | { ok: true;  quote: ExtractedQuote; toc: ExtractedToc | null; validation: QuoteValidation; tocSkippedReason?: string }
  | { ok: false; error: ProviderError;  toc: ExtractedToc | null }

export async function runExtractionPipeline(
  file: File,
  opts: PipelineOptions,
): Promise<PipelineResult> {
  const extract    = EXTRACTORS[opts.provider]
  const detectToc  = TOC_DETECTORS[opts.provider]

  let toc: ExtractedToc | null = null
  let scope: string | null = null
  let tocSkippedReason: string | undefined

  const shouldRunToc = !opts.skipToc && file.size >= TOC_MIN_BYTES

  if (!shouldRunToc) {
    tocSkippedReason = opts.skipToc
      ? 'skipToc=1'
      : `file < ${TOC_MIN_BYTES / 1024}KB`
  } else {
    const tocResult = await detectToc(file)
    if (tocResult.ok && tocResult.toc.lots.length > 0) {
      toc = tocResult.toc
      scope = buildScopeInstruction(toc)
      if (!scope) {
        tocSkippedReason = 'no narrowing possible (all lots plumbing or none)'
      }
    } else {
      tocSkippedReason = tocResult.ok
        ? 'TOC returned zero lots'
        : `TOC failed: ${tocResult.error.message}`
    }
  }

  const extractResult = await extract(file, { model: opts.model, scope })

  if (!extractResult.ok) {
    return { ok: false, error: extractResult.error, toc }
  }

  // Deterministic cleanup pass — dedupes, drops broken lines, flags
  // implausible units/quantities. See lib/quote/validate.ts.
  const { quote: cleaned, validation } = validateQuote(extractResult.quote)

  return { ok: true, quote: cleaned, toc, validation, tocSkippedReason }
}
