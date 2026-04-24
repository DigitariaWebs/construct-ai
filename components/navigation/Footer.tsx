'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  const links = [
    { href: '/',          label: t.footer.home },
    { href: '/dashboard', label: t.footer.dashboard },
    { href: '/projects',  label: t.footer.projects },
    { href: '/catalog',   label: t.footer.catalog },
  ]

  return (
    <footer className="w-full bg-black py-12 px-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex flex-col gap-2">
        <span className="font-headline font-bold text-on-surface tracking-tighter text-xl">
          PLOMBIA CHIFFRAGE
        </span>
        <p className="font-body text-xs tracking-normal text-on-surface-variant">
          {t.footer.copyright} {t.footer.tagline}
        </p>
      </div>

      <nav className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="font-body text-xs tracking-normal text-on-surface-variant hover:text-primary transition-colors"
          >
            {label}
          </Link>
        ))}
        <a
          href="mailto:alambre.contact@gmail.com"
          className="font-body text-xs tracking-normal text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[14px]">mail</span>
          alambre.contact@gmail.com
        </a>
      </nav>

      <div className="flex items-center gap-4 text-primary">
        <span className="material-symbols-outlined">verified</span>
        <span className="font-body text-xs font-bold uppercase tracking-widest">
          {t.footer.certified}
        </span>
      </div>
    </footer>
  )
}
