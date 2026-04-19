'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { ExtractedToc } from '@/lib/quote/types'

function fill(tmpl: string, vars: Record<string, string | number>): string {
  return tmpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`))
}

type Props = { toc: ExtractedToc }

export default function DetectedLotsPanel({ toc }: Props) {
  const { t } = useLanguage()
  const [showIgnored, setShowIgnored] = useState(false)

  const scored  = toc.lots.filter(l => l.isPlumbing)
  const ignored = toc.lots.filter(l => !l.isPlumbing)

  // Nothing meaningful to show if there was no narrowing — the pipeline
  // still returns a TOC for visibility, but the panel adds noise when
  // every lot was scored.
  if (scored.length === 0) return null
  if (ignored.length === 0) return null

  return (
    <section className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] overflow-hidden">
      <header className="px-5 py-4 flex items-center justify-between gap-4 border-b border-emerald-500/10">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="material-symbols-outlined text-emerald-400 text-lg shrink-0"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            list_alt
          </span>
          <div className="min-w-0">
            <div className="text-emerald-400 font-mono text-[10px] tracking-widest uppercase font-bold">
              {t.quote.tocTitle}
            </div>
            <div className="text-sm text-on-surface mt-0.5 truncate">
              {fill(t.quote.tocSummary, { scored: scored.length, total: toc.lots.length })}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowIgnored(v => !v)}
          className="shrink-0 text-[11px] font-semibold text-emerald-400/80 hover:text-emerald-400 transition-colors"
        >
          {showIgnored ? t.quote.tocHideAll : t.quote.tocShowAll}
        </button>
      </header>

      <ul className="divide-y divide-white/5">
        {scored.map((l, i) => (
          <li key={`k-${i}`} className="px-5 py-3 flex items-center gap-4">
            <span className="shrink-0 w-8 font-mono text-xs text-on-surface-variant">
              {l.number}
            </span>
            <span className="flex-1 text-sm text-on-surface truncate">{l.title}</span>
            <span className="shrink-0 text-[10px] text-on-surface-variant font-mono">
              {fill(t.quote.tocPageRange, { start: l.startPage, end: l.endPage })}
            </span>
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
              {t.quote.tocScored}
            </span>
          </li>
        ))}

        {showIgnored && ignored.map((l, i) => (
          <li key={`i-${i}`} className="px-5 py-3 flex items-center gap-4 opacity-50">
            <span className="shrink-0 w-8 font-mono text-xs text-on-surface-variant">
              {l.number}
            </span>
            <span className="flex-1 text-sm text-on-surface-variant truncate">{l.title}</span>
            <span className="shrink-0 text-[10px] text-on-surface-variant font-mono">
              {fill(t.quote.tocPageRange, { start: l.startPage, end: l.endPage })}
            </span>
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-surface-container-high border border-outline-variant/20 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
              {t.quote.tocIgnored}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
