import jsPDF from 'jspdf'

// ─── Data ─────────────────────────────────────────────────────────────────────

const materials = [
  { name: 'Steel Beams (Grade 50)',      sub: 'Structural I-Beam — 20ft',        qty: '42 Units',    unit: '$1,240.00',  total: '$52,080.00',  pct: 28 },
  { name: 'Concrete Mix (High Strength)', sub: 'M40 Grade — Ready Mix',           qty: '250 m³',      unit: '$115.00',    total: '$28,750.00',  pct: 16 },
  { name: 'Glass Paneling',               sub: 'Double Glazed Reflective',         qty: '1,200 sqft',  unit: '$45.00',     total: '$54,000.00',  pct: 29 },
  { name: 'Electrical Wiring & Conduit',  sub: 'EMT — 14 AWG + 12 AWG',           qty: '3,200 lft',   unit: '$8.40',      total: '$26,880.00',  pct: 14 },
  { name: 'Plumbing Fixtures & Pipe',     sub: 'PEX-A + Commercial Grade',         qty: '85 Sets',     unit: '$1,010.00',  total: '$85,850.00',  pct: 46 },
]

const labor = [
  { label: 'Structural Engineers', detail: '120 hrs @ $150/hr',  amount: '$18,000.00' },
  { label: 'General Labor',         detail: '840 hrs @ $45/hr',   amount: '$37,800.00' },
  { label: 'Site Supervision',      detail: '60 hrs @ $200/hr',   amount: '$12,000.00' },
]

const logistics = [
  { label: 'Heavy Haulage',         detail: '3 Routes',    amount: '$8,400.00'  },
  { label: 'Site Handling',         detail: 'Flat Fee',    amount: '$2,200.00'  },
  { label: 'Cold-Chain Freight',    detail: '1 Route',     amount: '$3,600.00'  },
  { label: 'Last-Mile Delivery',    detail: '12 Drops',    amount: '$1,400.00'  },
]

const vendors = ['CDO Comptoir', 'Pim Plastic', 'Richardson', 'Marplin', 'Atlas Steel', 'CoreBuild', 'NexusGlass', 'UltraFix']

// ─── Colours ──────────────────────────────────────────────────────────────────

const C = {
  navy:       [6,  14, 32]  as [number,number,number],
  navyMid:    [15, 25, 48]  as [number,number,number],
  navyLight:  [20, 31, 56]  as [number,number,number],
  blue:       [46, 91, 255] as [number,number,number],
  blueLight:  [113,139,255] as [number,number,number],
  white:      [222,229,255] as [number,number,number],
  muted:      [163,170,196] as [number,number,number],
  green:      [52, 211,153] as [number,number,number],
  border:     [40, 48, 73]  as [number,number,number],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setFill(doc: jsPDF, rgb: [number,number,number]) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2])
}
function setDraw(doc: jsPDF, rgb: [number,number,number]) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2])
}
function setTextColor(doc: jsPDF, rgb: [number,number,number]) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2])
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function generateQuotePdf() {
  const doc    = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })
  const W      = doc.internal.pageSize.getWidth()   // 595
  const margin = 40
  const inner  = W - margin * 2

  let y = 0

  // ── Header bar ──────────────────────────────────────────────────────────────
  setFill(doc, C.navyMid)
  doc.rect(0, 0, W, 72, 'F')

  // Brand name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  setTextColor(doc, C.white)
  doc.text('CONSTRUCT.AI', margin, 30)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  setTextColor(doc, C.muted)
  doc.text('DIGITAL FOREMAN PLATFORM', margin, 43)

  // Badge top-right
  setFill(doc, C.blue)
  doc.roundedRect(W - margin - 100, 16, 100, 20, 4, 4, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  setTextColor(doc, [255,255,255])
  doc.text('VALUATION CONFIRMED', W - margin - 100 + 50, 29.5, { align: 'center' })

  // Thin accent line under header
  setFill(doc, C.blue)
  doc.rect(0, 72, W, 2, 'F')

  y = 98

  // ── Meta row ────────────────────────────────────────────────────────────────
  setFill(doc, C.navyLight)
  doc.rect(margin, y, inner, 44, 'F')

  const metaItems = [
    ['PROJECT', 'Skyline Pavilion'],
    ['PROJECT ID', 'PRJ-992-DELTA'],
    ['QUOTE REF', '#829-PX'],
    ['DATE', new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })],
    ['VALID', '14 Days'],
  ]
  const colW = inner / metaItems.length
  metaItems.forEach(([label, val], i) => {
    const x = margin + i * colW + 10
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    setTextColor(doc, C.muted)
    doc.text(label, x, y + 14)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    setTextColor(doc, C.white)
    doc.text(val, x, y + 29)
  })

  y += 62

  // ── Section title helper ─────────────────────────────────────────────────────
  function sectionTitle(title: string, subtitle?: string) {
    // left accent bar
    setFill(doc, C.blue)
    doc.rect(margin, y, 3, 14, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    setTextColor(doc, C.white)
    doc.text(title, margin + 10, y + 11)
    if (subtitle) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      setTextColor(doc, C.muted)
      doc.text(subtitle, margin + 10 + doc.getTextWidth(title) + 8, y + 11)
    }
    y += 22
  }

  // ── Materials table ──────────────────────────────────────────────────────────
  sectionTitle('STRUCTURED MATERIALS', '5 line items · AI-sourced pricing')

  // Table header
  setFill(doc, C.navyMid)
  doc.rect(margin, y, inner, 20, 'F')
  const cols = {
    spec:  margin + 8,
    qty:   margin + inner * 0.48,
    unit:  margin + inner * 0.60,
    share: margin + inner * 0.73,
    total: margin + inner - 8,
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  setTextColor(doc, C.muted)
  doc.text('ITEM SPECIFICATION',   cols.spec,  y + 13)
  doc.text('QTY',                  cols.qty,   y + 13)
  doc.text('UNIT PRICE',           cols.unit,  y + 13)
  doc.text('SHARE',                cols.share, y + 13)
  doc.text('TOTAL',                cols.total, y + 13, { align: 'right' })
  y += 20

  // Rows
  materials.forEach((m, i) => {
    const rowH = 30
    if (i % 2 === 1) {
      setFill(doc, C.navyLight)
      doc.rect(margin, y, inner, rowH, 'F')
    }
    // Name
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    setTextColor(doc, C.white)
    doc.text(m.name, cols.spec, y + 12)
    // Sub
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    setTextColor(doc, C.muted)
    doc.text(m.sub, cols.spec, y + 22)
    // Qty
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    setTextColor(doc, C.muted)
    doc.text(m.qty, cols.qty, y + 17)
    // Unit
    doc.text(m.unit, cols.unit, y + 17)
    // Share bar
    const barW = 36
    setFill(doc, C.border)
    doc.rect(cols.share, y + 12, barW, 4, 'F')
    setFill(doc, C.blue)
    doc.rect(cols.share, y + 12, barW * m.pct / 100, 4, 'F')
    doc.setFontSize(7)
    setTextColor(doc, C.muted)
    doc.text(`${m.pct}%`, cols.share + barW + 3, y + 17)
    // Total
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    setTextColor(doc, C.blueLight)
    doc.text(m.total, cols.total, y + 17, { align: 'right' })

    y += rowH
  })

  y += 20

  // ── Labor + Logistics side by side ──────────────────────────────────────────
  const halfW = (inner - 12) / 2

  // Labor box
  setFill(doc, C.navyLight)
  doc.rect(margin, y, halfW, 120, 'F')

  setFill(doc, C.blue)
  doc.rect(margin, y, 3, 120, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  setTextColor(doc, C.white)
  doc.text('LABOR BREAKDOWN', margin + 10, y + 16)

  let ly = y + 28
  labor.forEach((row) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    setTextColor(doc, C.muted)
    doc.text(row.label, margin + 10, ly)
    doc.setFont('helvetica', 'bold')
    setTextColor(doc, C.white)
    doc.text(row.amount, margin + halfW - 10, ly, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    setTextColor(doc, [80,90,110])
    doc.text(row.detail, margin + 10, ly + 10)
    ly += 24
  })

  // Logistics box
  const lx = margin + halfW + 12
  setFill(doc, C.navyLight)
  doc.rect(lx, y, halfW, 120, 'F')

  setFill(doc, [144,147,255] as [number,number,number])  // secondary colour
  doc.rect(lx, y, 3, 120, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  setTextColor(doc, C.white)
  doc.text('LOGISTICS & FREIGHT', lx + 10, y + 16)

  let ry = y + 28
  logistics.forEach((row) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    setTextColor(doc, C.muted)
    doc.text(row.label, lx + 10, ry)
    doc.setFont('helvetica', 'bold')
    setTextColor(doc, C.white)
    doc.text(row.amount, lx + halfW - 10, ry, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    setTextColor(doc, [80,90,110])
    doc.text(row.detail, lx + 10, ry + 10)
    ry += 24
  })

  y += 132

  // ── Vendor network ───────────────────────────────────────────────────────────
  sectionTitle('VENDOR NETWORK', '12 Suppliers Notified')

  const vendorCols = 4
  const vW = inner / vendorCols
  vendors.forEach((v, i) => {
    const vx = margin + (i % vendorCols) * vW
    const vy = y + Math.floor(i / vendorCols) * 22
    setFill(doc, C.navyMid)
    doc.rect(vx + 2, vy, vW - 6, 18, 'F')
    // green dot
    setFill(doc, C.green)
    doc.circle(vx + 11, vy + 9, 2.5, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    setTextColor(doc, C.muted)
    doc.text(v, vx + 17, vy + 12.5)
  })

  y += Math.ceil(vendors.length / 4) * 22 + 16

  // ── Totals summary ───────────────────────────────────────────────────────────
  setFill(doc, C.navyMid)
  doc.rect(margin, y, inner, 108, 'F')
  // Blue left accent
  setFill(doc, C.blue)
  doc.rect(margin, y, 3, 108, 'F')

  const totals = [
    ['Materials Subtotal', '$247,560.00'],
    ['Labor',              '$67,800.00'],
    ['Logistics',          '$15,600.00'],
    ['Tax (6%)',           '$19,857.60'],
  ]
  let ty = y + 18
  totals.forEach(([label, val]) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    setTextColor(doc, C.muted)
    doc.text(label, margin + 14, ty)
    doc.setFont('helvetica', 'bold')
    setTextColor(doc, C.white)
    doc.text(val, W - margin - 14, ty, { align: 'right' })
    // divider
    setDraw(doc, C.border)
    doc.setLineWidth(0.5)
    doc.line(margin + 14, ty + 5, W - margin - 14, ty + 5)
    ty += 20
  })

  // Grand total
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  setTextColor(doc, C.white)
  doc.text('TOTAL PROJECT VALUATION', margin + 14, ty + 2)
  setTextColor(doc, C.blueLight)
  doc.text('$247,510.00', W - margin - 14, ty + 2, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  setTextColor(doc, C.green)
  doc.text('✓  Fixed Rate Guaranteed — 14 Days', margin + 14, ty + 16)

  y += 130

  // ── Footer ───────────────────────────────────────────────────────────────────
  const footerY = doc.internal.pageSize.getHeight() - 36
  setFill(doc, C.navyMid)
  doc.rect(0, footerY, W, 36, 'F')
  setFill(doc, C.blue)
  doc.rect(0, footerY, W, 1.5, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  setTextColor(doc, C.white)
  doc.text('CONSTRUCT.AI  ·  Digital Foreman Platform', margin, footerY + 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  setTextColor(doc, C.muted)
  doc.text('This document is AI-generated and for procurement reference only.', margin, footerY + 28)

  const pageLabel = 'Quote_PRJ-992-DELTA.pdf'
  setTextColor(doc, C.muted)
  doc.text(pageLabel, W - margin, footerY + 22, { align: 'right' })

  // ── Save ────────────────────────────────────────────────────────────────────
  doc.save('Quote_PRJ-992-DELTA.pdf')
}
