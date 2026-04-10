'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import UploadModal from '@/components/UploadModal'
import Toast from '@/components/Toast'
import Animate from '@/components/Animate'
import { useLanguage } from '@/contexts/LanguageContext'

const blueprints = [
  {
    name: 'North_Tower_Foundation.dwg',
    type: '3D Model',
    updated: '2 mins ago',
    health: 100,
    healthColor: 'bg-emerald-500',
    icon: 'account_tree',
  },
  {
    name: 'Heating_Cooling_Routes.ifc',
    type: 'Heating/Cooling',
    updated: '14 hours ago',
    health: 85,
    healthColor: 'bg-primary-container',
    icon: 'analytics',
  },
  {
    name: 'Load_Check_Report.pdf',
    type: 'Report',
    updated: 'Yesterday',
    health: 40,
    healthColor: 'bg-tertiary',
    icon: 'description',
  },
  {
    name: 'Skyline_Pavilion_v3.pdf',
    type: 'Building Plan',
    updated: '2 days ago',
    health: 95,
    healthColor: 'bg-emerald-500',
    icon: 'picture_as_pdf',
  },
  {
    name: 'Supplier_Timeline.csv',
    type: 'Buying',
    updated: '3 days ago',
    health: 60,
    healthColor: 'bg-primary-container',
    icon: 'table_chart',
  },
]

const fleet = [
  { name: 'Crane 01 - Alpha',  status: 'Operational', dot: 'bg-emerald-400', glow: 'shadow-[0_0_8px_rgba(52,211,153,0.6)]', active: true },
  { name: 'Excavator X-4',     status: 'In-Use',       dot: 'bg-emerald-400', glow: 'shadow-[0_0_8px_rgba(52,211,153,0.6)]', active: true },
  { name: 'Drone Unit 09',     status: 'Charging',     dot: 'bg-amber-400',   glow: '',                                       active: false },
  { name: 'Concrete Pump P-2', status: 'Standby',      dot: 'bg-slate-400',   glow: '',                                       active: false },
]

export default function ProjectsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [showUpload, setShowUpload] = useState(false)
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null)

  return (
    <AppLayout>

      <main className="pb-32 px-6 max-w-7xl mx-auto space-y-12 mt-8">

        {/* Hero Upload Canvas */}
        <Animate variant="fade-up" as="section">
          <div className="mb-8">
            <span className="text-primary font-headline font-bold tracking-widest text-[10px] uppercase">
              {t.projects.workspaceLabel}
            </span>
            <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tighter text-on-surface mt-1">
              {t.projects.pageTitle}
            </h1>
            <p className="text-on-surface-variant max-w-2xl mt-2">
              {t.projects.pageDesc}
            </p>
          </div>

          <button
            onClick={() => setShowUpload(true)}
            className="group relative w-full min-h-[320px] rounded-xl border border-white/5 flex flex-col items-center justify-center p-8 transition-all duration-700 hover:border-primary/30"
            style={{
              background: 'rgba(45,52,72,0.4)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ background: 'radial-gradient(circle at 50% 50%, rgba(46,91,255,0.08), transparent 70%)' }}
            />
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-primary-container/20 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(46,91,255,0.2)] group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-4xl text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                  cloud_upload
                </span>
              </div>
              <div className="text-center">
                <h3 className="font-headline font-bold text-2xl tracking-tight text-white mb-1">
                  {t.projects.dragDrop}
                </h3>
                <p className="text-on-surface-variant text-sm tracking-wide uppercase">
                  {t.projects.supportedFormats}
                </p>
              </div>
              <div className="px-8 py-3 bg-primary-container text-white font-headline font-extrabold rounded-xl shadow-[0_0_20px_rgba(46,91,255,0.3)] group-hover:scale-105 active:scale-95 transition-transform text-sm uppercase tracking-widest">
                {t.projects.browseWorkspace}
              </div>
            </div>
          </button>
        </Animate>

        {/* Bento Grid: Foreman Insight + Fleet */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Foreman Insight (2 cols) */}
          <Animate variant="slide-left" className="lg:col-span-2 relative overflow-hidden rounded-xl p-8 bg-surface-container border border-white/5 shadow-xl">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-container/20 blur-[80px] pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-tertiary-container/10 blur-[60px] pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary-container shadow-[0_0_15px_rgba(46,91,255,0.4)]">
                  <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                    psychology
                  </span>
                </div>
                <h3 className="font-headline font-bold text-xl tracking-tight text-white uppercase">
                  {t.projects.foremanInsight}
                </h3>
              </div>
              <div className="space-y-6">
                <div className="p-4 rounded-lg border-l-4 border-primary" style={{ background: 'rgba(46,91,255,0.1)' }}>
                  <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-widest">
                    {t.projects.activeAlert}
                  </p>
                  <p className="text-on-surface text-base leading-relaxed">
                    {t.projects.alertText}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 rounded-full bg-surface-container-high border border-white/5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    {t.projects.conflictsFound}
                  </span>
                  <span className="px-4 py-2 rounded-full bg-surface-container-high border border-white/5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    {t.projects.siteNorth}
                  </span>
                  <button
                    onClick={() => setToast({ message: t.projects.toastConflict, type: 'info' })}
                    className="px-4 py-2 rounded-full bg-primary-container/20 border border-primary/20 text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary-container/30 transition-colors"
                  >
                    {t.projects.resolveConflicts}
                  </button>
                </div>
              </div>
            </div>
          </Animate>

          {/* Fleet Status */}
          <Animate variant="slide-right" delay={80} className="rounded-xl p-8 bg-surface-container-high border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-8">
                <h3 className="font-headline font-bold text-lg tracking-tight text-white uppercase">
                  {t.projects.activeFleet}
                </h3>
                <span className="material-symbols-outlined text-primary">conveyor_belt</span>
              </div>
              <div className="space-y-4">
                {fleet.map((f, i) => (
                  <div key={f.name} className={`flex items-center justify-between group cursor-pointer ${!f.active ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${f.dot} ${f.glow}`} />
                      <span className="text-sm font-medium text-on-surface">{f.name}</span>
                    </div>
                    <span className="text-xs text-on-surface-variant group-hover:text-white transition-colors">
                      {t.projects.fleetStatuses[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setToast({ message: t.projects.toastFleet, type: 'info' })}
              className="w-full mt-8 py-3 rounded-lg border border-primary/20 text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/5 transition-all"
            >
              {t.projects.viewFleetMap}
            </button>
          </Animate>
        </section>

        {/* Recent Blueprints Table */}
        <Animate variant="fade-up" as="section" className="space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="font-headline font-black text-2xl tracking-tighter text-white uppercase">
              {t.projects.recentBlueprints}
            </h3>
            <button
              onClick={() => setToast({ message: t.projects.toastArchive, type: 'info' })}
              className="text-primary text-xs font-bold uppercase tracking-widest hover:underline underline-offset-8"
            >
              {t.projects.expandArchive}
            </button>
          </div>

          <div className="bg-surface-container rounded-xl border border-white/5 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 px-6 py-4 border-b border-white/5 bg-surface-container-high/30 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
              <div className="col-span-5">{t.projects.tableHeaders.name}</div>
              <div className="col-span-2">{t.projects.tableHeaders.type}</div>
              <div className="col-span-2">{t.projects.tableHeaders.updated}</div>
              <div className="col-span-2">{t.projects.tableHeaders.health}</div>
              <div className="col-span-1 text-right">{t.projects.tableHeaders.action}</div>
            </div>

            <div className="divide-y divide-white/5">
              {blueprints.map((b) => (
                <div
                  key={b.name}
                  className="grid grid-cols-12 px-6 py-5 items-center hover:bg-white/5 transition-colors group cursor-pointer"
                  onClick={() => router.push('/processing')}
                >
                  <div className="col-span-5 flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary/60 group-hover:text-primary transition-colors">
                      {b.icon}
                    </span>
                    <span className="font-semibold text-sm text-on-surface truncate">{b.name}</span>
                  </div>
                  <div className="col-span-2 text-xs text-on-surface-variant">{b.type}</div>
                  <div className="col-span-2 text-xs text-on-surface-variant">{b.updated}</div>
                  <div className="col-span-2">
                    <div className="w-20 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div className={`h-full ${b.healthColor} rounded-full`} style={{ width: `${b.health}%` }} />
                    </div>
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      className="material-symbols-outlined text-slate-400 hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        setToast({ message: `Actions for ${b.name}`, type: 'info' })
                      }}
                    >
                      more_vert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Animate>

        {/* Stats strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t.projects.statsLabels[0], value: '47', icon: 'folder_open', color: 'text-primary' },
            { label: t.projects.statsLabels[1], value: '14', icon: 'foundation', color: 'text-primary' },
            { label: t.projects.statsLabels[2], value: '3', icon: 'pending', color: 'text-tertiary' },
            { label: t.projects.statsLabels[3], value: '28', icon: 'verified', color: 'text-emerald-400' },
          ].map((s, i) => (
            <Animate key={s.label} variant="scale-up" delay={i * 80} className="bg-surface-container rounded-xl p-6 border border-white/5 flex flex-col gap-2">
              <span className={`material-symbols-outlined ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {s.icon}
              </span>
              <div className={`text-3xl font-headline font-black tracking-tighter ${s.color}`}>{s.value}</div>
              <div className="text-xs text-on-surface-variant uppercase tracking-widest">{s.label}</div>
            </Animate>
          ))}
        </section>
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowUpload(true)}
        className="fixed bottom-24 right-6 md:bottom-12 md:right-12 h-16 w-16 bg-primary-container rounded-full flex items-center justify-center text-white shadow-[0_8px_30px_rgba(46,91,255,0.4)] hover:scale-110 active:scale-95 transition-all z-40"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}
