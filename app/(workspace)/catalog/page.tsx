'use client'

import { useEffect, useMemo, useState } from 'react'
import Animate from '@/components/feedback/Animate'
import Toast from '@/components/feedback/Toast'
import SupplierConnectModal from '@/features/catalog/ui/SupplierConnectModal'
import { useLanguage } from '@/contexts/LanguageContext'
import { SUPPLIERS } from '@/features/catalog/suppliers'
import {
  getAllEntries,
  getSnapshotsBySupplier,
  deleteSupplierCatalog,
  subscribeCatalog,
} from '@/features/catalog/store'
import { FAMILIES, FAMILY_COLORS, FAMILY_LABELS, type CatalogEntry, type CatalogSnapshot, type Family } from '@/features/catalog/types'
import { getAllAccounts, subscribeAccounts, type SupplierAccount } from '@/features/catalog/supplierAccounts'

const CONNECTABLE = SUPPLIERS.filter(s => s.id !== 'auto')

// Icon per product family — powers the row thumbnails that replaced the
// all-text table. Keep in sync with FAMILIES in lib/catalog/types.ts.
const FAMILY_ICONS: Record<Family, string> = {
  ef_ec:      'water_drop',
  pvc:        'waves',
  sanitaires: 'bathtub',
  chauffage:  'local_fire_department',
  vmc:        'mode_fan',
  autres:     'inventory_2',
}

// Radial-gradient tint per supplier tab — matches the supplier's tier color
// so the tabs carry a bit of brand identity without needing real logos.
const SUPPLIER_TINTS: Record<string, { from: string; ring: string }> = {
  cdo:        { from: 'from-emerald-500/[0.08]', ring: 'ring-emerald-400/10' },
  pim:        { from: 'from-cyan-500/[0.08]',    ring: 'ring-cyan-400/10'    },
  richardson: { from: 'from-indigo-500/[0.08]',  ring: 'ring-indigo-400/10'  },
  marplin:    { from: 'from-rose-500/[0.08]',    ring: 'ring-rose-400/10'    },
}
const DEFAULT_TINT = { from: 'from-primary/[0.06]', ring: 'ring-primary/10' }

function fmtEur(v: number) {
  return v.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const fillTmpl = (tmpl: string, vars: Record<string, string>): string =>
  tmpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`)

export default function CatalogPage() {
  const { t } = useLanguage()
  const [entries, setEntries]     = useState<CatalogEntry[]>([])
  const [accounts, setAccounts]   = useState<Record<string, SupplierAccount>>({})
  const [activeSupplier, setActiveSupplier] = useState<string>(CONNECTABLE[0].id)
  const [snapshots, setSnapshots] = useState<CatalogSnapshot[]>([])
  const [query, setQuery]         = useState('')
  const [familyFilter, setFamilyFilter] = useState<Family | 'all'>('all')
  const [toast, setToast]         = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalSupplier, setModalSupplier] = useState<string | null>(null)

  const load = async () => {
    const all = await getAllEntries()
    setEntries(all)
    const snaps = await getSnapshotsBySupplier(activeSupplier)
    setSnapshots(snaps.sort((a, b) => b.importedAt - a.importedAt))
  }

  useEffect(() => {
    load()
    const unsub = subscribeCatalog(load)
    return unsub
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSupplier])

  useEffect(() => {
    setAccounts(getAllAccounts())
    return subscribeAccounts(s => setAccounts({ ...s }))
  }, [])

  const countsBySupplier = useMemo(() => {
    const c: Record<string, number> = {}
    for (const e of entries) c[e.supplierId] = (c[e.supplierId] ?? 0) + 1
    return c
  }, [entries])

  const supplierEntries = useMemo(
    () => entries.filter(e => e.supplierId === activeSupplier),
    [entries, activeSupplier],
  )

  const filteredEntries = useMemo(() => {
    let list = supplierEntries
    if (familyFilter !== 'all') list = list.filter(e => e.family === familyFilter)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(e =>
        e.itemCode.toLowerCase().includes(q) ||
        e.label.toLowerCase().includes(q) ||
        (e.ean?.toLowerCase().includes(q)),
      )
    }
    return list.sort((a, b) => a.label.localeCompare(b.label))
  }, [supplierEntries, query, familyFilter])

  const stats = useMemo(() => {
    const n = supplierEntries.length
    const byFamily: Record<Family, number> = FAMILIES.reduce((acc, f) => ({ ...acc, [f]: 0 }), {} as Record<Family, number>)
    let avgDiscount = 0
    let avgDiscountCount = 0
    for (const e of supplierEntries) {
      byFamily[e.family] = (byFamily[e.family] ?? 0) + 1
      if (e.publicPriceHT > 0 && e.netPriceHT > 0 && e.netPriceHT < e.publicPriceHT) {
        avgDiscount += ((e.publicPriceHT - e.netPriceHT) / e.publicPriceHT) * 100
        avgDiscountCount += 1
      }
    }
    return { n, byFamily, avgDiscount: avgDiscountCount ? avgDiscount / avgDiscountCount : 0 }
  }, [supplierEntries])

  const handleExportCsv = () => {
    const rows = [['itemCode', 'label', 'ean', 'family', 'unit', 'publicPriceHT', 'netPriceHT', 'source', 'importedAt']]
    for (const e of supplierEntries) {
      rows.push([
        e.itemCode,
        e.label.replace(/"/g, '""'),
        e.ean ?? '',
        FAMILY_LABELS[e.family],
        e.unit,
        e.publicPriceHT.toString(),
        e.netPriceHT.toString(),
        e.source,
        new Date(e.importedAt).toISOString(),
      ])
    }
    const csv = rows.map(r => r.map(c => `"${c}"`).join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `catalogue_${activeSupplier}_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setToast({ message: t.catalog.toastExported, type: 'success' })
  }

  const handleClearSupplier = async () => {
    const name = CONNECTABLE.find(s => s.id === activeSupplier)?.name ?? activeSupplier
    if (!confirm(fillTmpl(t.catalog.confirmClear, { name }))) return
    await deleteSupplierCatalog(activeSupplier)
    setToast({ message: t.catalog.toastCleared, type: 'info' })
  }

  const supplierName = CONNECTABLE.find(s => s.id === activeSupplier)?.name ?? activeSupplier

  return (
    <>
      <div className="pb-32 space-y-8">

        <Animate variant="fade-up" as="section" className="pt-4 relative isolate overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-primary/[0.03] via-surface-container-lowest to-surface-container-lowest px-6 py-8 md:px-10 md:py-12">
          <PlumbingHeroPattern />
          <span className="relative text-primary font-headline font-bold tracking-widest text-[10px] uppercase">{t.catalog.kicker}</span>
          <h1 className="relative text-4xl md:text-5xl font-headline font-black tracking-tighter text-on-surface mt-1">{t.catalog.pageTitle}</h1>
          <p className="relative text-on-surface-variant mt-1 text-sm max-w-xl">{t.catalog.pageDesc}</p>
        </Animate>

        {/* Supplier tabs */}
        <Animate variant="fade-up" delay={60}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CONNECTABLE.map(s => {
              const active = s.id === activeSupplier
              const count  = countsBySupplier[s.id] ?? 0
              const acc    = accounts[s.id]
              const tint   = SUPPLIER_TINTS[s.id] ?? DEFAULT_TINT
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSupplier(s.id)}
                  className={`group relative overflow-hidden p-4 rounded-2xl border text-left transition-all bg-gradient-to-br ${tint.from} to-surface-container-low ${
                    active
                      ? `border-primary/50 shadow-[0_0_24px_rgba(212,255,58,0.12)] ring-1 ${tint.ring}`
                      : 'border-white/5 hover:border-primary/20'
                  }`}
                >
                  {/* decorative corner glow */}
                  <span aria-hidden className="pointer-events-none absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/5 blur-xl" />
                  <div className="relative flex items-center justify-between mb-2.5">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-headline font-black text-[11px] transition-colors ${
                      active ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'
                    }`}>{s.initials}</div>
                    {acc?.status === 'connected' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                    )}
                  </div>
                  <div className="relative text-sm font-headline font-bold text-on-surface">{s.name}</div>
                  <div className="relative mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-on-surface-variant font-mono">{count.toLocaleString('fr-FR')} réf.</span>
                    {active && <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Actif</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </Animate>

        {/* Stats & actions */}
        <Animate variant="fade-up" delay={100}>
          <div className="bg-surface-container-low rounded-2xl border border-white/5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="font-headline font-black text-2xl text-on-surface tracking-tight">{supplierName}</h2>
                {snapshots[0] ? (
                  <p className="text-xs text-on-surface-variant mt-1">
                    Dernier import <span className="font-mono text-on-surface">{snapshots[0].sourceFileName}</span> · {formatDate(snapshots[0].importedAt)}
                  </p>
                ) : (
                  <p className="text-xs text-on-surface-variant mt-1">Aucun catalogue importé pour ce fournisseur.</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => { setModalSupplier(activeSupplier); setShowModal(true) }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary font-bold uppercase tracking-widest text-[11px] rounded-xl hover:shadow-[0_0_24px_rgba(212,255,58,0.4)] transition-all"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Importer
                </button>
                {stats.n > 0 && (
                  <>
                    <button
                      onClick={handleExportCsv}
                      className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant/20 bg-surface-container text-on-surface-variant hover:text-on-surface text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      Exporter CSV
                    </button>
                    <button
                      onClick={handleClearSupplier}
                      className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant/20 bg-surface-container text-on-surface-variant hover:text-red-400 hover:border-red-500/30 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Tout supprimer
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Références"  value={stats.n.toLocaleString('fr-FR')} />
              <StatCard label="Remise moy."  value={stats.avgDiscount > 0 ? `−${stats.avgDiscount.toFixed(1)}%` : '—'} />
              <StatCard label="Snapshots"    value={snapshots.length.toString()} />
              <StatCard label="Connexion"    value={accounts[activeSupplier]?.channel ? channelLabel(accounts[activeSupplier].channel) : 'Non connecté'} />
            </div>

            {/* Family distribution */}
            {stats.n > 0 && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <div className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Répartition par famille</div>
                <div className="flex flex-wrap gap-2">
                  {FAMILIES.map(f => {
                    const count = stats.byFamily[f] ?? 0
                    const pct   = stats.n ? Math.round((count / stats.n) * 100) : 0
                    if (count === 0) return null
                    return (
                      <button
                        key={f}
                        onClick={() => setFamilyFilter(familyFilter === f ? 'all' : f)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all ${
                          familyFilter === f
                            ? `${FAMILY_COLORS[f].bg} ${FAMILY_COLORS[f].text} border-current`
                            : 'bg-surface-container border-white/5 text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {FAMILY_LABELS[f]}
                        <span className="text-[10px] font-mono opacity-70">{count} · {pct}%</span>
                      </button>
                    )
                  })}
                  {familyFilter !== 'all' && (
                    <button
                      onClick={() => setFamilyFilter('all')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-outline-variant/20 bg-surface-container text-[11px] font-bold text-on-surface-variant hover:text-white transition-all"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                      Tout
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Animate>

        {/* Entries table */}
        <Animate variant="fade-up" delay={140}>
          {stats.n === 0 ? (
            <EmptyState onImport={() => { setModalSupplier(activeSupplier); setShowModal(true) }} supplierName={supplierName} />
          ) : (
            <>
              {/* Search */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-md">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg">search</span>
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={t.catalog.searchPlaceholder}
                    className="w-full rounded-xl border border-outline-variant/20 bg-surface-container pl-11 pr-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <span className="text-xs text-on-surface-variant font-mono shrink-0">
                  {filteredEntries.length.toLocaleString('fr-FR')} / {stats.n.toLocaleString('fr-FR')}
                </span>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto max-h-[640px]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-surface-container-low z-10">
                      <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-white/5">
                        <th className="px-4 py-3 w-14"></th>
                        <th className="px-4 py-3">{t.catalog.colRef}</th>
                        <th className="px-4 py-3">Libellé</th>
                        <th className="px-4 py-3">Famille</th>
                        <th className="px-4 py-3 text-right">Prix public HT</th>
                        <th className="px-4 py-3 text-right">Prix net HT</th>
                        <th className="px-4 py-3 text-right">Remise</th>
                        <th className="px-4 py-3">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map(e => {
                        const pubHT = e.publicPriceHT
                        const hasDiscount = pubHT > 0 && e.netPriceHT > 0 && e.netPriceHT < pubHT - 0.001
                        const discountPct = hasDiscount ? ((pubHT - e.netPriceHT) / pubHT) * 100 : 0
                        return (
                          <tr key={e.id} className="border-b border-white/5 last:border-0 hover:bg-surface-container-high transition-colors">
                            <td className="pl-4 pr-1 py-3">
                              <FamilyTile family={e.family} />
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px] text-on-surface-variant">{e.itemCode}</td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-on-surface">{e.label}</div>
                              {e.ean && <div className="text-[10px] text-on-surface-variant/70 font-mono mt-0.5">EAN {e.ean}</div>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${FAMILY_COLORS[e.family].bg} ${FAMILY_COLORS[e.family].text}`}>
                                {FAMILY_LABELS[e.family]}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-on-surface-variant">
                              {pubHT > 0 ? fmtEur(pubHT) : '—'}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-on-surface">
                              {fmtEur(e.netPriceHT)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {hasDiscount
                                ? <span className="font-mono text-[11px] font-bold text-primary">−{discountPct.toFixed(1)}%</span>
                                : <span className="font-mono text-[11px] text-on-surface-variant/60">—</span>}
                            </td>
                            <td className="px-4 py-3">
                              <SourceBadge source={e.source} />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Snapshot history */}
              {snapshots.length > 0 && (
                <div className="mt-6 bg-surface-container-low rounded-2xl border border-white/5 p-6">
                  <h3 className="font-headline font-bold text-base text-on-surface mb-4">Historique des imports</h3>
                  <div className="space-y-2">
                    {snapshots.slice(0, 8).map(s => (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-white/5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-sm">
                            {s.source === 'fabdis' ? 'dataset' : s.source === 'invoice_ocr' ? 'receipt_long' : 'draw'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-on-surface truncate">{s.sourceFileName}</div>
                          <div className="text-[11px] text-on-surface-variant mt-0.5">
                            {formatDate(s.importedAt)} · {s.itemsCount.toLocaleString('fr-FR')} lignes
                            {s.diff && (
                              <>
                                {' '}·{' '}
                                <span className="text-primary font-mono">+{s.diff.added}</span>
                                {' / '}
                                <span className="text-amber-400 font-mono">~{s.diff.updated}</span>
                                {s.diff.priceChanged > 0 && <>{' / '}<span className="font-mono text-on-surface-variant">{s.diff.priceChanged} prix</span></>}
                              </>
                            )}
                          </div>
                        </div>
                        <SourceBadge source={s.source} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </Animate>
      </div>

      {showModal && (
        <SupplierConnectModal
          initialSupplierId={modalSupplier ?? undefined}
          onClose={() => { setShowModal(false); setModalSupplier(null) }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-surface-container border border-white/5">
      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</div>
      <div className="text-lg font-headline font-black text-on-surface mt-1 font-mono truncate">{value}</div>
    </div>
  )
}

function SourceBadge({ source }: { source: 'fabdis' | 'invoice_ocr' | 'manual' }) {
  const c = {
    fabdis:      { label: 'FAB-DIS',   cls: 'bg-primary/10 text-primary',        icon: 'dataset' },
    invoice_ocr: { label: 'Facture',   cls: 'bg-cyan-500/10 text-cyan-400',      icon: 'receipt_long' },
    manual:      { label: 'Manuel',    cls: 'bg-white/5 text-on-surface-variant', icon: 'draw' },
  }[source]
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${c.cls}`}>
      <span className="material-symbols-outlined text-[11px]">{c.icon}</span>
      {c.label}
    </span>
  )
}

function EmptyState({ onImport, supplierName }: { onImport: () => void; supplierName: string }) {
  return (
    <div className="relative isolate overflow-hidden rounded-2xl border border-dashed border-outline-variant/30 bg-gradient-to-br from-primary/[0.02] via-surface-container-lowest to-surface-container-lowest py-16 px-6 text-center">
      <PlumbingHeroPattern />
      <div className="relative mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-primary text-3xl">inventory_2</span>
      </div>
      <h3 className="relative font-headline font-black text-2xl text-on-surface tracking-tight mb-2">
        Aucune référence pour {supplierName}
      </h3>
      <p className="relative text-sm text-on-surface-variant max-w-md mx-auto mb-6">
        Importez votre catalogue FAB-DIS, déposez une facture ou saisissez vos remises pour commencer à bâtir votre base de prix personnelle.
      </p>
      <button
        onClick={onImport}
        className="relative inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-headline font-black uppercase tracking-[0.15em] text-sm rounded-xl hover:shadow-[0_0_30px_rgba(212,255,58,0.45)] active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined text-lg">upload_file</span>
        Importer maintenant
      </button>

      {/* Decorative floating icons */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="material-symbols-outlined absolute top-8 left-6 text-primary/15 text-5xl rotate-[-12deg]">plumbing</span>
        <span className="material-symbols-outlined absolute bottom-10 right-8 text-cyan-400/15 text-6xl rotate-[12deg]">water_drop</span>
        <span className="material-symbols-outlined absolute top-14 right-16 text-rose-400/10 text-4xl">local_fire_department</span>
        <span className="material-symbols-outlined absolute bottom-6 left-14 text-emerald-400/10 text-4xl">mode_fan</span>
      </div>
    </div>
  )
}

/** Small colored icon tile shown at the start of each catalog row. */
function FamilyTile({ family }: { family: Family }) {
  const c = FAMILY_COLORS[family]
  const icon = FAMILY_ICONS[family]
  return (
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-white/5 ${c.bg}`}>
      <span className={`material-symbols-outlined text-[18px] ${c.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
    </div>
  )
}

/** Subtle plumbing-themed background pattern (SVG, inlined). */
function PlumbingHeroPattern() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.09] text-primary"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="plumbing-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
        <radialGradient id="plumbing-mask" cx="50%" cy="50%" r="75%">
          <stop offset="0%"   stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="plumbing-fade">
          <rect width="100%" height="100%" fill="url(#plumbing-mask)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#plumbing-grid)" mask="url(#plumbing-fade)" />
      {/* stylized pipe silhouettes */}
      <g mask="url(#plumbing-fade)" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round">
        <path d="M -20 80 Q 120 80 120 140 T 260 200" />
        <path d="M 340 -20 Q 340 80 420 80 T 560 120" />
        <circle cx="120" cy="140" r="6" fill="currentColor" opacity="0.5" />
        <circle cx="420" cy="80"  r="6" fill="currentColor" opacity="0.5" />
      </g>
    </svg>
  )
}

function channelLabel(channel: string): string {
  return (
    channel === 'fabdis'      ? 'FAB-DIS' :
    channel === 'invoice_ocr' ? 'Factures' :
    channel === 'discount'    ? 'Remise' :
    channel === 'extranet'    ? 'Extranet' : channel
  )
}
