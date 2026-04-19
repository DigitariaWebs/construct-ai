// Tiny client-side store that bridges UploadModal → /processing → /quote.
//
// UploadModal:       start(file) — kicks off the POST /api/extract
// /processing page:  subscribe()  — renders live status, redirects when ready
// /quote page:       load()       — reads the final ExtractedQuote
//
// No external deps; module state survives client-side navigations.

import type { ExtractedQuote } from './types'
import { recordQuoteUsed } from '@/lib/subscription'

const RESULT_KEY = 'df_quote_result'
const FILE_KEY   = 'df_quote_file_name'

export type ExtractionStage =
  | 'reading'     // uploading file / starting request
  | 'parsing'     // LLM is running
  | 'structuring' // shaping JSON
  | 'pricing'     // applying supplier prices
  | 'ready'
  | 'error'

export type ExtractionState =
  | { status: 'idle' }
  | { status: 'running'; fileName: string; stage: ExtractionStage; progress: number }
  | { status: 'done';    fileName: string; quote: ExtractedQuote }
  | { status: 'error';   fileName: string; message: string }

type Listener = (s: ExtractionState) => void

let state: ExtractionState = { status: 'idle' }
const listeners = new Set<Listener>()

function emit() { listeners.forEach(l => l(state)) }
function set(next: ExtractionState) { state = next; emit() }

export function getState()               { return state }
export function subscribe(l: Listener)   { listeners.add(l); l(state); return () => listeners.delete(l) }

// Stage → progress mapping used by the processing UI.
// Rough time-based estimate: the LLM call is the slow part.
const STAGE_PROGRESS: Record<ExtractionStage, number> = {
  reading:     8,
  parsing:     30,
  structuring: 75,
  pricing:     92,
  ready:       100,
  error:       0,
}

export async function startExtraction(file: File) {
  // Clear any previous result
  try { sessionStorage.removeItem(RESULT_KEY); sessionStorage.removeItem(FILE_KEY) } catch {}
  set({ status: 'running', fileName: file.name, stage: 'reading', progress: STAGE_PROGRESS.reading })

  const form = new FormData()
  form.append('file', file)

  try {
    // Kick off request and simulate stage transitions while we wait —
    // the server is opaque, so we drive UX with a soft progress.
    const req = fetch('/api/extract', { method: 'POST', body: form })

    // After a short delay we consider the upload done and the model working.
    setTimeout(() => {
      if (state.status === 'running' && state.stage === 'reading') {
        set({ ...state, stage: 'parsing', progress: STAGE_PROGRESS.parsing })
      }
    }, 1200)
    setTimeout(() => {
      if (state.status === 'running' && state.stage === 'parsing') {
        set({ ...state, stage: 'structuring', progress: STAGE_PROGRESS.structuring })
      }
    }, 6000)

    const res = await req
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      throw new Error(body.error || `HTTP ${res.status}`)
    }

    const data = await res.json() as { quote: ExtractedQuote; fileName: string }
    set({ status: 'running', fileName: data.fileName, stage: 'pricing', progress: STAGE_PROGRESS.pricing })

    // Persist to sessionStorage so /quote survives a hard refresh.
    try {
      sessionStorage.setItem(RESULT_KEY, JSON.stringify(data.quote))
      sessionStorage.setItem(FILE_KEY, data.fileName)
    } catch {}

    recordQuoteUsed()
    set({ status: 'done', fileName: data.fileName, quote: data.quote })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown extraction error.'
    set({ status: 'error', fileName: file.name, message })
  }
}

export function loadStoredQuote(): { quote: ExtractedQuote; fileName: string } | null {
  try {
    const raw = sessionStorage.getItem(RESULT_KEY)
    if (!raw) return null
    const quote = JSON.parse(raw) as ExtractedQuote
    const fileName = sessionStorage.getItem(FILE_KEY) || 'CCTP.pdf'
    return { quote, fileName }
  } catch {
    return null
  }
}

export function clearStoredQuote() {
  try { sessionStorage.removeItem(RESULT_KEY); sessionStorage.removeItem(FILE_KEY) } catch {}
  set({ status: 'idle' })
}
