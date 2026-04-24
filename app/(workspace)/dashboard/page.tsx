'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import UploadModal from '@/features/quote/ui/UploadModal'
import PaywallModal from '@/features/subscription/ui/PaywallModal'
import Toast from '@/components/feedback/Toast'
import Animate from '@/components/feedback/Animate'
import { useLanguage } from '@/contexts/LanguageContext'
import { getSubscription, subscribeSubscription, remainingTrialQuotes, type Subscription } from '@/features/subscription/store'

const metrics = [
  {
    label: 'System Speed',
    value: 'Fast',
    unit: '',
    icon: 'memory',
    bar: 85,
    badge: 'LIVE',
  },
  {
    label: 'Active Projects',
    value: '14',
    unit: 'Sites',
    icon: 'foundation',
    sub: '3 reviews waiting',
  },
  {
    label: 'Money Saved',
    value: '$42k',
    unit: '',
    icon: 'payments',
    trend: '12% more than last time',
  },
]

const logs = [
  { time: '09:42 AM', text: 'System scan updated for', highlight: 'Station 7',  dot: 'bg-white/70' },
  { time: '09:15 AM', text: 'Issue fixed in',           highlight: 'Cooling layout', dot: 'bg-white/40',            highlightColor: 'text-on-surface' },
  { time: '08:50 AM', text: 'Daily structure report created', highlight: '',   dot: 'bg-white/20' },
  { time: '08:22 AM', text: 'Quote PRJ-992-DELTA approved by',     highlight: 'A. Vance',   dot: 'bg-primary shadow-[0_0_8px_rgba(212,255,58,0.6)]',          highlightColor: 'text-primary' },
]

const recentFiles = [
  { name: 'Material_Cost_Report_V2.pdf',    meta: 'Updated 2h ago • 4.2 MB',    icon: 'description',  iconColor: 'text-on-surface' },
  { name: 'South_Wing_Elevation_Scan.png',  meta: 'Updated 5h ago • 18.5 MB',   icon: 'image',        iconColor: 'text-on-surface' },
  { name: 'Vendor_Timeline_Matrix.csv',     meta: 'Updated yesterday • 1.1 MB', icon: 'table_chart',  iconColor: 'text-on-surface' },
  { name: 'CCTP_Skyline_Pavilion_v3.pdf',   meta: 'Updated 2d ago • 9.8 MB',    icon: 'picture_as_pdf', iconColor: 'text-on-surface' },
]

const quickActions = [
  { icon: 'upload_file',   label: 'ADD ASSET', action: 'upload' },
  { icon: 'query_stats',   label: 'RUN SIM',   action: 'sim' },
  { icon: 'share',         label: 'EXPORT',    action: 'export' },
  { icon: 'robot_2',       label: 'ASK AI',    action: 'ai' },
]

export default function DashboardPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [showUpload, setShowUpload] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [sub, setSub] = useState<Subscription | null>(null)

  useEffect(() => {
    setSub(getSubscription())
    return subscribeSubscription(s => setSub({ ...s }))
  }, [])

  const onTrial    = sub?.plan === 'trial'
  const trialLeft  = sub ? remainingTrialQuotes() : 1
  const trialUsed  = onTrial && trialLeft === 0

  const handleQuickAction = (action: string) => {
    if (action === 'upload') { setShowUpload(true); return }
    if (action === 'sim')    { router.push('/processing'); return }
    if (action === 'export') { setToast(t.dashboard.toastExport); return }
    if (action === 'ai')     { setToast(t.dashboard.toastAI); return }
  }

  return (
    <>
      <div className="space-y-14">

        {/* ── Insights Hero ──────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl border border-outline-variant/15 bg-surface-container-lowest px-6 md:px-12 py-16 md:py-20">
          {/* Atmospheric analytics backdrop */}
          <div className="absolute inset-0 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1800&auto=format&fit=crop"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover opacity-[0.42] grayscale contrast-110 scale-x-[-1]"
              style={{ maskImage: 'radial-gradient(ellipse 90% 80% at center, black 40%, transparent 95%)', WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at center, black 40%, transparent 95%)' }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(5,5,5,0.35) 0%, rgba(5,5,5,0.2) 40%, rgba(5,5,5,0.75) 100%)' }} />
          </div>

          {/* Blueprint grid pattern */}
          <div className="absolute inset-0 hero-grid-fine pointer-events-none opacity-60" />

          {/* Ambient glows */}
          <div className="absolute -top-20 -left-20 w-[420px] h-[420px] bg-primary/[0.05] blur-[140px] rounded-full pointer-events-none animate-drift-glow" />
          <div className="absolute -bottom-24 -right-10 w-[440px] h-[440px] bg-primary-fixed/[0.035] blur-[140px] rounded-full pointer-events-none animate-drift-glow" style={{ animationDelay: '3s' }} />

          {/* Radial vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(5,5,5,0.8) 95%)' }} />

          {/* Corner architectural marks */}
          <div className="absolute top-5 left-5 w-16 h-16 pointer-events-none hidden md:block">
            <div className="absolute top-0 left-0 w-8 h-px bg-white/20" />
            <div className="absolute top-0 left-0 w-px h-8 bg-white/20" />
            <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-white/25" />
          </div>
          <div className="absolute top-5 right-5 w-16 h-16 pointer-events-none hidden md:block">
            <div className="absolute top-0 right-0 w-8 h-px bg-white/20" />
            <div className="absolute top-0 right-0 w-px h-8 bg-white/20" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/25" />
          </div>
          <div className="absolute bottom-5 left-5 w-16 h-16 pointer-events-none hidden md:block">
            <div className="absolute bottom-0 left-0 w-8 h-px bg-white/20" />
            <div className="absolute bottom-0 left-0 w-px h-8 bg-white/20" />
          </div>
          <div className="absolute bottom-5 right-5 w-16 h-16 pointer-events-none hidden md:block">
            <div className="absolute bottom-0 right-0 w-8 h-px bg-white/20" />
            <div className="absolute bottom-0 right-0 w-px h-8 bg-white/20" />
          </div>

          {/* Vertical measurement tick marks */}
          <div className="absolute left-3 top-1/3 hidden lg:flex flex-col gap-3 pointer-events-none opacity-40">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`h-px bg-on-surface-variant ${i % 2 === 0 ? 'w-3' : 'w-1.5'}`} />
            ))}
          </div>
          <div className="absolute right-3 top-1/3 hidden lg:flex flex-col gap-3 pointer-events-none opacity-40 items-end">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`h-px bg-on-surface-variant ${i % 2 === 0 ? 'w-3' : 'w-1.5'}`} />
            ))}
          </div>

          <div className="relative z-10 max-w-5xl">
            <Animate variant="fade-in" delay={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container/80 backdrop-blur-md border border-primary/20 mb-6 shadow-[0_0_24px_rgba(212,255,58,0.08)]">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                  {t.dashboard.hubLabel}
                </span>
              </div>
            </Animate>

            <Animate variant="fade-up" delay={80}>
              <h1 className="font-headline font-extrabold text-4xl md:text-6xl lg:text-7xl tracking-tight text-white leading-[1.05] mb-6">
                {t.dashboard.welcome}
              </h1>
            </Animate>

            <Animate variant="fade-up" delay={160}>
              <p className="max-w-2xl text-base md:text-lg text-on-surface-variant leading-relaxed">
                {t.dashboard.bannerDesc}
              </p>
            </Animate>

            {/* Signal ticker */}
            <Animate variant="fade-in" delay={280}>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
                  <span className="text-xs font-bold uppercase tracking-widest">14 sites live</span>
                </div>
                <div className="w-px h-4 bg-outline-variant hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Systems nominal</span>
                </div>
                <div className="w-px h-4 bg-outline-variant hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Synced · 09:42</span>
                </div>
              </div>
            </Animate>
          </div>
        </section>

        {/* ── Trial status strip ─────────────────────────── */}
        {onTrial && (
          <Animate variant="fade-up" as="section">
            <div className={`relative overflow-hidden rounded-2xl border px-6 py-4 flex flex-col md:flex-row md:items-center gap-4 ${
              trialUsed
                ? 'border-amber-500/30 bg-amber-500/[0.06]'
                : 'border-primary/30 bg-primary/[0.06]'
            }`}>
              <div className={`flex items-center gap-3 ${trialUsed ? 'text-amber-300' : 'text-primary'}`}>
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {trialUsed ? 'lock' : 'auto_awesome'}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.25em]">Essai</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-surface">
                  {trialUsed
                    ? 'Votre chiffrage gratuit est utilisé.'
                    : `Il vous reste ${trialLeft} chiffrage gratuit${trialLeft > 1 ? 's' : ''}.`}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {trialUsed
                    ? 'Passez à un plan payant pour générer de nouveaux chiffrage.'
                    : 'Essayez l\u2019estimateur — sans carte de crédit requise.'}
                </p>
              </div>
              <button
                onClick={() => setShowPaywall(true)}
                className={`shrink-0 px-5 py-2.5 rounded-xl font-headline font-black uppercase tracking-[0.15em] text-xs transition-all ${
                  trialUsed
                    ? 'bg-primary text-on-primary hover:shadow-[0_0_24px_rgba(212,255,58,0.45)]'
                    : 'bg-surface-container border border-primary/30 text-primary hover:bg-primary/10'
                }`}
              >
                {trialUsed ? 'Débloquer' : 'Voir les plans'}
              </button>
            </div>
          </Animate>
        )}

        {/* ── Launch estimator banner ────────────────────── */}
        <Animate variant="fade-up" delay={80} as="section">
          <div className="relative overflow-hidden rounded-3xl border border-outline-variant/20 bg-surface-container-lowest">
            <div className="relative rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              {/* Corner brackets */}
              <span className="absolute top-4 left-4 w-4 h-4 border-l border-t border-white/20 pointer-events-none" />
              <span className="absolute top-4 right-4 w-4 h-4 border-r border-t border-white/20 pointer-events-none" />
              <span className="absolute bottom-4 left-4 w-4 h-4 border-l border-b border-white/20 pointer-events-none" />
              <span className="absolute bottom-4 right-4 w-4 h-4 border-r border-b border-white/20 pointer-events-none" />

              {/* Tier label */}
              <span className="absolute top-5 right-16 text-[10px] font-mono font-bold tracking-[0.3em] text-primary/70 hidden md:block">
                OPERATIONS · LIVE
              </span>

              <div className="space-y-4 max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Ready</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-headline font-extrabold tracking-tight">
                  {t.dashboard.bannerTitle}
                </h2>
                <p className="text-on-surface-variant leading-relaxed">
                  {t.dashboard.bannerDesc}
                </p>
              </div>
              <button
                onClick={() => setShowUpload(true)}
                className="group relative whitespace-nowrap bg-primary text-on-primary px-8 md:px-10 py-4 md:py-5 rounded-xl font-headline font-black uppercase tracking-[0.2em] text-sm hover:shadow-[0_0_40px_rgba(212,255,58,0.45)] active:scale-95 transition-all duration-300 inline-flex items-center gap-3 z-10"
              >
                {t.dashboard.launchEstimator}
                <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-0.5">arrow_forward</span>
              </button>
            </div>
          </div>
        </Animate>

        {/* ── Metric cards ───────────────────────────────── */}
        <section>
          <Animate variant="fade-up" className="mb-6 flex items-end justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container/80 backdrop-blur-md border border-primary/20 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Telemetry</span>
              </div>
              <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight">Live Signal</h2>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[10px] font-mono font-bold tracking-[0.25em] text-on-surface-variant/70">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              STREAMING
            </div>
          </Animate>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Grid corner brackets */}
            <div className="pointer-events-none absolute -top-3 -left-3 w-6 h-6 hidden md:block">
              <div className="absolute top-0 left-0 w-4 h-px bg-white/20" />
              <div className="absolute top-0 left-0 w-px h-4 bg-white/20" />
            </div>
            <div className="pointer-events-none absolute -top-3 -right-3 w-6 h-6 hidden md:block">
              <div className="absolute top-0 right-0 w-4 h-px bg-white/20" />
              <div className="absolute top-0 right-0 w-px h-4 bg-white/20" />
            </div>
            <div className="pointer-events-none absolute -bottom-3 -left-3 w-6 h-6 hidden md:block">
              <div className="absolute bottom-0 left-0 w-4 h-px bg-white/20" />
              <div className="absolute bottom-0 left-0 w-px h-4 bg-white/20" />
            </div>
            <div className="pointer-events-none absolute -bottom-3 -right-3 w-6 h-6 hidden md:block">
              <div className="absolute bottom-0 right-0 w-4 h-px bg-white/20" />
              <div className="absolute bottom-0 right-0 w-px h-4 bg-white/20" />
            </div>

            {metrics.map((m, i) => {
              const metric = t.dashboard.metrics[i]

              return (
              <Animate
                key={m.icon}
                variant="fade-up"
                delay={i * 80}
                className="group relative bg-surface-container rounded-2xl p-7 pt-10 border border-outline-variant/10 hover:bg-surface-container-high hover:-translate-y-1 hover:border-white/15 transition-all duration-500 overflow-hidden"
              >
                {/* Mono index */}
                <span className="absolute top-5 right-6 text-[10px] font-mono font-bold tracking-[0.25em] text-on-surface-variant/50 group-hover:text-primary/80 transition-colors">
                  {String(i + 1).padStart(2, '0')} / 03
                </span>
                {/* Corner bracket */}
                <span className="absolute top-4 left-4 w-4 h-4 border-l border-t border-primary/25 group-hover:border-primary/60 transition-colors" />

                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-primary">
                    {metric.label}
                  </span>
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-surface-container-lowest border border-white/10 flex items-center justify-center group-hover:border-primary/35 transition-all">
                      <span
                        className="material-symbols-outlined text-on-surface"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {m.icon}
                      </span>
                    </div>
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-primary/70 group-hover:bg-primary transition-colors" />
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-headline font-extrabold tracking-tighter text-white">{m.value}</span>
                  {m.unit && <span className="text-on-surface-variant text-sm font-medium">{m.unit}</span>}
                </div>

                {m.bar !== undefined && (
                  <div className="mt-5 flex items-center gap-2">
                    <div className="h-1 flex-1 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary shadow-[0_0_10px_rgba(212,255,58,0.45)] rounded-full"
                        style={{ width: `${m.bar}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-primary tracking-widest">{m.badge}</span>
                  </div>
                )}
                {metric.sub && <p className="mt-5 text-xs text-on-surface-variant leading-relaxed">{metric.sub}</p>}
                {metric.trend && (
                  <div className="mt-5 flex items-center gap-1 text-[10px] font-bold text-primary">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    <span className="tracking-wide">{metric.trend}</span>
                  </div>
                )}

                {/* Bottom meta strip */}
                <div className="flex items-center gap-2 pt-5 mt-5 border-t border-white/5">
                  <span className="w-1 h-1 rounded-full bg-primary/60" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                    {i === 0 ? 'Neural uptime' : i === 1 ? 'Live rosters' : 'Rolling 30d'}
                  </span>
                </div>
              </Animate>
            )})}
          </div>
        </section>

        {/* ── Blueprint preview + System status ──────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Blueprint image */}
          <Animate variant="slide-left" className="lg:col-span-8 group relative overflow-hidden rounded-3xl bg-surface-container shadow-2xl border border-outline-variant/10 transition-all duration-700">
            <span className="absolute top-4 left-4 w-4 h-4 border-l border-t border-white/25 z-30 pointer-events-none" />
            <span className="absolute top-4 right-4 w-4 h-4 border-r border-t border-white/25 z-30 pointer-events-none" />
            <span className="absolute bottom-4 left-4 w-4 h-4 border-l border-b border-white/25 z-30 pointer-events-none" />
            <span className="absolute bottom-4 right-4 w-4 h-4 border-r border-b border-white/25 z-30 pointer-events-none" />

            <span className="absolute top-5 right-12 z-30 font-mono text-[10px] tracking-[0.3em] text-primary/80 font-bold">
              BLUEPRINT · 01
            </span>

            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/60 to-transparent opacity-90 z-10 pointer-events-none" />
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiCwLYs6qCWWwoGJTQO_qErOUa35Um9F-wmhf_arPouMPIUrs4YIGaCsKz5_BKMq6Hc8QTfteA_NG0cORZfC8Ca9LY3om2FILrybUOp_7kws7KrhDjFMnY0Raohjyv2Fhld5YZSLvlrvYcmcc0UpxZ8SwhSXKN4Ey7ta08tH0AfJjB5Gb80u8V-Qah2HSOkzR7WK2JCKX24AEdbxncuzP2uRCdo9Nn_ijJ2UifrTZ12MeJoKcP1TTfqkPfiA09h-wxLO_PG2EEoYs"
              alt="Active blueprint"
              className="w-full h-[400px] md:h-[520px] object-cover transition-transform duration-1000 group-hover:scale-105 grayscale contrast-110"
            />
            {/* Animated scan line — kept lime as the one living accent */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#d4ff3a] animate-scan z-20 pointer-events-none" />

            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 z-20">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container/80 backdrop-blur-md border border-primary/25 rounded-full mb-4 shadow-[0_0_20px_rgba(212,255,58,0.08)]">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-bold tracking-[0.25em] text-primary uppercase">
                      {t.dashboard.activeBlueprint}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-white tracking-tight mb-3">
                    {t.dashboard.centralTech}
                  </h2>
                  <p className="text-on-surface-variant max-w-md leading-relaxed">
                    {t.dashboard.phaseDesc}
                  </p>
                </div>
                <Link
                  href="/processing"
                  className="group/btn shrink-0 bg-primary text-on-primary px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-[0.2em] inline-flex items-center gap-2 hover:shadow-[0_0_30px_rgba(212,255,58,0.5)] active:scale-95 transition-all"
                >
                  {t.dashboard.viewAnalysis}
                  <span className="material-symbols-outlined text-base transition-transform group-hover/btn:translate-x-0.5">arrow_forward</span>
                </Link>
              </div>
            </div>
          </Animate>

          {/* System status feed */}
          <Animate variant="slide-right" delay={80} className="lg:col-span-4 relative">
            <div className="bg-surface-container-low p-7 rounded-2xl border border-outline-variant/10 h-full flex flex-col relative overflow-hidden">
              <span className="absolute top-4 left-4 w-4 h-4 border-l border-t border-white/15 pointer-events-none" />
              <span className="absolute top-5 right-6 text-[10px] font-mono font-bold tracking-[0.25em] text-on-surface-variant/60">
                FEED · LIVE
              </span>

              <div className="flex items-center justify-between mb-6 mt-4">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-primary">Channel 01</span>
                  <h3 className="text-xl font-headline font-bold text-white tracking-tight mt-0.5">{t.dashboard.systemStatus}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-surface-container-lowest border border-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>sensors</span>
                </div>
              </div>

              <div className="flex-1 space-y-0 overflow-y-auto">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${log.dot}`} />
                      {i < logs.length - 1 && (
                        <div className="w-px flex-1 bg-outline-variant/30 my-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <span className="text-[10px] font-mono font-bold text-on-surface-variant/70 block mb-1 tracking-[0.2em]">
                        {log.time}
                      </span>
                      <p className="text-sm text-on-surface leading-snug font-medium">
                        {t.dashboard.logs[i].text}{' '}
                        {t.dashboard.logs[i].highlight && (
                          <span className={log.highlightColor || 'text-on-surface'}>{t.dashboard.logs[i].highlight}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setToast(t.dashboard.toastLogs)}
                className="w-full py-4 mt-4 border border-outline-variant/20 rounded-xl text-[10px] font-bold tracking-[0.25em] uppercase text-on-surface-variant hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all inline-flex items-center justify-center gap-2"
              >
                {t.dashboard.viewFullLogs}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </Animate>
        </section>

        {/* ── Project timeline ──────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Animate variant="fade-up" className="group md:col-span-2 bg-surface-container rounded-2xl p-8 pt-10 border border-outline-variant/10 relative overflow-hidden transition-all duration-500">
            <span className="absolute top-4 left-4 w-4 h-4 border-l border-t border-white/15 group-hover:border-white/30 transition-colors" />
            <span className="absolute top-5 right-6 text-[10px] font-mono font-bold tracking-[0.25em] text-on-surface-variant/50">
              PHASE · 02/03
            </span>

            <div className="flex justify-between items-end mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-on-surface-variant">
                    {t.dashboard.activePhase}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-headline font-extrabold tracking-tight">
                  {t.dashboard.projectTimeline}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-5xl md:text-6xl font-headline font-black text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #d4ff3a 0%, #e8ff7a 50%, #c7f536 100%)' }}>68%</span>
                <div className="text-[10px] font-mono font-bold tracking-[0.3em] text-on-surface-variant/60 mt-1">COMPLETE</div>
              </div>
            </div>

            <div className="relative h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full rounded-full w-[68%] shadow-[0_0_15px_rgba(212,255,58,0.5)]" style={{ backgroundImage: 'linear-gradient(to right, #e8ff7a, #d4ff3a)' }} />
              {/* Flow dot marks the live position */}
              <div className="absolute top-1/2 -translate-y-1/2 left-[68%] w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(212,255,58,0.9)] -translate-x-1/2" />
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-xs font-bold uppercase tracking-[0.2em] font-headline">
              <div className="flex flex-col gap-1.5 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                <span className="text-on-surface-variant">{t.dashboard.sitePrep}</span>
                <span className="text-[9px] font-mono text-on-surface-variant/70">COMPLETE</span>
              </div>
              <div className="flex flex-col gap-1.5 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-primary">{t.dashboard.structuralFraming}</span>
                <span className="text-[9px] font-mono text-primary/80">IN PROGRESS</span>
              </div>
              <div className="flex flex-col gap-1.5 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                <span className="text-on-surface-variant/60">{t.dashboard.interiorFinish}</span>
                <span className="text-[9px] font-mono text-on-surface-variant/50">QUEUED</span>
              </div>
            </div>
          </Animate>

          <Animate variant="fade-up" delay={120} className="group bg-surface-container-high rounded-2xl p-8 pt-10 border border-outline-variant/10 flex flex-col justify-between relative overflow-hidden">
            <span className="absolute top-4 left-4 w-4 h-4 border-l border-t border-white/15 group-hover:border-white/30 transition-colors" />
            <span className="absolute top-5 right-6 text-[10px] font-mono font-bold tracking-[0.25em] text-on-surface-variant/50">
              LOGISTICS
            </span>

            <div className="w-12 h-12 rounded-xl bg-surface-container-lowest border border-white/10 flex items-center justify-center group-hover:border-white/25 transition-all">
              <span className="material-symbols-outlined text-on-surface" style={{ fontVariationSettings: "'FILL' 1" }}>conveyor_belt</span>
            </div>

            <div className="mt-8">
              <div className="text-4xl md:text-5xl font-headline font-black tracking-tighter text-white">12.4k</div>
              <div className="text-on-surface-variant text-xs font-bold uppercase tracking-[0.2em] mt-2">
                {t.dashboard.unitsInTransit}
              </div>
              <div className="flex items-center gap-2 pt-5 mt-5 border-t border-white/5">
                <span className="w-1 h-1 rounded-full bg-white/40" />
                <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                  Rolling fleet
                </span>
              </div>
            </div>
          </Animate>
        </section>

        {/* ── Quick actions + Recent files ───────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Quick actions */}
          <Animate variant="fade-up" className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container/80 backdrop-blur-md border border-primary/20 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Controls</span>
              </div>
              <h3 className="text-xl font-headline font-bold tracking-tight text-white">
                {t.dashboard.quickEngine}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((a, i) => (
                <button
                  key={a.action}
                  onClick={() => handleQuickAction(a.action)}
                  className="group relative bg-surface-container h-28 rounded-2xl border border-outline-variant/10 flex flex-col items-center justify-center gap-2.5 hover:bg-surface-container-high hover:border-white/15 transition-all active:scale-95 overflow-hidden"
                >
                  <span className="absolute top-2 left-2 w-3 h-3 border-l border-t border-white/15 group-hover:border-white/30 transition-colors" />
                  <span className="absolute bottom-2 right-2 text-[9px] font-mono font-bold tracking-[0.25em] text-on-surface-variant/40">
                    0{i + 1}
                  </span>

                  <div className="w-11 h-11 rounded-xl bg-surface-container-lowest border border-white/10 flex items-center justify-center group-hover:border-white/25 transition-all">
                    <span className="material-symbols-outlined text-on-surface group-hover:scale-110 transition-transform">
                      {a.icon}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.15em] text-on-surface">{t.dashboard.quickActions[i]}</span>
                </button>
              ))}
            </div>
          </Animate>

          {/* Recent files */}
          <Animate variant="fade-up" delay={100} className="group lg:col-span-2 bg-surface-container rounded-3xl p-8 pt-10 border border-outline-variant/10 relative overflow-hidden">
            <span className="absolute top-4 left-4 w-4 h-4 border-l border-t border-white/15 group-hover:border-white/30 transition-colors" />
            <span className="absolute top-5 right-6 text-[10px] font-mono font-bold tracking-[0.25em] text-on-surface-variant/50">
              ARCHIVE · 04
            </span>

            <div className="flex justify-between items-end mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Library</span>
                </div>
                <h3 className="text-xl md:text-2xl font-headline font-extrabold text-white tracking-tight">{t.dashboard.recentArtifacts}</h3>
              </div>
              <Link href="/quote" className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary hover:text-white transition-colors inline-flex items-center gap-1.5">
                {t.dashboard.viewAll}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="space-y-1">
              {recentFiles.map((f, i) => (
                <div
                  key={f.name}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-high transition-all cursor-pointer group/row border border-transparent hover:border-primary/15"
                  onClick={() => setToast(`Opening ${f.name}…`)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-on-surface-variant/50 w-8 shrink-0">
                      0{i + 1}
                    </span>
                    <div className="h-11 w-11 bg-surface-container-lowest rounded-xl flex items-center justify-center border border-outline-variant/10 group-hover/row:border-primary/35 shrink-0 transition-all">
                      <span className={`material-symbols-outlined ${f.iconColor}`}>{f.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{f.name}</h4>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.15em] mt-0.5">
                        {f.meta}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover/row:opacity-100 group-hover/row:text-primary transition-all">
                    arrow_forward
                  </span>
                </div>
              ))}
            </div>
          </Animate>
        </section>

        {/* ── Blueprint upload zone ──────────────────────── */}
        <Animate variant="fade-up" as="section">
          <button
            onClick={() => setShowUpload(true)}
            className="group relative w-full rounded-3xl bg-surface-container-lowest/40 p-1 overflow-hidden border border-outline-variant/15"
          >
            {/* Corner brackets */}
            <span className="absolute top-3 left-3 w-5 h-5 border-l border-t border-white/20 z-10" />
            <span className="absolute top-3 right-3 w-5 h-5 border-r border-t border-white/20 z-10" />
            <span className="absolute bottom-3 left-3 w-5 h-5 border-l border-b border-white/20 z-10" />
            <span className="absolute bottom-3 right-3 w-5 h-5 border-r border-b border-white/20 z-10" />

            {/* Tier label */}
            <span className="absolute top-4 right-10 text-[10px] font-mono font-bold tracking-[0.3em] text-on-surface-variant/60 z-10">
              INTAKE
            </span>

            {/* Subtle ambient grid */}
            <div className="absolute inset-0 hero-grid-fine opacity-30 pointer-events-none" />

            <div className="relative rounded-[calc(1.5rem-4px)] border-2 border-dashed border-outline-variant/30 p-16 flex flex-col items-center justify-center gap-6 group-hover:border-primary/45 transition-colors">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-surface-container border border-white/10 flex items-center justify-center group-hover:scale-105 group-hover:border-primary/40 group-hover:shadow-[0_0_30px_rgba(212,255,58,0.25)] transition-all duration-500">
                  <span className="material-symbols-outlined text-primary text-4xl">cloud_upload</span>
                </div>
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary/80 group-hover:shadow-[0_0_10px_rgba(212,255,58,0.9)] animate-pulse" />
              </div>

              <div className="text-center space-y-2">
                <h4 className="text-xl md:text-2xl font-headline font-extrabold tracking-tight">
                  {t.dashboard.dropBlueprints}
                </h4>
                <p className="text-on-surface-variant text-sm max-w-sm mx-auto leading-relaxed">
                  {t.dashboard.dropDesc}
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-outline-variant/40 text-[10px] font-bold text-on-surface uppercase tracking-[0.25em] group-hover:border-primary/50 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                {t.dashboard.browseFiles}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>

              {/* Supported types */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-[9px] font-mono font-bold tracking-[0.3em] text-on-surface-variant/60">
                <span>PDF</span>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <span>DWG</span>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <span>IFC</span>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <span>REVIT</span>
              </div>
            </div>
          </button>
        </Animate>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} reason="upgrade" />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  )
}
