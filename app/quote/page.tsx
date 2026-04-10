'use client'

import { useState, useMemo } from 'react'
import AppLayout from '@/components/AppLayout'
import Modal from '@/components/Modal'
import Toast from '@/components/Toast'
import Animate from '@/components/Animate'
import { useLanguage } from '@/contexts/LanguageContext'
import { generateQuotePdf } from '@/lib/generateQuotePdf'

// ─── Types ────────────────────────────────────────────────────────────────────

type Row = {
  icon: string
  iconBg: string
  iconColor: string
  name: string
  sub: string
  qtyNum: number
  qtyUnit: string
  unitNum: number
}

// ─── Initial data (numeric) ──────────────────────────────────────────────────

const INITIAL_ROWS: Row[] = [
  { icon: 'architecture', iconBg: 'bg-primary/10',    iconColor: 'text-primary',    name: 'Steel Beams (Grade 50)',       sub: 'Structural I-Beam — 20ft',   qtyNum: 42,   qtyUnit: 'Units', unitNum: 1240.00 },
  { icon: 'layers',       iconBg: 'bg-secondary/10',  iconColor: 'text-secondary',  name: 'Concrete Mix (High Strength)', sub: 'M40 Grade — Ready Mix',       qtyNum: 250,  qtyUnit: 'm³',   unitNum: 115.00  },
  { icon: 'texture',      iconBg: 'bg-tertiary/10',   iconColor: 'text-tertiary',   name: 'Glass Paneling',               sub: 'Double Glazed Reflective',    qtyNum: 1200, qtyUnit: 'sqft', unitNum: 45.00   },
  { icon: 'bolt',         iconBg: 'bg-blue-500/10',   iconColor: 'text-blue-400',   name: 'Electrical Wiring & Conduit',  sub: 'EMT — 14 AWG + 12 AWG',      qtyNum: 3200, qtyUnit: 'lft',  unitNum: 8.40    },
  { icon: 'water_drop',   iconBg: 'bg-cyan-500/10',   iconColor: 'text-cyan-400',   name: 'Plumbing Fixtures & Pipe',     sub: 'PEX-A + Commercial Grade',    qtyNum: 85,   qtyUnit: 'Sets', unitNum: 1010.00 },
]

const FIXED_LABOR     = 67_800
const FIXED_LOGISTICS = 15_600
const TAX_RATE        = 0.06

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function QuotePage() {
  const { t } = useLanguage()

  const [toast, setToast]             = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showApprove, setShowApprove] = useState(false)
  const [approved, setApproved]       = useState(false)
  const [downloading, setDownloading] = useState(false)

  // Edit state
  const [isEditing, setIsEditing]     = useState(false)
  const [rows, setRows]               = useState<Row[]>(INITIAL_ROWS)
  const [draft, setDraft]             = useState<Row[]>(INITIAL_ROWS)

  // Live totals derived from current rows
  const totals = useMemo(() => {
    const materialSubtotal = rows.reduce((s, r) => s + r.qtyNum * r.unitNum, 0)
    const subtotal = materialSubtotal + FIXED_LABOR + FIXED_LOGISTICS
    const tax      = subtotal * TAX_RATE
    return { materialSubtotal, subtotal, tax, grand: subtotal + tax }
  }, [rows])

  // Live totals while editing (based on draft)
  const draftTotals = useMemo(() => {
    const materialSubtotal = draft.reduce((s, r) => s + r.qtyNum * r.unitNum, 0)
    const subtotal = materialSubtotal + FIXED_LABOR + FIXED_LOGISTICS
    const tax      = subtotal * TAX_RATE
    return { materialSubtotal, subtotal, tax, grand: subtotal + tax }
  }, [draft])

  const activeTotals = isEditing ? draftTotals : totals

  // ── Handlers ───────────────────────────────────────────────────────────────

  const startEdit = () => {
    setDraft(rows.map(r => ({ ...r })))
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setDraft(rows.map(r => ({ ...r })))
    setIsEditing(false)
  }

  const saveEdit = () => {
    setRows(draft.map(r => ({ ...r })))
    setIsEditing(false)
    setToast({ message: 'Quote updated successfully.', type: 'success' })
  }

  const updateDraft = (idx: number, field: 'qtyNum' | 'unitNum', raw: string) => {
    const val = parseFloat(raw.replace(/[^0-9.]/g, '')) || 0
    setDraft(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r))
  }

  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => {
      try {
        generateQuotePdf(rows)
        setToast({ message: t.quote.toastDownloaded, type: 'success' })
      } catch {
        setToast({ message: 'PDF generation failed. Please try again.', type: 'error' })
      } finally {
        setDownloading(false)
      }
    }, 400)
  }

  const handleApprove = () => {
    setShowApprove(false)
    setApproved(true)
    setToast({ message: t.quote.toastApproved, type: 'success' })
  }

  // ── Display rows (draft while editing, committed otherwise) ─────────────────
  const displayRows = isEditing ? draft : rows
  const maxTotal    = Math.max(...displayRows.map(r => r.qtyNum * r.unitNum), 1)

  return (
    <AppLayout>

      <main className="pb-32 px-6 max-w-7xl mx-auto technical-grid">

        {/* Edit mode banner */}
        {isEditing && (
          <div className="mb-6 flex items-center gap-3 px-5 py-3 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-400">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
            <span className="text-xs font-bold uppercase tracking-widest">Edit Mode — changes are not saved yet</span>
            <div className="ml-auto flex gap-2">
              <button
                onClick={cancelEdit}
                className="px-4 py-1.5 rounded-lg border border-amber-500/20 text-xs font-bold text-amber-400/70 hover:text-amber-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-400 hover:bg-amber-500/30 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Page header */}
        <Animate variant="fade-up">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-primary font-mono text-xs tracking-widest uppercase font-bold">
                  {t.quote.valuationConfirmed}
                </span>
                <span className="h-px w-6 bg-outline-variant/40" />
                <span className="text-tertiary font-mono text-xs uppercase">Project ID: PRJ-992-DELTA</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tighter text-on-surface">
                {t.quote.pageTitle}{' '}
                <span className="text-primary-container">#829-PX</span>
              </h1>
              <p className="mt-2 text-on-surface-variant max-w-xl text-base leading-relaxed">
                {t.quote.pageDesc}
              </p>
            </div>

            <div className="flex gap-3 shrink-0">
              {isEditing ? (
                <>
                  <button
                    onClick={cancelEdit}
                    className="px-5 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-low text-on-surface-variant text-sm font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-5 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">check</span>
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={startEdit}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-low text-on-surface text-sm font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  {t.quote.edit}
                </button>
              )}
              <button
                onClick={handleDownload}
                disabled={downloading || isEditing}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-low text-on-surface text-sm font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">download</span>
                )}
                {downloading ? t.quote.generating : t.quote.download}
              </button>
            </div>
          </div>
        </Animate>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Main left ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-8">

            {/* Materials table */}
            <Animate
              variant="fade-up"
              as="section"
              className={`rounded-2xl overflow-hidden border transition-all duration-300 ${
                isEditing
                  ? 'border-amber-500/25 bg-surface-container-low shadow-[0_0_0_1px_rgba(245,158,11,0.15)]'
                  : 'bg-surface-container-low border-white/5'
              }`}
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surface-container">
                <div>
                  <h3 className="font-headline font-bold text-lg tracking-tight">{t.quote.structuredMaterials}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {isEditing ? 'Click any quantity or price to edit' : t.quote.aiPricing}
                  </p>
                </div>
                <span className={`text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 ${isEditing ? 'text-amber-400' : 'text-emerald-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isEditing ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  {isEditing ? 'EDITING' : t.quote.livePrices}
                </span>
              </div>

              <div className="p-2 overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-outline">
                      <th className="px-4 py-2 font-medium">{t.quote.tableHeaders.spec}</th>
                      <th className="px-4 py-2 font-medium">{t.quote.tableHeaders.qty}</th>
                      <th className="px-4 py-2 font-medium">{t.quote.tableHeaders.unit}</th>
                      <th className="px-4 py-2 font-medium">{t.quote.tableHeaders.share}</th>
                      <th className="px-4 py-2 font-medium text-right">{t.quote.tableHeaders.total}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.map((m, idx) => {
                      const rowTotal = m.qtyNum * m.unitNum
                      const pct      = Math.round((rowTotal / maxTotal) * 100)
                      return (
                        <tr
                          key={m.name}
                          className={`group transition-colors rounded-xl ${
                            isEditing ? 'hover:bg-amber-500/5' : 'hover:bg-surface-container-high'
                          }`}
                        >
                          {/* Spec */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl ${m.iconBg} flex items-center justify-center shrink-0`}>
                                <span className={`material-symbols-outlined text-sm ${m.iconColor}`}>{m.icon}</span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-on-surface">{m.name}</div>
                                <div className="text-[10px] text-outline">{m.sub}</div>
                              </div>
                            </div>
                          </td>

                          {/* Qty */}
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={m.qtyNum}
                                  onChange={e => updateDraft(idx, 'qtyNum', e.target.value)}
                                  className="w-20 bg-surface-container border border-amber-500/30 rounded-lg px-2 py-1 text-sm font-mono text-on-surface focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-all"
                                />
                                <span className="text-xs text-on-surface-variant">{m.qtyUnit}</span>
                              </div>
                            ) : (
                              <span className="text-sm font-mono text-on-surface-variant">
                                {m.qtyNum.toLocaleString('en-US')} {m.qtyUnit}
                              </span>
                            )}
                          </td>

                          {/* Unit price */}
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-on-surface-variant">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={m.unitNum}
                                  onChange={e => updateDraft(idx, 'unitNum', e.target.value)}
                                  className="w-24 bg-surface-container border border-amber-500/30 rounded-lg px-2 py-1 text-sm font-mono text-on-surface focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-all"
                                />
                              </div>
                            ) : (
                              <span className="text-sm font-mono text-on-surface-variant">
                                {fmt(m.unitNum)}
                              </span>
                            )}
                          </td>

                          {/* Share bar */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-1 w-16 bg-surface-container rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${isEditing ? 'bg-amber-500' : 'bg-primary'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-outline font-mono">{pct}%</span>
                            </div>
                          </td>

                          {/* Total */}
                          <td className="px-4 py-3 text-right">
                            <span className={`text-sm font-mono font-bold transition-colors ${isEditing ? 'text-amber-400' : 'text-primary'}`}>
                              {fmt(rowTotal)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Animate>

            {/* Labor + Logistics */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Labor */}
              <Animate variant="slide-left" className="bg-surface-container-low rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-sm">engineering</span>
                  </div>
                  <h3 className="font-headline font-bold text-base">{t.quote.laborBreakdown}</h3>
                </div>
                <div className="space-y-5">
                  {[
                    { label: t.quote.laborRows[0], detail: '120 hrs @ $150/hr', pct: 75, amount: '$18,000' },
                    { label: t.quote.laborRows[1], detail: '840 hrs @ $45/hr',  pct: 52, amount: '$37,800' },
                    { label: t.quote.laborRows[2], detail: '60 hrs @ $200/hr',  pct: 18, amount: '$12,000' },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-on-surface-variant">{row.label}</span>
                        <span className="text-xs font-mono text-on-surface">{row.amount}</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-secondary transition-all duration-700" style={{ width: `${row.pct}%` }} />
                      </div>
                      <div className="text-[10px] text-outline mt-1">{row.detail}</div>
                    </div>
                  ))}
                </div>
              </Animate>

              {/* Logistics */}
              <Animate variant="slide-right" delay={80} className="bg-surface-container-low rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary text-sm">local_shipping</span>
                  </div>
                  <h3 className="font-headline font-bold text-base">{t.quote.logisticsFreight}</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: t.quote.logisticsRows[0], value: '3 Routes',  amount: '$8,400'  },
                    { label: t.quote.logisticsRows[1], value: 'Flat Fee',  amount: '$2,200'  },
                    { label: t.quote.logisticsRows[2], value: '1 Route',   amount: '$3,600'  },
                    { label: t.quote.logisticsRows[3], value: '12 Drops',  amount: '$1,400'  },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center">
                      <div>
                        <span className="text-xs text-on-surface-variant">{row.label}</span>
                        <div className="text-[10px] text-outline">{row.value}</div>
                      </div>
                      <span className="text-sm font-mono text-on-surface">{row.amount}</span>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs uppercase tracking-widest text-outline">{t.quote.logisticsTotal}</span>
                    <span className="text-lg font-mono font-bold text-tertiary">{fmt(FIXED_LOGISTICS)}</span>
                  </div>
                </div>
              </Animate>
            </section>

            {/* Vendor network */}
            <Animate variant="fade-up" delay={100} as="section" className="bg-surface-container-low rounded-2xl p-6 border border-white/5">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-primary text-sm">hub</span>
                <h3 className="font-headline font-bold text-base">{t.quote.vendorNetwork}</h3>
                <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">{t.quote.suppliersNotified}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['CDO Comptoir', 'Pim Plastic', 'Richardson', 'Marplin', 'Atlas Steel', 'CoreBuild', 'NexusGlass', 'UltraFix'].map((v) => (
                  <div key={v} className="px-3 py-2 bg-surface-container rounded-lg border border-white/5 text-xs text-on-surface-variant font-mono flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {v}
                  </div>
                ))}
              </div>
            </Animate>
          </div>

          {/* ── Summary panel right ────────────────────────────────────────── */}
          <Animate variant="slide-right" delay={150} className="lg:col-span-4 space-y-6">

            {/* Total card */}
            <div className={`glass-panel rounded-3xl p-8 relative overflow-hidden transition-all duration-300 ${isEditing ? 'shadow-[0_0_0_1px_rgba(245,158,11,0.2)]' : 'glow-primary'}`}>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-container/15 blur-[60px] rounded-full pointer-events-none" />
              <div className="relative z-10">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary mb-3 block">
                  {t.quote.finalValuation}
                </span>
                <div className={`text-4xl font-headline font-black tracking-tighter mb-1 transition-colors ${isEditing ? 'text-amber-400' : 'text-on-surface'}`}>
                  {fmt(activeTotals.grand).replace('.00', '')}
                  <span className={`text-2xl ${isEditing ? 'text-amber-400/60' : 'text-primary-fixed-dim'}`}>.00</span>
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full animate-pulse ${isEditing ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                  <span className="text-xs text-outline">{isEditing ? 'Preview — not yet saved' : t.quote.fixedRate}</span>
                </div>

                {approved ? (
                  <div className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-headline font-bold text-base rounded-2xl flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {t.quote.procurementActive}
                  </div>
                ) : (
                  <button
                    disabled={isEditing}
                    onClick={() => setShowApprove(true)}
                    className="w-full py-4 bg-primary-container text-on-primary-container font-headline font-bold text-base rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary-container/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {t.quote.approveBtn}
                  </button>
                )}

                {/* Line-item breakdown — live */}
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between text-xs text-outline">
                    <span>{t.quote.materialsSubtotal}</span>
                    <span className={`font-mono transition-colors ${isEditing ? 'text-amber-400/80' : ''}`}>
                      {fmt(activeTotals.materialSubtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-outline">
                    <span>{t.quote.labor}</span>
                    <span className="font-mono">{fmt(FIXED_LABOR)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-outline">
                    <span>{t.quote.logistics}</span>
                    <span className="font-mono">{fmt(FIXED_LOGISTICS)}</span>
                  </div>
                  <div className="border-t border-white/5 pt-2 flex justify-between text-xs text-outline">
                    <span>{t.quote.tax}</span>
                    <span className={`font-mono transition-colors ${isEditing ? 'text-amber-400/80' : ''}`}>
                      {fmt(activeTotals.tax)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence gauge */}
            <div className="bg-surface-container rounded-2xl p-6 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-outline">{t.quote.quoteConfidence}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                  {t.quote.highReliability}
                </span>
              </div>
              <div className="relative w-full flex flex-col items-center mb-4">
                <svg viewBox="0 0 120 70" className="w-36 overflow-visible">
                  <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="#1e2840" strokeWidth="8" strokeLinecap="round" />
                  <path
                    d="M 10 65 A 50 50 0 0 1 110 65"
                    fill="none"
                    stroke="url(#conf-gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="165"
                    strokeDashoffset="10"
                  />
                  <defs>
                    <linearGradient id="conf-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2e5bff" />
                      <stop offset="100%" stopColor="#b8c3ff" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-3xl font-headline font-black text-on-surface -mt-4">94%</div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed text-center">{t.quote.confidenceDesc}</p>
              <div className="mt-4 flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full bg-primary/40 ${i === 3 ? 'animate-pulse' : ''}`} />
                ))}
                <div className="h-1 flex-1 rounded-full bg-surface-container-highest" />
              </div>
            </div>

            {/* Procurement timeline */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-white/5 space-y-5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-outline">{t.quote.procurementTimeline}</h4>
              {[
                { dot: 'bg-primary',    title: t.quote.timelineSteps[0].title, sub: t.quote.timelineSteps[0].sub, done: approved },
                { dot: 'bg-secondary',  title: t.quote.timelineSteps[1].title, sub: t.quote.timelineSteps[1].sub, done: false },
                { dot: 'bg-tertiary',   title: t.quote.timelineSteps[2].title, sub: t.quote.timelineSteps[2].sub, done: false },
                { dot: 'bg-emerald-500',title: t.quote.timelineSteps[3].title, sub: t.quote.timelineSteps[3].sub, done: false },
              ].map((item, i) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${item.done ? 'bg-emerald-500' : item.dot} ${i === 0 && !item.done ? 'animate-pulse' : ''}`} />
                  <div>
                    <div className="text-xs font-bold text-on-surface">{item.title}</div>
                    <div className="text-[10px] text-outline">{item.sub}</div>
                  </div>
                  {item.done && <span className="ml-auto text-[10px] text-emerald-400 font-mono">✓</span>}
                </div>
              ))}
            </div>
          </Animate>
        </div>
      </main>

      {/* Approve modal */}
      {showApprove && (
        <Modal title={t.quote.approveModalTitle} onClose={() => setShowApprove(false)}>
          <div className="space-y-6">
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">{t.quote.modalProject}</span>
                <span className="text-on-surface font-semibold">Skyline Pavilion — PRJ-992-DELTA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">{t.quote.modalTotalValue}</span>
                <span className="text-primary font-bold font-mono">{fmt(totals.grand)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">{t.quote.modalSuppliers}</span>
                <span className="text-on-surface font-semibold">12 Tier-1 Networks</span>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">{t.quote.modalDesc}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApprove(false)}
                className="flex-1 py-3 rounded-xl border border-outline-variant/20 text-on-surface-variant font-bold hover:bg-surface-container-high transition-all"
              >
                {t.quote.cancel}
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 py-3 rounded-xl bg-primary-container text-on-primary-container font-bold hover:shadow-[0_0_20px_rgba(46,91,255,0.4)] transition-all"
              >
                {t.quote.confirmApprove}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}
