'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

const navLinks = [
  { href: '/', labelKey: 'home' },
  { href: '/dashboard', labelKey: 'insights' },
  { href: '/projects', labelKey: 'projects' },
] as const

export default function Navbar() {
  const pathname = usePathname()
  const { t, locale, setLocale } = useLanguage()

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-slate-900/60 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_40px_rgba(46,91,255,0.08)]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <span className="material-symbols-outlined text-blue-500 text-2xl">architecture</span>
        <span className="font-headline font-black text-blue-500 tracking-tighter text-lg uppercase">
          CONSTRUCT.AI
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
                <span className="absolute -bottom-[21px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(46,91,255,0.8)]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setLocale(locale === 'en' ? 'fr' : 'en')}
          className="h-10 px-3 rounded-full border border-outline-variant/30 bg-surface-container-highest/70 text-on-surface text-xs font-bold tracking-widest hover:border-primary/40 hover:text-primary transition-colors"
          aria-label="Switch language"
        >
          {locale === 'en' ? 'FR' : 'EN'}
        </button>
        <Link href="/settings" className="h-10 w-10 rounded-full bg-surface-container-highest border border-outline-variant overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-slate-900 transition-all block">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1faKx57wKJXeFYS2Y5jHrwnPjXyQqcaQDpNVqOSzg_MDjUvbqhYNzkMz_zBkEeMkOrrRDp1kS49WjCJCMTc_1hk9tWUNCV7fVk0g7VHZ0Yb42CjXKvW6tZ6as6-7OHMusXjWxz-iycULP2boEAMjkJNAgxhpK5DHIr_H1yAVOjqo4Bbhv_xMW_jLSTyS5X-EbUkXJlREtM-4GDgNtEbbydye0FJc3sun52T7-8qsOPvlOZciwVoFp7heIqDbQrBZQ9sIsMhfpVTA"
            alt="User profile"
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
    </header>
  )
}

