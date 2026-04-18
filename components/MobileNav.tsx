'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard',  icon: 'dashboard',     label: 'Accueil'    },
  { href: '/projects',   icon: 'description',   label: 'Devis'      },
  { href: '/processing', icon: 'upload_file',   label: 'Analyser'   },
  { href: '/quote',      icon: 'request_quote', label: 'Devis actif' },
  { href: '/settings',   icon: 'settings',      label: 'Paramètres' },
] as const

export default function MobileNav() {
  const pathname = usePathname()
  const hidden = ['/', '/auth'].includes(pathname)
  if (hidden) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface-container/90 backdrop-blur-xl border-t border-outline-variant/20 px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {links.map(({ href, icon, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                active ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-wider ${active ? 'text-primary' : 'text-on-surface-variant'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
