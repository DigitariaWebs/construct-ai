// Client-side store for supplier account connections.
//
// Persists per-org, per-supplier credentials + per-family discount matrix +
// connection channel in localStorage. Schema mirrors the production
// `supplier_connections` table — rows migrate 1:1 when the backend lands.
//
// Keyed by `${orgId}:${supplierId}` so two orgs can connect the same
// distributor with different negotiated terms.

'use client'

import { FAMILIES, type Family } from './types'
import { DEFAULT_SUBSCRIBER_ORG_ID } from '@/features/auth/orgs'
import { getActiveOrgId } from '@/features/auth/currentUser'

const STORAGE_KEY = 'pc_supplier_accounts_v3'
const LEGACY_V2_KEY = 'pc_supplier_accounts_v2'
const LEGACY_V1_KEY = 'pc_supplier_accounts_v1'

export type SupplierAccountStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

/** How the plumber's prices reach us for this supplier. */
export type ConnectionChannel =
  | 'fabdis'      // catalog file imported
  | 'invoice_ocr' // derived from uploaded invoices
  | 'discount'    // flat per-family discount matrix against public tariff
  | 'extranet'    // server-side scraping (inert until backend)

export type DiscountByFamily = Record<Family, number>

export type SupplierAccount = {
  /** Stable composite key — the row id. */
  orgId: string
  supplierId: string
  status: SupplierAccountStatus
  accountNumber: string
  holderEmail: string
  channel: ConnectionChannel
  discountByFamily: DiscountByFamily
  connectedAt: number | null
  lastSyncedAt: number | null
  lastError?: string
}

/** Realistic default negotiated discounts per supplier (demo values, plumber overrides). */
const DEFAULT_DISCOUNT_BY_SUPPLIER: Record<string, DiscountByFamily> = {
  cdo:        { ef_ec: 22, pvc: 18, sanitaires: 15, chauffage: 20, vmc: 14, autres: 12 },
  pim:        { ef_ec: 15, pvc: 25, sanitaires: 12, chauffage: 10, vmc: 10, autres: 10 },
  richardson: { ef_ec: 18, pvc: 16, sanitaires: 14, chauffage: 16, vmc: 12, autres: 12 },
  marplin:    { ef_ec: 20, pvc: 22, sanitaires: 18, chauffage: 24, vmc: 16, autres: 14 },
}

export function defaultDiscountFor(supplierId: string): DiscountByFamily {
  return DEFAULT_DISCOUNT_BY_SUPPLIER[supplierId] ?? emptyDiscounts()
}

export function emptyDiscounts(): DiscountByFamily {
  return FAMILIES.reduce((acc, f) => ({ ...acc, [f]: 0 }), {} as DiscountByFamily)
}

// ─── Storage ────────────────────────────────────────────────────────────────

type Store = Record<string, SupplierAccount>

/** Listener receives the scoped view for the currently active org. */
type Listener = (scopedAccounts: Record<string, SupplierAccount>) => void
const listeners = new Set<Listener>()

function compositeKey(orgId: string, supplierId: string): string {
  return `${orgId}:${supplierId}`
}

function migrateV2(raw: string): Store {
  // v2 shape: Record<supplierId, { ..., discountByFamily, channel, ... }>
  // — no orgId. Attribute everything to the default subscriber org.
  try {
    const old = JSON.parse(raw) as Record<string, Omit<SupplierAccount, 'orgId'>>
    const migrated: Store = {}
    for (const [sid, a] of Object.entries(old)) {
      migrated[compositeKey(DEFAULT_SUBSCRIBER_ORG_ID, sid)] = {
        ...a,
        orgId: DEFAULT_SUBSCRIBER_ORG_ID,
        supplierId: sid,
      }
    }
    return migrated
  } catch { return {} }
}

function migrateV1(raw: string): Store {
  // v1: { supplierId, status, accountNumber, holderEmail, discountPct, ... }
  try {
    const old = JSON.parse(raw) as Record<string, { supplierId: string; status: SupplierAccountStatus; accountNumber: string; holderEmail: string; discountPct?: number; connectedAt: number | null; lastSyncedAt: number | null }>
    const migrated: Store = {}
    for (const [sid, a] of Object.entries(old)) {
      const pct = a.discountPct ?? 0
      migrated[compositeKey(DEFAULT_SUBSCRIBER_ORG_ID, sid)] = {
        orgId:            DEFAULT_SUBSCRIBER_ORG_ID,
        supplierId:       a.supplierId,
        status:           a.status,
        accountNumber:    a.accountNumber,
        holderEmail:      a.holderEmail,
        channel:          'discount',
        discountByFamily: FAMILIES.reduce((acc, f) => ({ ...acc, [f]: pct }), {} as DiscountByFamily),
        connectedAt:      a.connectedAt,
        lastSyncedAt:     a.lastSyncedAt,
      }
    }
    return migrated
  } catch { return {} }
}

function safeLoad(): Store {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Store
    // Migrate forward in sequence.
    const v2 = window.localStorage.getItem(LEGACY_V2_KEY)
    if (v2) {
      const migrated = migrateV2(v2)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
      window.localStorage.removeItem(LEGACY_V2_KEY)
      return migrated
    }
    const v1 = window.localStorage.getItem(LEGACY_V1_KEY)
    if (v1) {
      const migrated = migrateV1(v1)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
      window.localStorage.removeItem(LEGACY_V1_KEY)
      return migrated
    }
    return {}
  } catch {
    return {}
  }
}

function safeSave(store: Store) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch { /* quota / privacy mode — ignore */ }
  const scoped = getAllAccountsForOrg(getActiveOrgId())
  listeners.forEach(fn => fn(scoped))
}

/** Full store — across all orgs. Used by admin dashboards. */
export function getAllAccountsGlobal(): Store {
  return safeLoad()
}

/** All accounts for one org, indexed by supplierId. */
export function getAllAccountsForOrg(orgId: string): Record<string, SupplierAccount> {
  const out: Record<string, SupplierAccount> = {}
  const store = safeLoad()
  for (const acc of Object.values(store)) {
    if (acc.orgId === orgId) out[acc.supplierId] = acc
  }
  return out
}

/** Accounts for the currently active org (current user's viewing context). */
export function getAllAccounts(): Record<string, SupplierAccount> {
  return getAllAccountsForOrg(getActiveOrgId())
}

export function getAccount(supplierId: string, orgId: string = getActiveOrgId()): SupplierAccount | null {
  return safeLoad()[compositeKey(orgId, supplierId)] ?? null
}

export function isConnected(supplierId: string, orgId: string = getActiveOrgId()): boolean {
  return getAccount(supplierId, orgId)?.status === 'connected'
}

export function subscribeAccounts(cb: Listener): () => void {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

// ─── Mutations ──────────────────────────────────────────────────────────────

/**
 * Stubbed "discount channel" connection. 3-stage progress animation so the
 * UX is honest end-to-end. Real credential verification happens on the
 * server — this path only captures the account identity + discount matrix.
 */
export async function connectWithDiscountMatrix(
  supplierId: string,
  credentials: { accountNumber: string; password: string; email: string },
  discountByFamily: DiscountByFamily,
  onStage?: (stage: 'verifying' | 'syncing' | 'applying') => void,
  orgId: string = getActiveOrgId(),
): Promise<SupplierAccount> {
  const key = compositeKey(orgId, supplierId)
  const store = safeLoad()

  store[key] = {
    orgId,
    supplierId,
    status: 'connecting',
    accountNumber: credentials.accountNumber,
    holderEmail: credentials.email,
    channel: 'discount',
    discountByFamily,
    connectedAt: null,
    lastSyncedAt: null,
  }
  safeSave(store)

  onStage?.('verifying')
  await wait(900)

  if (credentials.accountNumber.trim().length < 4) {
    const s = safeLoad()
    s[key] = { ...store[key], status: 'error', lastError: 'Numéro de compte invalide.' }
    safeSave(s)
    throw new Error('Numéro de compte invalide.')
  }

  onStage?.('syncing')
  await wait(900)

  onStage?.('applying')
  await wait(500)

  const now = Date.now()
  const connected: SupplierAccount = {
    ...store[key],
    status: 'connected',
    connectedAt: now,
    lastSyncedAt: now,
  }
  const finalStore = safeLoad()
  finalStore[key] = connected
  safeSave(finalStore)
  return connected
}

/** Upsert an account after a catalog import (FAB-DIS or invoice OCR). */
export function recordCatalogConnection(params: {
  supplierId: string
  channel: 'fabdis' | 'invoice_ocr'
  accountNumber?: string
  holderEmail?: string
  fileName?: string
  orgId?: string
}): SupplierAccount {
  const orgId = params.orgId ?? getActiveOrgId()
  const key = compositeKey(orgId, params.supplierId)
  const store = safeLoad()
  const prior = store[key]
  const now   = Date.now()
  const account: SupplierAccount = {
    orgId,
    supplierId:       params.supplierId,
    status:           'connected',
    accountNumber:    params.accountNumber ?? prior?.accountNumber ?? params.fileName ?? '',
    holderEmail:      params.holderEmail   ?? prior?.holderEmail   ?? '',
    channel:          params.channel,
    discountByFamily: prior?.discountByFamily ?? emptyDiscounts(),
    connectedAt:      prior?.connectedAt ?? now,
    lastSyncedAt:     now,
  }
  store[key] = account
  safeSave(store)
  return account
}

export function updateDiscountMatrix(
  supplierId: string,
  discounts: DiscountByFamily,
  orgId: string = getActiveOrgId(),
): void {
  const key = compositeKey(orgId, supplierId)
  const store = safeLoad()
  const prior = store[key]
  if (!prior) return
  store[key] = { ...prior, discountByFamily: discounts }
  safeSave(store)
}

export function disconnectSupplier(supplierId: string, orgId: string = getActiveOrgId()): void {
  const key = compositeKey(orgId, supplierId)
  const store = safeLoad()
  delete store[key]
  safeSave(store)
}

function wait(ms: number) {
  return new Promise<void>(res => setTimeout(res, ms))
}
