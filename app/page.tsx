'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import MobileNav from '@/components/MobileNav'
import Modal from '@/components/Modal'
import Animate from '@/components/Animate'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LandingPage() {
  const { t } = useLanguage()
  const [showDemo, setShowDemo] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState<string | null>(null)

  const features = [
    { icon: 'layers', ...t.landing.features[0] },
    { icon: 'currency_exchange', ...t.landing.features[1] },
    { icon: 'timeline', ...t.landing.features[2] },
  ]

  const plans = t.landing.plans.map((plan, index) => ({
    ...plan,
    featured: index === 1,
  }))

  return (
    <>
      <Navbar />

      <main className="pt-24">

        {/* ── Hero ──────────────────────────────────────── */}
        <section className="relative min-h-[795px] flex flex-col items-center justify-center px-6 text-center overflow-hidden py-24">
          {/* Atmospheric architectural backdrop */}
          <div className="absolute inset-0 pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1800&auto=format&fit=crop"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover opacity-[0.32] grayscale contrast-125"
              style={{ maskImage: 'radial-gradient(ellipse 85% 75% at center, black 25%, transparent 85%)', WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at center, black 25%, transparent 85%)' }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(5,5,5,0.45) 0%, rgba(5,5,5,0.25) 40%, rgba(5,5,5,0.8) 100%)' }} />
            <div className="absolute inset-0 mix-blend-color" style={{ background: 'radial-gradient(ellipse at center, rgba(212,255,58,0.06), transparent 70%)' }} />
          </div>

          {/* Blueprint grid pattern */}
          <div className="absolute inset-0 hero-grid-bg pointer-events-none" />
          <div className="absolute inset-0 hero-grid-fine pointer-events-none" />

          {/* Ambient glows */}
          <div className="absolute top-[15%] left-[15%] w-[520px] h-[520px] bg-primary/[0.055] blur-[140px] rounded-full pointer-events-none animate-drift-glow" />
          <div className="absolute bottom-[20%] right-[12%] w-[480px] h-[480px] bg-primary-fixed/[0.04] blur-[140px] rounded-full pointer-events-none animate-drift-glow" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/[0.02] blur-[160px] rounded-full pointer-events-none" />

          {/* Radial vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,5,5,0.85) 95%)' }} />

          {/* Corner architectural marks */}
          <div className="absolute top-28 left-8 w-20 h-20 pointer-events-none hidden lg:block">
            <div className="absolute top-0 left-0 w-10 h-px bg-primary/35" />
            <div className="absolute top-0 left-0 w-px h-10 bg-primary/35" />
            <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-primary/40" />
          </div>
          <div className="absolute top-28 right-8 w-20 h-20 pointer-events-none hidden lg:block">
            <div className="absolute top-0 right-0 w-10 h-px bg-primary/35" />
            <div className="absolute top-0 right-0 w-px h-10 bg-primary/35" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary/40" />
          </div>
          <div className="absolute bottom-8 left-8 w-20 h-20 pointer-events-none hidden lg:block">
            <div className="absolute bottom-0 left-0 w-10 h-px bg-primary/35" />
            <div className="absolute bottom-0 left-0 w-px h-10 bg-primary/35" />
          </div>
          <div className="absolute bottom-8 right-8 w-20 h-20 pointer-events-none hidden lg:block">
            <div className="absolute bottom-0 right-0 w-10 h-px bg-primary/35" />
            <div className="absolute bottom-0 right-0 w-px h-10 bg-primary/35" />
          </div>

          {/* Vertical measurement tick marks */}
          <div className="absolute left-4 top-1/3 hidden lg:flex flex-col gap-3 pointer-events-none opacity-40">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`h-px bg-on-surface-variant ${i % 2 === 0 ? 'w-4' : 'w-2'}`} />
            ))}
          </div>
          <div className="absolute right-4 top-1/3 hidden lg:flex flex-col gap-3 pointer-events-none opacity-40 items-end">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`h-px bg-on-surface-variant ${i % 2 === 0 ? 'w-4' : 'w-2'}`} />
            ))}
          </div>

          <div className="relative z-10 max-w-5xl mx-auto">
            {/* Live badge */}
            <Animate variant="fade-in" delay={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container/80 backdrop-blur-md border border-primary/20 mb-8 shadow-[0_0_30px_rgba(212,255,58,0.1)]">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {t.landing.badge}
                </span>
              </div>
            </Animate>

            <Animate variant="fade-up" delay={80}>
              <h1 className="font-headline font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight text-white mb-8 leading-[1.05]">
                {t.landing.heroTitle}{' '}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #d4ff3a 0%, #e8ff7a 50%, #c7f536 100%)' }}>
                  {t.landing.heroBold}
                </span>
              </h1>
            </Animate>

            <Animate variant="fade-up" delay={180}>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-on-surface-variant mb-12 leading-relaxed">
                {t.landing.heroDesc}
              </p>
            </Animate>

            <Animate variant="fade-up" delay={280}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Link
                href="/auth"
                className="group relative w-full sm:w-auto px-10 py-5 bg-primary text-on-primary font-headline font-bold rounded-xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,255,58,0.4)] active:scale-95 text-center"
              >
                {t.landing.startTrial}
              </Link>
              <button
                onClick={() => setShowDemo(true)}
                className="w-full sm:w-auto px-10 py-5 bg-surface-variant/40 backdrop-blur-md border border-outline-variant/30 text-white font-headline font-bold rounded-xl hover:bg-surface-variant/60 transition-all active:scale-95"
              >
                {t.landing.watchDemo}
              </button>
            </div>
            </Animate>

            {/* Trust ticker */}
            <Animate variant="fade-in" delay={420}>
              <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="text-xs font-bold uppercase tracking-widest">450+ firms</span>
                </div>
                <div className="w-px h-4 bg-outline-variant hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                  <span className="text-xs font-bold uppercase tracking-widest">&lt; 4s quotes</span>
                </div>
                <div className="w-px h-4 bg-outline-variant hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">shield</span>
                  <span className="text-xs font-bold uppercase tracking-widest">99.8% accuracy</span>
                </div>
              </div>
            </Animate>
          </div>

          {/* Bento hero visualisation */}
          <Animate variant="fade-up" delay={100} className="relative mt-24 w-full max-w-6xl mx-auto px-4">
            {/* Floating AI badge */}
            <div className="absolute -top-6 right-4 md:right-10 glass-panel p-4 rounded-xl border border-white/10 flex items-center gap-3 z-20">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface">auto_awesome</span>
              </div>
              <div>
                <div className="text-xs text-on-surface-variant font-bold uppercase tracking-wide">{t.landing.accuracyCheck}</div>
                <div className="text-sm font-bold text-on-surface">{t.landing.precisionRate}</div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 h-[380px] md:h-[520px]">
              {/* Main engine card */}
              <div className="col-span-12 md:col-span-8 relative rounded-3xl overflow-hidden border border-outline-variant/20 bg-surface-container/30 backdrop-blur-xl p-8 group">
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ background: 'radial-gradient(at 0% 0%, #d4ff3a 0px, transparent 50%), radial-gradient(at 100% 0%, #e8ff7a 0px, transparent 50%), radial-gradient(at 100% 100%, #000000 0px, transparent 50%)' }}
                />
                <div className="relative h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline text-2xl font-bold mb-1">
                        {t.landing.neuralProcessor}
                      </h3>
                      <p className="text-sm text-on-surface-variant uppercase tracking-widest">
                        {t.landing.activeScanning}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-4xl text-on-surface">biotech</span>
                  </div>
                  <div className="w-full h-2/3 mt-6 relative">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvQGMi6iUa6tpBsfR0otxsJL7RAl7Va4I1dgvGLO1dyzrXpSRR4s2Wk4C9_o2bBg3Utp1DBDMFcojAimFyLw8QHp2XvXugHTRsdrCdo8cIa8CjJXF8yTXa6JTlUa8-EeTJlpor80uPM6-2AmnNMXpoBr9h8X0_k2aO43JQGwS_FCqjctUZeyAaVivZzAUktUO6ogCGUYCkaREutd95Uw4Ac3caE4X3Ch352ltxbc80X-zimiML1uftGnlOhsxvqFZ6pXehr-3AbXo"
                      alt="Blueprint with blue vector lines"
                      className="w-full h-full object-cover rounded-xl border border-outline-variant/30 opacity-60"
                    />
                    {/* Animated scan line */}
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#d4ff3a] animate-scan" />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="col-span-12 md:col-span-4 grid grid-rows-2 gap-4">
                <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-high/50 p-6 flex flex-col justify-center">
                  <span className="text-on-surface text-4xl font-headline font-extrabold mb-1 tracking-tighter">
                    99.8%
                  </span>
                  <span className="text-sm text-on-surface-variant uppercase tracking-widest font-bold">
                    {t.landing.accuracyRating}
                  </span>
                </div>
                <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-high/50 p-6 flex flex-col justify-center">
                  <span className="text-secondary text-4xl font-headline font-extrabold mb-1 tracking-tighter">
                    &lt;&nbsp;4s
                  </span>
                  <span className="text-sm text-on-surface-variant uppercase tracking-widest font-bold">
                    {t.landing.processingTimeLabel}
                  </span>
                </div>
              </div>
            </div>
          </Animate>
        </section>

        {/* ── Features Bento Grid ─────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-32">
          <Animate variant="fade-up">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container/80 backdrop-blur-md border border-primary/20 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                The Toolkit
              </span>
            </div>
            <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">
              {t.landing.featuresTitle}
            </h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">
              {t.landing.featuresDesc}
            </p>
          </div>
          </Animate>

          <div className="relative grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Grid corner brackets */}
            <div className="pointer-events-none absolute -top-4 -left-4 w-8 h-8 hidden md:block">
              <div className="absolute top-0 left-0 w-5 h-px bg-primary/40" />
              <div className="absolute top-0 left-0 w-px h-5 bg-primary/40" />
            </div>
            <div className="pointer-events-none absolute -top-4 -right-4 w-8 h-8 hidden md:block">
              <div className="absolute top-0 right-0 w-5 h-px bg-primary/40" />
              <div className="absolute top-0 right-0 w-px h-5 bg-primary/40" />
            </div>
            <div className="pointer-events-none absolute -bottom-4 -left-4 w-8 h-8 hidden md:block">
              <div className="absolute bottom-0 left-0 w-5 h-px bg-primary/40" />
              <div className="absolute bottom-0 left-0 w-px h-5 bg-primary/40" />
            </div>
            <div className="pointer-events-none absolute -bottom-4 -right-4 w-8 h-8 hidden md:block">
              <div className="absolute bottom-0 right-0 w-5 h-px bg-primary/40" />
              <div className="absolute bottom-0 right-0 w-px h-5 bg-primary/40" />
            </div>
            {/* Large card */}
            <Animate variant="fade-up" delay={0} className="feature-card-border md:col-span-8 group relative overflow-hidden rounded-2xl bg-surface-container border border-outline-variant/10 p-8 hover:bg-surface-container-high transition-all duration-500 hover:-translate-y-1">
              <span className="absolute top-5 right-5 z-20 font-mono text-[10px] tracking-[0.3em] text-on-surface-variant/60 font-bold">01 / 04</span>
              <div className="flex flex-col h-full justify-between gap-10 relative z-10">
                <div>
                  <span className="material-symbols-outlined text-on-surface text-4xl mb-4 block">
                    architecture
                  </span>
                  <h3 className="text-2xl font-bold text-on-surface mb-3 font-headline">
                    {t.landing.vectorTitle}
                  </h3>
                  <p className="text-on-surface-variant max-w-md leading-relaxed">
                    {t.landing.vectorDesc}
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-on-surface text-xs font-bold">
                    CAD FILES
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-on-surface text-xs font-bold">
                    REVIT FILES
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-on-surface text-xs font-bold">
                    PDF FILES
                  </span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                <img
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop"
                  alt="Plumbing pipe layout"
                  className="w-full h-full object-cover"
                />
              </div>
            </Animate>

            {/* Feature card 1 */}
            <Animate variant="fade-up" delay={100} className="feature-card-border relative overflow-hidden md:col-span-4 rounded-2xl bg-surface-container border border-outline-variant/10 p-8 flex flex-col justify-between hover:bg-surface-container-high transition-all hover:-translate-y-1 duration-500 group">
              <span className="absolute top-5 right-5 z-20 font-mono text-[10px] tracking-[0.3em] text-on-surface-variant/60 font-bold">02 / 04</span>
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop" alt="Market data graph" className="w-full h-full object-cover opacity-20 filter grayscale group-hover:opacity-40 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/80 to-transparent" />
              </div>
              <div className="relative z-10">
                <span className="material-symbols-outlined text-secondary text-4xl mb-12 block">request_quote</span>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2 font-headline">
                    {t.landing.marketTitle}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {t.landing.marketDesc}
                  </p>
                </div>
              </div>
            </Animate>

            {/* Feature card 2 */}
            <Animate variant="fade-up" delay={200} className="feature-card-border relative overflow-hidden md:col-span-4 rounded-2xl bg-surface-container border border-outline-variant/10 p-8 flex flex-col justify-between hover:bg-surface-container-high transition-all hover:-translate-y-1 duration-500 group">
              <span className="absolute top-5 right-5 z-20 font-mono text-[10px] tracking-[0.3em] text-on-surface-variant/60 font-bold">03 / 04</span>
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop" alt="Logistics construction" className="w-full h-full object-cover opacity-20 filter grayscale group-hover:opacity-40 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/80 to-transparent" />
              </div>
              <div className="relative z-10">
                <span className="material-symbols-outlined text-tertiary text-4xl mb-12 block">local_shipping</span>
                <div>
                  <h3 className="text-xl font-bold text-on-surface mb-2 font-headline">
                    {t.landing.logisticsTitle}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {t.landing.logisticsDesc}
                  </p>
                </div>
              </div>
            </Animate>

            {/* Medium card */}
            <Animate variant="fade-up" delay={150} className="feature-card-border relative md:col-span-8 rounded-2xl border border-primary/20 p-8 flex flex-col md:flex-row gap-8 items-center justify-between overflow-hidden" style={{ background: 'linear-gradient(to bottom right, rgba(212,255,58,0.12), #0d0d0d)' }}>
              <span className="absolute top-5 right-5 z-20 font-mono text-[10px] tracking-[0.3em] text-on-surface-variant/60 font-bold">04 / 04</span>
              <div className="max-w-xs">
                <h3 className="text-2xl font-bold text-on-surface mb-2 font-headline">
                  {t.landing.pulseTitle}
                </h3>
                <p className="text-sm text-on-surface-variant mb-6">
                  {t.landing.pulseDesc}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-on-surface">
                    <span>{t.landing.projectAlpha}</span>
                    <span className="text-primary">84%</span>
                  </div>
                  <div className="h-3 w-full bg-secondary-container rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full shadow-[0_0_10px_rgba(212,255,58,0.5)]"
                      style={{ width: '84%', backgroundImage: 'linear-gradient(to right, #e8ff7a, #d4ff3a)' }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-on-surface mt-4">
                    <span>{t.landing.sector7g}</span>
                    <span className="text-secondary">68%</span>
                  </div>
                  <div className="h-3 w-full bg-secondary-container rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: '68%' }} />
                  </div>
                </div>
              </div>
              <div className="w-full md:w-64 h-40 bg-surface-container-high rounded-xl overflow-hidden border border-outline-variant/20 relative group cursor-pointer">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
                  alt="Analytic dashboard"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 mix-blend-luminosity"
                />
                <div className="absolute inset-0 transition-opacity flex flex-col items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-white text-3xl drop-shadow-md">analytics</span>
                  <span className="text-white font-headline font-bold text-sm drop-shadow-md">{t.landing.analyticPreview}</span>
                </div>
              </div>
            </Animate>
          </div>
        </section>

        {/* ── Stats strip ─────────────────────────────── */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '450+', label: t.landing.statsLabels[0] },
              { value: '99.8%', label: t.landing.statsLabels[1] },
              { value: '$2.4B', label: t.landing.statsLabels[2] },
              { value: '< 4s', label: t.landing.statsLabels[3] },
            ].map((s, i) => (
              <Animate key={s.label} variant="scale-up" delay={i * 80}>
                <div className="text-4xl md:text-5xl font-headline font-black text-black mb-2">
                  {s.value}
                </div>
                <div className="text-xs text-slate-700 uppercase tracking-widest font-bold">
                  {s.label}
                </div>
              </Animate>
            ))}
          </div>
        </section>

        {/* ── How It Works ────────────────────────────── */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <Animate variant="fade-up">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container/80 backdrop-blur-md border border-primary/20 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                  {t.landing.howProcess}
                </span>
              </div>
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                {t.landing.howTitle}
              </h2>
              <div className="w-24 h-1 bg-primary/40 mx-auto rounded-full" />
            </div>
          </Animate>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Flow line - desktop only, behind cards */}
            <div className="hidden md:block absolute top-[88px] left-[16.66%] right-[16.66%] h-px pointer-events-none z-0">
              <div className="relative h-full">
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(90deg, rgba(212,255,58,0.35) 50%, transparent 50%)', backgroundSize: '10px 1px' }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(212,255,58,0.7)] animate-flow-dot" />
                <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(212,255,58,0.7)] animate-flow-dot-delay" />
              </div>
            </div>

            {[
              {
                step: '01',
                icon: 'upload_file',
                title: t.landing.steps[0].title,
                desc: t.landing.steps[0].desc,
              },
              {
                step: '02',
                icon: 'cognition',
                title: t.landing.steps[1].title,
                desc: t.landing.steps[1].desc,
              },
              {
                step: '03',
                icon: 'request_quote',
                title: t.landing.steps[2].title,
                desc: t.landing.steps[2].desc,
              },
            ].map((item, i) => (
              <Animate
                key={item.step}
                variant="fade-up"
                delay={i * 120}
                className="feature-card-border relative p-8 rounded-2xl border border-outline-variant/10 bg-surface-container hover:bg-surface-container-high flex flex-col gap-6 transition-all duration-500 hover:-translate-y-1 overflow-hidden z-10"
              >
                <span className="absolute top-5 right-5 font-mono text-[10px] tracking-[0.3em] text-on-surface-variant/50 font-bold">STEP {item.step}</span>

                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {item.icon}
                    </span>
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline font-black text-[10px]">
                      {item.step}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-headline font-bold text-xl text-on-surface mb-3">{item.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
                </div>

                {/* Subtle footer line */}
                <div className="flex items-center gap-2 pt-4 mt-auto border-t border-white/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-[0.25em]">
                    {i === 0 ? 'PDF · DWG · IFC' : i === 1 ? 'AI · 99.8% accuracy' : 'Itemized · Exportable'}
                  </span>
                </div>
              </Animate>
            ))}
          </div>
        </section>

        {/* ── Precision Toolset ───────────────────────── */}
        <section className="relative py-32 px-6 max-w-7xl mx-auto">
          {/* Ambient blueprint grid backdrop */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[520px] hero-grid-bg opacity-40" />
          {/* Drifting glow */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[360px] rounded-full bg-primary/[0.06] blur-[120px]" />

          <Animate variant="fade-up">
          <div className="relative mb-20 flex flex-col items-center text-center">
            {/* Eyebrow chip */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high border border-primary/20 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/90">Precision Toolset</span>
            </div>

            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              {t.landing.toolsetTitle}
            </h2>

            {/* Double accent underline */}
            <div className="flex items-center gap-2">
              <span className="w-16 h-px bg-on-surface/20" />
              <span className="w-2 h-2 rotate-45 border border-primary/60" />
              <span className="w-16 h-px bg-on-surface/20" />
            </div>
          </div>
          </Animate>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <Animate
                key={f.title}
                variant="fade-up"
                delay={i * 100}
                className="feature-card-border group relative bg-surface-container border border-outline-variant/10 rounded-2xl p-8 pt-10 overflow-hidden transition-all duration-500 hover:bg-surface-container-high hover:-translate-y-1"
              >
                {/* Top-right index label */}
                <span className="absolute top-5 right-6 text-[10px] font-mono font-bold tracking-[0.25em] text-on-surface-variant/50 group-hover:text-primary/80 transition-colors">
                  {String(i + 1).padStart(2, '0')} / 03
                </span>

                {/* Corner bracket (top-left) */}
                <span className="absolute top-4 left-4 w-4 h-4 border-l border-t border-primary/30 group-hover:border-primary/70 transition-colors" />

                {/* Icon with lime accent dot */}
                <div className="relative mb-7 w-fit">
                  <div className="w-14 h-14 rounded-xl bg-surface-container-lowest border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:border-primary/40 group-hover:shadow-[0_0_24px_rgba(212,255,58,0.22)]">
                    <span className="material-symbols-outlined text-on-surface text-3xl group-hover:text-primary transition-colors">{f.icon}</span>
                  </div>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary/70 group-hover:bg-primary group-hover:shadow-[0_0_10px_rgba(212,255,58,0.9)] transition-all" />
                </div>

                <h3 className="font-headline text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-on-surface-variant leading-relaxed text-sm">{f.desc}</p>

                {/* Bottom meta strip */}
                <div className="flex items-center gap-2 pt-6 mt-6 border-t border-white/5">
                  <span className="w-1 h-1 rounded-full bg-primary/60" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                    {i === 0 ? 'Auto-extract' : i === 1 ? 'Updated hourly' : 'Regional aware'}
                  </span>
                </div>
              </Animate>
            ))}
          </div>
        </section>

        {/* ── Pricing ─────────────────────────────────── */}
        <section className="relative py-32 px-6 bg-surface-container-low/50 overflow-hidden">
          {/* Ambient backdrop: blueprint grid + centered glow behind featured plan */}
          <div className="pointer-events-none absolute inset-0 hero-grid-bg opacity-30" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[520px] rounded-full bg-primary/[0.07] blur-[140px]" />

          <div className="relative max-w-7xl mx-auto">
            <Animate variant="fade-up">
            <div className="flex flex-col items-center text-center mb-20">
              {/* Eyebrow chip */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high border border-primary/20 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/90">Pricing</span>
              </div>

              <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                {t.landing.pricingTitle}
              </h2>
              <p className="text-on-surface-variant uppercase tracking-[0.3em] font-bold text-xs mb-6">
                {t.landing.pricingSubtitle}
              </p>

              {/* Diamond accent underline */}
              <div className="flex items-center gap-2">
                <span className="w-16 h-px bg-on-surface/20" />
                <span className="w-2 h-2 rotate-45 border border-primary/60" />
                <span className="w-16 h-px bg-on-surface/20" />
              </div>
            </div>
            </Animate>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch md:items-center">
              {plans.map((plan, i) => {
                const tierLabel = `TIER 0${i + 1}`
                const tierTag = i === 0 ? 'For solo estimators' : i === 1 ? 'For growing teams' : 'Tailored, at scale'
                return (
                <Animate
                  key={plan.name}
                  variant="fade-up"
                  delay={i * 100}
                  className={`feature-card-border group relative flex flex-col rounded-3xl p-10 pt-12 transition-all duration-500 ${
                    plan.featured
                      ? 'bg-gradient-to-b from-surface-container to-surface-container-lowest border-2 border-primary/50 shadow-[0_0_80px_-10px_rgba(212,255,58,0.28)] md:scale-105 z-10 md:-mt-4'
                      : 'bg-surface-container-lowest border border-outline-variant/10 hover:-translate-y-1'
                  }`}
                >
                  {/* Corner bracket (top-left) */}
                  <span className={`absolute top-5 left-5 w-4 h-4 border-l border-t ${plan.featured ? 'border-primary/70' : 'border-primary/30 group-hover:border-primary/70'} transition-colors`} />
                  {/* Corner bracket (bottom-right) */}
                  <span className={`absolute bottom-5 right-5 w-4 h-4 border-r border-b ${plan.featured ? 'border-primary/70' : 'border-primary/30 group-hover:border-primary/70'} transition-colors`} />

                  {/* Tier label (top-right mono) */}
                  <span className={`absolute top-5 right-6 text-[10px] font-mono font-bold tracking-[0.25em] ${plan.featured ? 'text-primary/80' : 'text-on-surface-variant/50 group-hover:text-primary/80'} transition-colors`}>
                    {tierLabel}
                  </span>

                  {/* Most-popular ribbon — refined */}
                  {plan.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-primary px-5 py-1.5 rounded-full text-on-primary-fixed font-black text-[10px] uppercase tracking-[0.25em] shadow-[0_0_24px_rgba(212,255,58,0.6)]">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                      {t.landing.mostPopular}
                    </div>
                  )}

                  {/* Plan name + tag */}
                  <div className="mb-6">
                    <h3 className={`font-headline text-xl font-bold ${plan.featured ? 'text-on-surface' : ''}`}>
                      {plan.name}
                    </h3>
                    <p className="text-[11px] uppercase tracking-[0.25em] text-on-surface-variant/70 mt-1 font-semibold">{tierTag}</p>
                  </div>

                  {/* Price block */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1.5">
                      <span className={`font-headline font-extrabold leading-none ${plan.featured ? 'text-6xl text-white bg-gradient-to-b from-white to-white/70 bg-clip-text' : 'text-5xl'}`}>
                        {plan.price}
                      </span>
                      {plan.per && <span className="text-on-surface-variant text-sm">{plan.per}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`h-px flex-1 ${plan.featured ? 'bg-primary/30' : 'bg-outline-variant/40'}`} />
                      <span className="text-[9px] font-mono font-bold tracking-[0.3em] text-on-surface-variant/60">
                        {plan.price === 'Custom' ? 'CONTACT' : 'BILLED MONTHLY'}
                      </span>
                      <span className={`h-px flex-1 ${plan.featured ? 'bg-primary/30' : 'bg-outline-variant/40'}`} />
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3.5 mb-10 flex-grow">
                    {plan.features.map((feat) => (
                      <li key={feat} className={`flex items-start gap-3 text-sm ${plan.featured ? 'text-white/90' : 'text-on-surface-variant'}`}>
                        <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.featured ? 'bg-primary/20 border border-primary/50' : 'bg-white/5 border border-white/10'}`}>
                          <span
                            className={`material-symbols-outlined text-[13px] ${plan.featured ? 'text-primary' : 'text-on-surface-variant'}`}
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check
                          </span>
                        </span>
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => setShowPlanModal(plan.name)}
                    className={`group/btn relative w-full py-4 rounded-xl font-bold uppercase tracking-[0.15em] text-sm transition-all overflow-hidden ${
                      plan.featured
                        ? 'bg-primary text-on-primary-fixed hover:shadow-[0_0_40px_rgba(212,255,58,0.55)] font-black'
                        : 'border border-outline-variant/60 text-on-surface hover:border-primary/50 hover:bg-primary/5'
                    }`}
                  >
                    <span className="relative z-10 inline-flex items-center justify-center gap-2">
                      {plan.cta}
                      <span className="material-symbols-outlined text-[18px] transition-transform group-hover/btn:translate-x-0.5">arrow_forward</span>
                    </span>
                  </button>

                  {/* Bottom meta strip */}
                  <div className="flex items-center gap-2 pt-5 mt-5 border-t border-white/5">
                    <span className={`w-1 h-1 rounded-full ${plan.featured ? 'bg-primary' : 'bg-primary/60'}`} />
                    <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                      {i === 0 ? 'Cancel anytime' : i === 1 ? '14-day free trial' : 'SLA & onboarding'}
                    </span>
                  </div>
                </Animate>
              )})}
            </div>

            {/* Footer reassurance bar */}
            <Animate variant="fade-up" delay={400}>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[11px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
              <span className="inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary/80" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                Secure checkout
              </span>
              <span className="w-1 h-1 rounded-full bg-outline-variant/50" />
              <span className="inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary/80">autorenew</span>
                Switch plans anytime
              </span>
              <span className="w-1 h-1 rounded-full bg-outline-variant/50" />
              <span className="inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary/80">credit_card_off</span>
                No setup fees
              </span>
            </div>
            </Animate>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 py-24 text-center">
          <Animate variant="scale-up">
          <div
            className="p-12 rounded-[2rem] border border-outline-variant/20 relative overflow-hidden"
            style={{ background: 'linear-gradient(to bottom right, #151515, #000000)' }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at center, rgba(212,255,58,0.1), transparent 70%)' }}
            />
            <h2 className="font-headline text-3xl md:text-5xl font-bold text-on-surface mb-6 relative z-10">
              {t.landing.ctaTitle.split('\n').map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>
            <p className="text-on-surface-variant text-lg mb-10 max-w-lg mx-auto relative z-10">
              {t.landing.ctaDesc}
            </p>
            <Link
              href="/dashboard"
              className="px-10 py-5 bg-on-surface text-background font-bold rounded-xl hover:scale-105 transition-all relative z-10 inline-block"
            >
              {t.landing.ctaButton}
            </Link>
          </div>
          </Animate>
        </section>
      </main>

      <Footer />
      <MobileNav />

      {/* Demo modal */}
      {showDemo && (
        <Modal title={t.landing.demoTitle} onClose={() => setShowDemo(false)}>
          <div className="space-y-6">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-on-surface text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_circle
                  </span>
                </div>
                <p className="text-on-surface-variant text-sm">{t.landing.demoSoon}</p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop"
                alt="Industrial plumbing manifold"
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { icon: 'upload_file', label: t.landing.demoSteps[0] },
                { icon: 'cognition', label: t.landing.demoSteps[1] },
                { icon: 'request_quote', label: t.landing.demoSteps[2] },
              ].map((s, i) => (
                <div key={s.label} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface">{s.icon}</span>
                  </div>
                  <span className="text-xs text-on-surface-variant font-bold">{i + 1}. {s.label}</span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard"
              onClick={() => setShowDemo(false)}
              className="block w-full py-4 bg-primary-container text-on-primary-container font-bold rounded-xl text-center hover:shadow-[0_0_20px_rgba(212,255,58,0.4)] transition-all"
            >
              {t.landing.demoTryLive}
            </Link>
          </div>
        </Modal>
      )}

      {/* Plan modal */}
      {showPlanModal && (
        <Modal title={showPlanModal} onClose={() => setShowPlanModal(null)}>
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-on-surface text-3xl">rocket_launch</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-xl text-on-surface mb-2">
                {t.landing.planChosen} {showPlanModal}
              </h3>
              <p className="text-on-surface-variant text-sm">
                {t.landing.planDesc}
              </p>
            </div>
            <input
              type="email"
              placeholder={t.landing.emailPlaceholder}
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary/40"
            />
            <button
              onClick={() => setShowPlanModal(null)}
              className="w-full py-4 bg-primary-container text-on-primary-container font-bold rounded-xl hover:shadow-[0_0_20px_rgba(212,255,58,0.4)] transition-all"
            >
              {t.landing.planNotify}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
