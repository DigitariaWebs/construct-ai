'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

const navLinks = [
  { href: '/dashboard', labelKey: 'insights', icon: 'dashboard' },
  { href: '/projects', labelKey: 'projects', icon: 'account_tree' },
  { href: '/processing', labelKey: 'fleet', icon: 'conveyor_belt' },
] as const

export default function Sidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <aside className="hidden md:flex flex-col w-[240px] fixed top-0 left-0 h-screen bg-surface-container/50 backdrop-blur-xl border-r border-outline-variant/20 pt-[80px] pb-6 px-4 shadow-[10px_0_40px_rgba(0,0,0,0.2)] z-40">
      <div className="flex-1 overflow-y-auto space-y-2 mt-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 px-3 mb-4">
          Main Menu
        </div>
        {navLinks.map(({ href, labelKey, icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 font-headline font-bold text-[13px] tracking-wider uppercase transition-all duration-300 px-4 py-3 rounded-xl ${
                active
                  ? 'bg-primary/10 text-primary shadow-inner border border-primary/20'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                {icon}
              </span>
              {t.nav[labelKey] || labelKey}
            </Link>
          )
        })}
      </div>
      
      <div className="mt-8 space-y-4">
        <div className="rounded-2xl bg-surface-container-low p-4 border border-outline-variant/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
          <h4 className="text-[11px] font-bold text-on-surface mb-1 uppercase tracking-widest relative z-10">AI Server Status</h4>
          <div className="flex items-center gap-2 text-primary relative z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-[10px] font-medium tracking-widest uppercase">Nodes Online</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

