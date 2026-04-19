import OpenAI from 'openai'
import {
  OPENAI_INVOICE_RESPONSE_FORMAT,
  INVOICE_EXTRACTION_SYSTEM_PROMPT,
  type ExtractedInvoice,
} from './schema'

const MODEL = 'gpt-4o'
const MAX_PDF_BYTES = 32 * 1024 * 1024

export type InvoiceProviderResult =
  | { ok: true; invoice: ExtractedInvoice }
  | { ok: false; error: { code: 'missing_key' | 'bad_request' | 'provider'; status?: number; message: string } }

export async function extractInvoiceWithOpenAI(file: File): Promise<InvoiceProviderResult> {
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
      model: MODEL,
      temperature: 0,
      response_format: OPENAI_INVOICE_RESPONSE_FORMAT,
      messages: [
        { role: 'system', content: INVOICE_EXTRACTION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'file', file: { file_id: uploaded.id } },
            { type: 'text', text: 'Extract every billable line item from this invoice/BC in the requested JSON format.' },
          ],
        },
      ],
    })

    const text = completion.choices[0]?.message?.content
    if (!text) {
      return { ok: false, error: { code: 'provider', status: 502, message: 'Empty completion from OpenAI.' } }
    }
    return { ok: true, invoice: JSON.parse(text) as ExtractedInvoice }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'OpenAI extraction failed.'
    return { ok: false, error: { code: 'provider', status: 502, message } }
  } finally {
    if (uploaded) openai.files.delete(uploaded.id).catch(() => {})
  }
}
