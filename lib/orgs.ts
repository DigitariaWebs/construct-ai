// Org + user directory. Client-side today, mirrors the future `orgs` /
// `org_memberships` tables. Two contractor flows are modeled here:
//
//   subscriber     — pays a subscription, owns their data
//   service_client — non-subscriber; Jean-Marc runs quotes for them
//                    and bills per-quote. Owned by the admin org.
//
// The admin org is Jean-Marc's operator workspace. Admin users see every
// org's data; owners see their org; members see what they created.

'use client'

const STORAGE_KEY = 'pc_orgs_v1'

export type OrgKind = 'admin' | 'subscriber' | 'service_client'
export type BillingMode = 'subscription' | 'per_quote' | 'internal'

export type Org = {
  id: string
  name: string
  kind: OrgKind
  billingMode: BillingMode
  /** For service_client orgs: the admin userId who owns the relationship. */
  managedByUserId?: string
  contactName?: string
  contactEmail?: string
  notes?: string
  createdAt: number
}

export const ADMIN_ORG_ID = 'org-ops'
export const DEFAULT_SUBSCRIBER_ORG_ID = 'org-morel-plomberie'

const SEED_ORGS: Org[] = [
  {
    id: ADMIN_ORG_ID,
    name: 'Plombier Chiffrage — Opérations',
    kind: 'admin',
    billingMode: 'internal',
    contactName: 'Jean-Marc Bertrand',
    contactEmail: 'jm@plombier-chiffrage.fr',
    createdAt: Date.parse('2025-09-01'),
  },
  {
    id: DEFAULT_SUBSCRIBER_ORG_ID,
    name: 'Morel Plomberie',
    kind: 'subscriber',
    billingMode: 'subscription',
    contactName: 'Thomas Morel',
    contactEmail: 'thomas@morel-plomberie.fr',
    createdAt: Date.parse('2026-01-12'),
  },
  {
    id: 'org-sarl-dubois',
    name: 'SARL Dubois',
    kind: 'service_client',
    billingMode: 'per_quote',
    managedByUserId: 'u-admin',
    contactName: 'Philippe Dubois',
    contactEmail: 'p.dubois@sarl-dubois.fr',
    notes: 'Appel d\u2019offres mairie — 18 logements. Quote ponctuel.',
    createdAt: Date.parse('2026-03-22'),
  },
  {
    id: 'org-bati-lorraine',
    name: 'Bâti Lorraine',
    kind: 'service_client',
    billingMode: 'per_quote',
    managedByUserId: 'u-admin',
    contactName: 'Isabelle Reinach',
    contactEmail: 'reinach@bati-lorraine.fr',
    notes: 'Tender ponctuel pour réhabilitation EHPAD.',
    createdAt: Date.parse('2026-04-02'),
  },
]

type Listener = (orgs: Org[]) => void
const listeners = new Set<Listener>()

function safeLoad(): Org[] {
  if (typeof window === 'undefined') return SEED_ORGS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ORGS))
      return SEED_ORGS
    }
    const parsed = JSON.parse(raw) as Org[]
    // Ensure seed orgs always exist (admin + default subscriber are required).
    const byId = new Map(parsed.map(o => [o.id, o]))
    let changed = false
    for (const seed of SEED_ORGS) {
      if (!byId.has(seed.id)) { byId.set(seed.id, seed); changed = true }
    }
    const merged = Array.from(byId.values())
    if (changed) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    return merged
  } catch {
    return SEED_ORGS
  }
}

function safeSave(orgs: Org[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orgs))
  } catch { /* ignore */ }
  listeners.forEach(fn => fn(orgs))
}

export function getAllOrgs(): Org[] {
  return safeLoad()
}

export function getOrg(id: string): Org | null {
  return safeLoad().find(o => o.id === id) ?? null
}

export function getOrgsByKind(kind: OrgKind): Org[] {
  return safeLoad().filter(o => o.kind === kind)
}

export function subscribeOrgs(cb: Listener): () => void {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

export function createServiceClientOrg(input: {
  name: string
  contactName?: string
  contactEmail?: string
  notes?: string
  managedByUserId: string
}): Org {
  const orgs = safeLoad()
  const id = `org-sc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  const org: Org = {
    id,
    name: input.name.trim(),
    kind: 'service_client',
    billingMode: 'per_quote',
    managedByUserId: input.managedByUserId,
    contactName: input.contactName?.trim() || undefined,
    contactEmail: input.contactEmail?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    createdAt: Date.now(),
  }
  safeSave([...orgs, org])
  return org
}

export function updateOrg(id: string, patch: Partial<Omit<Org, 'id' | 'createdAt' | 'kind'>>): void {
  const orgs = safeLoad()
  const idx = orgs.findIndex(o => o.id === id)
  if (idx < 0) return
  orgs[idx] = { ...orgs[idx], ...patch }
  safeSave(orgs)
}

export function deleteOrg(id: string): void {
  const orgs = safeLoad().filter(o => o.id !== id)
  safeSave(orgs)
}

export const ORG_KIND_LABELS: Record<OrgKind, string> = {
  admin:          'Opérateur',
  subscriber:     'Abonné',
  service_client: 'Client à la prestation',
}
