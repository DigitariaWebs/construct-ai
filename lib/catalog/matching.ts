// 4-layer match engine for CCTP item → plumber's catalog entry.
//
//   1. exact_code   — if the CCTP cited a distributor reference (rare but free)
//   2. ean          — if present on the extracted item
//   3. normalized_label — exact match after accent/case normalization
//   4. fuzzy_trigram — character-trigram Dice coefficient, constrained by family + unit
//
// Below threshold: falls back to public tariff × (1 − family discount %) — the
// caller receives a MatchResult annotated with the method actually used.

import type { ExtractedItem } from '../quote/types'
import { familyFor, extractDiameterMm, normalize, type CatalogEntry, type Family, type MatchResult } from './types'

const TRIGRAM_THRESHOLD = 0.55 // tuned for short technical labels

// ─── Trigram similarity (Dice coefficient) ─────────────────────────────────

function trigrams(s: string): Set<string> {
  const norm = ` ${s} `
  const set = new Set<string>()
  for (let i = 0; i < norm.length - 2; i++) set.add(norm.slice(i, i + 3))
  return set
}

function diceCoef(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const t of a) if (b.has(t)) inter += 1
  return (2 * inter) / (a.size + b.size)
}

// ─── Public entry point ────────────────────────────────────────────────────

export type MatchContext = {
  entries: CatalogEntry[]
  /** Plumber's per-family discount %, applied when catalog has no match. */
  discountByFamily: Record<Family, number>
  /** Public tariff fallback (currently the static supplier catalog baseline). */
  publicTariffFallback: (item: ExtractedItem) => number
}

export function matchItem(item: ExtractedItem, ctx: MatchContext): MatchResult {
  const fam = familyFor(`${item.category} ${item.name} ${item.description ?? ''}`)
  const normName = normalize(`${item.name} ${item.description ?? ''}`)
  const diameter = extractDiameterMm(item.name + ' ' + (item.description ?? ''))

  // ── 1. exact item code ─────────────────────────────────────────────────
  if (item.reference) {
    const ref = item.reference.trim()
    const exact = ctx.entries.find(e => e.itemCode === ref)
    if (exact) return { entry: exact, method: 'exact_code', score: 1.0, unitPriceHT: exact.netPriceHT }
  }

  // ── 2. (future) EAN — ExtractedItem has no EAN field yet, stub for parity ──

  // ── 3. exact normalized label ─────────────────────────────────────────
  const exactLabel = ctx.entries.find(e =>
    e.family === fam &&
    e.normalizedLabel === normName,
  )
  if (exactLabel) {
    return { entry: exactLabel, method: 'normalized_label', score: 0.98, unitPriceHT: exactLabel.netPriceHT }
  }

  // ── 4. fuzzy trigram over family-constrained candidates ────────────────
  const candidates = ctx.entries.filter(e => e.family === fam)
  if (candidates.length > 0) {
    const queryGrams = trigrams(normName)
    let best: { entry: CatalogEntry; score: number } | null = null

    for (const c of candidates) {
      // Bias for diameter match — same diameter adds 0.15 to the score ceiling.
      let s = diceCoef(queryGrams, trigrams(c.normalizedLabel))
      if (diameter && c.diameterMm && diameter === c.diameterMm) s += 0.15
      if (!best || s > best.score) best = { entry: c, score: s }
    }

    if (best && best.score >= TRIGRAM_THRESHOLD) {
      return { entry: best.entry, method: 'fuzzy_trigram', score: Math.min(best.score, 1), unitPriceHT: best.entry.netPriceHT }
    }
  }

  // ── Fallbacks ─────────────────────────────────────────────────────────
  const publicPrice = ctx.publicTariffFallback(item)
  const discountPct = ctx.discountByFamily[fam] ?? 0

  if (discountPct > 0) {
    return {
      entry: null,
      method: 'discount_fallback',
      score: 0.4,
      unitPriceHT: publicPrice * (1 - discountPct / 100),
    }
  }

  return {
    entry: null,
    method: 'public_fallback',
    score: 0.2,
    unitPriceHT: publicPrice,
  }
}

export function methodLabel(method: MatchResult['method']): string {
  switch (method) {
    case 'exact_code':        return 'Réf. exacte'
    case 'ean':               return 'Code EAN'
    case 'normalized_label':  return 'Libellé exact'
    case 'fuzzy_trigram':     return 'Libellé proche'
    case 'discount_fallback': return 'Remise famille'
    case 'public_fallback':   return 'Tarif public'
  }
}

/** Confidence level for UI colour coding. */
export function methodTier(method: MatchResult['method']): 'high' | 'medium' | 'low' {
  if (method === 'exact_code' || method === 'ean' || method === 'normalized_label') return 'high'
  if (method === 'fuzzy_trigram' || method === 'discount_fallback') return 'medium'
  return 'low'
}
