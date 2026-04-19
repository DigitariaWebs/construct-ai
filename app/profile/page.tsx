'use client'

import Link from 'next/link'
import { useState } from 'react'
import AppLayout from '@/components/AppLayout'
import Animate from '@/components/Animate'
import Toast from '@/components/Toast'
import { useLanguage } from '@/contexts/LanguageContext'

const USER = {
  firstName: 'Jean-Marc',
  lastName:  'Bertrand',
  email:     'jm.bertrand@plomberie-bertrand.fr',
  phone:     '06 12 34 56 78',
  company:   'Plomberie Bertrand',
  sector:    'Plomberie',
  city:      'Lyon, France',
  joined:    '15 avril 2025',
  plan:      'Pro',
  initials:  'JB',
}

const STATS_CONFIG = [
  { key: 'statsQuotes',     value: '127',  icon: 'description', trend: '+12 ce mois-ci',   color: 'primary'    },
  { key: 'statsProjects',   value: '14',   icon: 'foundation',  trend: '3 en revue',        color: 'on-surface' },
  { key: 'statsCompliance', value: '98%',  icon: 'verified',    trend: '+2% vs. N-1',       color: 'emerald'    },
  { key: 'statsRevenue',    value: '42k€', icon: 'trending_up', trend: '+18% vs. mois-1',   color: 'primary'    },
] as const

const ACTIVITY = [
  { time: 'Il y a 2 h',    icon: 'description',   text: 'Devis',                    highlight: 'PRJ-992-DELTA', meta: 'généré depuis CCTP' },
  { time: 'Il y a 5 h',    icon: 'upload_file',   text: 'CCTP',                     highlight: 'Skyline Pavilion v3', meta: 'analysé (26 lots)' },
  { time: 'Hier',          icon: 'check_circle',  text: 'Devis validé par',         highlight: 'A. Vance',      meta: 'PRJ-988-ALPHA' },
  { time: 'Il y a 3 j',    icon: 'edit',          text: 'Profil société mis à jour', highlight: '',              meta: 'logo ajouté' },
  { time: 'Il y a 5 j',    icon: 'credit_card',   text: 'Facture',                  highlight: '450,00 €',      meta: 'payée — Plan Pro' },
]

const SHORTCUTS_CONFIG = [
  { href: '/settings', icon: 'person',        key: 'shortcutInfo' },
  { href: '/settings', icon: 'storefront',    key: 'shortcutSuppliers' },
  { href: '/settings', icon: 'credit_card',   key: 'shortcutBilling' },
  { href: '/settings', icon: 'lock',          key: 'shortcutSecurity' },
  { href: '/settings', icon: 'notifications', key: 'shortcutNotifications' },
] as const

export default function ProfilePage() {
  const { t } = useLanguage()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  return (
    <AppLayout>
      <div className="pb-32 space-y-8">

        {/* Hero */}
        <Animate variant="fade-up" as="section" className="pt-4">
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-surface-container-low via-surface-container-low to-surface-container p-8 md:p-10">
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 md:items-center">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-primary/15 border border-primary/30 flex items-center justify-center font-headline font-black text-4xl md:text-5xl text-primary shadow-[0_0_40px_rgba(212,255,58,0.15)]">
                  {USER.initials}
                </div>
                <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500/90 border-2 border-surface-container-low flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-primary font-headline font-bold tracking-widest text-[10px] uppercase">
                  {t.profile.verifiedAccount}
                </span>
                <h1 className="text-3xl md:text-4xl font-headline font-black tracking-tighter text-on-surface mt-1">
                  {USER.firstName} {USER.lastName}
                </h1>
                <p className="text-on-surface-variant text-sm mt-1">
                  {USER.sector} · {USER.company}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant/20 text-on-surface-variant text-[11px] font-medium">
                    <span className="material-symbols-outlined text-[13px]">mail</span>{USER.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant/20 text-on-surface-variant text-[11px] font-medium">
                    <span className="material-symbols-outlined text-[13px]">call</span>{USER.phone}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant/20 text-on-surface-variant text-[11px] font-medium">
                    <span className="material-symbols-outlined text-[13px]">location_on</span>{USER.city}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-bold uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />Plan {USER.plan}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-3 md:ml-auto">
                <Link
                  href="/settings"
                  className="px-5 py-3 bg-primary-container text-on-primary-container font-bold rounded-xl hover:shadow-[0_0_20px_rgba(212,255,58,0.3)] transition-all text-sm text-center whitespace-nowrap"
                >
                  {t.profile.editProfile}
                </Link>
                <button
                  onClick={() => setToast({ message: t.profile.shareSuccess, type: 'success' })}
                  className="px-5 py-3 border border-outline-variant/20 bg-surface-container text-on-surface font-bold rounded-xl hover:bg-surface-container-high transition-all text-sm whitespace-nowrap"
                >
                  {t.profile.share}
                </button>
              </div>
            </div>
          </div>
        </Animate>

        {/* Stats */}
        <Animate variant="fade-up" delay={60} as="section" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS_CONFIG.map(s => (
            <div key={s.key} className="group relative overflow-hidden bg-surface-container-low rounded-2xl border border-white/5 p-5 hover:border-primary/20 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  s.color === 'primary' ? 'bg-primary/15 text-primary' :
                  s.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' :
                  'bg-surface-container-highest text-on-surface'
                }`}>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                </div>
              </div>
              <div className="text-3xl font-headline font-black text-on-surface tracking-tighter">{s.value}</div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">{t.profile[s.key]}</div>
              <div className="text-[10px] text-on-surface-variant/70 mt-2">{s.trend}</div>
            </div>
          ))}
        </Animate>

        {/* Body: activity + shortcuts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Activity */}
          <Animate variant="fade-up" delay={120} className="lg:col-span-2">
            <div className="bg-surface-container-low rounded-2xl border border-white/5 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-headline font-bold text-xl text-on-surface">
                    {t.profile.recentActivityTitle}
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    {t.profile.recentActivityDesc}
                  </p>
                </div>
                <Link href="/dashboard" className="text-xs font-bold text-primary hover:text-white transition-colors tracking-widest uppercase">
                  {t.profile.seeAll}
                </Link>
              </div>

              <ol className="relative space-y-0 divide-y divide-white/5">
                {ACTIVITY.map((a, i) => (
                  <li key={i} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="w-9 h-9 rounded-xl bg-surface-container border border-outline-variant/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-on-surface">
                        {a.text}{' '}
                        {a.highlight && <span className="font-semibold text-primary">{a.highlight}</span>}
                        {a.meta && <span className="text-on-surface-variant"> — {a.meta}</span>}
                      </div>
                      <div className="text-[11px] text-on-surface-variant/70 mt-0.5">{a.time}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Animate>

          {/* Right column */}
          <Animate variant="fade-up" delay={180} className="space-y-6">

            {/* Completeness */}
            <div className="bg-surface-container-low rounded-2xl border border-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline font-bold text-base text-on-surface">
                  {t.profile.profileCompletionTitle}
                </h3>
                <span className="text-primary font-headline font-black text-lg">80%</span>
              </div>
              <div className="h-2 rounded-full bg-surface-container overflow-hidden mb-4">
                <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-primary/70 to-primary shadow-[0_0_12px_rgba(212,255,58,0.4)]" />
              </div>
              <ul className="space-y-2.5">
                {[
                  { label: t.profile.completionContact, done: true  },
                  { label: t.profile.completionCompany, done: true  },
                  { label: t.profile.completionPayment, done: true  },
                  { label: t.profile.completionLogo,    done: false },
                  { label: t.profile.completion2FA,     done: false },
                ].map(i => (
                  <li key={i.label} className="flex items-center gap-2 text-xs">
                    <span className={`material-symbols-outlined text-[16px] ${i.done ? 'text-primary' : 'text-on-surface-variant/40'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {i.done ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={i.done ? 'text-on-surface-variant line-through' : 'text-on-surface'}>{i.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Shortcuts */}
            <div className="bg-surface-container-low rounded-2xl border border-white/5 p-6">
              <h3 className="font-headline font-bold text-base text-on-surface mb-4">
                {t.profile.shortcutsTitle}
              </h3>
              <nav className="space-y-1">
                {SHORTCUTS_CONFIG.map(s => (
                  <Link key={s.key} href={s.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors group">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary transition-colors">{s.icon}</span>
                    <span className="flex-1">{t.profile[s.key]}</span>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant/40">chevron_right</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Joined */}
            <div className="bg-surface-container-low rounded-2xl border border-white/5 p-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">cake</span>
              </div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase font-bold tracking-widest text-on-surface-variant">
                  {t.profile.memberSince}
                </div>
                <div className="text-sm font-semibold text-on-surface truncate">{USER.joined}</div>
              </div>
            </div>

          </Animate>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AppLayout>
  )
}
