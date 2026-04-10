'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { SUPPLIERS, SESSION_KEY, type Supplier } from '@/lib/suppliers'

const ACCEPTED = ['.pdf', '.dwg', '.ifc', '.rvt']

export default function UploadModal({ onClose }: { onClose: () => void }) {
  const { t }  = useLanguage()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [step, setStep]                   = useState<1 | 2>(1)
  const [dragging, setDragging]           = useState(false)
  const [file, setFile]                   = useState<File | null>(null)
  const [selectedId, setSelectedId]       = useState('auto')
  const [launching, setLaunching]         = useState(false)

  // ── Step 1: file accepted → move to step 2 ────────────────────────────────
  const handleFile = useCallback((f: File) => {
    setFile(f)
    setTimeout(() => setStep(2), 350)
  }, [])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  // ── Step 2: launch analysis ───────────────────────────────────────────────
  const launch = () => {
    setLaunching(true)
    sessionStorage.setItem(SESSION_KEY, selectedId)
    setTimeout(() => {
      onClose()
      router.push('/processing')
    }, 700)
  }

  const selectedSupplier = SUPPLIERS.find(s => s.id === selectedId)!

  // ── Savings vs AI Optimized baseline (uses fixed default quantities) ───────
  const BASE_PRICES = SUPPLIERS[0].prices
  const BASE_QTY    = [42, 250, 1200, 3200, 85]
  const baseTotal   = BASE_PRICES.reduce((s, p, i) => s + p * BASE_QTY[i], 0)

  const savingsOf = (s: Supplier) => {
    const total = s.prices.reduce((sum, p, i) => sum + p * BASE_QTY[i], 0)
    const diff  = total - baseTotal
    const pct   = (diff / baseTotal) * 100
    return { diff, pct }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,14,32,0.88)', backdropFilter: 'blur(14px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !launching) onClose() }}
    >
      <div
        className={`relative rounded-2xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 ${
          step === 1 ? 'w-full max-w-lg' : 'w-full max-w-2xl'
        }`}
        style={{ background: 'rgba(15,25,48,0.97)', animation: 'modal-in 0.25s ease-out' }}
      >

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-8 pt-7 pb-0">
          <div>
            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${step >= 1 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}>1</div>
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${step === 1 ? 'text-primary' : 'text-on-surface-variant'}`}>Upload</span>
              </div>
              <div className={`h-px w-6 transition-colors ${step === 2 ? 'bg-primary' : 'bg-outline-variant/30'}`} />
              <div className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${step === 2 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}>2</div>
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${step === 2 ? 'text-primary' : 'text-on-surface-variant'}`}>Choose Supplier</span>
              </div>
            </div>
            <h2 className="font-headline font-black text-xl tracking-tighter text-white">
              {step === 1 ? t.projects.dragDrop : 'Choose a Supplier'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={launching}
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* ── Step 1: Upload ───────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="p-8">
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => inputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-5 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 py-14 px-8 ${
                dragging
                  ? 'border-primary bg-primary/10 scale-[1.01]'
                  : 'border-outline-variant/30 hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              {dragging && (
                <div className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 50% 50%, rgba(46,91,255,0.15), transparent 70%)' }}
                />
              )}
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                dragging
                  ? 'bg-primary/20 border-primary/40 shadow-[0_0_30px_rgba(46,91,255,0.3)] scale-110'
                  : 'bg-primary-container/20 border-primary/20'
              }`}>
                <span
                  className={`material-symbols-outlined text-4xl transition-colors ${dragging ? 'text-primary' : 'text-primary/60'}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  cloud_upload
                </span>
              </div>
              <div className="text-center space-y-1.5">
                <p className="font-headline font-bold text-white text-lg">
                  {dragging ? 'Release to upload' : t.dashboard.dropBlueprints}
                </p>
                <p className="text-on-surface-variant text-sm">{t.dashboard.dropDesc}</p>
                <p className="text-on-surface-variant/50 text-xs font-mono uppercase tracking-widest mt-2">
                  {t.projects.supportedFormats}
                </p>
              </div>
            </div>

            <input ref={inputRef} type="file" accept={ACCEPTED.join(',')} className="hidden" onChange={onInputChange} />

            <div className="flex justify-center gap-2 mt-5">
              {ACCEPTED.map(ext => (
                <span key={ext} className="px-3 py-1 rounded-full bg-surface-container border border-outline-variant/20 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  {ext.replace('.', '')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Supplier selection ───────────────────────────────────── */}
        {step === 2 && (
          <div className="p-8">
            {/* File confirmed */}
            <div className="flex items-center gap-3 mb-7 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <span className="material-symbols-outlined text-emerald-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <div className="min-w-0">
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest">File Ready</p>
                <p className="text-sm text-on-surface font-medium truncate">{file?.name}</p>
              </div>
              <button
                onClick={() => { setFile(null); setStep(1) }}
                className="ml-auto text-[10px] text-on-surface-variant hover:text-white uppercase tracking-widest font-bold transition-colors"
              >
                Change
              </button>
            </div>

            {/* Supplier cards */}
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {SUPPLIERS.map(s => {
                const { diff, pct } = savingsOf(s)
                const isSelected    = s.id === selectedId
                const isCheaper     = diff < 0
                const isBaseline    = s.id === 'auto'

                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`relative flex-shrink-0 w-40 p-4 rounded-2xl border text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-surface-container shadow-[0_0_20px_rgba(46,91,255,0.2)]'
                        : 'border-white/5 bg-surface-container-high hover:border-primary/30'
                    }`}
                  >
                    {/* Checkmark */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1", fontSize: '12px' }}>check</span>
                      </div>
                    )}

                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 font-headline font-black text-xs transition-colors ${
                      isSelected ? 'bg-primary text-white' : 'bg-surface-container text-on-surface'
                    }`}>
                      {s.initials}
                    </div>

                    <div className="font-headline font-bold text-sm text-on-surface leading-tight">{s.name}</div>
                    <div className="text-[10px] text-on-surface-variant mt-0.5 mb-3 truncate">{s.sub}</div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${s.tierColor}`}>
                      {s.tier}
                    </span>

                    <div className="mt-3 flex items-center justify-between text-[10px] text-on-surface-variant">
                      <span>★ {s.rating}</span>
                      <span>{s.deliveryDays}d</span>
                    </div>

                    <div className={`mt-2 text-[10px] font-bold font-mono ${isBaseline ? 'text-primary' : isCheaper ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isBaseline
                        ? '◆ BASELINE'
                        : `${isCheaper ? '▼' : '▲'} ${Math.abs(pct).toFixed(1)}%`}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Selected summary + Launch button */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 px-4 py-3 rounded-xl bg-surface-container border border-white/5">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Selected Supplier</p>
                <p className="text-sm font-headline font-bold text-on-surface mt-0.5">
                  {selectedSupplier.name}
                  <span className="ml-2 text-[10px] font-normal text-on-surface-variant font-body">{selectedSupplier.deliveryDays}-day delivery · ★ {selectedSupplier.rating}</span>
                </p>
              </div>

              <button
                onClick={launch}
                disabled={launching}
                className="flex items-center gap-2 px-6 py-3 bg-primary-container text-on-primary-container font-headline font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:scale-100 shrink-0"
              >
                {launching ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    Launching…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                    Start Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
