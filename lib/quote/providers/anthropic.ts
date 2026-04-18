import Anthropic from '@anthropic-ai/sdk'
import { EXTRACTED_QUOTE_JSON_SCHEMA, EXTRACTION_SYSTEM_PROMPT } from '../schema'
import type { ExtractedQuote } from '../types'
import type { ExtractProvider, ProviderResult } from './types'

const MODEL = 'claude-opus-4-7'
const MAX_PDF_BYTES = 32 * 1024 * 1024 // Anthropic inline PDF ceiling
const MAX_TOKENS = 16000

export const extractWithAnthropic: ExtractProvider = async (file): Promise<ProviderResult> => {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    return { ok: false, error: { code: 'missing_key', message: 'ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server.' } }
  }

  if (file.size > MAX_PDF_BYTES) {
    return { ok: false, error: { code: 'bad_request', status: 413, message: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Max supported via Anthropic inline PDF is ${MAX_PDF_BYTES / 1024 / 1024} MB.` } }
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')
  const client = new Anthropic({ apiKey: key })

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      thinking: { type: 'adaptive' },
      system: EXTRACTION_SYSTEM_PROMPT,
      output_config: {
        format: {
          type: 'json_schema',
          schema: EXTRACTED_QUOTE_JSON_SCHEMA,
        },
      },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 },
            },
            {
              type: 'text',
              text: 'Extract the full bill of materials / services from this CCTP in the requested JSON format.',
            },
          ],
        },
      ],
    })

    if (response.stop_reason === 'max_tokens') {
      return { ok: false, error: { code: 'provider', status: 502, message: 'Claude hit the max_tokens ceiling before finishing the extraction. The CCTP is too large for a single non-streaming pass.' } }
    }

    if (response.stop_reason === 'refusal') {
      return { ok: false, error: { code: 'provider', status: 502, message: 'Claude refused to process this document.' } }
    }

    // First text block carries the JSON per the structured-output contract.
    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')
    if (!textBlock) {
      return { ok: false, error: { code: 'provider', status: 502, message: 'Claude returned no text block.' } }
    }

    return { ok: true, quote: JSON.parse(textBlock.text) as ExtractedQuote }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Anthropic extraction failed.'
    const status = err instanceof Anthropic.APIError ? err.status : undefined
    return { ok: false, error: { code: 'provider', status: status ?? 502, message } }
  }
}
