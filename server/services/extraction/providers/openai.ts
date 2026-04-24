import OpenAI from 'openai'
import {
  OPENAI_RESPONSE_FORMAT,
  OPENAI_TOC_RESPONSE_FORMAT,
  EXTRACTION_SYSTEM_PROMPT,
  TOC_SYSTEM_PROMPT,
  buildUserInstruction,
} from '@/features/quote/schema'
import type { ExtractedQuote, ExtractedToc } from '@/features/quote/types'
import type { ExtractProvider, ProviderResult, TocProvider, TocResult } from '@/features/quote/providers/types'
import { resolveModel, fastModel } from '@/features/quote/providers/models'

const MAX_PDF_BYTES = 32 * 1024 * 1024

export const extractWithOpenAI: ExtractProvider = async (file, opts): Promise<ProviderResult> => {
  const model = resolveModel('openai', opts?.model)
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    return { ok: false, error: { code: 'missing_key', message: 'OPENAI_API_KEY is not set. Add it to .env.local and restart the dev server.' } }
  }

  if (file.size > MAX_PDF_BYTES) {
    return { ok: false, error: { code: 'bad_request', status: 413, message: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Max supported via OpenAI is ${MAX_PDF_BYTES / 1024 / 1024} MB.` } }
  }

  const openai = new OpenAI({ apiKey: key })

  let uploaded: Awaited<ReturnType<typeof openai.files.create>> | undefined

  try {
    // Upload to Files API so we can reference the PDF by id instead of inlining.
    uploaded = await openai.files.create({ file, purpose: 'user_data' })

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0,
      response_format: OPENAI_RESPONSE_FORMAT,
      messages: [
        { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'file', file: { file_id: uploaded.id } },
            { type: 'text', text: buildUserInstruction(opts?.scope) },
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
    if (uploaded) openai.files.delete(uploaded.id).catch(() => {})
  }
}

export const detectTocWithOpenAI: TocProvider = async (file, opts): Promise<TocResult> => {
  const model = resolveModel('openai', opts?.model ?? fastModel('openai'))
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    return { ok: false, error: { code: 'missing_key', message: 'OPENAI_API_KEY is not set.' } }
  }
  if (file.size > MAX_PDF_BYTES) {
    return { ok: false, error: { code: 'bad_request', status: 413, message: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Max ${MAX_PDF_BYTES / 1024 / 1024} MB.` } }
  }

  const openai = new OpenAI({ apiKey: key })
  let uploaded: Awaited<ReturnType<typeof openai.files.create>> | undefined

  try {
    uploaded = await openai.files.create({ file, purpose: 'user_data' })

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0,
      response_format: OPENAI_TOC_RESPONSE_FORMAT,
      messages: [
        { role: 'system', content: TOC_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'file', file: { file_id: uploaded.id } },
            { type: 'text', text: 'Return the lot index for this CCTP in the requested JSON format.' },
          ],
        },
      ],
    })

    const text = completion.choices[0]?.message?.content
    if (!text) {
      return { ok: false, error: { code: 'provider', status: 502, message: 'Empty TOC completion from OpenAI.' } }
    }
    return { ok: true, toc: JSON.parse(text) as ExtractedToc }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'OpenAI TOC detection failed.'
    return { ok: false, error: { code: 'provider', status: 502, message } }
  } finally {
    if (uploaded) openai.files.delete(uploaded.id).catch(() => {})
  }
}
