import { GoogleGenAI } from '@google/genai'
import {
  EXTRACTED_QUOTE_JSON_SCHEMA,
  EXTRACTION_SYSTEM_PROMPT,
  TOC_JSON_SCHEMA,
  TOC_SYSTEM_PROMPT,
  buildUserInstruction,
} from '../schema'
import type { ExtractedQuote, ExtractedToc } from '../types'
import type { ExtractProvider, ProviderResult, TocProvider, TocResult } from './types'
import { resolveModel, fastModel } from './models'

// Gemini inline PDF ceiling via base64 is ~20 MB of request payload.
// The Files API lifts this to ~2 GB per file; switch if you need to send Jean-Marc's 75 MB CCTPs.
const MAX_PDF_BYTES = 20 * 1024 * 1024

export const extractWithGemini: ExtractProvider = async (file, opts): Promise<ProviderResult> => {
  const model = resolveModel('gemini', opts?.model)
  const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY
  if (!key) {
    return { ok: false, error: { code: 'missing_key', message: 'GEMINI_API_KEY is not set. Add it to .env.local and restart the dev server.' } }
  }

  if (file.size > MAX_PDF_BYTES) {
    return { ok: false, error: { code: 'bad_request', status: 413, message: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Max supported via Gemini inline PDF is ${MAX_PDF_BYTES / 1024 / 1024} MB.` } }
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')
  const ai = new GoogleGenAI({ apiKey: key })

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'application/pdf', data: base64 } },
            { text: buildUserInstruction(opts?.scope) },
          ],
        },
      ],
      config: {
        systemInstruction: EXTRACTION_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        // responseJsonSchema accepts standard JSON Schema with the features we use
        // (type, properties, required, additionalProperties, enum, items, description).
        responseJsonSchema: EXTRACTED_QUOTE_JSON_SCHEMA,
        temperature: 0,
      },
    })

    const text = response.text
    if (!text) {
      return { ok: false, error: { code: 'provider', status: 502, message: 'Gemini returned no text.' } }
    }

    return { ok: true, quote: JSON.parse(text) as ExtractedQuote }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gemini extraction failed.'
    return { ok: false, error: { code: 'provider', status: 502, message } }
  }
}

export const detectTocWithGemini: TocProvider = async (file, opts): Promise<TocResult> => {
  const model = resolveModel('gemini', opts?.model ?? fastModel('gemini'))
  const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY
  if (!key) {
    return { ok: false, error: { code: 'missing_key', message: 'GEMINI_API_KEY is not set.' } }
  }
  if (file.size > MAX_PDF_BYTES) {
    return { ok: false, error: { code: 'bad_request', status: 413, message: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Max ${MAX_PDF_BYTES / 1024 / 1024} MB.` } }
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')
  const ai = new GoogleGenAI({ apiKey: key })

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'application/pdf', data: base64 } },
            { text: 'Return the lot index for this CCTP in the requested JSON format.' },
          ],
        },
      ],
      config: {
        systemInstruction: TOC_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseJsonSchema: TOC_JSON_SCHEMA,
        temperature: 0,
      },
    })

    const text = response.text
    if (!text) {
      return { ok: false, error: { code: 'provider', status: 502, message: 'Gemini returned no text for TOC.' } }
    }
    return { ok: true, toc: JSON.parse(text) as ExtractedToc }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gemini TOC detection failed.'
    return { ok: false, error: { code: 'provider', status: 502, message } }
  }
}
