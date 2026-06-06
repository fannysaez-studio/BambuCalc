import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { company } from '../config/company'
import { fmtEur, fmtDate } from './formatters'

const TEAL = [46, 156, 171]
const DARK = [27, 47, 57]
const GREY = [113, 128, 150]
const LIGHT = [240, 244, 248]
const WHITE = [255, 255, 255]

const STATUS_MAP = {
  pending: { label: 'En attente', color: [214, 158, 46], bg: [255, 247, 230] },
  accepted: { label: 'Accepté', color: [39, 174, 96], bg: [230, 255, 240] },
  refused: { label: 'Refusé', color: [229, 62, 62], bg: [255, 230, 230] },
  sent: { label: 'Envoyé', color: [66, 153, 225], bg: [230, 243, 255] },
}

function statusInfo(s) {
  return STATUS_MAP[s] || STATUS_MAP.pending
}

function validityDate(quoteDate, days) {
  if (!quoteDate || !days) return '—'
  const d = new Date(quoteDate)
  d.setDate(d.getDate() + Number(days))
  return fmtDate(d.toISOString())
}

function processingLabel(v) {
  return (
    {
      '24h': '24 heures',
      '2-3j': '2 à 3 jours ouvrés',
      '5-7j': '5 à 7 jours ouvrés',
      '1-2s': '1 à 2 semaines',
      '2-4s': '2 à 4 semaines',
      custom: 'À convenir',
    }[v] ||
    v ||
    ''
  )
}

function deliveryLabel(v) {
  return (
    {
      pickup: 'Retrait en main propre',
      colissimo: 'Colissimo (2-3 j)',
      chronopost: 'Chronopost (J+1)',
      mondial: 'Mondial Relay (3-5 j)',
      custom: 'À convenir',
    }[v] ||
    v ||
    ''
  )
}

function paymentLabel(m) {
  return (
    {
      virement: 'Virement bancaire',
      cheque: 'Chèque',
      cb: 'Carte bancaire',
      especes: 'Espèces',
      paypal: 'PayPal',
    }[m] ||
    m ||
    'Virement bancaire'
  )
}

async function loadImageDataUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = reject
    img.src = url
  })
}

async function _buildDoc(quote, mode = 'client') {
  const taxRate = quote.tax_rate != null ? Number(quote.tax_rate) : 0

  // ── Construction des lignes (multi-pièces ou legacy) ─────────────
  let items
  if (quote.items?.length) {
    items = quote.items.map(item => ({
      name:             item.name || '—',
      quantity:         item.quantity ?? 1,
      weight:           item.weight || 0,
      material:         item.material || '—',
      colorCount:       item.colorCount || 1,
      referenceImageUrl:item.referenceImageUrl || '',
      unitPriceHT:      item.unitPriceHT ?? 0,
      totalTTC:         item.totalTTC ?? 0,
      tvaPart:          item.tvaPart ?? 0,
    }))
  } else {
    const uph = (quote.cost_per_unit || 0) / (1 + taxRate / 100)
    const ttc = quote.total_cost || 0
    items = [{
      name:             `Impression 3D — ${quote.project_name || '—'}`,
      quantity:         quote.quantity ?? 1,
      weight:           quote.weight || 0,
      material:         quote.material || '—',
      colorCount:       1,
      referenceImageUrl:quote.reference_image_url || '',
      unitPriceHT:      uph,
      totalTTC:         ttc,
      tvaPart:          ttc - uph * (quote.quantity ?? 1),
    }]
  }

  // Charger toutes les images en parallèle
  const itemImages = await Promise.all(
    items.map(async item => {
      if (!item.referenceImageUrl) return null
      try { return await loadImageDataUrl(item.referenceImageUrl) }
      catch { return null }
    })
  )
  const hasAnyImage = itemImages.some(Boolean)

  // Totaux globaux
  const allTotalTTC = items.reduce((s, i) => s + i.totalTTC, 0)
  const allTotalHT  = allTotalTTC / (1 + taxRate / 100)
  const allTotalTVA = allTotalTTC - allTotalHT

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 16
  const st = statusInfo(quote.status)

  // ── EN-TÊTE ──────────────────────────────────────────────────
  // Logo gauche
  doc.setTextColor(...DARK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('BambuCalc', margin, 17)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...TEAL)
  doc.text('App ~ Coût d\'impression 3D', margin, 23)

  // DEVIS droite
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(...DARK)
  doc.text('DEVIS', W - margin, 16, { align: 'right' })

  // Infos devis (N°, Date, Validité)
  const infoRightX = W - margin
  const infoLabelX = W - margin - 38
  const infoRows = [
    [`N° Devis :`, quote.quote_number || '—'],
    ['Date :', fmtDate(quote.quote_date)],
    ['Validité :', `${quote.quote_validity_days || 30} jours`],
  ]
  infoRows.forEach(([label, value], i) => {
    const iy = 22 + i * 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...GREY)
    doc.text(label, infoLabelX, iy)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    doc.text(value, infoRightX, iy, { align: 'right' })
  })

  // Ligne séparatrice teal
  doc.setDrawColor(...TEAL)
  doc.setLineWidth(0.5)
  doc.line(margin, 34, W - margin, 34)

  // ── BADGE STATUT ─────────────────────────────────────────────
  const badgeW = 28
  const badgeX = W - margin - badgeW
  doc.setFillColor(...st.bg)
  doc.roundedRect(badgeX, 37, badgeW, 8, 2, 2, 'F')
  doc.setDrawColor(...st.color)
  doc.setLineWidth(0.4)
  doc.roundedRect(badgeX, 37, badgeW, 8, 2, 2, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...st.color)
  doc.text(st.label, badgeX + badgeW / 2, 42.2, { align: 'center' })

  // ── CONTACTS ─────────────────────────────────────────────────
  let y = 38
  const midX = W / 2 + 2

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...GREY)
  doc.text('PRESTATAIRE', margin, y)
  doc.text('DESTINATAIRE', midX, y)

  y += 4.5

  const providerLines = [
    { text: company.name, bold: true, size: 10 },
    { text: company.address },
    { text: [company.postalCode, company.city].filter(Boolean).join(' ') },
    { text: company.email, color: TEAL },
    company.phone ? { text: company.phone } : null,
    company.siret ? { text: `SIRET : ${company.siret}`, color: GREY, size: 7.5 } : null,
    company.vatNumber ? { text: `TVA : ${company.vatNumber}`, color: GREY, size: 7.5 } : null,
  ].filter(Boolean)

  const clientName =
    quote.client_name || [quote.client_first_name, quote.client_last_name].filter(Boolean).join(' ')
  const clientLines = [
    { text: clientName || '—', bold: true, size: 10 },
    quote.client_contact_name ? { text: `Contact : ${quote.client_contact_name}` } : null,
    quote.client_address ? { text: quote.client_address } : null,
    [quote.client_postal_code, quote.client_city].filter(Boolean).length
      ? { text: [quote.client_postal_code, quote.client_city].filter(Boolean).join(' ') }
      : null,
    quote.client_email ? { text: quote.client_email, color: TEAL } : null,
    quote.client_phone ? { text: quote.client_phone } : null,
    quote.client_siret ? { text: `SIRET : ${quote.client_siret}`, color: GREY, size: 7.5 } : null,
  ].filter(Boolean)

  const maxLines = Math.max(providerLines.length, clientLines.length)
  for (let i = 0; i < maxLines; i++) {
    const ly = y + i * 4.6
    const pl = providerLines[i]
    const cl = clientLines[i]
    if (pl) {
      doc.setFont('helvetica', pl.bold ? 'bold' : 'normal')
      doc.setFontSize(pl.size || 8.5)
      doc.setTextColor(...(pl.color || DARK))
      doc.text(pl.text, margin, ly)
    }
    if (cl) {
      doc.setFont('helvetica', cl.bold ? 'bold' : 'normal')
      doc.setFontSize(cl.size || 8.5)
      doc.setTextColor(...(cl.color || DARK))
      doc.text(cl.text, midX, ly)
    }
  }

  y = y + maxLines * 4.6 + 12

  // Séparateur léger
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.25)
  doc.line(margin, y - 1, W - margin, y - 1)

  // ── OBJET ────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...GREY)
  doc.text('OBJET :', margin, y + 4)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...DARK)
  const objetLabel = items.length > 1
    ? `Impression 3D multi-pièces — ${items.length} article(s)`
    : (quote.project_name || '—')
  doc.text(objetLabel, margin + 20, y + 4)
  y += 9

  // ── TABLEAU ───────────────────────────────────────────────────
  const PHOTO_COL_W = 32
  const IMG_W = PHOTO_COL_W - 6
  const IMG_H = 22
  const ROW_H = IMG_H + 10  // hauteur minimale par ligne

  const showTva = taxRate > 0
  const puLabel = showTva ? 'PU HT' : 'PU TTC'

  const headRow = ['Désignation / Spécifications']
  if (hasAnyImage) headRow.push('Photo réf.')
  headRow.push('Qté', puLabel)
  if (showTva) headRow.push(`TVA ${taxRate}%`)
  headRow.push('Total TTC')
  const tableHead = [headRow]

  const tableBody = items.map(item => {
    const row = ['']
    if (hasAnyImage) row.push('')
    row.push(item.quantity, fmtEur(item.unitPriceHT))
    if (showTva) row.push(fmtEur(item.tvaPart))
    row.push(fmtEur(item.totalTTC))
    return row
  })

  let ci = 0
  const colStyles = {}
  colStyles[ci++] = { cellWidth: 'auto' }
  if (hasAnyImage) colStyles[ci++] = { cellWidth: PHOTO_COL_W, halign: 'center' }
  colStyles[ci++] = { cellWidth: 14, halign: 'center' }
  colStyles[ci++] = { cellWidth: 27, halign: 'right' }
  if (showTva) colStyles[ci++] = { cellWidth: 22, halign: 'right' }
  colStyles[ci++] = { cellWidth: 30, halign: 'right', fontStyle: 'bold' }

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: tableHead,
    body: tableBody,
    styles: { fontSize: 8, cellPadding: 3.5, textColor: DARK, lineColor: [226, 232, 240], lineWidth: 0.25 },
    headStyles: { fillColor: TEAL, textColor: WHITE, fontStyle: 'bold', fontSize: 7.5 },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    columnStyles: colStyles,
    didParseCell(data) {
      if (data.section !== 'body') return
      const rowIdx = data.row.index
      const imgData = itemImages[rowIdx]
      if (data.column.index === 0) {
        const item = items[rowIdx]
        const specs = [
          `Matière : ${item.material}`,
          item.weight ? `Poids total : ${item.weight} g` : null,
          item.colorCount > 1 ? `${item.colorCount} couleurs` : null,
        ].filter(Boolean)
        data.cell.styles.minCellHeight = Math.max(ROW_H, 10 + specs.length * 5)
        data.cell.text = []
      }
      if (hasAnyImage && data.column.index === 1) {
        data.cell.styles.minCellHeight = ROW_H
        data.cell.text = []
      }
    },
    didDrawCell(data) {
      if (data.section !== 'body') return
      const rowIdx = data.row.index
      const item   = items[rowIdx]
      const imgData = itemImages[rowIdx]

      // ── Photo ──
      if (hasAnyImage && data.column.index === 1) {
        if (imgData) {
          const px = data.cell.x + (data.cell.width - IMG_W) / 2
          const py = data.cell.y + (data.cell.height - IMG_H) / 2
          doc.addImage(imgData, 'JPEG', px, py, IMG_W, IMG_H, undefined, 'MEDIUM')
          doc.setFontSize(6); doc.setFont('helvetica', 'italic'); doc.setTextColor(160, 174, 192)
          doc.text('Réf. client', px + IMG_W / 2, py + IMG_H + 3, { align: 'center' })
        }
        return
      }

      // ── Description ──
      if (data.column.index !== 0) return
      const pad = 3.5
      const x0  = data.cell.x + pad
      let   ly  = data.cell.y + pad + 4

      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...DARK)
      doc.text(item.name, x0, ly)
      ly += 6

      const specs = [
        `Matière : ${item.material}`,
        item.weight ? `Poids total : ${item.weight} g` : null,
        item.colorCount > 1 ? `${item.colorCount} couleurs` : null,
      ].filter(Boolean)
      specs.forEach(spec => {
        doc.setFillColor(...TEAL)
        doc.circle(x0 + 1, ly - 1.2, 0.75, 'F')
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...DARK)
        doc.text(spec, x0 + 4, ly)
        ly += 4.8
      })
    },
  })

  let afterTable = doc.lastAutoTable.finalY + 6

  // ── DÉTAIL DES COÛTS (version interne uniquement) ────────────
  if (mode === 'internal') {
    const matCost = quote.material_cost || 0
    const eqpCost = quote.equipment_cost || 0
    const wrkCost = quote.work_cost || 0
    const costBase = quote.subtotal_ht || matCost + eqpCost + wrkCost
    const marge = quote.margin_percent || 40
    const sellingHT = Math.round(costBase * (1 + marge / 100) * 100) / 100

    const sectionH = 50
    const boxW = (W - margin * 2 - 6) / 3
    const secTop = afterTable

    // Fond section
    doc.setFillColor(...LIGHT)
    doc.rect(margin, secTop, W - margin * 2, sectionH, 'F')

    // Titre
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...GREY)
    doc.text('DÉTAIL DES COÛTS — USAGE INTERNE', margin + 3, secTop + 6)

    // 3 cartes côte à côte
    const cards = [
      { title: 'Matériau', value: fmtEur(matCost), color: [39, 174, 96] },
      { title: 'Équipement', value: fmtEur(eqpCost), color: [66, 153, 225] },
      { title: "Main d'œuvre", value: fmtEur(wrkCost), color: [229, 62, 62] },
    ]
    const cardTop = secTop + 10
    const cardH = 22

    cards.forEach((card, i) => {
      const cx = margin + i * (boxW + 3)
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(cx, cardTop, boxW, cardH, 2, 2, 'F')
      // Bande couleur en haut
      doc.setFillColor(...card.color)
      doc.roundedRect(cx, cardTop, boxW, 5, 2, 2, 'F')
      doc.rect(cx, cardTop + 3, boxW, 2, 'F')
      // Titre carte
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.setTextColor(...WHITE)
      doc.text(card.title, cx + boxW / 2, cardTop + 3.8, { align: 'center' })
      // Valeur
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...DARK)
      doc.text(card.value, cx + boxW / 2, cardTop + 16, { align: 'center' })
    })

    // Ligne marge / prix de vente
    const margeY = cardTop + cardH + 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...DARK)
    const parts = [
      `Coût de revient : ${fmtEur(costBase)}`,
      `Marge +${marge}%`,
      `Prix de vente HT : ${fmtEur(sellingHT)}`,
    ]
    const spacing = (W - margin * 2) / 3
    parts.forEach((p, i) => {
      const px = margin + spacing * i + spacing / 2
      const arrow = i < parts.length - 1 ? ' ➜' : ''
      doc.text(p + arrow, px, margeY, { align: 'center' })
    })

    afterTable = secTop + sectionH + 6
  }

  // ── TOTAUX + CONDITIONS ───────────────────────────────────────
  const totalsX = W - margin - 80
  const condWidth = totalsX - margin - 6

  const totals = [['Sous-total HT', fmtEur(allTotalHT)]]
  if (taxRate > 0) totals.push([`TVA (${taxRate}%)`, fmtEur(allTotalTVA)])
  if (quote.deposit_percent > 0) {
    const acompte = allTotalTTC * (quote.deposit_percent / 100)
    totals.push([`Acompte (${quote.deposit_percent}%)`, fmtEur(acompte)])
  }
  const totalsH = totals.length * 6 + 13

  const condLines = [`Mode de paiement : ${paymentLabel(quote.payment_method)}`]
  if (quote.processing_delay)
    condLines.push(`Délai de fabrication : ${processingLabel(quote.processing_delay)}`)
  if (quote.delivery_delay) condLines.push(`Livraison : ${deliveryLabel(quote.delivery_delay)}`)
  if (quote.deposit_percent > 0)
    condLines.push(`Acompte de ${quote.deposit_percent}% à la commande`)
  condLines.push(
    `Devis valable jusqu'au ${validityDate(quote.quote_date, quote.quote_validity_days || 30)}`,
  )
  if (company.paymentIban) condLines.push(`IBAN : ${company.paymentIban}`)

  const condBandH = Math.max(totalsH, condLines.length * 5 + 8)

  // Bloc CONDITIONS (gauche)
  doc.setFillColor(...LIGHT)
  doc.rect(margin, afterTable, condWidth, condBandH, 'F')
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...GREY)
  doc.text('CONDITIONS DE RÈGLEMENT', margin + 3, afterTable + 5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...DARK)
  condLines.forEach((line, i) => {
    doc.text(line, margin + 3, afterTable + 11 + i * 5)
  })

  // Totaux (droite)
  let ty = afterTable + 5
  doc.setFontSize(8.5)
  totals.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GREY)
    doc.text(label, totalsX, ty)
    doc.setTextColor(...DARK)
    doc.text(value, W - margin, ty, { align: 'right' })
    ty += 6
  })

  // Total TTC
  doc.setFillColor(...TEAL)
  doc.roundedRect(totalsX - 3, ty - 4, W - margin - totalsX + 3, 9, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.setFontSize(10)
  doc.text('Total TTC', totalsX, ty + 2)
  doc.text(fmtEur(allTotalTTC), W - margin, ty + 2, { align: 'right' })

  // ── NOTES ─────────────────────────────────────────────────────
  let curY = afterTable + condBandH + 8
  if (quote.quote_notes) {
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...GREY)
    doc.text('NOTES', margin, curY)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...DARK)
    const noteLines = doc.splitTextToSize(quote.quote_notes, W - margin * 2)
    doc.text(noteLines, margin, curY + 5)
    curY += 8 + noteLines.length * 4
  }

  curY += 4

  // ── VÉRIFICATION D'ESPACE avant "Pour valider" + signatures (~86mm) ──
  if (curY + 86 > 265) {
    doc.setDrawColor(...TEAL)
    doc.setLineWidth(0.4)
    doc.line(margin, 279, W - margin, 279)
    if (company.legalMention) {
      doc.setFontSize(6.5)
      doc.setTextColor(...GREY)
      doc.setFont('helvetica', 'italic')
      doc.text(company.legalMention, W / 2, 283, { align: 'center' })
    }
    doc.setFontSize(7)
    doc.setTextColor(...GREY)
    doc.setFont('helvetica', 'normal')
    const fp2 = [company.name, company.ownerName,
      company.siret ? `SIRET : ${company.siret}` : null, company.email].filter(Boolean)
    doc.text(fp2.join(' — '), W / 2, 290, { align: 'center' })
    if (mode === 'internal') {
      doc.setFontSize(6.5)
      doc.setTextColor(229, 62, 62)
      doc.text('DOCUMENT INTERNE — NE PAS DIFFUSER AU CLIENT', W / 2, 294.5, { align: 'center' })
    }
    doc.addPage()
    curY = 20
  }

  // ── BLOC "COMMENT VALIDER CE DEVIS" ───────────────────────────
  // Hauteur dynamique : titre (6) + cercle (8) + texte max 2 lignes (8) + padding (6)
  const stepBgH = 28
  doc.setFillColor(232, 247, 249)
  doc.roundedRect(margin, curY, W - margin * 2, stepBgH, 3, 3, 'F')
  doc.setDrawColor(...TEAL)
  doc.setLineWidth(0.4)
  doc.roundedRect(margin, curY, W - margin * 2, stepBgH, 3, 3, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(...TEAL)
  doc.text('POUR VALIDER CE DEVIS', margin + 4, curY + 5)

  const stepW = (W - margin * 2) / 3
  const acompteLabel = quote.deposit_percent > 0
    ? `Versez l'acompte de ${quote.deposit_percent}%`
    : 'Procédez au paiement'
  const steps = [
    { num: '1', text: 'Signez et datez ce document' },
    { num: '2', text: `Renvoyez par email :\n${company.email}` },
    { num: '3', text: acompteLabel },
  ]
  const circleY = curY + 13
  steps.forEach((step, i) => {
    const sx = margin + i * stepW + stepW / 2
    // Cercle teal plein
    doc.setFillColor(...TEAL)
    doc.circle(sx, circleY, 3.2, 'F')
    // Numéro blanc dans le cercle
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...WHITE)
    doc.text(step.num, sx, circleY + 1.2, { align: 'center' })
    // Texte sous le cercle (dans la boîte)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...DARK)
    step.text.split('\n').forEach((l, li) => {
      doc.text(l, sx, circleY + 7 + li * 3.8, { align: 'center' })
    })
  })
  curY += stepBgH + 12

  // ── COORDONNÉES BANCAIRES ─────────────────────────────────────
  if (company.paymentIban) {
    const ibanH = 16
    doc.setFillColor(...LIGHT)
    doc.rect(margin, curY, W - margin * 2, ibanH, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...GREY)
    doc.text('RÈGLEMENT PAR VIREMENT', margin + 3, curY + 5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...DARK)
    const ibanParts = [
      `IBAN : ${company.paymentIban}`,
      company.paymentBic  ? `BIC : ${company.paymentBic}`   : null,
      company.paymentBank ? `Banque : ${company.paymentBank}` : null,
    ].filter(Boolean).join('   ')
    doc.text(ibanParts, margin + 3, curY + 12)
    curY += ibanH + 6
  }

  // ── VÉRIFICATION D'ESPACE avant signatures ────────────────────
  // Besoin : séparateur (8) + sigY (18) + lignes (15) + marge (5) = ~46mm
  if (curY + 46 > 265) {
    // Fermer la page courante avec le footer
    doc.setDrawColor(...TEAL)
    doc.setLineWidth(0.4)
    doc.line(margin, 279, W - margin, 279)
    if (company.legalMention) {
      doc.setFontSize(6.5)
      doc.setTextColor(...GREY)
      doc.setFont('helvetica', 'italic')
      doc.text(company.legalMention, W / 2, 283, { align: 'center' })
    }
    doc.setFontSize(7)
    doc.setTextColor(...GREY)
    doc.setFont('helvetica', 'normal')
    const fp = [company.name, company.ownerName,
      company.siret ? `SIRET : ${company.siret}` : null, company.email].filter(Boolean)
    doc.text(fp.join(' — '), W / 2, 290, { align: 'center' })
    if (mode === 'internal') {
      doc.setFontSize(6.5)
      doc.setTextColor(229, 62, 62)
      doc.text('DOCUMENT INTERNE — NE PAS DIFFUSER AU CLIENT', W / 2, 294.5, { align: 'center' })
    }
    doc.addPage()
    curY = 20
  }

  // ── SÉPARATEUR avant signatures ───────────────────────────────
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.25)
  doc.line(margin, curY + 8, W - margin, curY + 8)

  // ── SIGNATURES AMÉLIORÉES ─────────────────────────────────────
  const sigY = curY + 18
  const lineW = 72

  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(margin, sigY, margin + lineW, sigY)
  doc.line(W - margin - lineW, sigY, W - margin, sigY)

  // Textes signatures
  doc.setFontSize(7)
  doc.setTextColor(...GREY)
  doc.setFont('helvetica', 'bold')
  doc.text('Signature client', margin, sigY + 5)
  doc.text('Signature prestataire', W - margin - lineW, sigY + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.text('Lu et approuvé', margin, sigY + 10)
  doc.text('Lu et approuvé', W - margin - lineW, sigY + 10)

  doc.setTextColor(...DARK)
  doc.text('Date : ______________________', margin, sigY + 15)
  doc.text('Date : ______________________', W - margin - lineW, sigY + 15)

  // ── SÉPARATEUR avant mentions légales ─────────────────────────
  doc.setDrawColor(...TEAL)
  doc.setLineWidth(0.4)
  doc.line(margin, 279, W - margin, 279)

  // ── MENTIONS LÉGALES — fixées en bas de page ──────────────────
  if (company.legalMention) {
    doc.setFontSize(6.5)
    doc.setTextColor(...GREY)
    doc.setFont('helvetica', 'italic')
    doc.text(company.legalMention, W / 2, 283, { align: 'center' })
  }

  // ── PIED DE PAGE — fixé en bas de page ────────────────────────
  doc.setFontSize(7)
  doc.setTextColor(...GREY)
  doc.setFont('helvetica', 'normal')
  const footerParts = [
    company.name,
    company.ownerName,
    company.siret ? `SIRET : ${company.siret}` : null,
    company.email,
  ].filter(Boolean)
  doc.text(footerParts.join(' — '), W / 2, 290, { align: 'center' })

  if (mode === 'internal') {
    doc.setFontSize(6.5)
    doc.setTextColor(229, 62, 62)
    doc.text('DOCUMENT INTERNE — NE PAS DIFFUSER AU CLIENT', W / 2, 294.5, { align: 'center' })
  }

  return doc
}

export { fmtEur, fmtDate, validityDate, processingLabel, deliveryLabel, paymentLabel, statusInfo }

// ── Exports publics ───────────────────────────────────────────────────────────

export async function generateQuotePDF(quote, mode = 'client') {
  const doc = await _buildDoc(quote, mode)
  const suffix = mode === 'internal' ? '-INTERNE' : ''
  doc.save(`devis-${quote.quote_number || 'bambucalc'}${suffix}.pdf`)
}

export async function generateQuotePDFDoc(quote, mode = 'client') {
  return _buildDoc(quote, mode)
}

// jsPDF v4 a supprimé output('datauristring') — passage par ArrayBuffer
export function pdfToBase64(doc) {
  const buffer = doc.output('arraybuffer')
  const bytes = new Uint8Array(buffer)
  const CHUNK = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(binary)
}
