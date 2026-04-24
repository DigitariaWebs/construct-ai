// IndexedDB-backed catalog store. Schema mirrors the Postgres tables so
// a future server migration is a JSON dump → POST round-trip, nothing more.
//
// Two object stores:
//   entries   — keyed by id (uuid); indexed on orgId_supplierId,
//               orgId_supplierId_itemCode, orgId_supplierId_family, snapshotId
//   snapshots — keyed by id; indexed on orgId_supplierId
//
// v2 adds the orgId dimension so two plumbers' catalogs for the same
// distributor don't clobber each other. The `onupgradeneeded` handler
// migrates legacy (v1) rows by stamping them with the default subscriber
// org — safe because all legacy data was produced by the demo subscriber.

'use client'

import type { CatalogEntry, CatalogSnapshot, CatalogSource } from './types'
import { DEFAULT_SUBSCRIBER_ORG_ID } from '@/features/auth/orgs'
import { getActiveOrgId } from '@/features/auth/currentUser'

const DB_NAME = 'pc_catalog'
const DB_VERSION = 2
const STORE_ENTRIES = 'entries'
const STORE_SNAPSHOTS = 'snapshots'

type Listener = () => void
const listeners = new Set<Listener>()

function notify() { listeners.forEach(cb => cb()) }

export function subscribeCatalog(cb: Listener): () => void {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

/** Open the DB, creating stores / running migrations on first run. */
function openDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null)
  }
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (event) => {
      const db = req.result
      const tx = req.transaction!
      const oldVersion = event.oldVersion

      // Fresh DB — create both stores with the v2 schema.
      if (oldVersion < 1) {
        const entries = db.createObjectStore(STORE_ENTRIES, { keyPath: 'id' })
        entries.createIndex('orgId_supplierId',           ['orgId', 'supplierId'],                      { unique: false })
        entries.createIndex('orgId_supplierId_itemCode',  ['orgId', 'supplierId', 'itemCode'],          { unique: false })
        entries.createIndex('orgId_supplierId_family',    ['orgId', 'supplierId', 'family'],            { unique: false })
        entries.createIndex('snapshotId',                 'snapshotId',                                  { unique: false })

        const snapshots = db.createObjectStore(STORE_SNAPSHOTS, { keyPath: 'id' })
        snapshots.createIndex('orgId_supplierId', ['orgId', 'supplierId'], { unique: false })
        return
      }

      // v1 → v2: add orgId to every row; rebuild indexes; backfill missing orgId.
      if (oldVersion < 2) {
        const entries   = tx.objectStore(STORE_ENTRIES)
        const snapshots = tx.objectStore(STORE_SNAPSHOTS)

        // Drop old single-dimension indexes (safe on the upgrade transaction).
        for (const name of ['supplierId', 'supplierId_itemCode', 'supplierId_family']) {
          if (entries.indexNames.contains(name)) entries.deleteIndex(name)
        }
        if (snapshots.indexNames.contains('supplierId')) snapshots.deleteIndex('supplierId')

        // Add new composite indexes.
        entries.createIndex('orgId_supplierId',          ['orgId', 'supplierId'],             { unique: false })
        entries.createIndex('orgId_supplierId_itemCode', ['orgId', 'supplierId', 'itemCode'], { unique: false })
        entries.createIndex('orgId_supplierId_family',   ['orgId', 'supplierId', 'family'],   { unique: false })
        if (!entries.indexNames.contains('snapshotId'))
          entries.createIndex('snapshotId', 'snapshotId', { unique: false })
        snapshots.createIndex('orgId_supplierId', ['orgId', 'supplierId'], { unique: false })

        // Backfill orgId on legacy rows.
        const backfill = (store: IDBObjectStore) => {
          const cursorReq = store.openCursor()
          cursorReq.onsuccess = () => {
            const cursor = cursorReq.result
            if (!cursor) return
            const row = cursor.value as { orgId?: string }
            if (!row.orgId) {
              row.orgId = DEFAULT_SUBSCRIBER_ORG_ID
              cursor.update(row)
            }
            cursor.continue()
          }
        }
        backfill(entries)
        backfill(snapshots)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

function tx<T>(
  mode: IDBTransactionMode,
  stores: string[],
  run: (t: IDBTransaction) => Promise<T> | T,
): Promise<T> {
  return openDb().then(db => {
    if (!db) return Promise.reject(new Error('IndexedDB unavailable'))
    return new Promise<T>((resolve, reject) => {
      const t = db.transaction(stores, mode)
      let value: T
      t.oncomplete = () => resolve(value)
      t.onerror    = () => reject(t.error)
      t.onabort    = () => reject(t.error)
      Promise.resolve(run(t)).then(v => { value = v }, err => reject(err))
    })
  })
}

function promisify<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ─── Reads ──────────────────────────────────────────────────────────────────

export async function getEntriesBySupplier(
  supplierId: string,
  orgId: string = getActiveOrgId(),
): Promise<CatalogEntry[]> {
  try {
    return await tx('readonly', [STORE_ENTRIES], t => {
      const idx = t.objectStore(STORE_ENTRIES).index('orgId_supplierId')
      return promisify(idx.getAll(IDBKeyRange.only([orgId, supplierId]))) as Promise<CatalogEntry[]>
    })
  } catch { return [] }
}

/** All entries for one org (used by the "Mon catalogue" page). */
export async function getAllEntriesForOrg(orgId: string = getActiveOrgId()): Promise<CatalogEntry[]> {
  try {
    return await tx('readonly', [STORE_ENTRIES], t => {
      const all = promisify(t.objectStore(STORE_ENTRIES).getAll()) as Promise<CatalogEntry[]>
      return all.then(list => list.filter(e => e.orgId === orgId))
    })
  } catch { return [] }
}

/** Back-compat alias — defaults to the active org. */
export const getAllEntries = getAllEntriesForOrg

export async function getSnapshotsBySupplier(
  supplierId: string,
  orgId: string = getActiveOrgId(),
): Promise<CatalogSnapshot[]> {
  try {
    return await tx('readonly', [STORE_SNAPSHOTS], t => {
      const idx = t.objectStore(STORE_SNAPSHOTS).index('orgId_supplierId')
      return promisify(idx.getAll(IDBKeyRange.only([orgId, supplierId]))) as Promise<CatalogSnapshot[]>
    })
  } catch { return [] }
}

export async function countEntriesBySupplier(
  supplierId: string,
  orgId: string = getActiveOrgId(),
): Promise<number> {
  try {
    return await tx('readonly', [STORE_ENTRIES], t => {
      return promisify(t.objectStore(STORE_ENTRIES).index('orgId_supplierId').count(IDBKeyRange.only([orgId, supplierId])))
    })
  } catch { return 0 }
}

export async function getLatestSnapshot(
  supplierId: string,
  orgId: string = getActiveOrgId(),
): Promise<CatalogSnapshot | null> {
  const all = await getSnapshotsBySupplier(supplierId, orgId)
  if (!all.length) return null
  return all.sort((a, b) => b.importedAt - a.importedAt)[0]
}

// ─── Writes ─────────────────────────────────────────────────────────────────

export type EntryDraft = Omit<CatalogEntry, 'id' | 'orgId' | 'snapshotId' | 'importedAt' | 'normalizedLabel'> & {
  normalizedLabel: string
}

export type ImportOutcome = {
  snapshot: CatalogSnapshot
  added: number
  updated: number
  priceChanged: number
}

/**
 * Import a batch of entries. Creates a snapshot, diffs against the previous
 * snapshot for the same (orgId, supplierId) by itemCode, and writes
 * new/updated rows. Existing rows for the same (orgId, supplierId, itemCode)
 * are replaced so reads stay O(1) — the previous snapshot still points at
 * the old row ids for audit reproducibility.
 */
export async function importEntries(
  supplierId: string,
  source: CatalogSource,
  sourceFileName: string,
  drafts: EntryDraft[],
  orgId: string = getActiveOrgId(),
): Promise<ImportOutcome> {
  const snapshotId = uuid()
  const now        = Date.now()

  const outcome = await tx('readwrite', [STORE_ENTRIES, STORE_SNAPSHOTS], async t => {
    const entries   = t.objectStore(STORE_ENTRIES)
    const snapshots = t.objectStore(STORE_SNAPSHOTS)

    let added = 0, updated = 0, priceChanged = 0

    for (const d of drafts) {
      const idx = entries.index('orgId_supplierId_itemCode')
      const prior = await promisify(idx.get([orgId, supplierId, d.itemCode])) as CatalogEntry | undefined

      if (!prior) {
        added += 1
        const row: CatalogEntry = {
          id: uuid(),
          orgId,
          supplierId,
          snapshotId,
          itemCode: d.itemCode,
          ean: d.ean,
          label: d.label,
          normalizedLabel: d.normalizedLabel,
          family: d.family,
          diameterMm: d.diameterMm,
          unit: d.unit,
          publicPriceHT: d.publicPriceHT,
          netPriceHT: d.netPriceHT,
          source: d.source,
          sourceFileName: d.sourceFileName,
          importedAt: now,
        }
        await promisify(entries.add(row))
      } else {
        updated += 1
        if (Math.abs(prior.netPriceHT - d.netPriceHT) > 0.001) priceChanged += 1
        const row: CatalogEntry = {
          ...prior,
          snapshotId,
          label: d.label,
          normalizedLabel: d.normalizedLabel,
          family: d.family,
          diameterMm: d.diameterMm ?? prior.diameterMm,
          unit: d.unit,
          publicPriceHT: d.publicPriceHT,
          netPriceHT: d.netPriceHT,
          source: d.source,
          sourceFileName: d.sourceFileName,
          importedAt: now,
        }
        await promisify(entries.put(row))
      }
    }

    const snapshot: CatalogSnapshot = {
      id: snapshotId,
      orgId,
      supplierId,
      source,
      sourceFileName,
      importedAt: now,
      itemsCount: drafts.length,
      diff: { added, updated, priceChanged },
    }
    await promisify(snapshots.add(snapshot))
    return { snapshot, added, updated, priceChanged }
  })

  notify()
  return outcome
}

export async function deleteSupplierCatalog(
  supplierId: string,
  orgId: string = getActiveOrgId(),
): Promise<void> {
  await tx('readwrite', [STORE_ENTRIES, STORE_SNAPSHOTS], async t => {
    const entries   = t.objectStore(STORE_ENTRIES)
    const snapshots = t.objectStore(STORE_SNAPSHOTS)

    const range = IDBKeyRange.only([orgId, supplierId])
    const toDelete = await promisify(entries.index('orgId_supplierId').getAllKeys(range)) as IDBValidKey[]
    for (const k of toDelete) await promisify(entries.delete(k))

    const snapKeys = await promisify(snapshots.index('orgId_supplierId').getAllKeys(range)) as IDBValidKey[]
    for (const k of snapKeys) await promisify(snapshots.delete(k))
  })
  notify()
}

export async function deleteAllCatalogs(): Promise<void> {
  await tx('readwrite', [STORE_ENTRIES, STORE_SNAPSHOTS], async t => {
    await promisify(t.objectStore(STORE_ENTRIES).clear())
    await promisify(t.objectStore(STORE_SNAPSHOTS).clear())
  })
  notify()
}

/** Export everything (for backup OR future backend migration). */
export async function exportAll(): Promise<{ entries: CatalogEntry[]; snapshots: CatalogSnapshot[] }> {
  const [entries, snapshots] = await Promise.all([
    tx('readonly', [STORE_ENTRIES],  t => promisify(t.objectStore(STORE_ENTRIES).getAll()))   as Promise<CatalogEntry[]>,
    tx('readonly', [STORE_SNAPSHOTS], t => promisify(t.objectStore(STORE_SNAPSHOTS).getAll())) as Promise<CatalogSnapshot[]>,
  ])
  return { entries, snapshots }
}
