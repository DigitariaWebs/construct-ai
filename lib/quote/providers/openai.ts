import OpenAI from 'openai'
import { OPENAI_RESPONSE_FORMAT, EXTRACTION_SYSTEM_PROMPT } from '../schema'
import type { ExtractedQuote } from '../types'
import type { ExtractProvider, ProviderResult } from './types'

const MODEL = 'gpt-4o'
const MAX_PDF_BYTES = 32 * 1024 * 1024

export const extractWithOpenAI: ExtractProvider = async (file): Promise<ProviderResult> => {
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    return { ok: false, error: { code: 'missing_key', message: 'OPENAI_API_KEY is not set. Add it to .env.local and restart the dev server.' } }
  }

  if (file.size > MAX_PDF_BYTES) {
    return { ok: false, error: { code: 'bad_request', status: 413, message: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Max supported via OpenAI is ${MAX_PDF_BYTES / 1024 / 1024} MB.` } }
  }

  const openai = new OpenAI({ apiKey: key })

  // Upload to Files API so we can reference the PDF by id instead of inlining.
  const uploaded = await openai.files.create({ file, purpose: 'user_data' })

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0,
      response_format: OPENAI_RESPONSE_FORMAT,
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'file', file: { file_id: uploaded.id } },
            { type: 'text', text: 'Extract the full bill of materials / services from this CCTP in the requested JSON format.' },
          ],
        },
      ],
    })

    const text = completion.choices[0]?.message?.content
    if (!text) {
      return { ok: false, error: { code: 'provider', status: 502, message: 'Empty completion from OpenAI.' } }
    }

    return { ok: true, quote: JSON.parse(text) as ExtractedQuote }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'OpenAI extraction failed.'
    return { ok: false, error: { code: 'provider', status: 502, message } }
  } finally {
    openai.files.delete(uploaded.id).catch(() => {})
  }
}
