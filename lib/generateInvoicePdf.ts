import jsPDF from 'jspdf'

// Invoice emitted by the admin (Jean-Marc / Plombia Chiffrage Ops) to a
// service-client plumber for running a one-off quote on their behalf.
// Mirrors the visual language of generateQuotePdf.ts — white paper, single
// accent rule, B&W text — so both documents feel like one stationery set.

export type PdfInvoiceLabels = {
  brandName: string
  subtitle: string
  invoiceTitle: string
  issuedOn: string
  dueDate: string
  issuer: string
  billedTo: string
  attention: string
  designation: string
  amountHT: string
  lineLabel: string
  devisRef: string
  totalHT: string
  vat: string
  totalTTC: string
  paymentTitle: string
  paymentDue: string
  legal: string
  fileName: string
}

export type PdfInvoiceOptions = {
  invoiceNumber: string
  /** Issue date — defaults to now. */
  issuedAt?: Date
  /** Related devis reference shown in the description block. */
  devisNumber?: string
  /** Line description: name + lot of the chiffrage mission. */
  mission: {
    projectName: string
    lot: string
  }
  amountHT: number
  vatRate: number
  /** Optional free-text line appended to the description. */
  note?: string
  /** Active locale — drives date formatting and file name prefix. */
  locale?: 'fr' | 'en'
  /** Translated labels (from i18n's `invoice` namespace). */
  labels?: PdfInvoiceLabels
  /** Issuer = the admin workspace (Plombia Chiffrage). */
  issuer?: {
    name: string
    address: string
    phone: string
    email: string
    siret: string
    tvaIntra: string
  }
  /** Billee = the service-client plumber receiving the invoice. */
  billee: {
    name: string
    contactName?: string
    contactEmail?: string
  }
}

const DEFAULT_ISSUER = {
  name:     'Plombia Chiffrage — Opérations',
  address:  '12 rue des Artisans · 69003 Lyon',
  phone:    '06 12 34 56 78',
  email:    'jm@plombia-chiffrage.fr',
  siret:    'SIRET 902 184 330 00017',
  tvaIntra: 'TVA FR60 902184330',
}

const DEFAULT_LABELS_FR: PdfInvoiceLabels = {
  brandName: 'PLOMBIA CHIFFRAGE',
  subtitle: 'Prestation de chiffrage CCTP · Service à la demande',
  invoiceTitle: 'FACTURE N°',
  issuedOn: 'Émise le',
  dueDate: 'Échéance',
  issuer: 'ÉMETTEUR',
  billedTo: 'FACTURÉ À',
  attention: 'À l\u2019attention de',
  designation: 'DÉSIGNATION',
  amountHT: 'MONTANT HT',
  lineLabel: 'Prestation de chiffrage — devis CCTP',
  devisRef: 'Réf. devis',
  totalHT: 'Total HT',
  vat: 'TVA',
  totalTTC: 'Total TTC',
  paymentTitle: 'RÈGLEMENT',
  paymentDue: 'Paiement à réception sous 30 jours — échéance {date}.',
  legal: 'Pénalités de retard : taux BCE + 10 pts. Indemnité forfaitaire pour frais de recouvrement : 40 €. Pas d\u2019escompte pour paiement anticipé.',
  fileName: 'facture',
}

const C = {
  ink:    [ 26,  26,  26] as [number, number, number],
  text:   [ 55,  55,  55] as [number, number, number],
  muted:  [120, 120, 120] as [number, number, number],
  rule:   [210, 210, 210] as [number, number, number],
  zebra:  [248, 248, 248] as [number, number, number],
  accent: [106, 170,  35] as [number, number, number],
}

const setFill = (doc: jsPDF, rgb: [number, number, number]) => doc.setFillColor(rgb[0], rgb[1], rgb[2])
const setDraw = (doc: jsPDF, rgb: [number, number, number]) => doc.setDrawColor(rgb[0], rgb[1], rgb[2])
const setText = (doc: jsPDF, rgb: [number, number, number]) => doc.setTextColor(rgb[0], rgb[1], rgb[2])

const fillTmpl = (tmpl: string, vars: Record<string, string>): string =>
  tmpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`)

export function generateInvoicePdf(options: PdfInvoiceOptions) {
  const locale = options.locale ?? 'fr'
  const L = options.labels ?? DEFAULT_LABELS_FR
  const issuer = options.issuer ?? DEFAULT_ISSUER
  const issuedAt = options.issuedAt ?? new Date()
  const dueDate = new Date(issuedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
  const tva = options.amountHT * (options.vatRate / 100)
  const ttc = options.amountHT + tva

  const fmtEur = (n: number) =>
    n.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

  const fmtDate = (d: Date) =>
    d.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })
  const W = doc.internal.pageSize.getWidth()
  const margin = 40
  const inner  = W - margin * 2

  let y = 0

  // Top accent rule
  setFill(doc, C.accent)
  doc.rect(0, 0, W, 4, 'F')

  // Header
  y = 34
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  setText(doc, C.ink)
  doc.text(L.brandName, margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  setText(doc, C.muted)
  doc.text(L.subtitle, margin, y + 12)

  // Invoice meta — right-aligned
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  setText(doc, C.ink)
  doc.text(`${L.invoiceTitle} ${options.invoiceNumber}`, W - margin, y, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  setText(doc, C.text)
  doc.text(`${L.issuedOn} ${fmtDate(issuedAt)}`, W - margin, y + 14, { align: 'right' })
  doc.text(`${L.dueDate} : ${fmtDate(dueDate)}`, W - margin, y + 26, { align: 'right' })

  y += 50
  setDraw(doc, C.rule)
  doc.setLineWidth(0.5)
  doc.line(margin, y, W - margin, y)
  y += 14

  // Émetteur + Facturé à
  const colW = (inner - 20) / 2
  const colL = margin
  const colR = margin + colW + 20

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  setText(doc, C.muted)
  doc.text(L.issuer, colL, y)
  doc.text(L.billedTo, colR, y)
  y += 12

  // Issuer block
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  setText(doc, C.ink)
  doc.text(issuer.name, colL, y, { maxWidth: colW })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  setText(doc, C.text)
  let ly = y + 13
  for (const line of [issuer.address, issuer.phone + '  ·  ' + issuer.email, issuer.siret, issuer.tvaIntra]) {
    doc.text(line, colL, ly, { maxWidth: colW })
    ly += 11
  }

  // Billee block
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  setText(doc, C.ink)
  doc.text(options.billee.name, colR, y, { maxWidth: colW })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  setText(doc, C.text)
  let ry = y + 13
  if (options.billee.contactName) {
    doc.text(`${L.attention} ${options.billee.contactName}`, colR, ry, { maxWidth: colW })
    ry += 11
  }
  if (options.billee.contactEmail) {
    doc.text(options.billee.contactEmail, colR, ry, { maxWidth: colW })
    ry += 11
  }

  y = Math.max(ly, ry) + 14

  // Line-item table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  setText(doc, C.muted)
  const rowY = y
  const amountX = W - margin
  doc.text(L.designation, colL, rowY)
  doc.text(L.amountHT, amountX, rowY, { align: 'right' })
  y += 8
  setDraw(doc, C.rule)
  doc.line(margin, y, W - margin, y)
  y += 16

  // Row: chiffrage service
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  setText(doc, C.ink)
  doc.text(L.lineLabel, colL, y, { maxWidth: inner - 120 })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  setText(doc, C.text)
  doc.text(fmtEur(options.amountHT), amountX, y, { align: 'right' })
  y += 13

  doc.setFontSize(8.5)
  setText(doc, C.text)
  doc.text(options.mission.projectName, colL, y, { maxWidth: inner - 120 })
  y += 11
  setText(doc, C.muted)
  doc.text(options.mission.lot, colL, y, { maxWidth: inner - 120 })
  y += 11
  if (options.devisNumber) {
    doc.text(`${L.devisRef} ${options.devisNumber}`, colL, y, { maxWidth: inner - 120 })
    y += 11
  }
  if (options.note) {
    doc.setFont('helvetica', 'italic')
    doc.text(options.note, colL, y, { maxWidth: inner - 120 })
    doc.setFont('helvetica', 'normal')
    y += 11
  }
  y += 10
  setDraw(doc, C.rule)
  doc.line(margin, y, W - margin, y)
  y += 18

  // Totals block — right aligned
  const labelX = W - margin - 160
  const valueX = W - margin
  const totalRow = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(bold ? 10.5 : 9.5)
    setText(doc, bold ? C.ink : C.text)
    doc.text(label, labelX, y)
    doc.text(value, valueX, y, { align: 'right' })
    y += bold ? 16 : 13
  }
  totalRow(L.totalHT, fmtEur(options.amountHT))
  totalRow(`${L.vat} (${options.vatRate.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US')} %)`, fmtEur(tva))
  setDraw(doc, C.rule)
  doc.line(labelX, y - 6, W - margin, y - 6)
  totalRow(L.totalTTC, fmtEur(ttc), true)

  y += 20

  // Payment / legal footer
  setFill(doc, C.zebra)
  doc.rect(margin, y, inner, 54, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  setText(doc, C.ink)
  doc.text(L.paymentTitle, margin + 10, y + 14)
  doc.setFont('helvetica', 'normal')
  setText(doc, C.text)
  doc.text(
    fillTmpl(L.paymentDue, { date: fmtDate(dueDate) }),
    margin + 10,
    y + 26,
    { maxWidth: inner - 20 }
  )
  setText(doc, C.muted)
  doc.setFontSize(7.5)
  doc.text(
    L.legal,
    margin + 10,
    y + 40,
    { maxWidth: inner - 20 }
  )
  y += 72

  // Issuer mentions footer
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  setText(doc, C.muted)
  doc.text(
    `${issuer.name} · ${issuer.siret} · ${issuer.tvaIntra}`,
    W / 2,
    doc.internal.pageSize.getHeight() - 24,
    { align: 'center' }
  )

  doc.save(`${L.fileName}-${options.invoiceNumber}.pdf`)
}
