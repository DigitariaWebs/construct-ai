'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import Footer from '@/components/Footer'
import UploadModal from '@/components/UploadModal'
import Toast from '@/components/Toast'
import Animate from '@/components/Animate'
import { useLanguage } from '@/contexts/LanguageContext'

const metrics = [
  {
    label: 'Processing Power',
    value: '98.2',
    unit: 'TFLOPS',
    icon: 'memory',
    bar: 85,
    badge: 'LIVE',
    color: 'text-primary',
  },
  {
    label: 'Active Projects',
    value: '14',
    unit: 'Nodes',
    icon: 'foundation',
    sub: '3 pending architectural reviews',
    color: 'text-primary',
  },
  {
    label: 'Savings Identified',
    value: '$42.8k',
    unit: '',
    icon: 'payments',
    trend: '12% INCREASE VS LAST CYCLE',
    color: 'text-tertiary',
  },
]

const logs = [
  { time: '09:42 AM', text: 'Neural Engine updated site scan for', highlight: 'Station 7',  dot: 'bg-primary-container shadow-[0_0_8px_rgba(46,91,255,0.8)]' },
  { time: '09:15 AM', text: 'Optimization conflict resolved in',   highlight: 'HVAC Layout', dot: 'bg-tertiary shadow-[0_0_8px_rgba(255,181,155,0.8)]',            highlightColor: 'text-tertiary' },
  { time: '08:50 AM', text: 'Daily structural integrity report generated', highlight: '',   dot: 'bg-primary-container opacity-50' },
  { time: '08:22 AM', text: 'Quote PRJ-992-DELTA approved by',     highlight: 'A. Vance',   dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',          highlightColor: 'text-emerald-400' },
]

const recentFiles = [
  { name: 'Material_Cost_Report_V2.pdf',    meta: 'Updated 2h ago • 4.2 MB',    icon: 'description',  iconColor: 'text-primary-container' },
  { name: 'South_Wing_Elevation_Scan.png',  meta: 'Updated 5h ago • 18.5 MB',   icon: 'image',        iconColor: 'text-primary-container' },
  { name: 'Vendor_Timeline_Matrix.csv',     meta: 'Updated yesterday • 1.1 MB', icon: 'table_chart',  iconColor: 'text-primary-container' },
  { name: 'CCTP_Skyline_Pavilion_v3.pdf',   meta: 'Updated 2d ago • 9.8 MB',    icon: 'picture_as_pdf', iconColor: 'text-primary-container' },
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
  const [toast, setToast] = useState<string | null>(null)

  const handleQuickAction = (action: string) => {
    if (action === 'upload') { setShowUpload(true); return }
    if (action === 'sim')    { router.push('/processing'); return }
    if (action === 'export') { setToast(t.dashboard.toastExport); return }
    if (action === 'ai')     { setToast(t.dashboard.toastAI); return }
  }

  return (
    <AppLayout>
      <div className="space-y-10">

        {/* Welcome */}
        <Animate variant="fade-up" as="section" className="space-y-1 pt-4">
          <span className="text-primary font-headline font-bold tracking-widest text-[10px] uppercase">
            {t.dashboard.hubLabel}
          </span>
          <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tighter text-on-surface">
            {t.dashboard.welcome}
          </h1>
        </Animate>

        {/* Launch estimator banner */}
        <Animate variant="fade-up" delay={80} as="section">
          <div className="relative overflow-hidden rounded-3xl p-px" style={{ background: 'radial-gradient(at 0% 0%, #2e5bff 0px, transparent 50%), radial-gradient(at 100% 100%, #171f32 0px, transparent 50%)' }}>
            <div className="relative bg-surface rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5 shadow-[0_4px_40px_rgba(46,91,255,0.08)]">
              <div className="space-y-3 max-w-2xl">
                <h2 className="text-2xl md:text-3xl font-headline font-bold tracking-tight">
                  {t.dashboard.bannerTitle}
                </h2>
                <p className="text-on-surface-variant leading-relaxed">
                  {t.dashboard.bannerDesc}
                </p>
              </div>
              <button
                onClick={() => setShowUpload(true)}
                className="whitespace-nowrap bg-primary-container text-on-primary-container px-10 py-5 rounded-full font-headline font-black uppercase tracking-widest shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-95 transition-all duration-300"
              >
                {t.dashboard.launchEstimator}
              </button>
            </div>
          </div>
        </Animate>

        {/* Metric cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((m, i) => {
            const metric = t.dashboard.metrics[i]

            return (
            <Animate
              key={m.icon}
              variant="fade-up"
              delay={i * 80}
              className="bg-surface-container p-6 rounded-2xl border border-outline-variant/10 shadow-[0_4px_40px_rgba(46,91,255,0.04)] hover:-translate-y-1 transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-bold tracking-widest uppercase ${m.color}`}>
                  {metric.label}
                </span>
                <span
                  className="material-symbols-outlined text-primary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {m.icon}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-white">{m.value}</span>
                {m.unit && <span className="text-on-surface-variant text-sm font-medium">{m.unit}</span>}
              </div>
              {m.bar !== undefined && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1 flex-1 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-container shadow-[0_0_12px_rgba(46,91,255,0.5)] rounded-full"
                      style={{ width: `${m.bar}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-primary">{m.badge}</span>
                </div>
              )}
              {metric.sub && <p className="mt-4 text-xs text-on-surface-variant leading-relaxed">{metric.sub}</p>}
              {metric.trend && (
                <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-tertiary">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span>{metric.trend}</span>
                </div>
              )}
            </Animate>
          )})}
        </section>

        {/* Blueprint preview + System status */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Blueprint image */}
          <Animate variant="slide-left" className="lg:col-span-8 group relative overflow-hidden rounded-3xl bg-surface-container shadow-2xl border border-outline-variant/10 transition-all duration-700">
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent opacity-70 z-10 pointer-events-none" />
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiCwLYs6qCWWwoGJTQO_qErOUa35Um9F-wmhf_arPouMPIUrs4YIGaCsKz5_BKMq6Hc8QTfteA_NG0cORZfC8Ca9LY3om2FILrybUOp_7kws7KrhDjFMnY0Raohjyv2Fhld5YZSLvlrvYcmcc0UpxZ8SwhSXKN4Ey7ta08tH0AfJjB5Gb80u8V-Qah2HSOkzR7WK2JCKX24AEdbxncuzP2uRCdo9Nn_ijJ2UifrTZ12MeJoKcP1TTfqkPfiA09h-wxLO_PG2EEoYs"
              alt="Active architectural blueprint"
              className="w-full h-[400px] md:h-[480px] object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
              <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-container/20 backdrop-blur-md border border-primary/30 rounded-full mb-4">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
                      {t.dashboard.activeBlueprint}
                    </span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                    {t.dashboard.centralTech}
                  </h2>
                  <p className="text-on-surface-variant max-w-md">
                    {t.dashboard.phaseDesc}
                  </p>
                </div>
                <Link
                  href="/processing"
                  className="shrink-0 bg-primary-container text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-400 transition-colors shadow-lg active:scale-95"
                >
                  {t.dashboard.viewAnalysis}
                  <span className="material-symbols-outlined text-lg">open_in_full</span>
                </Link>
              </div>
            </div>
          </Animate>

          {/* System status feed */}
          <Animate variant="slide-right" delay={80} className="lg:col-span-4">
            <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white tracking-tight">{t.dashboard.systemStatus}</h3>
                <span className="material-symbols-outlined text-on-surface-variant">sensors</span>
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
                      <span className="text-[10px] font-bold text-on-surface-variant block mb-1">
                        {log.time}
                      </span>
                      <p className="text-sm text-on-surface leading-tight font-medium">
                        {t.dashboard.logs[i].text}{' '}
                        {t.dashboard.logs[i].highlight && (
                          <span className={log.highlightColor || 'text-primary'}>{t.dashboard.logs[i].highlight}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setToast(t.dashboard.toastLogs)}
                className="w-full py-4 mt-4 border border-outline-variant/10 rounded-xl text-[10px] font-bold tracking-widest uppercase text-on-surface-variant hover:bg-white/5 transition-all"
              >
                {t.dashboard.viewFullLogs}
              </button>
            </div>
          </Animate>
        </section>

        {/* Project timeline */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Animate variant="fade-up" className="md:col-span-2 bg-surface-container rounded-2xl p-8 border border-outline-variant/10">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-blue-500 font-headline font-bold text-[10px] uppercase tracking-widest">
                  {t.dashboard.activePhase}
                </span>
                <h3 className="text-2xl font-headline font-bold tracking-tight mt-1">
                  {t.dashboard.projectTimeline}
                </h3>
              </div>
              <span className="text-4xl font-headline font-black text-primary">68%</span>
            </div>
            <div className="relative h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-primary-container shadow-[0_0_15px_rgba(46,91,255,0.6)] rounded-full w-[68%]" />
            </div>
            <div className="mt-6 flex justify-between text-xs font-medium text-slate-500 uppercase tracking-widest font-headline">
              <span>{t.dashboard.sitePrep}</span>
              <span className="text-primary-fixed-dim">{t.dashboard.structuralFraming}</span>
              <span>{t.dashboard.interiorFinish}</span>
            </div>
          </Animate>
          <Animate variant="fade-up" delay={120} className="bg-surface-container-high rounded-2xl p-8 border border-outline-variant/10 flex flex-col justify-between">
            <span className="material-symbols-outlined text-tertiary-fixed-dim text-3xl">conveyor_belt</span>
            <div>
              <div className="text-3xl font-headline font-black">12.4k</div>
              <div className="text-slate-400 text-sm font-medium uppercase tracking-tight mt-1">
                {t.dashboard.unitsInTransit}
              </div>
            </div>
          </Animate>
        </section>

        {/* Quick actions + Recent files */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Quick actions */}
          <Animate variant="fade-up" className="space-y-4">
            <h3 className="text-sm font-bold text-primary tracking-widest uppercase mb-6">
              {t.dashboard.quickEngine}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((a, i) => (
                <button
                  key={a.action}
                  onClick={() => handleQuickAction(a.action)}
                  className="bg-surface-container h-24 rounded-2xl border border-outline-variant/10 flex flex-col items-center justify-center gap-2 hover:bg-surface-container-high transition-all active:scale-95 group"
                >
                  <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                    {a.icon}
                  </span>
                  <span className="text-[10px] font-bold text-on-surface">{t.dashboard.quickActions[i]}</span>
                </button>
              ))}
            </div>
          </Animate>

          {/* Recent files */}
          <Animate variant="fade-up" delay={100} className="lg:col-span-2 bg-surface-container rounded-3xl p-8 border border-outline-variant/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold text-white tracking-tight">{t.dashboard.recentArtifacts}</h3>
              <Link href="/quote" className="text-xs font-bold text-primary hover:text-white transition-colors">
                {t.dashboard.viewAll}
              </Link>
            </div>
            <div className="space-y-2">
              {recentFiles.map((f) => (
                <div
                  key={f.name}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-container-high transition-all cursor-pointer group"
                  onClick={() => setToast(`Opening ${f.name}…`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-surface-container-low rounded-lg flex items-center justify-center border border-outline-variant/10 shrink-0">
                      <span className={`material-symbols-outlined ${f.iconColor}`}>{f.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">{f.name}</h4>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">
                        {f.meta}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                    more_vert
                  </span>
                </div>
              ))}
            </div>
          </Animate>
        </section>

        {/* Blueprint upload zone */}
        <Animate variant="fade-up" as="section">
          <button
            onClick={() => setShowUpload(true)}
            className="w-full glass-panel rounded-xl p-1"
          >
            <div className="bg-surface-container-lowest/40 rounded-lg border-2 border-dashed border-outline-variant/30 p-16 flex flex-col items-center justify-center space-y-6 hover:border-primary/50 transition-colors group cursor-pointer">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-primary text-4xl">cloud_upload</span>
              </div>
              <div className="text-center space-y-2">
                <h4 className="text-xl font-headline font-bold tracking-tight">
                  {t.dashboard.dropBlueprints}
                </h4>
                <p className="text-slate-500 text-sm max-w-xs">
                  {t.dashboard.dropDesc}
                </p>
              </div>
              <div className="px-6 py-2 rounded-full border border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                {t.dashboard.browseFiles}
              </div>
            </div>
          </button>
        </Animate>
      </div>

      <Footer />

      {/* Floating action button */}
      <button
        onClick={() => setShowUpload(true)}
        className="fixed bottom-24 right-6 md:bottom-12 md:right-12 h-16 w-16 bg-primary-container rounded-full flex items-center justify-center text-white shadow-[0_8px_30px_rgba(46,91,255,0.4)] hover:scale-110 active:scale-95 transition-all z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}
