'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { QuoteValidation } from '@/features/quote/types'

function fill(tmpl: string, vars: Record<string, string | number>): string {
  return tmpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`))
}

type Props = { validation: QuoteValidation }

export default function ValidationPanel({ validation }: Props) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  const total = validation.removed.length + validation.warnings.length + validation.merged.length
  if (total === 0) return null

  return (
    <section className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] overflow-hidden">
      <header className="px-5 py-4 flex items-center justify-between gap-4 border-b border-amber-500/10">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="material-symbols-outlined text-amber-400 text-lg shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            rule
          </span>
          <div className="min-w-0">
            <div className="text-amber-400 font-mono text-[10px] tracking-widest uppercase font-bold">
              {t.quote.validationTitle}
            </div>
            <div className="text-sm text-on-surface mt-0.5">
              {fill(t.quote.validationSummary, { count: total })}
            </div>
          </div>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="shrink-0 text-[11px] font-semibold text-amber-400/80 hover:text-amber-400 transition-colors"
        >
          {open ? t.quote.validationHide : t.quote.validationShow}
        </button>
      </header>

      {open && (
        <ul className="divide-y divide-white/5">
          {validation.removed.map((issue, i) => (
            <li key={`r-${i}`} className="px-5 py-3 flex items-start gap-4">
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-400 uppercase tracking-widest mt-0.5">
                {t.quote.validationRemoved}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-on-surface truncate">{issue.item}</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">{issue.reason}</div>
              </div>
            </li>
          ))}
          {validation.warnings.map((issue, i) => (
            <li key={`w-${i}`} className="px-5 py-3 flex items-start gap-4">
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-400 uppercase tracking-widest mt-0.5">
                {t.quote.validationWarnings}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-on-surface truncate">{issue.item}</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">{issue.reason}</div>
              </div>
            </li>
          ))}
          {validation.merged.map((issue, i) => (
            <li key={`m-${i}`} className="px-5 py-3 flex items-start gap-4">
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-[9px] font-bold text-sky-400 uppercase tracking-widest mt-0.5">
                {t.quote.validationMerged}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-on-surface truncate">{issue.item}</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">{issue.reason}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
