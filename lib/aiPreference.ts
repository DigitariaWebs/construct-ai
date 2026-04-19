// Per-org preference for the CCTP-extraction engine: provider + model.
//
// Stored in localStorage keyed by orgId, so two orgs under the same browser
// (Jean-Marc impersonating a service-client, demo persona-swap) keep their
// settings independent. When no preference exists, callers fall back to
// whatever `EXTRACTION_PROVIDER` is set to in the server env.

'use client'

import { getActiveOrgId } from './currentUser'
import { isProviderId, type ProviderId } from './quote/providers/types'
import { isValidModel, resolveModel } from './quote/providers/models'

const STORAGE_KEY = 'pc_ai_preferences_v1'

export type AiPreference = {
  provider: ProviderId
  model: string
}

type Store = Record<string, AiPreference>

type Listener = (pref: AiPreference | null) => void
const listeners = new Set<Listener>()

function safeLoad(): Store {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Store) : {}
  } catch {
    return {}
  }
}

function safeSave(store: Store) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch { /* quota / privacy mode — ignore */ }
}

export function getAiPreference(orgId: string = getActiveOrgId()): AiPreference | null {
  const raw = safeLoad()[orgId]
  if (!raw) return null
  if (!isProviderId(raw.provider)) return null
  if (!isValidModel(raw.provider, raw.model)) {
    // Upgrade path: stored model is stale after a catalog edit. Snap to default.
    return { provider: raw.provider, model: resolveModel(raw.provider) }
  }
  return raw
}

export function setAiPreference(
  pref: AiPreference,
  orgId: string = getActiveOrgId(),
): AiPreference {
  const normalized: AiPreference = {
    provider: pref.provider,
    model:    resolveModel(pref.provider, pref.model),
  }
  const store = safeLoad()
  store[orgId] = normalized
  safeSave(store)
  listeners.forEach(fn => fn(normalized))
  return normalized
}

export function clearAiPreference(orgId: string = getActiveOrgId()): void {
  const store = safeLoad()
  delete store[orgId]
  safeSave(store)
  listeners.forEach(fn => fn(null))
}

export function subscribeAiPreference(cb: Listener): () => void {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}
