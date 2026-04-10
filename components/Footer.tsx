'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="w-full bg-[#060E20] py-12 px-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex flex-col gap-2">
        <span className="font-headline font-bold text-slate-200 tracking-tighter text-xl">
          CONSTRUCT.AI
        </span>
        <p className="font-body text-xs tracking-normal text-slate-500">
          {t.footer.copyright} {t.footer.tagline}
        </p>
      </div>

      <div className="flex gap-8">
        <a
          href="#"
          className="font-body text-xs tracking-normal text-slate-500 hover:text-white transition-colors"
        >
          {t.footer.docs}
        </a>
        <a
          href="#"
          className="font-body text-xs tracking-normal text-slate-500 hover:text-white transition-colors"
        >
          {t.footer.status}
        </a>
        <a
          href="#"
          className="font-body text-xs tracking-normal text-slate-500 hover:text-white transition-colors"
        >
          {t.footer.security}
        </a>
      </div>

      <div className="flex items-center gap-4 text-blue-600">
        <span className="material-symbols-outlined">verified</span>
        <span className="font-body text-xs font-bold uppercase tracking-widest">
          {t.footer.certified}
        </span>
      </div>
    </footer>
  )
}

