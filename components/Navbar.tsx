'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

const navLinks = [
  { href: '/', labelKey: 'home' },
  { href: '/dashboard', labelKey: 'insights' },
  { href: '/projects', labelKey: 'projects' },
] as const

const USER = {
  name: 'Jean-Marc Bertrand',
  email: 'jm.bertrand@plomberie-bertrand.fr',
  initials: 'JB',
  company: 'Plomberie Bertrand',
  plan: 'Pro',
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { t, locale, setLocale } = useLanguage()

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const menuItems: { href?: string; onClick?: () => void; icon: string; label: string; danger?: boolean }[] = [
    { href: '/profile',   icon: 'account_circle', label: locale === 'fr' ? 'Mon profil'       : 'My profile' },
    { href: '/settings',  icon: 'tune',           label: locale === 'fr' ? 'Paramètres'       : 'Settings' },
    { href: '/settings?tab=abonnement', icon: 'credit_card', label: locale === 'fr' ? 'Abonnement' : 'Billing' },
    { onClick: () => router.push('/auth'), icon: 'logout', label: locale === 'fr' ? 'Déconnexion' : 'Sign out', danger: true },
  ]

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-black/60 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_40px_rgba(212,255,58,0.08)]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <span className="material-symbols-outlined text-on-surface text-2xl">architecture</span>
        <span className="font-headline font-black text-on-surface tracking-tighter text-lg uppercase">
          DIGITAL FOREMAN
        </span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex flex-1 items-center justify-center gap-8">
        {navLinks.map(({ href, labelKey }) => {
          const active = href === '/' ? pathname === '/' : (pathname === href || pathname.startsWith(`${href}/`))
          return (
            <Link
              key={href}
              href={href}
              className={`relative font-headline font-bold text-[13px] tracking-[0.2em] uppercase transition-all duration-300 px-4 py-2 rounded-xl group/link ${
                active
                  ? 'text-primary bg-primary/10'
                  : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
              }`}
            >
              {t.nav[labelKey] || labelKey}
              {active && (
                <span className="absolute -bottom-[21px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(212,255,58,0.8)]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Right cluster */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}
          className="h-10 px-3 rounded-full border border-outline-variant/30 bg-surface-container-highest/70 text-on-surface text-xs font-bold tracking-widest hover:border-primary/40 hover:text-primary transition-colors"
          aria-label="Switch language"
        >
          {locale === 'en' ? 'FR' : 'EN'}
        </button>

        {/* Avatar + menu */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Open user menu"
            className={`h-10 w-10 rounded-full bg-surface-container-highest border border-outline-variant overflow-hidden cursor-pointer transition-all block ${
              menuOpen ? 'ring-2 ring-primary ring-offset-2 ring-offset-black' : 'hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-black'
            }`}
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1faKx57wKJXeFYS2Y5jHrwnPjXyQqcaQDpNVqOSzg_MDjUvbqhYNzkMz_zBkEeMkOrrRDp1kS49WjCJCMTc_1hk9tWUNCV7fVk0g7VHZ0Yb42CjXKvW6tZ6as6-7OHMusXjWxz-iycULP2boEAMjkJNAgxhpK5DHIr_H1yAVOjqo4Bbhv_xMW_jLSTyS5X-EbUkXJlREtM-4GDgNtEbbydye0FJc3sun52T7-8qsOPvlOZciwVoFp7heIqDbQrBZQ9sIsMhfpVTA"
              alt="User profile"
              className="w-full h-full object-cover"
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-3 w-72 origin-top-right rounded-2xl border border-white/5 bg-surface-container-low/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden animate-[fadeIn_0.15s_ease-out]"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-headline font-black text-sm text-primary flex-shrink-0">
                  {USER.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-on-surface truncate">{USER.name}</div>
                  <div className="text-[11px] text-on-surface-variant truncate">{USER.email}</div>
                  <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest">
                    <span className="w-1 h-1 rounded-full bg-primary" /> Plan {USER.plan}
                  </div>
                </div>
              </div>

              {/* Items */}
              <nav className="p-2">
                {menuItems.map(item => {
                  const cls = `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    item.danger
                      ? 'text-red-400 hover:bg-red-500/10'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`
                  const body = (
                    <>
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      <span>{item.label}</span>
                    </>
                  )
                  return item.href
                    ? <Link key={item.label} href={item.href} role="menuitem" className={cls}>{body}</Link>
                    : <button key={item.label} type="button" role="menuitem" onClick={item.onClick} className={cls}>{body}</button>
                })}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
