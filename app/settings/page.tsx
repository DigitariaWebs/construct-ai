'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'
import Toast from '@/components/Toast'
import Animate from '@/components/Animate'
import { useLanguage } from '@/contexts/LanguageContext'

const sidebarItems = [
  { id: 'account', icon: 'person' },
  { id: 'supplier', icon: 'local_shipping' },
  { id: 'theme', icon: 'palette' },
  { id: 'security', icon: 'security' },
]

const defaultForm = {
  name: 'Alexander Vance',
  email: 'a.vance@construct.ai',
  org: 'Vance Structural Group',
  region: 'North America — Eastern',
}

const defaultSecurity = {
  twoFactor: true,
  sessionTimeout: '30',
  ipWhitelist: false,
  auditLog: true,
}

export default function SettingsPage() {
  const { t } = useLanguage()
  const [active, setActive]   = useState('account')
  const [toast, setToast]     = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null)

  // Account form
  const [form, setForm]       = useState(defaultForm)
  const [savedForm, setSaved] = useState(defaultForm)

  // Supplier toggles
  const [aiSourcing, setAiSourcing]                 = useState(true)
  const [logisticsPrecision, setLogisticsPrecision] = useState(false)
  const [autoReorder, setAutoReorder]               = useState(false)
  const [savedToggles, setSavedToggles]             = useState({ aiSourcing: true, logisticsPrecision: false, autoReorder: false })

  // Theme
  const [selectedTheme, setSelectedTheme]           = useState<'dark' | 'light'>('dark')
  const [savedTheme, setSavedTheme]                 = useState<'dark' | 'light'>('dark')

  // Security
  const [security, setSecurity]   = useState(defaultSecurity)
  const [savedSecurity, setSavedSecurity] = useState(defaultSecurity)

  const handleSave = () => {
    setSaved(form)
    setSavedToggles({ aiSourcing, logisticsPrecision, autoReorder })
    setSavedTheme(selectedTheme)
    setSavedSecurity(security)
    setToast({ message: t.settings.toastSaved, type: 'success' })
  }

  const handleDiscard = () => {
    setForm(savedForm)
    setAiSourcing(savedToggles.aiSourcing)
    setLogisticsPrecision(savedToggles.logisticsPrecision)
    setAutoReorder(savedToggles.autoReorder)
    setSelectedTheme(savedTheme)
    setSecurity(savedSecurity)
    setToast({ message: t.settings.toastDiscarded, type: 'info' })
  }

  const scrollTo = (id: string) => {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        value ? 'bg-primary-container' : 'bg-outline-variant/30'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
          value ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )

  return (
    <AppLayout>

      <main className="pb-32 px-6 max-w-6xl mx-auto">
        {/* Header */}
        <Animate variant="fade-up">
        <div className="mb-12">
          <p className="text-[10px] font-mono text-primary tracking-[0.3em] uppercase mb-2">{t.settings.systemConfig}</p>
          <h1 className="font-headline font-black text-4xl md:text-5xl tracking-tighter text-on-surface mb-2">
            {t.settings.pageTitle}
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-base font-light">
            {t.settings.pageDesc}
          </p>
        </div>
        </Animate>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Sidebar */}
          <aside className="lg:col-span-3 sticky top-28 space-y-1">
            {sidebarItems.map((item, i) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center gap-3 transition-all ${
                  active === item.id
                    ? 'bg-primary-container/10 text-primary border border-primary/10'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                <span className="text-sm">{t.settings.sidebar[i]}</span>
              </button>
            ))}

            {/* Save / Discard in sidebar on desktop */}
            <div className="pt-6 space-y-2 hidden lg:block">
              <button
                onClick={handleSave}
                className="w-full py-3 rounded-xl bg-primary-container text-on-primary-container font-headline font-bold text-sm hover:shadow-[0_0_20px_rgba(46,91,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                {t.settings.saveConfig}
              </button>
              <button
                onClick={handleDiscard}
                className="w-full py-3 rounded-xl border border-outline-variant/20 text-on-surface-variant font-bold text-sm hover:bg-surface-container hover:text-on-surface transition-all"
              >
                {t.settings.discardChanges}
              </button>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-9 space-y-20">

            {/* ── Account ── */}
            <Animate variant="fade-up" as="section" id="account" className="scroll-mt-32 space-y-8">
              <div className="border-b border-outline-variant/10 pb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-sm">person</span>
                </div>
                <h2 className="font-headline font-bold text-xl tracking-tight text-on-surface">{t.settings.accountTitle}</h2>
              </div>

              {/* Avatar row */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjYFBXAWJr0LMMkLbMvZl5QYoHw44SSGV75FHW9MPIksbSuwK-OIML2NqxcdsltnDX_gYxN7shjzShRS-rTMe5giDTNn1CzS_uuISf7hvUGByWQDuQvo-CXQ-zRkRbXshKlU4hTmEYVGVpFCgkcpvdVGoqIbO1WPzfEJf_Gtl5BF5g_lErhNhZCKo_0XnUQXDUv21-kFyjrCS15_LpeuAmwdXgIO6IK50-uypuxXLUuOft4-n2XPA3nxGwkwDTkr4UMI0rz04zNx4"
                    alt="User avatar"
                    className="w-16 h-16 rounded-2xl object-cover border border-outline-variant/20"
                  />
                  <button
                    onClick={() => setToast({ message: t.settings.toastAvatar, type: 'info' })}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-container flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-on-primary-container text-xs">edit</span>
                  </button>
                </div>
                <div>
                  <p className="font-headline font-bold text-on-surface">{form.name}</p>
                  <p className="text-xs text-on-surface-variant">{form.email}</p>
                  <p className="text-[10px] text-primary font-mono mt-1">{t.settings.proPlan}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: t.settings.fieldLabels[0], key: 'name', type: 'text' },
                  { label: t.settings.fieldLabels[1], key: 'email', type: 'email' },
                  { label: t.settings.fieldLabels[2], key: 'org', type: 'text' },
                  { label: t.settings.fieldLabels[3], key: 'region', type: 'text' },
                ].map(({ label, key, type }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm focus:border-primary/40 focus:outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
            </Animate>

            {/* ── Supplier Preferences ── */}
            <Animate variant="fade-up" delay={60} as="section" id="supplier" className="scroll-mt-32 space-y-8">
              <div className="border-b border-outline-variant/10 pb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-sm">local_shipping</span>
                </div>
                <h2 className="font-headline font-bold text-xl tracking-tight text-on-surface">{t.settings.supplierTitle}</h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: 'smart_toy',     iconBg: 'bg-primary/10',   iconColor: 'text-primary',
                    title: t.settings.supplierToggles[0].title,
                    desc: t.settings.supplierToggles[0].desc,
                    value: aiSourcing,   onChange: () => setAiSourcing((v) => !v),
                  },
                  {
                    icon: 'precision_manufacturing', iconBg: 'bg-secondary/10', iconColor: 'text-secondary',
                    title: t.settings.supplierToggles[1].title,
                    desc: t.settings.supplierToggles[1].desc,
                    value: logisticsPrecision, onChange: () => setLogisticsPrecision((v) => !v),
                  },
                  {
                    icon: 'autorenew',    iconBg: 'bg-tertiary/10',  iconColor: 'text-tertiary',
                    title: t.settings.supplierToggles[2].title,
                    desc: t.settings.supplierToggles[2].desc,
                    value: autoReorder,  onChange: () => setAutoReorder((v) => !v),
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between p-5 rounded-2xl bg-surface-container border border-outline-variant/5 hover:border-primary/10 transition-all gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center ${item.iconColor} shrink-0`}>
                        <span className="material-symbols-outlined text-sm">{item.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-on-surface text-sm">{item.title}</h4>
                        <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed max-w-sm">{item.desc}</p>
                      </div>
                    </div>
                    <Toggle value={item.value} onChange={item.onChange} />
                  </div>
                ))}
              </div>

              {/* Supplier priority list */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t.settings.preferredSupplier}</label>
                {['CDO — Comptoir Des Fers', 'Pim Plastic', 'Richardson', 'Marplin'].map((s, i) => (
                  <div key={s} className="flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-white/5">
                    <span className="text-[10px] font-mono text-primary w-4">{i + 1}</span>
                    <span className="text-sm text-on-surface flex-1">{s}</span>
                    <span className="material-symbols-outlined text-outline text-sm cursor-grab">drag_indicator</span>
                  </div>
                ))}
              </div>
            </Animate>

            {/* ── Theme ── */}
            <Animate variant="fade-up" delay={80} as="section" id="theme" className="scroll-mt-32 space-y-8">
              <div className="border-b border-outline-variant/10 pb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary text-sm">palette</span>
                </div>
                <h2 className="font-headline font-bold text-xl tracking-tight text-on-surface">{t.settings.themeTitle}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Midnight Dark */}
                <button
                  onClick={() => setSelectedTheme('dark')}
                  className={`relative cursor-pointer overflow-hidden rounded-2xl p-2 transition-all text-left ${
                    selectedTheme === 'dark'
                      ? 'border-2 border-primary ring-4 ring-primary/5'
                      : 'border border-outline-variant/10 hover:border-primary/30'
                  }`}
                >
                  <div className="aspect-video rounded-xl bg-[#060e20] mb-3 overflow-hidden p-4 space-y-2">
                    <div className="h-2 w-1/3 bg-[#2e5bff]/40 rounded-full" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-10 bg-[#131b2e] rounded-lg border border-[#2e5bff]/10" />
                      <div className="h-10 bg-[#171f32] rounded-lg" />
                      <div className="h-10 bg-[#2e5bff]/20 rounded-lg border border-[#2e5bff]/20" />
                    </div>
                    <div className="h-1 w-2/3 bg-[#2e5bff]/30 rounded-full" />
                    <div className="h-1 w-1/2 bg-slate-700 rounded-full" />
                  </div>
                  <div className="px-2 pb-2 flex justify-between items-center">
                    <div>
                      <span className="font-headline font-bold text-on-surface text-sm">{t.settings.darkTheme.name}</span>
                      <p className="text-[10px] text-on-surface-variant">{t.settings.darkTheme.desc}</p>
                    </div>
                    {selectedTheme === 'dark' && (
                      <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    )}
                  </div>
                </button>

                {/* Clean Light */}
                <button
                  onClick={() => setSelectedTheme('light')}
                  className={`relative cursor-pointer overflow-hidden rounded-2xl p-2 transition-all text-left ${
                    selectedTheme === 'light'
                      ? 'border-2 border-primary ring-4 ring-primary/5'
                      : 'border border-outline-variant/10 hover:border-primary/30'
                  }`}
                >
                  <div className="aspect-video rounded-xl bg-slate-50 mb-3 overflow-hidden p-4 space-y-2">
                    <div className="h-2 w-1/3 bg-blue-600/40 rounded-full" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-10 bg-white rounded-lg border border-slate-200" />
                      <div className="h-10 bg-slate-100 rounded-lg" />
                      <div className="h-10 bg-blue-50 rounded-lg border border-blue-200" />
                    </div>
                    <div className="h-1 w-2/3 bg-slate-300 rounded-full" />
                    <div className="h-1 w-1/2 bg-slate-200 rounded-full" />
                  </div>
                  <div className="px-2 pb-2 flex justify-between items-center">
                    <div>
                      <span className="font-headline font-bold text-on-surface text-sm">{t.settings.lightTheme.name}</span>
                      <p className="text-[10px] text-on-surface-variant">{t.settings.lightTheme.desc}</p>
                    </div>
                    {selectedTheme === 'light' && (
                      <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    )}
                  </div>
                </button>
              </div>

              {/* Density */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t.settings.interfaceDensity}</label>
                <div className="flex gap-3">
                  {t.settings.densityOptions.map((d) => (
                    <button
                      key={d}
                      className="flex-1 py-2.5 rounded-xl border border-outline-variant/20 text-xs font-semibold text-on-surface-variant hover:border-primary/30 hover:text-on-surface transition-all first:border-primary first:text-primary"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </Animate>

            {/* ── Security ── */}
            <Animate variant="fade-up" delay={100} as="section" id="security" className="scroll-mt-32 space-y-8">
              <div className="border-b border-outline-variant/10 pb-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-red-400 text-sm">security</span>
                </div>
                <h2 className="font-headline font-bold text-xl tracking-tight text-on-surface">{t.settings.securityTitle}</h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: 'phonelink_lock', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400',
                    title: t.settings.securityToggles[0].title,
                    desc: t.settings.securityToggles[0].desc,
                    key: 'twoFactor' as const,
                  },
                  {
                    icon: 'history',        iconBg: 'bg-blue-500/10',    iconColor: 'text-blue-400',
                    title: t.settings.securityToggles[1].title,
                    desc: t.settings.securityToggles[1].desc,
                    key: 'auditLog' as const,
                  },
                  {
                    icon: 'router',         iconBg: 'bg-orange-500/10',  iconColor: 'text-orange-400',
                    title: t.settings.securityToggles[2].title,
                    desc: t.settings.securityToggles[2].desc,
                    key: 'ipWhitelist' as const,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center justify-between p-5 rounded-2xl bg-surface-container border border-outline-variant/5 gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center ${item.iconColor} shrink-0`}>
                        <span className="material-symbols-outlined text-sm">{item.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-on-surface text-sm">{item.title}</h4>
                        <p className="text-xs text-on-surface-variant mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <Toggle
                      value={security[item.key]}
                      onChange={() => setSecurity((s) => ({ ...s, [item.key]: !s[item.key] }))}
                    />
                  </div>
                ))}
              </div>

              {/* Session timeout */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  {t.settings.sessionTimeout}
                </label>
                <select
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity((s) => ({ ...s, sessionTimeout: e.target.value }))}
                  className="w-full md:w-64 bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm focus:border-primary/40 focus:outline-none transition-all"
                >
                  {['15', '30', '60', '120', '480'].map((v) => (
                    <option key={v} value={v}>{v} {t.settings.minutes}</option>
                  ))}
                </select>
              </div>

              {/* Change password */}
              <button
                onClick={() => setToast({ message: t.settings.toastPassword, type: 'info' })}
                className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline transition-all"
              >
                <span className="material-symbols-outlined text-sm">lock_reset</span>
                {t.settings.changePassword}
              </button>
            </Animate>

            {/* Mobile save/discard footer */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-outline-variant/10 lg:hidden">
              <button
                onClick={handleDiscard}
                className="w-full sm:w-auto px-8 py-3 rounded-full font-headline font-bold text-on-surface-variant border border-outline-variant/20 hover:bg-surface-container transition-all"
              >
                {t.settings.discardChanges}
              </button>
              <button
                onClick={handleSave}
                className="w-full sm:w-auto px-10 py-3 rounded-full bg-primary-container text-on-primary-container font-headline font-extrabold tracking-tight shadow-[0_4px_24px_rgba(46,91,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                {t.settings.saveConfig}
              </button>
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AppLayout>
  )
}
