'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import { useLanguage } from '@/contexts/LanguageContext'

const stepMeta = [
  { icon: 'description', duration: 1800 },
  { icon: 'account_tree', duration: 2200 },
  { icon: 'layers', duration: 2000 },
  { icon: 'currency_exchange', duration: 1600 },
  { icon: 'request_quote', duration: 1400 },
]

export default function ProcessingPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [done, setDone]               = useState(false)
  const [progress, setProgress]       = useState(0)

  // Auto-advance through steps on mount
  useEffect(() => {
    let cancelled = false
    let stepIndex = 0
    let elapsed = 0
    const totalDuration = stepMeta.reduce((acc, s) => acc + s.duration, 0)

    const advance = () => {
      if (cancelled || stepIndex >= stepMeta.length) return
      setCurrentStep(stepIndex)
      const stepDuration = stepMeta[stepIndex].duration

      // Animate progress bar within this step
      const startProgress = (elapsed / totalDuration) * 100
      const endProgress   = ((elapsed + stepDuration) / totalDuration) * 100
      const tickInterval  = 50
      const ticks = stepDuration / tickInterval
      let tick = 0

      const progressTimer = setInterval(() => {
        tick++
        const p = startProgress + ((endProgress - startProgress) * tick) / ticks
        setProgress(Math.min(p, 100))
        if (tick >= ticks) clearInterval(progressTimer)
      }, tickInterval)

      setTimeout(() => {
        if (cancelled) return
        elapsed += stepDuration
        stepIndex++
        if (stepIndex >= stepMeta.length) {
          setCurrentStep(stepMeta.length) // all done
          setProgress(100)
          setTimeout(() => {
            if (!cancelled) setDone(true)
          }, 600)
        } else {
          advance()
        }
      }, stepDuration)
    }

    advance()
    return () => { cancelled = true }
  }, [])

  return (
    <AppLayout>

      <main className="min-h-[80vh] pb-32 px-6 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Ambient mesh */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 30% 40%, rgba(46,91,255,0.12) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(23,41,114,0.1) 0%, transparent 60%)',
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
                alt="Technical architectural blueprint"
                className="w-full h-[420px] object-cover opacity-50"
              />
              {/* Vertical scan bar */}
              {!done && (
                <div
                  className="absolute top-0 left-0 w-0.5 h-full z-20"
                  style={{
                    background: 'linear-gradient(to bottom, transparent, #2e5bff, transparent)',
                    animation: 'scan-vertical 3s linear infinite',
                  }}
                />
              )}
              {/* Horizontal scan bar */}
              {!done && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_#2e5bff] animate-scan z-20" />
              )}
              {/* Data annotation badges */}
              <div className="absolute top-1/4 left-1/4 p-2 bg-primary-container/20 backdrop-blur-md border border-primary/30 rounded text-[10px] text-primary font-mono tracking-tighter z-20">
                STRUCTURAL_COLUMN_V2 [REF: 902]
              </div>
              <div className="absolute bottom-1/3 right-1/5 p-2 bg-primary-container/20 backdrop-blur-md border border-primary/30 rounded text-[10px] text-primary font-mono tracking-tighter z-20">
                LOAD_BEARING_CALC: PASS
              </div>
              <div className="absolute top-2/3 left-1/2 -translate-x-1/2 p-2 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 rounded text-[10px] text-emerald-400 font-mono tracking-tighter z-20">
                MAT_SPEC: GRADE-50 STEEL
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
            </div>

            {/* Progress bar */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs font-mono text-on-surface-variant">
                <span>ANALYSIS PROGRESS</span>
                <span className="text-primary">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-container to-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Steps + orbital */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left">

            {/* Animated orbital spinner */}
            <div className="mb-10 relative">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-primary/10 rounded-full" />
                <div className={`absolute inset-0 border-t-2 border-primary rounded-full ${done ? '' : 'animate-spin-slow'}`} />
                <div className={`absolute inset-3 border border-secondary/20 rounded-full ${done ? '' : 'animate-spin-reverse'}`} />
                <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(46,91,255,0.35)] relative">
                  {!done && <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />}
                  <span
                    className="material-symbols-outlined text-white text-3xl relative z-10"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {done ? 'task_alt' : 'cognition'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-2 text-[10px] font-mono text-primary tracking-[0.3em] uppercase">
              {done ? `- ${t.processing.complete2} -` : `- ${t.processing.analyzing2} -`}
            </div>
            <h1 className="font-headline font-black text-4xl md:text-5xl tracking-tighter text-on-surface mb-8 uppercase">
              {done ? (
                <>{t.processing.complete2}</>
              ) : (
                <>{t.processing.analyzing}</>
              )}
            </h1>

            {/* Steps list */}
            <div className="w-full space-y-3 max-w-md">
              {stepMeta.map((s, i) => {
                const isDone    = i < currentStep
                const isActive  = i === currentStep && !done
                const isPending = i > currentStep

                return (
                  <div
                    key={`${s.icon}-${i}`}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                      isDone
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : isActive
                        ? 'bg-surface-container border-primary/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
                        : 'bg-surface-container/20 border-white/5 opacity-40'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isActive
                          ? 'bg-primary/20 text-primary'
                          : 'bg-slate-700/20 text-slate-500'
                      }`}
                    >
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

            {/* CTA when done */}
            <div className={`mt-8 transition-all duration-700 ${done ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <button
                onClick={() => router.push('/quote')}
                className="px-8 py-4 bg-primary-container text-on-primary-container font-headline font-bold rounded-xl hover:shadow-[0_0_30px_rgba(46,91,255,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                {t.processing.viewQuote}
              </button>
            </div>
          </div>
        </div>

        {/* AI Foreman Insight card */}
        <div className="mt-20 max-w-4xl w-full bg-surface-variant/30 backdrop-blur-2xl p-8 rounded-2xl border border-outline-variant/15 shadow-2xl relative overflow-hidden z-10">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <span className="material-symbols-outlined text-8xl">format_quote</span>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
            <div className="w-14 h-14 shrink-0 bg-primary-container rounded-xl flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-on-primary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>engineering</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-headline font-extrabold text-primary text-[10px] tracking-[0.2em] uppercase">
                AI Foreman Insights
              </h3>
              <p className="text-on-surface-variant font-medium text-base leading-relaxed italic">
                "Structural integrity analysis indicates a 14% optimization opportunity in the
                load-bearing beams. Re-calculating material stress requirements to ensure maximum
                safety with minimum waste."
              </p>
              <div className="flex gap-2 items-center text-[10px] font-bold tracking-widest uppercase mt-2">
                <span className={`w-1.5 h-1.5 rounded-full ${done ? 'bg-emerald-500' : 'bg-primary animate-pulse'}`} />
                <span className={done ? 'text-emerald-400' : 'text-primary'}>
                  {done ? 'CALCULATION COMPLETE' : 'LIVE NEURAL CALCULATION IN PROGRESS'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes scan-vertical {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(100vw)); }
        }
      `}</style>
    </AppLayout>
  )
}
