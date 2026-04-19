// Bridge: ExtractedInvoice (from the OCR endpoint) → EntryDraft[] ready to
// feed importEntries(). Filters out nonsense lines (no code + no price).

import { familyFor, extractDiameterMm, normalize } from '../types'
import type { EntryDraft } from '../store'
import type { ExtractedInvoice } from './schema'

export function invoiceToDrafts(
  invoice: ExtractedInvoice,
  supplierId: string,
  fileName: string,
): EntryDraft[] {
  const drafts: EntryDraft[] = []

  for (const [i, item] of invoice.items.entries()) {
    if (!item.label) continue
    if (item.unitPriceHT <= 0) continue

    // Without a real itemCode, synthesise a stable one from the file + line so
    // repeated imports of the same invoice don't create duplicates.
    const code = item.itemCode?.trim() || `OCR-${hash(fileName)}-${i + 1}`

    drafts.push({
      supplierId,
      itemCode: code,
      label: item.label.trim(),
      normalizedLabel: normalize(item.label),
      family: familyFor(item.label),
      diameterMm: extractDiameterMm(item.label),
      unit: (item.unit || 'u').trim(),
      publicPriceHT: item.unitPriceHT, // no public price on invoices — use net as proxy
      netPriceHT: item.unitPriceHT,
      source: 'invoice_ocr',
      sourceFileName: fileName,
    })
  }

  return drafts
}

/** Stable 32-bit string hash — enough to uniquely tag invoice lines. */
function hash(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return (h >>> 0).toString(16)
}
