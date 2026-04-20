import jsPDF from 'jspdf'

// Professional French devis (plumbing/construction) — white background,
// B&W text, single accent color, grouped by lot, ready to print.

export type PdfRow = {
  category: string
  name: string
  sub: string
  qtyNum: number
  qtyUnit: string
  unitNum: number
  reference?: string
}

export type PdfQuoteOptions = {
  rows: PdfRow[]
  project: {
    name: string
    lot: string
    client?: string
    summary?: string
  }
  supplier: {
    name: string
    deliveryDays: number
  }
  totals: {
    materialsHT: number
    laborHT: number
    chantierHT: number
    subtotalHT: number
    vatRate: number
    tva: number
    totalTTC: number
  }
  devisNumber?: string
  /** Defaulted if absent. */
  company?: {
    name: string
    address: string
    phone: string
    email: string
    siret: string
    tvaIntra: string
    insurance: string
    /** Mandatory for construction work (loi Spinetta). */
    decennale: string
    /** Mandatory B2C mention — consumer-mediation body. */
    mediator: string
  }
}

const DEFAULT_COMPANY = {
  name:      'Plomberie Bertrand',
  address:   '12 rue des Artisans · 69003 Lyon',
  phone:     '06 12 34 56 78',
  email:     'contact@plomberie-bertrand.fr',
  siret:     'SIRET 812 345 678 00019',
  tvaIntra:  'TVA FR42 812345678',
  insurance: 'RC Pro — MAAF n° 2041-0012',
  decennale: 'Assurance décennale — MAAF n° 2041-0012-D · France métropolitaine',
  mediator:  'Médiateur : CNPM Médiation — cnpm-mediation-consommation.eu',
}

// ─── Print-friendly palette (no dark backgrounds, saves ink) ──────────────────

const C = {
  ink:     [ 26,  26,  26] as [number, number, number], // near-black
  text:    [ 55,  55,  55] as [number, number, number],
  muted:   [120, 120, 120] as [number, number, number],
  rule:    [210, 210, 210] as [number, number, number],
  zebra:   [248, 248, 248] as [number, number, number],
  accent:  [106, 170,  35] as [number, number, number], // muted green — Digital Foreman's primary shifted darker for paper
  white:   [255, 255, 255] as [number, number, number],
  danger:  [170,  34,  34] as [number, number, number],
}

function setFill (doc: jsPDF, rgb: [number, number, number]) { doc.setFillColor(rgb[0], rgb[1], rgb[2]) }
function setDraw (doc: jsPDF, rgb: [number, number, number]) { doc.setDrawColor(rgb[0], rgb[1], rgb[2]) }
function setText (doc: jsPDF, rgb: [number, number, number]) { doc.setTextColor(rgb[0], rgb[1], rgb[2]) }

const fmtEur = (n: number) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

const fmtQty = (n: number) =>
  n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })

const fmtDate = (d: Date) =>
  d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })

function defaultDevisNumber(): string {
  const d = new Date()
  const yy = String(d.getFullYear()).slice(-2)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `DV-${yy}${mm}-${rand}`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function generateQuotePdf(options: PdfQuoteOptions) {
  const { rows, project, supplier, totals } = options
  const company = options.company ?? DEFAULT_COMPANY
  const devisNumber = options.devisNumber ?? defaultDevisNumber()

  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })
  const W = doc.internal.pageSize.getWidth()   // 595
  const H = doc.internal.pageSize.getHeight()  // 842
  const margin = 40
  const inner  = W - margin * 2

  let y = 0

  // ── Top accent band ─────────────────────────────────────────────────────────
  setFill(doc, C.accent)
  doc.rect(0, 0, W, 4, 'F')

  // ── Header ──────────────────────────────────────────────────────────────────
  y = 34
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  setText(doc, C.ink)
  doc.text('PLOMBIER CHIFFRAGE', margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  setText(doc, C.muted)
  doc.text('Plomberie · Chauffage · VMC · Devis conforme CCTP', margin, y + 12)

  // Devis meta — right aligned
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  setText(doc, C.ink)
  doc.text(`DEVIS N° ${devisNumber}`, W - margin, y, { align: 'right' })

  const today = new Date()
  const validUntil = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  setText(doc, C.text)
  doc.text(`Émis le ${fmtDate(today)}`, W - margin, y + 14, { align: 'right' })
  doc.text(`Valable jusqu'au ${fmtDate(validUntil)}`, W - margin, y + 26, { align: 'right' })

  y += 50
  setDraw(doc, C.rule)
  doc.setLineWidth(0.5)
  doc.line(margin, y, W - margin, y)
  y += 14

  // ── Émetteur + Client (two columns) ─────────────────────────────────────────
  const colW = (inner - 20) / 2
  const colL = margin
  const colR = margin + colW + 20

  const blockTop = y
  // Labels
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  setText(doc, C.muted)
  doc.text('ÉMETTEUR', colL, y)
  doc.text('CLIENT / CHANTIER', colR, y)
  y += 12

  // Left: company
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  setText(doc, C.ink)
  doc.text(company.name, colL, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  setText(doc, C.text)
  let ly = y + 13
  for (const line of [
    company.address,
    company.phone + '  ·  ' + company.email,
    company.siret,
    company.tvaIntra,
    company.insurance,
    company.decennale,
  ]) {
    doc.text(line, colL, ly, { maxWidth: colW })
    ly += 11
  }

  // Right: client/project
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  setText(doc, C.ink)
  doc.text(project.name, colR, y, { maxWidth: colW })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  setText(doc, C.text)
  let ry = y + 13
  if (project.lot) {
    doc.text(project.lot, colR, ry, { maxWidth: colW })
    ry += 11
  }
  if (project.client) {
    doc.text(project.client, colR, ry, { maxWidth: colW })
    ry += 11
  }
  doc.text(`Fournisseur retenu : ${supplier.name} (livraison ${supplier.deliveryDays} j)`, colR, ry, { maxWidth: colW })

  y = Math.max(ly, ry) + 8

  // Summary paragraph (if any)
  if (project.summary) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8.5)
    setText(doc, C.muted)
    const wrapped = doc.splitTextToSize(project.summary, inner)
    doc.text(wrapped, margin, y)
    y += wrapped.length * 11 + 4
  }

  y += 4
  doc.setLineWidth(0.5)
  setDraw(doc, C.rule)
  doc.line(margin, y, W - margin, y)
  y += 16

  // ── Items table — 7-column layout required for a devis conforme ───────────
  // Qté | Désignation | Unité | P.U. HT | TVA | Montant HT | Montant TTC.
  // The CCTP reference is tucked under the designation in small grey text
  // (traceability preserved, one less column).
  const cols = {
    qty:        margin + 44,                       // right-aligned
    desig:      margin + 50,                       // left-aligned (6pt gap from qty edge)
    desigEndX:  margin + Math.round(inner * 0.42), // wrap boundary
    unit:       margin + Math.round(inner * 0.45),
    pu:         margin + Math.round(inner * 0.59),
    tva:        margin + Math.round(inner * 0.66),
    totalHT:    margin + Math.round(inner * 0.82),
    totalTTC:   margin + inner - 4,
  }
  const HEAD_H = 18
  const ROW_MIN_H = 22
  const BOTTOM_SAFE = 180 // reserve space for totals + signature on last page
  const vatPct = totals.vatRate * 100

  function drawTableHeader() {
    setFill(doc, C.ink)
    doc.rect(margin, y, inner, HEAD_H, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    setText(doc, C.white)
    doc.text('QTÉ',          cols.qty,      y + 12, { align: 'right' })
    doc.text('DÉSIGNATION',  cols.desig,    y + 12)
    doc.text('UNITÉ',        cols.unit,     y + 12)
    doc.text('P.U. HT',      cols.pu,       y + 12, { align: 'right' })
    doc.text('TVA',          cols.tva,      y + 12, { align: 'right' })
    doc.text('MONTANT HT',   cols.totalHT,  y + 12, { align: 'right' })
    doc.text('MONTANT TTC',  cols.totalTTC, y + 12, { align: 'right' })
    y += HEAD_H
  }

  function pageFooter(pageNum: number, pageCount: number) {
    const fy = H - 24
    setDraw(doc, C.rule)
    doc.setLineWidth(0.5)
    doc.line(margin, fy - 10, W - margin, fy - 10)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    setText(doc, C.muted)
    doc.text(`Plombier Chiffrage  ·  plombier-chiffrage.fr`, margin, fy)
    doc.text(`${devisNumber}`, W / 2, fy, { align: 'center' })
    doc.text(`Page ${pageNum} / ${pageCount}`, W - margin, fy, { align: 'right' })
  }

  function newPage() {
    doc.addPage()
    y = margin
    setFill(doc, C.accent)
    doc.rect(0, 0, W, 4, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    setText(doc, C.muted)
    doc.text(`DEVIS ${devisNumber}  —  ${project.name}`, margin, y + 2)
    y += 18
    drawTableHeader()
  }

  drawTableHeader()

  // Group rows by category, preserve insertion order
  const groups = new Map<string, PdfRow[]>()
  for (const r of rows) {
    const list = groups.get(r.category) ?? []
    list.push(r)
    groups.set(r.category, list)
  }

  let zebra = false
  for (const [cat, catRows] of groups) {
    // Category header band
    if (y + 26 > H - BOTTOM_SAFE) newPage()
    setFill(doc, C.zebra)
    doc.rect(margin, y, inner, 16, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    setText(doc, C.accent)
    doc.text(cat.toUpperCase(), margin + 6, y + 11)
    const catTotalHT  = catRows.reduce((s, r) => s + r.qtyNum * r.unitNum, 0)
    const catTotalTTC = catTotalHT * (1 + totals.vatRate)
    setText(doc, C.text)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `sous-total HT ${fmtEur(catTotalHT)}  ·  TTC ${fmtEur(catTotalTTC)}`,
      W - margin - 6, y + 11,
      { align: 'right' },
    )
    y += 16
    zebra = false

    for (const r of catRows) {
      const rowTotalHT  = r.qtyNum * r.unitNum
      const rowTotalTTC = rowTotalHT * (1 + totals.vatRate)

      // Wrap designation into up to 2 lines within available width.
      // Sub-line stacks the CCTP reference + optional description.
      const desigMaxW = cols.desigEndX - cols.desig - 4
      const desigWrapped = doc.splitTextToSize(r.name, desigMaxW).slice(0, 2) as string[]
      const subParts: string[] = []
      if (r.reference) subParts.push(`Réf. ${r.reference}`)
      if (r.sub)       subParts.push(r.sub)
      const subText    = subParts.join('  ·  ')
      const subWrapped = subText ? doc.splitTextToSize(subText, desigMaxW).slice(0, 1) as string[] : []
      const rowH = Math.max(ROW_MIN_H, 14 + desigWrapped.length * 10 + subWrapped.length * 9 + 4)

      if (y + rowH > H - BOTTOM_SAFE) newPage()

      if (zebra) {
        setFill(doc, C.zebra)
        doc.rect(margin, y, inner, rowH, 'F')
      }
      zebra = !zebra

      // Qté
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      setText(doc, C.text)
      doc.text(fmtQty(r.qtyNum), cols.qty, y + 13, { align: 'right' })

      // Designation (+ reference / sub-line below)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      setText(doc, C.ink)
      doc.text(desigWrapped, cols.desig, y + 13)

      if (subWrapped.length > 0) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        setText(doc, C.muted)
        doc.text(subWrapped, cols.desig, y + 13 + desigWrapped.length * 10 + 1)
      }

      // Unité · PU HT · TVA · Montant HT · Montant TTC
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      setText(doc, C.text)
      doc.text(r.qtyUnit,                     cols.unit,     y + 13)
      doc.text(fmtEur(r.unitNum),             cols.pu,       y + 13, { align: 'right' })
      doc.text(`${vatPct.toFixed(0)}%`,       cols.tva,      y + 13, { align: 'right' })

      doc.setFont('helvetica', 'bold')
      setText(doc, C.ink)
      doc.text(fmtEur(rowTotalHT),  cols.totalHT,  y + 13, { align: 'right' })
      doc.text(fmtEur(rowTotalTTC), cols.totalTTC, y + 13, { align: 'right' })

      // Hairline between rows
      setDraw(doc, C.rule)
      doc.setLineWidth(0.3)
      doc.line(margin, y + rowH, W - margin, y + rowH)

      y += rowH
    }

    y += 4 // small gap between categories
  }

  // ── Totals block ────────────────────────────────────────────────────────────
  if (y + 140 > H - 40) newPage()

  y += 10
  const totW = 260
  const totX = W - margin - totW

  const lines: Array<[string, number, { bold?: boolean; muted?: boolean }?]> = [
    ['Total matériaux HT',     totals.materialsHT],
    ['Main d\'œuvre HT',       totals.laborHT],
    ['Préparation chantier HT', totals.chantierHT],
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  for (const [label, value] of lines) {
    setText(doc, C.text)
    doc.text(label, totX, y + 11)
    doc.text(fmtEur(value), totX + totW, y + 11, { align: 'right' })
    y += 15
  }

  setDraw(doc, C.rule)
  doc.setLineWidth(0.6)
  doc.line(totX, y, totX + totW, y)
  y += 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  setText(doc, C.ink)
  doc.text('Total HT', totX, y + 11)
  doc.text(fmtEur(totals.subtotalHT), totX + totW, y + 11, { align: 'right' })
  y += 17

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  setText(doc, C.text)
  doc.text(`TVA ${(totals.vatRate * 100).toFixed(0)} %`, totX, y + 11)
  doc.text(fmtEur(totals.tva), totX + totW, y + 11, { align: 'right' })
  y += 18

  // TOTAL TTC — boxed accent
  setFill(doc, C.accent)
  doc.rect(totX, y, totW, 28, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  setText(doc, C.white)
  doc.text('TOTAL TTC', totX + 10, y + 18)
  doc.setFontSize(13)
  doc.text(fmtEur(totals.totalTTC), totX + totW - 10, y + 18, { align: 'right' })
  y += 40

  // ── Conditions + signatures ─────────────────────────────────────────────────
  // Reserve enough room for the conditions box (128) + gap (10) + signature
  // block (70) + safety so they never split across pages.
  if (y + 220 > H - 40) newPage()

  // Taux horaire MOE — computed from labour rows so the conditions block
  // can state it plainly (standard on a conforme devis).
  const moeRows = rows.filter(r => r.category === "MAIN D'ŒUVRE" && r.qtyUnit === 'h')
  const moeHours = moeRows.reduce((s, r) => s + r.qtyNum, 0)
  const moeCost  = moeRows.reduce((s, r) => s + r.qtyNum * r.unitNum, 0)
  const moeRate  = moeHours > 0 ? moeCost / moeHours : 0

  const condBoxH = 128
  setFill(doc, C.zebra)
  doc.rect(margin, y, inner, condBoxH, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  setText(doc, C.ink)
  doc.text('CONDITIONS & MENTIONS LÉGALES', margin + 10, y + 14)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  setText(doc, C.text)
  const cond = [
    '• Acompte 30 % à la signature du devis, solde à la livraison.',
    '• Règlement par virement bancaire sous 30 jours après facturation.',
    '• Pénalités de retard : taux BCE + 10 points. Indemnité forfaitaire de recouvrement : 40 €.',
    '• Pas d\u2019escompte pour paiement anticipé.',
    '• Devis valable 30 jours à compter de la date d\u2019émission.',
    '• Délai d\u2019exécution : à préciser après signature — usuellement 4 à 8 semaines selon approvisionnement.',
    moeRate > 0
      ? `• Taux horaire main d\u2019œuvre : ${fmtEur(moeRate)} HT  ·  ${moeHours.toLocaleString('fr-FR')} h au total.`
      : '• Main d\u2019œuvre facturée à l\u2019heure, détail par tâche dans le tableau ci-dessus.',
    `• ${company.mediator}`,
  ]
  let cy = y + 28
  for (const line of cond) {
    doc.text(line, margin + 10, cy, { maxWidth: inner - 20 })
    cy += 11
  }
  y += condBoxH + 10

  // Signature blocks
  const sigW = (inner - 20) / 2
  setDraw(doc, C.rule)
  doc.setLineWidth(0.6)

  // Left: client
  doc.rect(margin, y, sigW, 70)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  setText(doc, C.muted)
  doc.text('BON POUR ACCORD — CLIENT', margin + 8, y + 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text('(Date + signature précédée de la mention manuscrite « Bon pour accord »)', margin + 8, y + 23, { maxWidth: sigW - 16 })

  // Right: company
  doc.rect(margin + sigW + 20, y, sigW, 70)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  setText(doc, C.muted)
  doc.text('L\'ENTREPRISE', margin + sigW + 28, y + 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text(company.name, margin + sigW + 28, y + 26)

  // ── Page numbers / footer on every page ────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    pageFooter(p, pageCount)
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  const safeName = project.name.replace(/[^\w\- ]+/g, '').replace(/\s+/g, '_').slice(0, 40) || 'devis'
  doc.save(`${devisNumber}_${safeName}.pdf`)
}
