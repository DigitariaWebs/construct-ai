// FAB-DIS / generic distributor CSV parser.
//
// The official FAB-DIS spec has ~200 columns — we only need about 7 of them.
// Real plumber exports rarely conform perfectly to the spec, so we identify
// columns by *aliases* (French + English, accented + non-accented) rather
// than by fixed position.
//
// Input: raw CSV/TSV text. Output: EntryDraft[] ready to feed importEntries().

import { familyFor, extractDiameterMm, normalize, type Family } from '../types'
import type { EntryDraft } from '../store'

// ─── CSV parsing ────────────────────────────────────────────────────────────

function detectDelimiter(sample: string): ',' | ';' | '\t' | '|' {
  // FAB-DIS / French Excel exports use ';'. Others vary. Sniff by frequency on the header line.
  const line = sample.split(/\r?\n/)[0] ?? ''
  const counts: Record<string, number> = {
    ';': (line.match(/;/g) || []).length,
    ',': (line.match(/,/g) || []).length,
    '\t': (line.match(/\t/g) || []).length,
    '|': (line.match(/\|/g) || []).length,
  }
  const winner = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]) as ',' | ';' | '\t' | '|'
  return counts[winner] > 0 ? winner : ';'
}

/**
 * RFC 4180-ish CSV parser with custom delimiter. Handles double-quoted fields,
 * escaped quotes ("") inside quoted fields, and CRLF/LF line endings.
 */
export function parseCsv(text: string, delimiter?: string): string[][] {
  const delim = delimiter ?? detectDelimiter(text)
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let i = 0
  let inQuotes = false

  while (i < text.length) {
    const c = text[i]

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue }
        inQuotes = false
        i += 1
        continue
      }
      field += c
      i += 1
      continue
    }

    if (c === '"') { inQuotes = true; i += 1; continue }
    if (c === delim) { row.push(field); field = ''; i += 1; continue }
    if (c === '\r') { i += 1; continue }
    if (c === '\n') {
      row.push(field)
      if (row.some(f => f.length > 0)) rows.push(row)
      row = []
      field = ''
      i += 1
      continue
    }

    field += c
    i += 1
  }

  // flush
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    if (row.some(f => f.length > 0)) rows.push(row)
  }

  return rows
}

// ─── Column detection ──────────────────────────────────────────────────────

type ColSpec = { key: 'itemCode' | 'label' | 'ean' | 'unit' | 'publicPrice' | 'netPrice' | 'family' | 'discountPct'; aliases: string[] }

const COLUMN_SPECS: ColSpec[] = [
  { key: 'itemCode',    aliases: ['refart', 'codart', 'code article', 'code', 'reference', 'référence', 'ref', 'sku'] },
  { key: 'label',       aliases: ['libart', 'libelle', 'libellé', 'designation', 'désignation', 'description', 'nom', 'label', 'libellé article'] },
  { key: 'ean',         aliases: ['codean', 'ean', 'ean13', 'gtin', 'code barre', 'code-barre'] },
  { key: 'unit',        aliases: ['univte', 'unite', 'unité', 'unit', 'u'] },
  { key: 'publicPrice', aliases: ['puht', 'pu ht', 'prix public', 'prix public ht', 'prix catalogue', 'tarif public', 'tarif ht', 'prix ht', 'pbht'] },
  { key: 'netPrice',    aliases: ['pnht', 'pn ht', 'prix net', 'prix net ht', 'prix negocie', 'prix négocié', 'prix d achat', 'prix dachat', 'prix reel', 'prix acheteur'] },
  { key: 'family',      aliases: ['fampro', 'famille', 'family', 'gamme', 'categorie', 'catégorie'] },
  { key: 'discountPct', aliases: ['remise', 'remise %', 'remise pct', 'remise pourcent', 'discount', 'taux remise'] },
]

function matchColumn(header: string): ColSpec['key'] | null {
  const h = normalize(header)
  for (const spec of COLUMN_SPECS) {
    if (spec.aliases.some(a => h === a || h.includes(a))) return spec.key
  }
  return null
}

function parseNumber(raw: string): number {
  if (!raw) return NaN
  // French decimals: "12,34" → 12.34. Strip spaces, € signs.
  const clean = raw.replace(/\s/g, '').replace(/€/g, '').replace(',', '.')
  const n = parseFloat(clean)
  return Number.isFinite(n) ? n : NaN
}

// ─── Parser ────────────────────────────────────────────────────────────────

export type FabdisParseResult = {
  drafts: EntryDraft[]
  totalRows: number
  skippedRows: number
  detectedColumns: Partial<Record<ColSpec['key'], { index: number; header: string }>>
  warnings: string[]
}

export function parseFabdis(
  csvText: string,
  opts: { supplierId: string; source?: 'fabdis' | 'manual'; sourceFileName?: string },
): FabdisParseResult {
  const warnings: string[] = []
  const rows = parseCsv(csvText)
  if (rows.length < 2) {
    return { drafts: [], totalRows: 0, skippedRows: 0, detectedColumns: {}, warnings: ['Fichier vide ou sans données.'] }
  }

  const headerRow = rows[0]
  const colIdx: Partial<Record<ColSpec['key'], { index: number; header: string }>> = {}
  headerRow.forEach((h, i) => {
    const key = matchColumn(h)
    if (key && !colIdx[key]) colIdx[key] = { index: i, header: h }
  })

  if (!colIdx.itemCode || !colIdx.label) {
    return {
      drafts: [],
      totalRows: rows.length - 1,
      skippedRows: rows.length - 1,
      detectedColumns: colIdx,
      warnings: [
        `Colonnes "code article" et "libellé" introuvables. En-têtes détectés : ${headerRow.map(h => `"${h}"`).join(', ')}`,
      ],
    }
  }
  if (!colIdx.publicPrice && !colIdx.netPrice) {
    warnings.push('Aucune colonne de prix détectée. Les lignes seront importées à 0 €.')
  }

  const drafts: EntryDraft[] = []
  let skipped = 0

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r]
    const itemCode = (cells[colIdx.itemCode.index] ?? '').trim()
    const label    = (cells[colIdx.label.index]    ?? '').trim()
    if (!itemCode || !label) { skipped += 1; continue }

    const publicRaw = colIdx.publicPrice ? cells[colIdx.publicPrice.index] : ''
    const netRaw    = colIdx.netPrice    ? cells[colIdx.netPrice.index]    : ''
    const discRaw   = colIdx.discountPct ? cells[colIdx.discountPct.index] : ''

    const publicHT = parseNumber(publicRaw)
    let   netHT    = parseNumber(netRaw)
    const discount = parseNumber(discRaw)

    // Derive net price from public + discount when net isn't present.
    if (Number.isNaN(netHT) && Number.isFinite(publicHT) && Number.isFinite(discount)) {
      netHT = publicHT * (1 - discount / 100)
    }
    // Or fall back to public price when no discount negotiated yet.
    if (Number.isNaN(netHT)) netHT = Number.isFinite(publicHT) ? publicHT : 0

    const ean   = colIdx.ean   ? (cells[colIdx.ean.index]   ?? '').trim() : ''
    const unit  = colIdx.unit  ? (cells[colIdx.unit.index]  ?? '').trim() : 'u'
    const famRaw = colIdx.family ? (cells[colIdx.family.index] ?? '').trim() : ''

    const family: Family = famRaw ? familyFor(famRaw) : familyFor(`${label}`)

    drafts.push({
      supplierId: opts.supplierId,
      itemCode,
      ean: ean || undefined,
      label,
      normalizedLabel: normalize(label),
      family,
      diameterMm: extractDiameterMm(label),
      unit: unit || 'u',
      publicPriceHT: Number.isFinite(publicHT) ? publicHT : netHT,
      netPriceHT: netHT,
      source: opts.source ?? 'fabdis',
      sourceFileName: opts.sourceFileName,
    })
  }

  return {
    drafts,
    totalRows: rows.length - 1,
    skippedRows: skipped,
    detectedColumns: colIdx,
    warnings,
  }
}
