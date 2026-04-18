'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import { useLanguage } from '@/contexts/LanguageContext'
import { subscribe, getState, type ExtractionState, type ExtractionStage } from '@/lib/quote/store'

const stepMeta: { icon: string; stage: ExtractionStage }[] = [
  { icon: 'description',       stage: 'reading'     },
  { icon: 'account_tree',      stage: 'parsing'     },
  { icon: 'layers',            stage: 'structuring' },
  { icon: 'currency_exchange', stage: 'pricing'     },
  { icon: 'request_quote',     stage: 'ready'       },
]

function stageIndex(stage: ExtractionStage) {
  return stepMeta.findIndex(s => s.stage === stage)
}

export default function ProcessingPage() {
  const { t } = useLanguage()
  const router = useRouter()

  const [state, setState]     = useState<ExtractionState>(getState())
  const [redirecting, setRed] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribe(setState)
    return () => { unsubscribe() }
  }, [])

  // If the user landed here directly (no upload in flight, no result), bounce them home.
  useEffect(() => {
    if (state.status === 'idle') {
      const id = setTimeout(() => router.replace('/dashboard'), 400)
      return () => clearTimeout(id)
    }
  }, [state.status, router])

  // Auto-advance to /quote once extraction is done.
  useEffect(() => {
    if (state.status === 'done' && !redirecting) {
      setRed(true)
      const id = setTimeout(() => router.push('/quote'), 900)
      return () => clearTimeout(id)
    }
  }, [state.status, redirecting, router])

  const done       = state.status === 'done'
  const isError    = state.status === 'error'
  const progress   = state.status === 'running' ? state.progress : done ? 100 : 0
  const activeIdx  = state.status === 'running'
    ? Math.max(0, stageIndex(state.stage))
    : done ? stepMeta.length : 0
  const fileName   = state.status !== 'idle' ? (state as { fileName: string }).fileName : ''
  const errorMsg   = isError ? state.message : ''

  return (
    <AppLayout>
      <main className="min-h-[80vh] pb-32 px-6 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Ambient mesh */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 30% 40%, rgba(212,255,58,0.12) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(168,255,90,0.08) 0%, transparent 60%)',
          }}
        />

        <div className="max-w-4xl w-full relative z-10 flex flex-col items-center text-center">

          {/* Orbital spinner */}
          <div className="mb-8 relative">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-primary/10 rounded-full" />
              {!done && !isError && (
                <>
                  <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin-slow" />
                  <div className="absolute inset-3 border border-secondary/20 rounded-full animate-spin-reverse" />
                </>
              )}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center relative ${
                isError ? 'bg-red-500/20 border border-red-500/30' : 'bg-primary-container shadow-[0_0_40px_rgba(212,255,58,0.35)]'
              }`}>
                {!done && !isError && <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />}
                <span
                  className={`material-symbols-outlined text-3xl relative z-10 ${isError ? 'text-red-400' : 'text-on-primary-container'}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {isError ? 'error' : done ? 'task_alt' : 'cognition'}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-2 text-[10px] font-mono text-primary tracking-[0.3em] uppercase">
            {isError ? '— ANALYSIS FAILED —' : done ? `— ${t.processing.complete2} —` : `— ${t.processing.analyzing2} —`}
          </div>
          <h1 className="font-headline font-black text-3xl md:text-5xl tracking-tighter text-on-surface mb-3 uppercase">
            {isError ? 'Extraction failed' : done ? t.processing.complete2 : t.processing.analyzing}
          </h1>
          {fileName && !isError && (
            <p className="text-sm text-on-surface-variant font-mono mb-8 truncate max-w-lg">
              <span className="material-symbols-outlined text-xs align-middle mr-1">picture_as_pdf</span>
              {fileName}
            </p>
          )}
          {isError && (
            <p className="text-sm text-red-400 mb-8 max-w-lg leading-relaxed">{errorMsg}</p>
          )}

          {/* Steps list */}
          {!isError && (
            <div className="w-full space-y-3 max-w-md">
              {stepMeta.map((s, i) => {
                const isDone    = i < activeIdx || done
                const isActive  = i === activeIdx && !done
                return (
                  <div
                    key={s.stage}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                      isDone
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : isActive
                        ? 'bg-surface-container border-primary/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
                        : 'bg-surface-container/20 border-white/5 opacity-40'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isDone ? 'bg-emerald-500/20 text-emerald-400' :
                      isActive ? 'bg-primary/20 text-primary' :
                      'bg-surface-container-high text-on-surface-variant/60'
                    }`}>
                      {isDone ? (
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      ) : isActive ? (
                        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-sm">{s.icon}</span>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className={`text-sm font-headline font-bold truncate ${
                        isDone ? 'text-emerald-400' : isActive ? 'text-primary' : 'text-on-surface-variant'
                      }`}>
                        {t.processing.steps[i].label}
                      </p>
                      <p className="text-[10px] text-on-surface-variant/60 truncate mt-0.5">{t.processing.steps[i].sub}</p>
                    </div>
                    {isDone && (
                      <span className="text-[10px] font-mono text-emerald-500/60 shrink-0">DONE</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Progress bar */}
          {!isError && (
            <div className="mt-8 w-full max-w-md space-y-2">
              <div className="flex justify-between text-xs font-mono text-on-surface-variant">
                <span>PROGRESS</span>
                <span className="text-primary">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-container to-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-10 flex items-center gap-3">
            {done && (
              <button
                onClick={() => router.push('/quote')}
                className="px-8 py-4 bg-primary-container text-on-primary-container font-headline font-bold rounded-xl hover:shadow-[0_0_30px_rgba(212,255,58,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                {t.processing.viewQuote}
              </button>
            )}
            {isError && (
              <button
                onClick={() => router.push('/dashboard')}
                className="px-8 py-4 bg-primary-container text-on-primary-container font-headline font-bold rounded-xl hover:shadow-[0_0_30px_rgba(212,255,58,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                {t.processing.reupload}
              </button>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
