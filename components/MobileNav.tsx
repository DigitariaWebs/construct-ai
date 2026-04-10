'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

const tabs = [
  { href: '/dashboard', labelKey: 'insights', icon: 'analytics' },
  { href: '/projects', labelKey: 'projects', icon: 'account_tree' },
  { href: '/processing', labelKey: 'fleet', icon: 'conveyor_belt' },
  { href: '/settings', labelKey: 'settings', icon: 'settings' },
] as const

export default function MobileNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center p-3 pb-safe bg-[#171f32]/70 backdrop-blur-2xl rounded-t-lg border-t border-blue-500/10 shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
      {tabs.map(({ href, labelKey, icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center transition-colors ${
              active
                ? 'text-blue-500 bg-blue-500/10 rounded-xl px-3 py-1 shadow-[0_0_15px_rgba(46,91,255,0.2)]'
                : 'text-slate-500 hover:text-blue-400'
            }`}
          >
            <span
              className="material-symbols-outlined mb-0.5"
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
            <span className="font-headline text-[10px] font-bold uppercase tracking-widest">
              {t.nav[labelKey]}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

