// Allowed models per provider for CCTP extraction.
//
// This is a typed catalog — callers pick from `MODEL_IDS[provider]` and the
// provider source files validate against it. Keep the list tight: only
// production models we've actually tested against the extraction schema.

import type { ProviderId } from './types'

export type ModelTier = 'max' | 'balanced' | 'fast'

export type ModelInfo = {
  id: string
  label: string
  tier: ModelTier
  note?: string
}

export const MODEL_CATALOG: Record<ProviderId, ModelInfo[]> = {
  anthropic: [
    { id: 'claude-opus-4-7',        label: 'Opus 4.7',    tier: 'max',      note: 'Best quality · slowest · highest cost' },
    { id: 'claude-sonnet-4-6',      label: 'Sonnet 4.6',  tier: 'balanced', note: 'Good quality · balanced speed/cost' },
    { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5', tier: 'fast',    note: 'Fastest · cheapest · lower precision' },
  ],
  openai: [
    { id: 'gpt-4o',      label: 'GPT-4o',      tier: 'balanced', note: 'Default · good quality' },
    { id: 'gpt-4o-mini', label: 'GPT-4o mini', tier: 'fast',     note: 'Fastest · cheapest' },
  ],
  gemini: [
    { id: 'gemini-2.5-pro',   label: 'Gemini 2.5 Pro',   tier: 'max',      note: 'Large context · best quality' },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', tier: 'fast',     note: 'Fastest · cheapest' },
  ],
}

export const DEFAULT_MODEL: Record<ProviderId, string> = {
  anthropic: 'claude-opus-4-7',
  openai:    'gpt-4o',
  gemini:    'gemini-2.5-pro',
}

export function isValidModel(provider: ProviderId, model: string): boolean {
  return MODEL_CATALOG[provider].some(m => m.id === model)
}

export function resolveModel(provider: ProviderId, requested?: string): string {
  if (requested && isValidModel(provider, requested)) return requested
  return DEFAULT_MODEL[provider]
}

// Fastest tier of the selected provider — used for the TOC pass so structural
// indexing doesn't pay Opus/GPT-4o pricing for a task any frontier model nails.
export function fastModel(provider: ProviderId): string {
  const fast = MODEL_CATALOG[provider].find(m => m.tier === 'fast')
  return fast?.id ?? DEFAULT_MODEL[provider]
}
