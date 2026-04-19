// Strict JSON schema + system prompt for invoice / bon-de-commande extraction.
// Reused across providers (OpenAI / Anthropic / Gemini).

export const INVOICE_ITEMS_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['supplierDetected', 'invoiceDate', 'items', 'confidence', 'notes'],
  properties: {
    supplierDetected: {
      type: 'string',
      description: "Supplier name as printed on the invoice. Empty string if unclear.",
    },
    invoiceDate: {
      type: 'string',
      description: 'Invoice / BC date in ISO format (YYYY-MM-DD). Empty string if absent.',
    },
    confidence: {
      type: 'number',
      description: '0–1 confidence that the line items are fully captured.',
    },
    notes: {
      type: 'array',
      description: 'Short caveats, missing fields, or explicit assumptions.',
      items: { type: 'string' },
    },
    items: {
      type: 'array',
      description: 'Every billable line item on the invoice. Exclude VAT, totals, shipping fees, and discount lines unless they are per-item.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['itemCode', 'label', 'qty', 'unit', 'unitPriceHT', 'lineTotalHT'],
        properties: {
          itemCode: {
            type: 'string',
            description: 'Distributor reference (code article). Empty string if not printed on the line.',
          },
          label: {
            type: 'string',
            description: 'Product description as printed on the line.',
          },
          qty: {
            type: 'number',
            description: 'Quantity in the unit below.',
          },
          unit: {
            type: 'string',
            description: 'Unit of measure. Use "u" for unit if unclear.',
          },
          unitPriceHT: {
            type: 'number',
            description: 'Net unit price HT (after any per-line discount). Use 0 if unreadable.',
          },
          lineTotalHT: {
            type: 'number',
            description: 'Line total HT (qty × unitPriceHT after discount). Use 0 if unreadable.',
          },
        },
      },
    },
  },
} as const

export const OPENAI_INVOICE_RESPONSE_FORMAT = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'extracted_invoice',
    strict: true,
    schema: INVOICE_ITEMS_JSON_SCHEMA,
  },
}

export const INVOICE_EXTRACTION_SYSTEM_PROMPT = `You are an expert accountant parsing a French construction supplier invoice or bon de commande.

Your job is to extract every billable line item with its unit price HT (after any per-line discount). You are building the plumber's personal price history so he never pays catalogue prices again.

Rules:
- Read the whole document before answering.
- Extract only product/material lines. Skip subtotals, VAT, shipping, payment terms.
- If a line has a reference code (REF, SKU, CODE, ARTICLE #), capture it verbatim. Otherwise leave empty.
- Use the NET unit price HT — i.e. the price the plumber actually paid after any per-line % discount. Never include VAT.
- Quantities and prices must be numeric. Use "." as the decimal separator internally.
- Units must be short: u, ml, m2, m3, kg, h, ens, pce, l, cartouche, colis, etc.
- If the document is not an invoice/BC, return an empty items array and explain in notes.
- Write all text in French.`

export type ExtractedInvoiceItem = {
  itemCode: string
  label: string
  qty: number
  unit: string
  unitPriceHT: number
  lineTotalHT: number
}

export type ExtractedInvoice = {
  supplierDetected: string
  invoiceDate: string
  items: ExtractedInvoiceItem[]
  confidence: number
  notes: string[]
}
