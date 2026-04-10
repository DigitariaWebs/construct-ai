'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

const ACCEPTED = ['.pdf', '.dwg', '.ifc', '.rvt']

export default function UploadModal({ onClose }: { onClose: () => void }) {
  const { t } = useLanguage()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [file, setFile]         = useState<File | null>(null)
  const [launching, setLaunching] = useState(false)

  const handleFile = useCallback((f: File) => {
    setFile(f)
    setLaunching(true)
    setTimeout(() => {
      onClose()
      router.push('/processing')
    }, 900)
  }, [onClose, router])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,14,32,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        style={{
          background: 'rgba(15,25,48,0.95)',
          animation: 'modal-in 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-0">
          <div>
            <span className="text-primary font-headline font-bold tracking-widest text-[10px] uppercase">
              Blueprint Engine
            </span>
            <h2 className="font-headline font-black text-2xl tracking-tighter text-white mt-0.5">
              {t.projects.dragDrop}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Drop zone */}
        <div className="p-8">
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={() => setDragging(false)}
            onClick={() => !launching && inputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center gap-5 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 py-14 px-8 ${
              launching
                ? 'border-emerald-500/40 bg-emerald-500/5 cursor-default'
                : dragging
                ? 'border-primary bg-primary/10 scale-[1.01]'
                : 'border-outline-variant/30 hover:border-primary/40 hover:bg-primary/5'
            }`}
          >
            {/* Glow on drag */}
            {dragging && (
              <div className="absolute inset-0 rounded-xl pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 50%, rgba(46,91,255,0.15), transparent 70%)' }}
              />
            )}

            {/* Icon */}
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
              launching
                ? 'bg-emerald-500/20 border-emerald-500/30 shadow-[0_0_30px_rgba(52,211,153,0.2)]'
                : dragging
                ? 'bg-primary/20 border-primary/40 shadow-[0_0_30px_rgba(46,91,255,0.3)] scale-110'
                : 'bg-primary-container/20 border-primary/20'
            }`}>
              <span
                className={`material-symbols-outlined text-4xl transition-colors ${
                  launching ? 'text-emerald-400' : dragging ? 'text-primary' : 'text-primary/60'
                }`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {launching ? 'check_circle' : 'cloud_upload'}
              </span>
            </div>

            {launching ? (
              <div className="text-center space-y-1">
                <p className="font-headline font-bold text-emerald-400 text-lg">{file?.name}</p>
                <p className="text-on-surface-variant text-sm">Launching analysis engine…</p>
                <div className="mt-3 h-1 w-40 mx-auto bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full animate-[loading_0.9s_ease-out_forwards]" style={{ width: '0%' }} />
                </div>
              </div>
            ) : (
              <div className="text-center space-y-1.5">
                <p className="font-headline font-bold text-white text-lg">
                  {dragging ? 'Release to upload' : t.dashboard.dropBlueprints}
                </p>
                <p className="text-on-surface-variant text-sm">{t.dashboard.dropDesc}</p>
                <p className="text-on-surface-variant/50 text-xs font-mono uppercase tracking-widest mt-2">
                  {t.projects.supportedFormats}
                </p>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={onInputChange}
          />

          {/* Format pills */}
          {!launching && (
            <div className="flex justify-center gap-2 mt-5">
              {ACCEPTED.map((ext) => (
                <span
                  key={ext}
                  className="px-3 py-1 rounded-full bg-surface-container border border-outline-variant/20 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
                >
                  {ext.replace('.', '')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes loading {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  )
}
