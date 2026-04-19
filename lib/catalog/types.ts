// Normalized catalog data model. This is the shape we persist in IndexedDB
// today and the shape the backend will speak tomorrow — rows migrate 1:1
// to the `supplier_catalog_entries` table described in the architecture.

export type Family = 'ef_ec' | 'pvc' | 'sanitaires' | 'chauffage' | 'vmc' | 'autres'

export const FAMILIES: Family[] = ['ef_ec', 'pvc', 'sanitaires', 'chauffage', 'vmc', 'autres']

export const FAMILY_LABELS: Record<Family, string> = {
  ef_ec:      'Alimentation EF / EC',
  pvc:        'Évacuations PVC',
  sanitaires: 'Appareils sanitaires',
  chauffage:  'Chauffage & gaz',
  vmc:        'VMC & ventilation',
  autres:     'Autres postes',
}

export const FAMILY_COLORS: Record<Family, { text: string; bg: string }> = {
  ef_ec:      { text: 'text-primary',      bg: 'bg-primary/10' },
  pvc:        { text: 'text-cyan-400',     bg: 'bg-cyan-500/10' },
  sanitaires: { text: 'text-secondary',    bg: 'bg-secondary/10' },
  chauffage:  { text: 'text-tertiary',     bg: 'bg-tertiary/10' },
  vmc:        { text: 'text-emerald-400',  bg: 'bg-emerald-500/10' },
  autres:     { text: 'text-on-surface-variant', bg: 'bg-white/5' },
}

export type CatalogSource = 'fabdis' | 'invoice_ocr' | 'manual'

export type CatalogEntry = {
  /** uuid */
  id: string
  /** Owning org — one plumber's catalog is private to their org. */
  orgId: string
  supplierId: string
  /** Which import batch produced this row — for rollback + diff. */
  snapshotId: string
  /** Distributor SKU (code article / REFART). */
  itemCode: string
  ean?: string
  label: string
  /** Lowercased, accent-stripped label — used by the match engine. */
  normalizedLabel: string
  family: Family
  /** Extracted when possible (for constrained search). */
  diameterMm?: number
  /** ml, u, ens, kg, m2, m3, h, pce, ... */
  unit: string
  publicPriceHT: number
  /** Plumber's negotiated price after his personal discount. */
  netPriceHT: number
  source: CatalogSource
  sourceFileName?: string
  importedAt: number
}

export type CatalogSnapshot = {
  id: string
  orgId: string
  supplierId: string
  source: CatalogSource
  sourceFileName: string
  importedAt: number
  itemsCount: number
  /** Paper trail: how many were new / updated / price-changed vs previous snapshot. */
  diff?: {
    added: number
    updated: number
    priceChanged: number
  }
}

export type MatchMethod =
  | 'exact_code'
  | 'ean'
  | 'normalized_label'
  | 'fuzzy_trigram'
  | 'discount_fallback'
  | 'public_fallback'

export type MatchResult = {
  entry: CatalogEntry | null
  method: MatchMethod
  score: number
  /** The unit price we landed on. */
  unitPriceHT: number
}

/** Map a free-text CCTP category/name to our normalized family taxonomy. */
export function familyFor(haystack: string): Family {
  const h = haystack.toLowerCase()
  if (/\b(per|cuivre|aliment|ef|ec|ecs|multic)\b/.test(h)) return 'ef_ec'
  if (/\b(pvc|évacuation|chute|eu|ev|siphon)\b/.test(h))   return 'pvc'
  if (/\b(wc|lavabo|baignoire|douche|évier|sanitaire|mitigeur|robinet|urinoir)\b/.test(h)) return 'sanitaires'
  if (/\b(chaudière|radiateur|chauffage|gaz|thermostat|pac|pompe à chaleur)\b/.test(h))    return 'chauffage'
  if (/\b(vmc|ventilation|bouche|extracteur|hygro|caisson)\b/.test(h)) return 'vmc'
  return 'autres'
}

/** Lowercase, strip accents, collapse whitespace. Used for normalized label + match keys. */
export function normalize(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.\/]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

/** Pull "Ø32", "Ø12/14", "DN50" → mm. */
export function extractDiameterMm(text: string): number | undefined {
  const m = text.match(/(?:Ø|diam(?:ètre|etre)?|dn)\s*(\d{1,3})(?:\s*[\/xX]\s*\d{1,3})?/i)
  if (m) return parseInt(m[1], 10)
  const bare = text.match(/\b(\d{2,3})\s*(?:mm|mil)\b/i)
  return bare ? parseInt(bare[1], 10) : undefined
}
