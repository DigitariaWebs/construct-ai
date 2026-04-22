'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { SUPPLIERS } from '@/lib/suppliers'
import {
  connectWithDiscountMatrix,
  recordCatalogConnection,
  disconnectSupplier,
  getAllAccounts,
  subscribeAccounts,
  updateDiscountMatrix,
  defaultDiscountFor,
  type SupplierAccount,
  type SupplierAccountStatus,
  type DiscountByFamily,
  type ConnectionChannel,
} from '@/lib/supplierAccounts'
import { FAMILIES, FAMILY_LABELS, FAMILY_COLORS } from '@/lib/catalog/types'
import { parseFabdis } from '@/lib/catalog/fabdis'
import { importEntries, countEntriesBySupplier, getLatestSnapshot, subscribeCatalog } from '@/lib/catalog/store'
import { invoiceToDrafts } from '@/lib/catalog/ocr/invoiceToDrafts'
import type { CatalogSnapshot } from '@/lib/catalog/types'

type Props = {
  onClose: () => void
  initialSupplierId?: string
}

type Tab = 'fabdis' | 'discount' | 'invoice'
type Stage = 'idle' | 'working' | 'success' | 'error'

const CONNECTABLE = SUPPLIERS.filter(s => s.id !== 'auto')

export default function SupplierConnectModal({ onClose, initialSupplierId }: Props) {
  const [view, setView]           = useState<'grid' | 'detail'>(initialSupplierId ? 'detail' : 'grid')
  const [activeId, setActiveId]   = useState<string | null>(initialSupplierId ?? null)
  const [accounts, setAccounts]   = useState<Record<string, SupplierAccount>>({})
  const [entryCounts, setEntryCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    setAccounts(getAllAccounts())
    const unsubAcc = subscribeAccounts(s => setAccounts({ ...s }))
    const refreshCounts = async () => {
      const next: Record<string, number> = {}
      for (const s of CONNECTABLE) next[s.id] = await countEntriesBySupplier(s.id)
      setEntryCounts(next)
    }
    refreshCounts()
    const unsubCat = subscribeCatalog(refreshCounts)
    return () => { unsubAcc(); unsubCat() }
  }, [])

  const activeSupplier = useMemo(() => CONNECTABLE.find(s => s.id === activeId), [activeId])
  const connectedCount = Object.values(accounts).filter(a => a.status === 'connected').length

  const openSupplier = (id: string) => { setActiveId(id); setView('detail') }
  const backToGrid   = () => { setActiveId(null); setView('grid') }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,5,0.82)', backdropFilter: 'blur(14px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] rounded-2xl bg-surface-container border border-outline-variant/20 shadow-2xl overflow-hidden flex flex-col"
        style={{ animation: 'supplier-modal-in 0.28s cubic-bezier(0.2, 0.9, 0.3, 1.2)' }}
      >
        <span className="absolute top-3 left-3 w-4 h-4 border-l border-t border-white/15 pointer-events-none" />
        <span className="absolute top-3 right-3 w-4 h-4 border-r border-t border-white/15 pointer-events-none" />
        <span className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-white/15 pointer-events-none" />
        <span className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-white/15 pointer-events-none" />
        <div className="absolute inset-0 hero-grid-fine opacity-20 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-8 pt-7 pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            {view === 'detail' && (
              <button
                onClick={backToGrid}
                className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/10 transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
              </button>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                  {view === 'grid' ? 'Comptes fournisseurs' : 'Configurer le compte'}
                </span>
              </div>
              <h2 className="font-headline font-black text-2xl tracking-tighter text-white truncate">
                {view === 'grid' ? 'Synchronisez vos prix remisés' : activeSupplier?.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/10 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="relative z-10 flex-1 overflow-y-auto">
          {view === 'grid' && (
            <GridView
              accounts={accounts}
              entryCounts={entryCounts}
              connectedCount={connectedCount}
              onSelect={openSupplier}
              onDisconnect={disconnectSupplier}
              onDone={onClose}
            />
          )}
          {view === 'detail' && activeSupplier && (
            <DetailView
              supplier={activeSupplier}
              account={accounts[activeSupplier.id] ?? null}
              entryCount={entryCounts[activeSupplier.id] ?? 0}
              onDone={() => { backToGrid() }}
            />
          )}
        </div>
      </div>

      <style>{`
        @keyframes supplier-modal-in {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ─── Grid view ─────────────────────────────────────────────────────────────

function GridView({ accounts, entryCounts, connectedCount, onSelect, onDisconnect, onDone }: {
  accounts: Record<string, SupplierAccount>
  entryCounts: Record<string, number>
  connectedCount: number
  onSelect: (id: string) => void
  onDisconnect: (id: string) => void
  onDone: () => void
}) {
  return (
    <div className="p-8 space-y-6">
      <p className="text-sm text-on-surface-variant leading-relaxed max-w-xl">
        Connectez vos comptes distributeurs pour que vos tarifs personnels remplacent automatiquement les prix publics dans chaque chiffrage.
      </p>

      <div className="flex items-center gap-4 px-5 py-3 rounded-xl bg-surface-container-low border border-white/5">
        <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            {connectedCount > 0 ? 'verified' : 'lock_open'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-on-surface-variant">Comptes synchronisés</div>
          <div className="text-sm font-headline font-bold text-on-surface">
            {connectedCount} / {CONNECTABLE.length}
            {connectedCount > 0 && <span className="ml-2 text-[11px] font-mono text-primary">· remises actives</span>}
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
          Chiffré · TLS 1.3
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CONNECTABLE.map(s => {
          const acc      = accounts[s.id]
          const status   = acc?.status ?? 'disconnected'
          const isOn     = status === 'connected'
          const catalog  = entryCounts[s.id] ?? 0
          const channel  = acc?.channel

          return (
            <div
              key={s.id}
              className={`group relative p-5 rounded-xl border transition-all duration-200 ${
                isOn
                  ? 'border-primary/40 bg-primary/[0.04] shadow-[0_0_24px_rgba(212,255,58,0.08)]'
                  : 'border-white/5 bg-surface-container-low hover:border-primary/20 hover:bg-surface-container-high'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-headline font-black text-xs shrink-0 transition-colors ${
                  isOn ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'
                }`}>{s.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-headline font-bold text-base text-on-surface leading-tight truncate">{s.name}</div>
                    <StatusPill status={status} />
                  </div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5 truncate">{s.sub}</div>
                  {isOn && channel && (
                    <div className="mt-2.5 flex items-center gap-3 flex-wrap">
                      <ChannelBadge channel={channel} />
                      {catalog > 0 && (
                        <>
                          <div className="h-3 w-px bg-white/10" />
                          <div className="text-[10px] text-on-surface-variant font-mono">
                            {catalog.toLocaleString('fr-FR')} réf.
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {isOn ? (
                  <>
                    <button
                      onClick={() => onSelect(s.id)}
                      className="flex-1 px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container text-on-surface-variant hover:text-on-surface hover:border-primary/30 text-[11px] font-bold uppercase tracking-widest transition-all"
                    >
                      Gérer
                    </button>
                    <button
                      onClick={() => onDisconnect(s.id)}
                      className="px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container text-on-surface-variant hover:text-red-400 hover:border-red-500/30 text-[11px] font-bold uppercase tracking-widest transition-all"
                    >
                      Déconnecter
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onSelect(s.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary-container text-on-primary-container text-[11px] font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(212,255,58,0.35)] active:scale-[0.98] transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">link</span>
                    Connecter
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
          <span className="material-symbols-outlined text-xs">shield</span>
          <span>Vos identifiants ne quittent jamais votre espace sécurisé.</span>
        </div>
        <button
          onClick={onDone}
          className="px-5 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container text-on-surface-variant hover:text-white hover:border-primary/30 text-xs font-bold uppercase tracking-widest transition-all"
        >
          Terminé
        </button>
      </div>
    </div>
  )
}

// ─── Detail view (3 tabs) ──────────────────────────────────────────────────

function DetailView({ supplier, account, entryCount, onDone }: {
  supplier: { id: string; name: string; initials: string; tier: string; sub: string; deliveryDays: number }
  account: SupplierAccount | null
  entryCount: number
  onDone: () => void
}) {
  const [tab, setTab] = useState<Tab>(account?.channel === 'invoice_ocr' ? 'invoice' : account?.channel === 'discount' ? 'discount' : 'fabdis')
  const [snapshot, setSnapshot] = useState<CatalogSnapshot | null>(null)

  useEffect(() => {
    getLatestSnapshot(supplier.id).then(setSnapshot)
    const unsub = subscribeCatalog(() => { getLatestSnapshot(supplier.id).then(setSnapshot) })
    return unsub
  }, [supplier.id])

  return (
    <div className="p-8 space-y-6">
      {/* Supplier identity card */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-white/5">
        <div className="w-12 h-12 rounded-xl bg-primary text-on-primary font-headline font-black text-sm flex items-center justify-center shrink-0">
          {supplier.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-headline font-bold text-white text-base">{supplier.name}</div>
          <div className="text-[11px] text-on-surface-variant mt-0.5">
            {account?.status === 'connected' ? (
              <>Connecté · <ChannelBadge channel={account.channel} inline /> {entryCount > 0 && `· ${entryCount.toLocaleString('fr-FR')} références`}</>
            ) : (
              'Partenaire distributeur · choisissez une méthode ci-dessous'
            )}
          </div>
        </div>
        <span className="shrink-0 text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
          {supplier.tier}
        </span>
      </div>

      {/* Tab switcher */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-xl bg-surface-container-low border border-white/5">
        {([
          { id: 'fabdis',   label: 'Fichier FAB-DIS', icon: 'upload_file',   sub: 'Catalogue complet' },
          { id: 'discount', label: 'Remise négociée', icon: 'percent',       sub: 'Par famille' },
          { id: 'invoice',  label: 'Depuis factures', icon: 'receipt_long',  sub: 'OCR automatique' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`p-3 rounded-lg text-left transition-all ${
              tab === t.id
                ? 'bg-primary-container text-on-primary-container'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
              <span className="text-[11px] font-black uppercase tracking-widest">{t.label}</span>
            </div>
            <div className={`text-[10px] ${tab === t.id ? 'text-on-primary-container/70' : 'text-on-surface-variant/70'}`}>{t.sub}</div>
          </button>
        ))}
      </div>

      {/* Active tab */}
      {tab === 'fabdis'   && <FabdisTab   supplierId={supplier.id} snapshot={snapshot} onDone={onDone} />}
      {tab === 'discount' && <DiscountTab supplierId={supplier.id} supplierName={supplier.name} account={account} onDone={onDone} />}
      {tab === 'invoice'  && <InvoiceTab  supplierId={supplier.id} snapshot={snapshot} onDone={onDone} />}
    </div>
  )
}

// ─── Tab: FAB-DIS import ───────────────────────────────────────────────────

function FabdisTab({ supplierId, snapshot, onDone }: { supplierId: string; snapshot: CatalogSnapshot | null; onDone: () => void }) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [stage, setStage]       = useState<Stage>('idle')
  const [error, setError]       = useState('')
  const [outcome, setOutcome]   = useState<{ fileName: string; added: number; updated: number; priceChanged: number; skipped: number; total: number } | null>(null)

  const handleFile = async (file: File) => {
    setStage('working'); setError(''); setOutcome(null)
    try {
      const text = await file.text()
      const parsed = parseFabdis(text, { supplierId, source: 'fabdis', sourceFileName: file.name })
      if (parsed.drafts.length === 0) {
        setStage('error')
        setError(parsed.warnings.join(' ') || 'Aucune ligne exploitable dans ce fichier.')
        return
      }
      const result = await importEntries(supplierId, 'fabdis', file.name, parsed.drafts)
      recordCatalogConnection({ supplierId, channel: 'fabdis', fileName: file.name })
      setOutcome({
        fileName: file.name,
        added: result.added,
        updated: result.updated,
        priceChanged: result.priceChanged,
        skipped: parsed.skippedRows,
        total: parsed.totalRows,
      })
      setStage('success')
    } catch (e: any) {
      setStage('error')
      setError(e?.message || "Impossible d'analyser ce fichier.")
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  if (stage === 'success' && outcome) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shadow-[0_0_40px_rgba(212,255,58,0.25)]">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-2">Catalogue importé</div>
        <h3 className="font-headline font-black text-2xl text-white mb-3 tracking-tight">
          {outcome.added + outcome.updated} références synchronisées
        </h3>
        <p className="text-sm text-on-surface-variant max-w-sm mx-auto mb-6 truncate">
          Depuis <span className="text-white font-mono">{outcome.fileName}</span>
        </p>
        <div className="max-w-md mx-auto mb-6 grid grid-cols-4 gap-2">
          <Stat label="Ajoutées"    value={outcome.added.toString()} />
          <Stat label="Mises à jour" value={outcome.updated.toString()} />
          <Stat label="Prix changés" value={outcome.priceChanged.toString()} />
          <Stat label="Ignorées"    value={outcome.skipped.toString()} />
        </div>
        <button onClick={onDone} className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container text-xs font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(212,255,58,0.35)] transition-all">
          Terminer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {snapshot && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container-low border border-white/5">
          <span className="material-symbols-outlined text-primary text-sm">history</span>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-on-surface-variant">Dernier import</div>
            <div className="text-xs text-on-surface font-medium truncate">
              {snapshot.sourceFileName} · {snapshot.itemsCount.toLocaleString('fr-FR')} réf. · {formatRelativeTime(snapshot.importedAt)}
            </div>
          </div>
        </div>
      )}

      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onClick={() => stage !== 'working' && fileInput.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 py-12 px-6 ${
          dragging
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-outline-variant/30 hover:border-primary/40 hover:bg-primary/5'
        } ${stage === 'working' ? 'pointer-events-none opacity-80' : ''}`}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${
          stage === 'working' ? 'bg-primary/15 border-primary/30' : 'bg-primary-container/20 border-primary/20'
        }`}>
          <span className={`material-symbols-outlined text-3xl ${stage === 'working' ? 'text-primary animate-spin' : 'text-primary/70'}`} style={{ fontVariationSettings: stage !== 'working' ? "'FILL' 1" : undefined }}>
            {stage === 'working' ? 'progress_activity' : 'upload_file'}
          </span>
        </div>
        <div className="text-center space-y-1">
          <p className="font-headline font-bold text-white text-base">
            {stage === 'working' ? 'Analyse du catalogue…' : dragging ? 'Déposer pour importer' : 'Importez votre fichier FAB-DIS'}
          </p>
          <p className="text-on-surface-variant text-xs">
            Format CSV (exporté d'Excel). Aliases de colonnes reconnus : code article, libellé, prix HT, remise…
          </p>
        </div>
        <input ref={fileInput} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={onInputChange} />
      </div>

      {error && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-bold">
          <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="p-4 rounded-xl bg-surface-container-low border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary text-sm">lightbulb</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface">Vous n'avez pas de FAB-DIS ?</span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Demandez-le à votre commercial — c'est la norme d'échange catalogue du bâtiment français. En attendant, renseignez vos remises (onglet à côté) ou importez vos factures.
        </p>
      </div>
    </div>
  )
}

// ─── Tab: Discount matrix ──────────────────────────────────────────────────

function DiscountTab({ supplierId, supplierName, account, onDone }: {
  supplierId: string
  supplierName: string
  account: SupplierAccount | null
  onDone: () => void
}) {
  const existingMatrix = account?.discountByFamily
  const [matrix, setMatrix] = useState<DiscountByFamily>(existingMatrix ?? defaultDiscountFor(supplierId))
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber ?? '')
  const [password, setPassword]           = useState('')
  const [email, setEmail]                 = useState(account?.holderEmail ?? '')
  const [showPassword, setShowPassword]   = useState(false)
  const [stage, setStage]   = useState<'idle' | 'verifying' | 'syncing' | 'applying' | 'success' | 'error'>('idle')
  const [error, setError]   = useState('')

  const isReconfigure = account?.status === 'connected'
  const busy = stage === 'verifying' || stage === 'syncing' || stage === 'applying'

  const setFamily = (f: keyof DiscountByFamily, v: number) => {
    setMatrix(m => ({ ...m, [f]: Math.max(0, Math.min(50, v)) }))
  }

  const avgDiscount = Math.round(
    FAMILIES.reduce((s, f) => s + matrix[f], 0) / FAMILIES.length,
  )

  const handleSubmit = async () => {
    setError('')

    if (!isReconfigure) {
      if (accountNumber.trim().length < 4) return setError('Numéro de compte invalide.')
      if (password.trim().length < 3)       return setError('Mot de passe requis.')
      if (!/^\S+@\S+\.\S+$/.test(email))     return setError('Email du compte invalide.')
    }

    try {
      if (isReconfigure) {
        updateDiscountMatrix(supplierId, matrix)
        setStage('success')
        return
      }
      await connectWithDiscountMatrix(
        supplierId,
        { accountNumber: accountNumber.trim(), password: password.trim(), email: email.trim() },
        matrix,
        s => setStage(s),
      )
      setStage('success')
    } catch (e: any) {
      setStage('error')
      setError(e?.message || 'Connexion impossible.')
    }
  }

  if (stage === 'success') {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shadow-[0_0_40px_rgba(212,255,58,0.25)]">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-2">
          {isReconfigure ? 'Mise à jour' : 'Connecté'}
        </div>
        <h3 className="font-headline font-black text-2xl text-white mb-3 tracking-tight">
          {supplierName} — remises appliquées
        </h3>
        <p className="text-sm text-on-surface-variant max-w-md mx-auto mb-6">
          Vos remises par famille seront appliquées automatiquement sur tous vos chiffrage.
        </p>
        <div className="max-w-lg mx-auto mb-6 grid grid-cols-3 gap-2">
          {FAMILIES.map(f => (
            <div key={f} className={`p-3 rounded-xl border border-white/5 bg-surface-container-low`}>
              <div className={`text-[9px] uppercase tracking-widest ${FAMILY_COLORS[f].text}`}>{FAMILY_LABELS[f]}</div>
              <div className="text-sm font-headline font-bold text-on-surface mt-0.5 font-mono">−{matrix[f]}%</div>
            </div>
          ))}
        </div>
        <button onClick={onDone} className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container text-xs font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(212,255,58,0.35)] transition-all">
          Terminer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {!isReconfigure && (
        <>
          <Field label="Numéro de compte client" icon="badge" value={accountNumber} onChange={setAccountNumber} placeholder="CEDEO-482910" disabled={busy} />
          <Field label="Email du compte" icon="mail" type="email" value={email} onChange={setEmail} placeholder="contact@plomberie-bertrand.fr" disabled={busy} />
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Mot de passe extranet</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl group-focus-within:text-primary transition-colors">lock</span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={busy}
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container/60 pl-12 pr-12 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:bg-surface-container-high transition-all disabled:opacity-60"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} disabled={busy} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant/60 hover:text-on-surface hover:bg-white/5 transition-all">
                <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Family discount matrix */}
      <div className="rounded-xl border border-white/5 bg-surface-container-low p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-on-surface">Vos remises négociées</div>
            <div className="text-[10px] text-on-surface-variant mt-0.5">Appliquées automatiquement au tarif public</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">Moyenne</div>
            <div className="text-lg font-headline font-black text-primary font-mono">−{avgDiscount}%</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FAMILIES.map(f => (
            <div key={f} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container border border-white/5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${FAMILY_COLORS[f].bg}`}>
                <span className={`material-symbols-outlined text-sm ${FAMILY_COLORS[f].text}`}>
                  {f === 'ef_ec' ? 'water' : f === 'pvc' ? 'valve' : f === 'sanitaires' ? 'bathroom' : f === 'chauffage' ? 'local_fire_department' : f === 'vmc' ? 'air' : 'build'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-on-surface truncate">{FAMILY_LABELS[f]}</div>
              </div>
              <div className="relative shrink-0 w-20">
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={matrix[f]}
                  onChange={e => setFamily(f, parseInt(e.target.value, 10) || 0)}
                  disabled={busy}
                  className="w-full bg-surface-container-high border border-outline-variant/20 rounded-lg pl-3 pr-6 py-2 text-sm text-on-surface text-right font-mono focus:outline-none focus:border-primary/50 transition-all disabled:opacity-60"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant pointer-events-none">%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {busy && <ConnectionProgress stage={stage as 'verifying' | 'syncing' | 'applying'} />}

      {error && !busy && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-bold">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
          <span className="material-symbols-outlined text-sm">lock</span>
          <span>Identifiants stockés localement et chiffrés.</span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={busy}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-headline font-black uppercase tracking-[0.15em] text-sm rounded-xl hover:shadow-[0_0_30px_rgba(212,255,58,0.45)] active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100 shrink-0"
        >
          {busy ? (
            <>
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              Connexion…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">bolt</span>
              {isReconfigure ? 'Mettre à jour' : 'Connecter le compte'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Tab: Invoice OCR ──────────────────────────────────────────────────────

function InvoiceTab({ supplierId, snapshot, onDone }: { supplierId: string; snapshot: CatalogSnapshot | null; onDone: () => void }) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [stage, setStage]       = useState<Stage>('idle')
  const [error, setError]       = useState('')
  const [outcome, setOutcome]   = useState<{ fileName: string; detectedSupplier: string; added: number; updated: number; priceChanged: number } | null>(null)
  const [progressMsg, setProgressMsg] = useState('')

  const handleFile = async (file: File) => {
    setStage('working'); setError(''); setOutcome(null)
    setProgressMsg('Envoi du document…')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/catalog/ocr-invoice', { method: 'POST', body: form })
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: `Erreur ${res.status}` }))
        throw new Error(body.error || `Erreur ${res.status}`)
      }
      setProgressMsg('Lecture des lignes…')
      const { invoice, fileName } = await res.json() as { invoice: import('@/lib/catalog/ocr/schema').ExtractedInvoice; fileName: string }

      if (!invoice.items || invoice.items.length === 0) {
        setStage('error')
        setError(invoice.notes?.join(' ') || 'Aucune ligne détectée sur ce document.')
        return
      }

      setProgressMsg('Indexation dans votre catalogue…')
      const drafts = invoiceToDrafts(invoice, supplierId, fileName)
      if (drafts.length === 0) {
        setStage('error')
        setError("Les lignes détectées n'ont pas pu être normalisées.")
        return
      }
      const result = await importEntries(supplierId, 'invoice_ocr', fileName, drafts)
      recordCatalogConnection({ supplierId, channel: 'invoice_ocr', fileName })
      setOutcome({
        fileName,
        detectedSupplier: invoice.supplierDetected || '—',
        added: result.added,
        updated: result.updated,
        priceChanged: result.priceChanged,
      })
      setStage('success')
    } catch (e: any) {
      setStage('error')
      setError(e?.message || "Impossible d'analyser cette facture.")
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  if (stage === 'success' && outcome) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shadow-[0_0_40px_rgba(212,255,58,0.25)]">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary mb-2">Facture analysée</div>
        <h3 className="font-headline font-black text-2xl text-white mb-3 tracking-tight">
          {outcome.added + outcome.updated} prix ajoutés à votre catalogue
        </h3>
        <p className="text-sm text-on-surface-variant max-w-sm mx-auto mb-6 truncate">
          Depuis <span className="text-white font-mono">{outcome.fileName}</span>
        </p>
        <div className="max-w-md mx-auto mb-6 grid grid-cols-3 gap-2">
          <Stat label="Nouvelles"    value={outcome.added.toString()} />
          <Stat label="Mises à jour" value={outcome.updated.toString()} />
          <Stat label="Prix révisés"  value={outcome.priceChanged.toString()} />
        </div>
        <button onClick={onDone} className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container text-xs font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(212,255,58,0.35)] transition-all">
          Terminer
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {snapshot && snapshot.source === 'invoice_ocr' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container-low border border-white/5">
          <span className="material-symbols-outlined text-primary text-sm">history</span>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-on-surface-variant">Dernière facture analysée</div>
            <div className="text-xs text-on-surface font-medium truncate">
              {snapshot.sourceFileName} · {snapshot.itemsCount.toLocaleString('fr-FR')} lignes · {formatRelativeTime(snapshot.importedAt)}
            </div>
          </div>
        </div>
      )}

      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onClick={() => stage !== 'working' && fileInput.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 py-12 px-6 ${
          dragging
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-outline-variant/30 hover:border-primary/40 hover:bg-primary/5'
        } ${stage === 'working' ? 'pointer-events-none opacity-80' : ''}`}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${
          stage === 'working' ? 'bg-primary/15 border-primary/30' : 'bg-primary-container/20 border-primary/20'
        }`}>
          <span className={`material-symbols-outlined text-3xl ${stage === 'working' ? 'text-primary animate-spin' : 'text-primary/70'}`} style={{ fontVariationSettings: stage !== 'working' ? "'FILL' 1" : undefined }}>
            {stage === 'working' ? 'progress_activity' : 'receipt_long'}
          </span>
        </div>
        <div className="text-center space-y-1">
          <p className="font-headline font-bold text-white text-base">
            {stage === 'working' ? progressMsg || 'Analyse en cours…' : dragging ? 'Déposer pour analyser' : 'Déposez une facture ou un bon de commande'}
          </p>
          <p className="text-on-surface-variant text-xs">
            PDF · l'IA extrait chaque ligne (réf, libellé, qté, prix HT) et l'ajoute à votre catalogue
          </p>
        </div>
        <input ref={fileInput} type="file" accept=".pdf" className="hidden" onChange={onInputChange} />
      </div>

      {error && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-bold">
          <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="p-4 rounded-xl bg-surface-container-low border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface">Plus vous importez, plus c'est précis</span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Chaque facture enrichit votre base personnelle. Après 5 à 10 factures, le système connaît vos prix réels sur les références que vous utilisez le plus.
        </p>
      </div>
    </div>
  )
}

// ─── Shared primitives ─────────────────────────────────────────────────────

function StatusPill({ status }: { status: SupplierAccountStatus }) {
  if (status === 'connected') {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest bg-primary/10 text-primary">
        <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
        Connecté
      </span>
    )
  }
  if (status === 'connecting') {
    return (
      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest bg-amber-400/10 text-amber-400">
        En cours
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest bg-error/10 text-error">
        Erreur
      </span>
    )
  }
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest bg-white/5 text-on-surface-variant">
      Non connecté
    </span>
  )
}

function ChannelBadge({ channel, inline = false }: { channel: ConnectionChannel; inline?: boolean }) {
  const conf = {
    fabdis:       { icon: 'dataset',       label: 'Catalogue FAB-DIS' },
    invoice_ocr:  { icon: 'receipt_long',  label: 'Factures OCR' },
    discount:     { icon: 'percent',       label: 'Remise négociée' },
    extranet:     { icon: 'cloud_sync',    label: 'Extranet' },
  }[channel]
  if (inline) {
    return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary">
      <span className="material-symbols-outlined text-[12px]">{conf.icon}</span>{conf.label}
    </span>
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-primary">
      <span className="material-symbols-outlined text-[12px]">{conf.icon}</span>
      {conf.label}
    </span>
  )
}

function ConnectionProgress({ stage }: { stage: 'verifying' | 'syncing' | 'applying' }) {
  const steps: { key: 'verifying' | 'syncing' | 'applying'; label: string }[] = [
    { key: 'verifying', label: "Vérification des identifiants" },
    { key: 'syncing',   label: "Synchronisation du catalogue"   },
    { key: 'applying',  label: "Application de vos remises"     },
  ]
  const order = steps.findIndex(s => s.key === stage)
  return (
    <div className="p-5 rounded-xl bg-surface-container-low border border-white/5 space-y-2.5">
      {steps.map((s, i) => {
        const done    = i < order
        const active  = i === order
        return (
          <div key={s.key} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
              done   ? 'bg-primary text-on-primary' :
              active ? 'bg-primary/15 text-primary' :
                       'bg-surface-container-high text-on-surface-variant'
            }`}>
              {done ? (
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              ) : active ? (
                <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
              ) : (
                <span className="text-[10px] font-bold">{i + 1}</span>
              )}
            </div>
            <span className={`text-xs font-semibold transition-colors ${
              done   ? 'text-on-surface-variant' :
              active ? 'text-on-surface' :
                       'text-on-surface-variant/50'
            }`}>{s.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, icon, value, onChange, placeholder, disabled, type = 'text' }: {
  label: string
  icon: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  disabled?: boolean
  type?: string
}) {
  return (
    <div className="space-y-2.5">
      <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">{label}</label>
      <div className="relative group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-xl group-focus-within:text-primary transition-colors">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full rounded-xl border border-outline-variant/20 bg-surface-container/60 pl-12 pr-4 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:bg-surface-container-high transition-all disabled:opacity-60"
        />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-surface-container-low border border-white/5">
      <div className="text-[9px] uppercase tracking-widest text-on-surface-variant">{label}</div>
      <div className="text-sm font-headline font-bold text-on-surface mt-0.5 font-mono">{value}</div>
    </div>
  )
}

function formatRelativeTime(ts: number): string {
  const delta = Date.now() - ts
  const m = Math.floor(delta / 60_000)
  const h = Math.floor(delta / 3_600_000)
  const d = Math.floor(delta / 86_400_000)
  if (d > 0) return `il y a ${d} j`
  if (h > 0) return `il y a ${h} h`
  if (m > 0) return `il y a ${m} min`
  return "à l'instant"
}
