'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { subscribe, getState, type ExtractionState, type ExtractionStage } from '@/features/quote/store'

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
    <>
      <main className="min-h-[80vh] pb-32 px-6 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Ambient mesh */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 30% 40%, rgba(212,255,58,0.12) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(168,255,90,0.08) 0%, transparent 60%)',
          }}
        />

        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

          {/* Left: Blueprint preview with scan */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/20 shadow-2xl">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent opacity-70 pointer-events-none z-10" />
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAt1rZXIaYWTXngSOCM60O7RaF61YA1luM13x5Tpf1qzpHBcLIHzMkXBLmsaA_dJohq1Rs4y5OwI6s_dldStMsbtgOeIQ5Xe3EUB8zpGVUWecvvnrM5QZn6jqdqOCwPs2hf-FTM5Q52QOWgMu-BJek7_0zlFvlpBJOnP3_p2EJDZBFvo9qPLQJAouQY3iRh0ph-nf-A7F9UhuPr0K_2OBEb-u09fbBpojUWi1SekKwdtERKto5fdm5imAuN7g3Ntk_UukVuPwQUZ6I"
                alt="Blueprint preview"
                className="w-full h-[420px] object-cover opacity-50"
              />
              {/* Vertical scan bar */}
              {!done && !isError && (
                <div
                  className="absolute top-0 left-0 w-0.5 h-full z-20"
                  style={{
                    background: 'linear-gradient(to bottom, transparent, #d4ff3a, transparent)',
                    animation: 'scan-vertical 3s linear infinite',
                  }}
                />
              )}
              {/* Horizontal scan bar */}
              {!done && !isError && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_#d4ff3a] animate-scan z-20" />
              )}
              {/* Data annotation badges */}
              <div className="absolute top-1/4 left-1/4 p-2 bg-primary-container/20 backdrop-blur-md border border-primary/30 rounded text-[10px] text-primary font-mono tracking-tighter z-20">
                POSTE : ALIMENTATION EF/EC
              </div>
              <div className="absolute bottom-1/3 right-1/5 p-2 bg-primary-container/20 backdrop-blur-md border border-primary/30 rounded text-[10px] text-primary font-mono tracking-tighter z-20">
                LOT 09 — PLOMBERIE
              </div>
              <div className="absolute top-2/3 left-1/2 -translate-x-1/2 p-2 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 rounded text-[10px] text-emerald-400 font-mono tracking-tighter z-20">
                MATÉRIAU : PER Ø32
              </div>

              {/* Done overlay */}
              {done && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface-container-lowest/60 backdrop-blur-sm">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-emerald-400 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    </div>
                    <p className="text-emerald-400 font-headline font-bold text-sm tracking-widest uppercase">{t.processing.complete}</p>
                  </div>
                </div>
              )}

              {/* Error overlay */}
              {isError && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface-container-lowest/70 backdrop-blur-sm">
                  <div className="text-center space-y-3 px-6">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-red-400 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        error
                      </span>
                    </div>
                    <p className="text-red-400 font-headline font-bold text-sm tracking-widest uppercase">Analyse échouée</p>
                  </div>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs font-mono text-on-surface-variant">
                <span>PROGRESS</span>
                <span className="text-primary">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-container to-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {fileName && (
                <p className="text-[10px] text-on-surface-variant/60 font-mono truncate pt-1">
                  <span className="material-symbols-outlined text-[11px] align-middle mr-1">picture_as_pdf</span>
                  {fileName}
                </p>
              )}
            </div>
          </div>

          {/* Right: Orbital spinner + steps */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left">

            {/* Animated orbital spinner */}
            <div className="mb-10 relative">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-primary/10 rounded-full" />
                <div className={`absolute inset-0 border-t-2 border-primary rounded-full ${done || isError ? '' : 'animate-spin-slow'}`} />
                <div className={`absolute inset-3 border border-secondary/20 rounded-full ${done || isError ? '' : 'animate-spin-reverse'}`} />
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
              {isError ? '— ANALYSE ÉCHOUÉE —' : done ? `— ${t.processing.complete2} —` : `— ${t.processing.analyzing2} —`}
            </div>
            <h1 className="font-headline font-black text-4xl md:text-5xl tracking-tighter text-on-surface mb-8 uppercase">
              {isError ? 'Extraction échouée' : done ? t.processing.complete2 : t.processing.analyzing}
            </h1>
            {isError && (
              <p className="text-sm text-red-400 mb-6 max-w-lg leading-relaxed">{errorMsg}</p>
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

            {/* CTA when done or error */}
            <div className={`mt-8 transition-all duration-700 ${done || isError ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
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
        </div>

        <style>{`
          @keyframes scan-vertical {
            0%   { transform: translateX(0); }
            100% { transform: translateX(calc(100vw)); }
          }
        `}</style>
      </main>
    </>
  )
}
