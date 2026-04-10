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
          {/* Ambient glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-container/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-container/20 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto">
            {/* Live badge */}
            <Animate variant="fade-in" delay={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant mb-8">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {t.landing.badge}
                </span>
              </div>
            </Animate>

            <Animate variant="fade-up" delay={80}>
              <h1 className="font-headline font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight text-white mb-8 leading-[1.05]">
                {t.landing.heroTitle}{' '}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #2e5bff 0%, #b8c3ff 50%, #a6b4ff 100%)' }}>
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
                className="group relative w-full sm:w-auto px-10 py-5 bg-primary-container text-on-primary-container font-headline font-bold rounded-xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(46,91,255,0.4)] active:scale-95 text-center"
              >
                {t.landing.startTrial}
                <span className="absolute inset-0 rounded-xl border border-white/20 group-hover:border-white/40" />
              </Link>
              <button
                onClick={() => setShowDemo(true)}
                className="w-full sm:w-auto px-10 py-5 bg-surface-variant/40 backdrop-blur-md border border-outline-variant/30 text-white font-headline font-bold rounded-xl hover:bg-surface-variant/60 transition-all active:scale-95"
              >
                {t.landing.watchDemo}
              </button>
            </div>
            </Animate>
          </div>

          {/* Bento hero visualisation */}
          <Animate variant="fade-up" delay={100} className="relative mt-24 w-full max-w-6xl mx-auto px-4">
            {/* Floating AI badge */}
            <div className="absolute -top-6 right-4 md:right-10 glass-panel p-4 rounded-xl border border-primary/30 flex items-center gap-3 z-20">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
              </div>
              <div>
                <div className="text-xs text-primary-fixed-dim font-bold uppercase tracking-wide">{t.landing.accuracyCheck}</div>
                <div className="text-sm font-bold text-on-surface">{t.landing.precisionRate}</div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 h-[380px] md:h-[520px]">
              {/* Main engine card */}
              <div className="col-span-12 md:col-span-8 relative rounded-3xl overflow-hidden border border-outline-variant/20 bg-surface-container/30 backdrop-blur-xl p-8 group">
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ background: 'radial-gradient(at 0% 0%, #2e5bff 0px, transparent 50%), radial-gradient(at 100% 0%, #b8c3ff 0px, transparent 50%), radial-gradient(at 100% 100%, #060e20 0px, transparent 50%)' }}
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
                    <span className="material-symbols-outlined text-4xl text-primary">biotech</span>
                  </div>
                  <div className="w-full h-2/3 mt-6 relative">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvQGMi6iUa6tpBsfR0otxsJL7RAl7Va4I1dgvGLO1dyzrXpSRR4s2Wk4C9_o2bBg3Utp1DBDMFcojAimFyLw8QHp2XvXugHTRsdrCdo8cIa8CjJXF8yTXa6JTlUa8-EeTJlpor80uPM6-2AmnNMXpoBr9h8X0_k2aO43JQGwS_FCqjctUZeyAaVivZzAUktUO6ogCGUYCkaREutd95Uw4Ac3caE4X3Ch352ltxbc80X-zimiML1uftGnlOhsxvqFZ6pXehr-3AbXo"
                      alt="Blueprint with blue vector lines"
                      className="w-full h-full object-cover rounded-xl border border-outline-variant/30 opacity-60"
                    />
                    {/* Animated scan line */}
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#2e5bff] animate-scan" />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="col-span-12 md:col-span-4 grid grid-rows-2 gap-4">
                <div className="rounded-3xl border border-outline-variant/20 bg-surface-container-high/50 p-6 flex flex-col justify-center">
                  <span className="text-primary text-4xl font-headline font-extrabold mb-1 tracking-tighter">
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
          <div className="mb-16">
            <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight text-on-surface mb-4">
              {t.landing.featuresTitle}
            </h2>
            <p className="text-on-surface-variant max-w-xl">
              {t.landing.featuresDesc}
            </p>
          </div>
          </Animate>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Large card */}
            <Animate variant="fade-up" delay={0} className="md:col-span-8 group relative overflow-hidden rounded-2xl bg-surface-container border border-outline-variant/10 p-8 hover:bg-surface-container-high transition-all duration-500 hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between gap-10 relative z-10">
                <div>
                  <span className="material-symbols-outlined text-primary text-4xl mb-4 block">
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
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    CAD FILES
                  </span>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    REVIT FILES
                  </span>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
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
            <Animate variant="fade-up" delay={100} className="relative overflow-hidden md:col-span-4 rounded-2xl bg-surface-container border border-outline-variant/10 p-8 flex flex-col justify-between hover:bg-surface-container-high transition-all hover:-translate-y-1 duration-500 group">
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
            <Animate variant="fade-up" delay={200} className="relative overflow-hidden md:col-span-4 rounded-2xl bg-surface-container border border-outline-variant/10 p-8 flex flex-col justify-between hover:bg-surface-container-high transition-all hover:-translate-y-1 duration-500 group">
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
            <Animate variant="fade-up" delay={150} className="md:col-span-8 rounded-2xl border border-primary/20 p-8 flex flex-col md:flex-row gap-8 items-center justify-between" style={{ background: 'linear-gradient(to bottom right, rgba(46,91,255,0.2), #171f32)' }}>
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
                      className="h-full rounded-full shadow-[0_0_10px_rgba(151,169,255,0.5)]"
                      style={{ width: '84%', backgroundImage: 'linear-gradient(to right, #b8c3ff, #2e5bff)' }}
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
                <div className="text-4xl md:text-5xl font-headline font-black text-blue-600 mb-2">
                  {s.value}
                </div>
                <div className="text-xs text-slate-800 uppercase tracking-widest font-bold">
                  {s.label}
                </div>
              </Animate>
            ))}
          </div>
        </section>

        {/* ── How It Works ────────────────────────────── */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[10px] font-mono text-primary tracking-[0.3em] uppercase mb-3">{t.landing.howProcess}</p>
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              {t.landing.howTitle}
            </h2>
            <div className="w-24 h-1 bg-primary/40 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: 'upload_file',
                title: t.landing.steps[0].title,
                desc: t.landing.steps[0].desc,
                color: 'text-primary',
                bg: 'bg-primary/10',
                border: 'border-primary/20',
              },
              {
                step: '02',
                icon: 'cognition',
                title: t.landing.steps[1].title,
                desc: t.landing.steps[1].desc,
                color: 'text-secondary',
                bg: 'bg-secondary/10',
                border: 'border-secondary/20',
              },
              {
                step: '03',
                icon: 'request_quote',
                title: t.landing.steps[2].title,
                desc: t.landing.steps[2].desc,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
              },
            ].map((item, i) => (
              <Animate
                key={item.step}
                variant="fade-up"
                delay={i * 120}
                className={`relative p-8 rounded-2xl border ${item.border} flex flex-col gap-6`}
                style={{ background: 'rgba(23,31,50,0.6)', backdropFilter: 'blur(8px)' }}
              >
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                    <span className="material-symbols-outlined text-outline-variant/40 text-2xl">arrow_forward</span>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined ${item.color} text-2xl`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {item.icon}
                    </span>
                  </div>
                  <span className={`font-headline font-black text-4xl ${item.color} opacity-20`}>{item.step}</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-xl text-on-surface mb-3">{item.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Animate>
            ))}
          </div>
        </section>

        {/* ── Precision Toolset ───────────────────────── */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <Animate variant="fade-up">
          <div className="mb-20 text-center">
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              {t.landing.toolsetTitle}
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </div>
          </Animate>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <Animate
                key={f.title}
                variant="fade-up"
                delay={i * 100}
                className="group bg-surface-container border border-outline-variant/10 rounded-2xl p-8 transition-all duration-500 hover:bg-surface-container-high hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] hover:-translate-y-1"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110">
                  <span className="material-symbols-outlined text-primary text-3xl">{f.icon}</span>
                </div>
                <h3 className="font-headline text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{f.desc}</p>
              </Animate>
            ))}
          </div>
        </section>

        {/* ── Pricing ─────────────────────────────────── */}
        <section className="py-32 px-6 bg-surface-container-low/50">
          <div className="max-w-7xl mx-auto">
            <Animate variant="fade-up">
            <div className="text-center mb-20">
              <h2 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                {t.landing.pricingTitle}
              </h2>
              <p className="text-on-surface-variant uppercase tracking-[0.3em] font-bold text-xs">
                {t.landing.pricingSubtitle}
              </p>
            </div>
            </Animate>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
              {plans.map((plan, i) => (
                <Animate
                  key={plan.name}
                  variant="fade-up"
                  delay={i * 100}
                  className={`relative flex flex-col rounded-3xl p-10 transition-all ${
                    plan.featured
                      ? 'bg-surface-container border-2 border-primary/40 shadow-[0_0_60px_rgba(46,91,255,0.15)] md:scale-105 z-10'
                      : 'bg-surface-container-lowest border border-outline-variant/10 hover:border-primary/30'
                  }`}
                >
                  {plan.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary px-6 py-1 rounded-full text-on-primary-fixed font-black text-[10px] uppercase tracking-widest">
                      {t.landing.mostPopular}
                    </div>
                  )}
                  <span className={`font-headline text-xl font-bold mb-2 ${plan.featured ? 'text-primary' : ''}`}>
                    {plan.name}
                  </span>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className={`font-headline font-extrabold ${plan.featured ? 'text-5xl text-white' : 'text-4xl'}`}>
                      {plan.price}
                    </span>
                    {plan.per && <span className="text-on-surface-variant">{plan.per}</span>}
                  </div>
                  <ul className="space-y-4 mb-12 flex-grow">
                    {plan.features.map((feat) => (
                      <li key={feat} className={`flex items-center gap-3 text-sm ${plan.featured ? 'text-white' : 'text-on-surface-variant'}`}>
                        <span
                          className="material-symbols-outlined text-primary text-lg"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setShowPlanModal(plan.name)}
                    className={`w-full py-4 rounded-xl font-bold uppercase tracking-tight transition-all ${
                      plan.featured
                        ? 'bg-primary text-on-primary-fixed hover:shadow-[0_0_30px_rgba(46,91,255,0.5)] font-black'
                        : 'border border-outline-variant text-on-surface hover:bg-white/5'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </Animate>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-6 py-24 text-center">
          <Animate variant="scale-up">
          <div
            className="p-12 rounded-[2rem] border border-outline-variant/20 relative overflow-hidden"
            style={{ background: 'linear-gradient(to bottom right, #222a3d, #0b1325)' }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at center, rgba(62,101,255,0.1), transparent 70%)' }}
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
                <div className="w-20 h-20 rounded-full bg-primary-container/20 border border-primary/30 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
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
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">{s.icon}</span>
                  </div>
                  <span className="text-xs text-on-surface-variant font-bold">{i + 1}. {s.label}</span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard"
              onClick={() => setShowDemo(false)}
              className="block w-full py-4 bg-primary-container text-on-primary-container font-bold rounded-xl text-center hover:shadow-[0_0_20px_rgba(46,91,255,0.4)] transition-all"
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
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-primary text-3xl">rocket_launch</span>
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
              className="w-full py-4 bg-primary-container text-on-primary-container font-bold rounded-xl hover:shadow-[0_0_20px_rgba(46,91,255,0.4)] transition-all"
            >
              {t.landing.planNotify}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
