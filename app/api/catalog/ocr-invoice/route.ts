import { NextRequest } from 'next/server'
import { extractInvoiceWithOpenAI } from '@/server/services/catalog/ocrService'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(req: NextRequest) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return Response.json({ error: 'Invalid multipart payload.' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return Response.json({ error: 'Missing `file` field.' }, { status: 400 })
  }
  if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
    return Response.json({ error: 'Only PDF invoices are supported for now.' }, { status: 415 })
  }

  const result = await extractInvoiceWithOpenAI(file)
  if (!result.ok) {
    const status = result.error.code === 'missing_key' ? 500 : result.error.status ?? 502
    return Response.json({ error: result.error.message }, { status })
  }

  return Response.json({ invoice: result.invoice, fileName: file.name })
}
