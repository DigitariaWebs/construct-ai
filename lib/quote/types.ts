// Extracted quote structure produced by the AI from a CCTP PDF.
// Shared by the API route, the processing page, and the quote page.

export type Unit = 'ml' | 'm2' | 'm3' | 'u' | 'kg' | 'h' | 'ens' | 'pce'

export type ExtractedItem = {
  /** Human-readable category label, e.g. "ALIMENTATION EF/EC". */
  category: string
  /** Material / service name, e.g. "PER Ø32mm 10 bars". */
  name: string
  /** Short precision, e.g. "Regard compteur → chaudière". */
  description?: string
  /** Quantity in the unit below. */
  quantity: number
  /** Unit of measure. */
  unit: Unit
  /** Raw CCTP reference if cited (e.g. lot, page, paragraph). */
  reference?: string
  /** True when the AI could not infer the quantity and had to guess. */
  uncertain?: boolean
}

export type ExtractedQuote = {
  /** Short project title inferred from the CCTP. */
  projectName: string
  /** Trade / lot, e.g. "Lot 08 — Plomberie sanitaire". */
  lot: string
  /** Client / MOA / address if present. */
  client?: string
  /** Free-text summary of the scope. Max ~2 sentences. */
  summary: string
  /** Ordered list of materials/services the contractor must supply. */
  items: ExtractedItem[]
  /** AI confidence (0–1) for the overall extraction. */
  confidence: number
  /** Short notes / warnings from the AI (e.g. missing info, assumptions). */
  notes: string[]
}

export type QuoteLineWithPricing = ExtractedItem & {
  /** Unit price HT attached downstream by supplier pricing. */
  unitPrice: number
  /** Quantity × unitPrice. */
  totalHT: number
}

export type PricedQuote = Omit<ExtractedQuote, 'items'> & {
  items: QuoteLineWithPricing[]
  /** Sum of all items.totalHT. */
  totalHT: number
  /** TVA % applied. */
  vatRate: number
  /** totalHT × (1 + vatRate). */
  totalTTC: number
  /** Supplier chosen when the quote was priced. */
  supplierId: string
}
