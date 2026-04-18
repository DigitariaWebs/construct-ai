import { NextRequest } from 'next/server'
import { extractWithOpenAI } from '@/lib/quote/providers/openai'
import { extractWithAnthropic } from '@/lib/quote/providers/anthropic'
import { extractWithGemini } from '@/lib/quote/providers/gemini'
import { isProviderId, type ProviderId, type ExtractProvider } from '@/lib/quote/providers/types'

export const runtime = 'nodejs'
export const maxDuration = 300

const PROVIDERS: Record<ProviderId, ExtractProvider> = {
  openai:    extractWithOpenAI,
  anthropic: extractWithAnthropic,
  gemini:    extractWithGemini,
}

function pickProvider(req: NextRequest, form: FormData): ProviderId {
  const fromQuery  = req.nextUrl.searchParams.get('provider')
  const fromHeader = req.headers.get('x-extract-provider')
  const fromForm   = form.get('provider')
  const fromEnv    = process.env.EXTRACTION_PROVIDER

  const formValue = typeof fromForm === 'string' ? fromForm : null
  const candidate = fromQuery ?? fromHeader ?? formValue ?? fromEnv ?? 'openai'
  return isProviderId(candidate) ? candidate : 'openai'
}

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
    return Response.json({ error: 'Only PDF files are supported for now.' }, { status: 415 })
  }

  const provider = pickProvider(req, form)
  const result = await PROVIDERS[provider](file)

  if (!result.ok) {
    const status = result.error.code === 'missing_key' ? 500 : result.error.status ?? 502
    return Response.json({ error: result.error.message, provider }, { status })
  }

  return Response.json({ quote: result.quote, fileName: file.name, provider })
}
