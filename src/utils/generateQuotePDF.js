import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { company } from '../config/company'

const TEAL   = [46, 156, 171]
const DARK   = [27, 47, 57]
const GREY   = [113, 128, 150]
const LIGHT  = [240, 244, 248]
const WHITE  = [255, 255, 255]

const STATUS_MAP = {
  pending:  { label: 'En attente', color: [214, 158, 46],  bg: [255, 247, 230] },
  accepted: { label: 'Accepté',    color: [39,  174, 96],  bg: [230, 255, 240] },
  refused:  { label: 'Refusé',     color: [229, 62,  62],  bg: [255, 230, 230] },
  sent:     { label: 'Envoyé',     color: [66,  153, 225], bg: [230, 243, 255] },
}

function statusInfo(status) {
  return STATUS_MAP[status] || STATUS_MAP.pending
}

function fmtEur(v) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v ?? 0)
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso))
}

function addValidityDate(quoteDate, days) {
  if (!quoteDate || !days) return '—'
  const d = new Date(quoteDate)
  d.setDate(d.getDate() + Number(days))
  return fmtDate(d.toISOString())
}

function processingLabel(v) {
  return { '24h': '24 heures', '2-3j': '2 à 3 jours ouvrés', '5-7j': '5 à 7 jours ouvrés',
    '1-2s': '1 à 2 semaines', '2-4s': '2 à 4 semaines', 'custom': 'À convenir' }[v] || v || ''
}

function deliveryLabel(v) {
  return { pickup: 'Retrait en main propre', colissimo: 'Colissimo (2-3 j)',
    chronopost: 'Chronopost (J+1)', mondial: 'Mondial Relay (3-5 j)', custom: 'À convenir' }[v] || v || ''
}

function paymentLabel(method) {
  const map = {
    virement: 'Virement bancaire',
    cheque: 'Chèque',
    cb: 'Carte bancaire',
    especes: 'Espèces',
    paypal: 'PayPal',
  }
  return map[method] || method || 'Virement bancaire'
}

// Charge une image distante et la retourne en data-URL (pour jsPDF addImage)
async function loadImageDataUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width  = img.naturalWidth
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

// ── Constructeur interne (retourne le doc jsPDF sans déclencher le download) ──
async function _buildDoc(quote) {
  // Pré-chargement de l'image de référence (si présente)
  let refImageData = null
  if (quote.reference_image_url) {
    try { refImageData = await loadImageDataUrl(quote.reference_image_url) } catch { /* CORS ou réseau */ }
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 14

  // ── En-tête ──────────────────────────────────────────────
  doc.setFillColor(...TEAL)
  doc.rect(0, 0, W, 28, 'F')

  doc.setTextColor(...WHITE)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('BambuCalc', margin, 12)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Impression 3D professionnelle', margin, 18)
  if (company.website) doc.text(company.website, margin, 23)

  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('DEVIS', W - margin, 14, { align: 'right' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(quote.quote_number || '', W - margin, 20, { align: 'right' })

  // ── Infos devis (bandeau gris) ────────────────────────────
  doc.setFillColor(...LIGHT)
  doc.rect(0, 28, W, 14, 'F')

  doc.setTextColor(...GREY)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')

  const st = statusInfo(quote.status)
  const infoItems = [
    ['Date d\'émission', fmtDate(quote.quote_date)],
    ['Validité', addValidityDate(quote.quote_date, quote.quote_validity_days || 30)],
    ['Durée validité', `${quote.quote_validity_days || 30} jours`],
  ]

  const colW = (W - margin * 2) / (infoItems.length + 1)
  infoItems.forEach(([label, value], i) => {
    const x = margin + i * colW
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...GREY)
    doc.text(label.toUpperCase(), x, 34)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...DARK)
    doc.text(value, x, 39)
  })

  // Badge statut coloré
  const badgeX = margin + infoItems.length * colW
  const badgeW = colW - 2
  doc.setFillColor(...st.bg)
  doc.roundedRect(badgeX, 29, badgeW, 10, 3, 3, 'F')
  doc.setDrawColor(...st.color)
  doc.setLineWidth(0.5)
  doc.roundedRect(badgeX, 29, badgeW, 10, 3, 3, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...st.color)
  doc.text('STATUT', badgeX + badgeW / 2, 33.5, { align: 'center' })
  doc.setFontSize(9)
  doc.text(st.label, badgeX + badgeW / 2, 37.5, { align: 'center' })

  // ── Deux colonnes : Client | Prestataire ──────────────────
  let y = 50
  const colLeft  = margin
  const colRight = W / 2 + 3

  // Titres colonnes
  doc.setFillColor(...TEAL)
  doc.roundedRect(colLeft,  y - 5, W / 2 - 5, 7, 2, 2, 'F')
  doc.roundedRect(colRight, y - 5, W / 2 - 3, 7, 2, 2, 'F')
  doc.setTextColor(...WHITE)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('CLIENT', colLeft + 3, y)
  doc.text('PRESTATAIRE', colRight + 3, y)

  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...DARK)
  doc.setFontSize(9)

  // Bloc client
  const clientLines = []
  const clientName = quote.client_name || [quote.client_first_name, quote.client_last_name].filter(Boolean).join(' ')
  if (clientName) clientLines.push({ text: clientName, bold: true })
  if (quote.client_contact_name) clientLines.push({ text: `Contact : ${quote.client_contact_name}` })
  if (quote.client_address) clientLines.push({ text: quote.client_address })
  const cityLine = [quote.client_postal_code, quote.client_city].filter(Boolean).join(' ')
  if (cityLine) clientLines.push({ text: cityLine })
  if (quote.client_country && quote.client_country !== 'France') clientLines.push({ text: quote.client_country })
  if (quote.client_email) clientLines.push({ text: quote.client_email, color: TEAL })
  if (quote.client_phone) clientLines.push({ text: quote.client_phone })
  if (quote.client_siret) clientLines.push({ text: `SIRET : ${quote.client_siret}`, color: GREY })
  if (quote.client_vat_number) clientLines.push({ text: `TVA : ${quote.client_vat_number}`, color: GREY })

  // Bloc prestataire
  const providerLines = [
    { text: company.name, bold: true },
    { text: company.ownerName },
    { text: company.address },
    { text: [company.postalCode, company.city].filter(Boolean).join(' ') },
    { text: company.email, color: TEAL },
    company.phone ? { text: company.phone } : null,
    company.siret ? { text: `SIRET : ${company.siret}`, color: GREY } : null,
    company.vatNumber ? { text: `TVA : ${company.vatNumber}`, color: GREY } : null,
  ].filter(Boolean)

  const maxLines = Math.max(clientLines.length, providerLines.length)

  for (let i = 0; i < maxLines; i++) {
    const cl = clientLines[i]
    const pl = providerLines[i]
    const lineY = y + 5 + i * 5

    if (cl) {
      doc.setFont('helvetica', cl.bold ? 'bold' : 'normal')
      doc.setTextColor(...(cl.color || DARK))
      doc.text(cl.text, colLeft, lineY)
    }
    if (pl) {
      doc.setFont('helvetica', pl.bold ? 'bold' : 'normal')
      doc.setTextColor(...(pl.color || DARK))
      doc.text(pl.text, colRight, lineY)
    }
  }

  // ── Objet du devis (bande simple 1 ligne) ────────────────
  y = y + 5 + maxLines * 5 + 6

  doc.setFillColor(...LIGHT)
  doc.rect(margin, y, W - margin * 2, 10, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...GREY)
  doc.text('OBJET :', margin + 3, y + 6.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...DARK)
  doc.text(quote.project_name || '—', margin + 22, y + 6.5)

  y += 14

  // ── Tableau des prestations ───────────────────────────────
  const taxRate     = quote.tax_rate ?? 20
  const unitPriceHT = (quote.cost_per_unit || 0) / (1 + taxRate / 100)
  const totalHT     = unitPriceHT * (quote.quantity || 1)
  const totalTVA    = (quote.total_cost || 0) - totalHT
  const printerLabel = {
    'p2s-combo': 'Bambu P2S Combo',
    'p2s-mono':  'Bambu P2S Monocouleur',
    'x1c':       'Bambu X1C',
    'a1-mini':   'Bambu A1 Mini',
    'a1':        'Bambu A1',
  }[quote.printer_model] || quote.printer_model || '—'

  const desc = [
    `Impression 3D — ${quote.project_name || '—'}`,
    `Matière : ${quote.material || '—'} | Imprimante : ${printerLabel} | Buse : ${quote.nozzle_size || '—'} mm`,
    `Profil : ${quote.print_profile || '—'} | Poids total : ${quote.weight || 0} g`,
  ].join('\n')

  // Ligne image dans le tableau (si photo de référence)
  const REF_IMG_MARKER = '__REF_IMG__'
  const IMG_ROW_H = 46  // hauteur réservée pour la photo dans le tableau
  const tableBody = [[
    desc,
    quote.quantity ?? 1,
    fmtEur(unitPriceHT),
    fmtEur((quote.cost_per_unit || 0) - unitPriceHT),
    fmtEur(quote.cost_per_unit || 0),
  ]]
  if (refImageData) tableBody.push([REF_IMG_MARKER, '', '', '', ''])

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Description', 'Qté', 'PU HT', `TVA ${taxRate}%`, 'Total TTC']],
    body: tableBody,
    styles: {
      fontSize: 8.5,
      cellPadding: 4,
      textColor: DARK,
      lineColor: [226, 232, 240],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: TEAL,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 28, halign: 'right' },
      3: { cellWidth: 24, halign: 'right' },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell(data) {
      if (!refImageData) return
      const isImgRow = data.section === 'body' && data.row.index === 1
      if (!isImgRow) return
      // Réserver la hauteur pour l'image dans la cellule Description
      if (data.column.index === 0) {
        data.cell.styles.minCellHeight = IMG_ROW_H
        data.cell.text = []  // effacer le marqueur texte
      } else {
        data.cell.text = []  // cellules vides sur le reste de la ligne
      }
    },
    didDrawCell(data) {
      if (!refImageData) return
      const isImgRow = data.section === 'body' && data.row.index === 1 && data.column.index === 0
      if (!isImgRow) return
      // Dimensions de la photo : max 55 × 40 mm, centrée verticalement dans la cellule
      const pW = 55, pH = 40
      const px = data.cell.x + data.cell.padding('left')
      const py = data.cell.y + (data.cell.height - pH) / 2
      doc.addImage(refImageData, 'JPEG', px, py, pW, pH, undefined, 'MEDIUM')
      // Légende sous l'image
      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(160, 174, 192)
      doc.text('Photo de référence client', px, py + pH + 3.5)
    },
  })

  // ── Totaux + Conditions (layout 2 colonnes côte à côte) ────
  const afterTable = doc.lastAutoTable.finalY + 4
  const totalsX   = W - margin - 80
  const condWidth = totalsX - margin - 6

  // Lignes totaux
  const totals = [
    ['Sous-total HT', fmtEur(totalHT)],
    [`TVA (${taxRate}%)`, fmtEur(totalTVA)],
  ]
  if (quote.deposit_percent > 0) {
    const acompte = (quote.total_cost || 0) * (quote.deposit_percent / 100)
    totals.push([`Acompte (${quote.deposit_percent}%)`, fmtEur(acompte)])
  }
  const totalsH = totals.length * 6 + 13  // lignes × 6 + boîte TTC

  // Lignes conditions
  const condLines = [
    `Mode de paiement : ${paymentLabel(quote.payment_method)}`,
  ]
  if (quote.processing_delay)
    condLines.push(`Délai de fabrication : ${processingLabel(quote.processing_delay)}`)
  if (quote.delivery_delay)
    condLines.push(`Livraison : ${deliveryLabel(quote.delivery_delay)}`)
  if (quote.deposit_percent > 0)
    condLines.push(`Acompte de ${quote.deposit_percent}% à la commande`)
  condLines.push(`Devis valable jusqu'au ${addValidityDate(quote.quote_date, quote.quote_validity_days || 30)}`)
  if (company.paymentIban)
    condLines.push(`IBAN : ${company.paymentIban}`)

  const condBandH = Math.max(totalsH, condLines.length * 5 + 8)

  // Bloc CONDITIONS (colonne gauche)
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

  // Totaux (colonne droite)
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

  // Total TTC (en gras dans un rectangle)
  doc.setFillColor(...TEAL)
  doc.roundedRect(totalsX - 3, ty - 4, W - margin - totalsX + 3, 9, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.setFontSize(10)
  doc.text('Total TTC', totalsX, ty + 2)
  doc.text(fmtEur(quote.total_cost || 0), W - margin, ty + 2, { align: 'right' })

  // ── Notes ─────────────────────────────────────────────────
  const twoColBottomY = afterTable + condBandH + 8
  let notesH = 0
  if (quote.quote_notes) {
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...GREY)
    doc.text('NOTES', margin, twoColBottomY)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...DARK)
    const lines = doc.splitTextToSize(quote.quote_notes, W - margin * 2)
    doc.text(lines, margin, twoColBottomY + 5)
    notesH = 8 + lines.length * 4
  }

  // ── Zone signature ────────────────────────────────────────
  const sigY = Math.max(twoColBottomY + notesH + 8, 252)
  doc.setDrawColor(...[226, 232, 240])
  doc.setLineWidth(0.3)
  doc.line(margin, sigY, margin + 70, sigY)
  doc.line(W - margin - 70, sigY, W - margin, sigY)

  doc.setFontSize(7.5)
  doc.setTextColor(...GREY)
  doc.setFont('helvetica', 'normal')
  doc.text('Signature client\n(Bon pour accord)', margin, sigY + 5)
  doc.text('Signature prestataire', W - margin - 70, sigY + 5)

  // ── Pied de page ──────────────────────────────────────────
  doc.setFontSize(7)
  doc.setTextColor(...GREY)
  doc.text(
    `BambuCalc — ${company.ownerName}${company.siret ? ' — SIRET : ' + company.siret : ''} — ${company.email}`,
    W / 2, 290, { align: 'center' }
  )

  return doc
}

// ── Export : déclenche le téléchargement navigateur ──
export async function generateQuotePDF(quote) {
  const doc = await _buildDoc(quote)
  doc.save(`devis-${quote.quote_number || 'bambucalc'}.pdf`)
}

// ── Export : retourne le doc jsPDF brut (pour encodage Base64 avant envoi mail) ──
export async function generateQuotePDFDoc(quote) {
  return _buildDoc(quote)
}

// ── Export : convertit un doc jsPDF en chaîne Base64 pure (compatible jsPDF v4) ──
// jsPDF v4 a supprimé output('datauristring') — on passe par ArrayBuffer.
export function pdfToBase64(doc) {
  const buffer = doc.output('arraybuffer')
  const bytes  = new Uint8Array(buffer)
  const CHUNK  = 0x8000 // 32 768 octets — évite les stack overflow sur gros fichiers
  let binary   = ''
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(binary)
}
