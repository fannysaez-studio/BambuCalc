<template>
  <div class="preview-overlay" @click.self="$emit('close')">
    <div class="preview-modal" role="dialog" aria-modal="true">

      <!-- ── Barre du haut ── -->
      <div :class="['preview-bar', mode === 'internal' && 'preview-bar--internal']">
        <div class="preview-bar-left">
          <Eye class="bar-icon" />
          <span class="bar-title">{{ mode === 'internal' ? 'Aperçu Interne — Coûts' : 'Aperçu du Devis' }}</span>
          <span v-if="q.quote_number" class="bar-num">{{ q.quote_number }}</span>
          <span v-if="mode === 'internal'" class="bar-badge-int">Usage interne</span>
        </div>
        <div class="preview-bar-right">
          <button :class="['btn-dl', mode === 'internal' && 'btn-dl--internal']" @click="handleDownload" :disabled="downloading">
            <Download class="btn-dl-icon" />
            <span>{{ downloading ? 'Génération…' : 'Télécharger PDF' }}</span>
          </button>
          <button class="btn-close-modal" @click="$emit('close')" aria-label="Fermer">✕</button>
        </div>
      </div>

      <!-- ── Document scrollable ── -->
      <div class="preview-scroll">
        <div class="doc">

          <!-- ═══ EN-TÊTE ═══ -->
          <div class="d-header">
            <div class="d-header-left">
              <div class="d-brand">BambuCalc</div>
              <div class="d-brand-sub">App ~ Coût d'impression 3D</div>
            </div>
            <div class="d-header-right">
              <div class="d-devis-label">DEVIS</div>
              <div class="d-meta-row">
                <span class="d-meta-lbl">N° Devis :</span>
                <span class="d-meta-val">{{ q.quote_number || '—' }}</span>
              </div>
              <div class="d-meta-row">
                <span class="d-meta-lbl">Date :</span>
                <span class="d-meta-val">{{ fmtDate(q.quote_date) }}</span>
              </div>
              <div class="d-meta-row">
                <span class="d-meta-lbl">Validité :</span>
                <span class="d-meta-val">{{ q.quote_validity_days || 30 }} jours</span>
              </div>
            </div>
          </div>
          <div class="d-sep-teal"></div>

          <!-- ═══ CONTACTS ═══ -->
          <div class="d-contacts">
            <div class="d-contact">
              <div class="d-contact-hdr">PRESTATAIRE</div>
              <div class="d-contact-name">{{ co.name }}</div>
              <div class="d-contact-line">{{ co.address }}</div>
              <div class="d-contact-line">{{ co.postalCode }} {{ co.city }}</div>
              <div class="d-contact-line d-teal">{{ co.email }}</div>
              <div v-if="co.phone" class="d-contact-line">{{ co.phone }}</div>
              <div v-if="co.siret" class="d-contact-line d-grey">SIRET : {{ co.siret }}</div>
            </div>
            <div class="d-contact">
              <div class="d-contact-hdr">DESTINATAIRE</div>
              <div class="d-contact-name">{{ clientName || '—' }}</div>
              <div v-if="q.client_contact_name" class="d-contact-line">Contact : {{ q.client_contact_name }}</div>
              <div v-if="q.client_address" class="d-contact-line">{{ q.client_address }}</div>
              <div v-if="q.client_postal_code || q.client_city" class="d-contact-line">
                {{ q.client_postal_code }} {{ q.client_city }}
              </div>
              <div v-if="q.client_email" class="d-contact-line d-teal">{{ q.client_email }}</div>
              <div v-if="q.client_phone" class="d-contact-line">{{ q.client_phone }}</div>
              <div v-if="q.client_siret" class="d-contact-line d-grey">SIRET : {{ q.client_siret }}</div>
            </div>
          </div>
          <div class="d-sep-light"></div>

          <!-- ═══ OBJET ═══ -->
          <div class="d-objet">
            <span class="d-objet-lbl">OBJET :</span>
            <span>{{ q.project_name || '—' }}</span>
          </div>

          <!-- ═══ TABLEAU ═══ -->
          <table class="d-table">
            <thead>
              <tr>
                <th class="th-desc">Désignation / Spécifications</th>
                <th v-if="q.reference_image_url" class="th-photo">Photo réf.</th>
                <th class="th-num">Qté</th>
                <th class="th-num">PU HT</th>
                <th class="th-num">TVA {{ taxRate }}%</th>
                <th class="th-num th-ttc">Total TTC</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="td-desc">
                  <div class="td-title">Impression 3D — {{ q.project_name || '—' }}</div>
                  <ul class="td-specs">
                    <li v-for="spec in specParts" :key="spec">{{ spec }}</li>
                  </ul>
                </td>
                <td v-if="q.reference_image_url" class="td-photo">
                  <img :src="q.reference_image_url" class="d-ref-img" alt="" loading="lazy" />
                  <div class="d-ref-lbl">Réf. client</div>
                </td>
                <td class="td-c">{{ q.quantity ?? 1 }}</td>
                <td class="td-r">{{ fmtEur(unitPriceHT) }}</td>
                <td class="td-r">{{ fmtEur(totalTVA) }}</td>
                <td class="td-r td-bold">{{ fmtEur(q.total_cost || 0) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- ═══ DÉTAIL DES COÛTS — mode interne uniquement ═══ -->
          <div v-if="mode === 'internal'" class="d-internal">
            <div class="d-int-title">DÉTAIL DES COÛTS — USAGE INTERNE</div>
            <div class="d-int-cards">
              <div class="d-int-card d-int-card--green">
                <div class="d-int-card-label">Matériau</div>
                <div class="d-int-card-value">{{ fmtEur(q.material_cost || 0) }}</div>
              </div>
              <div class="d-int-card d-int-card--blue">
                <div class="d-int-card-label">Équipement</div>
                <div class="d-int-card-value">{{ fmtEur(q.equipment_cost || 0) }}</div>
              </div>
              <div class="d-int-card d-int-card--red">
                <div class="d-int-card-label">Main d'œuvre</div>
                <div class="d-int-card-value">{{ fmtEur(q.work_cost || 0) }}</div>
              </div>
            </div>
            <div class="d-int-summary">
              <span>Coût de revient : <strong>{{ fmtEur(costBase) }}</strong></span>
              <span class="d-int-arrow">→</span>
              <span>Marge <strong>+{{ q.margin_percent || 40 }}%</strong></span>
              <span class="d-int-arrow">→</span>
              <span>Prix de vente HT : <strong class="d-int-selling">{{ fmtEur(sellingHT) }}</strong></span>
            </div>
          </div>

          <!-- ═══ TOTAUX + CONDITIONS ═══ -->
          <div class="d-bottom">
            <div class="d-conditions">
              <div class="d-cond-title">CONDITIONS DE RÈGLEMENT</div>
              <div v-for="line in condLines" :key="line" class="d-cond-line">{{ line }}</div>
            </div>
            <div class="d-totals">
              <div v-for="([lbl, val]) in totalsRows" :key="lbl" class="d-tot-row">
                <span class="d-tot-lbl">{{ lbl }}</span>
                <span class="d-tot-val">{{ val }}</span>
              </div>
              <div class="d-tot-ttc">
                <span>Total TTC</span>
                <span>{{ fmtEur(q.total_cost || 0) }}</span>
              </div>
            </div>
          </div>

          <!-- ═══ NOTES ═══ -->
          <div v-if="q.quote_notes" class="d-notes">
            <div class="d-notes-title">NOTES</div>
            <p class="d-notes-text">{{ q.quote_notes }}</p>
          </div>

          <!-- ═══ POUR VALIDER ═══ -->
          <div class="d-validate">
            <div class="d-validate-title">POUR VALIDER CE DEVIS</div>
            <div class="d-vsteps">
              <div v-for="step in validateSteps" :key="step.num" class="d-vstep">
                <div class="d-vstep-circle">{{ step.num }}</div>
                <div class="d-vstep-text">
                  <template v-for="(line, i) in step.lines" :key="i">
                    {{ line }}<br v-if="i < step.lines.length - 1" />
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- ═══ SIGNATURES ═══ -->
          <div class="d-sep-grey"></div>
          <div class="d-sigs">
            <div class="d-sig">
              <div class="d-sig-title">Bon pour accord — Client</div>
              <div class="d-sig-field">Lu et approuvé :</div>
              <div class="d-sig-field d-sig-spacer">Date : _______________</div>
              <div class="d-sig-field d-sig-spacer">Signature :</div>
              <div class="d-sig-line"></div>
            </div>
            <div class="d-sig">
              <div class="d-sig-title">BambuCalc — Prestataire</div>
              <div class="d-sig-field">{{ co.ownerName }}</div>
              <div class="d-sig-field d-sig-spacer">Date : {{ fmtDate(q.quote_date) }}</div>
              <div class="d-sig-field d-sig-spacer">Signature :</div>
              <div class="d-sig-line"></div>
            </div>
          </div>

          <!-- ═══ FOOTER ═══ -->
          <div class="d-sep-teal d-sep-teal--footer"></div>
          <div class="d-footer">
            <span>{{ co.legalMention }}</span>
            <span>BambuCalc · {{ co.email }}</span>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Eye, Download } from 'lucide-vue-next'
import { generateQuotePDF } from '@/utils/generateQuotePDF'
import { company } from '@/config/company'

const PROCESSING_LABELS = {
  '24h': '24 heures', '2-3j': '2 à 3 jours ouvrés',
  '5-7j': '5 à 7 jours ouvrés', '1-2s': '1 à 2 semaines',
  '2-4s': '2 à 4 semaines', custom: 'À convenir',
}
const DELIVERY_LABELS = {
  pickup: 'Retrait en main propre', colissimo: 'Colissimo (2-3 j)',
  chronopost: 'Chronopost (J+1)', mondial: 'Mondial Relay (3-5 j)', custom: 'À convenir',
}
const PAYMENT_LABELS = {
  virement: 'Virement bancaire', cheque: 'Chèque',
  cb: 'Carte bancaire', especes: 'Espèces', paypal: 'PayPal',
}
const PRINTER_LABELS = {
  'p2s-combo': 'Bambu P2S Combo', 'p2s-mono': 'Bambu P2S Monocouleur',
  'x1c': 'Bambu X1C', 'a1-mini': 'Bambu A1 Mini', 'a1': 'Bambu A1',
}

export default {
  name: 'QuotePreviewModal',
  components: { Eye, Download },
  props: {
    quote: { type: Object, required: true },
    mode:  { type: String, default: 'client' },
  },
  emits: ['close'],
  data() {
    return { co: company, downloading: false }
  },
  computed: {
    q() { return this.quote },

    clientName() {
      return this.q.client_name
        || [this.q.client_first_name, this.q.client_last_name].filter(Boolean).join(' ')
        || ''
    },

    taxRate() { return this.q.tax_rate ?? 20 },

    unitPriceHT() {
      return (this.q.cost_per_unit || 0) / (1 + this.taxRate / 100)
    },

    totalHT() {
      return this.unitPriceHT * (this.q.quantity || 1)
    },

    totalTVA() {
      return (this.q.total_cost || 0) - this.totalHT
    },

    specParts() {
      const printTime = this.q.print_hours || this.q.print_minutes
        ? `${this.q.print_hours || 0}h${String(this.q.print_minutes || 0).padStart(2, '0')}`
        : null
      const printerLabel = PRINTER_LABELS[this.q.printer_model] || this.q.printer_model || '—'
      return [
        `Matière : ${this.q.material || '—'}`,
        printTime ? `Durée impression : ${printTime}` : null,
        this.q.weight ? `Poids : ${this.q.weight} g` : null,
        this.q.nozzle_size ? `Buse : ${this.q.nozzle_size} mm` : null,
        `Imprimante : ${printerLabel}`,
      ].filter(Boolean)
    },

    condLines() {
      const lines = [
        `Mode de paiement : ${PAYMENT_LABELS[this.q.payment_method] || this.q.payment_method || 'Virement bancaire'}`,
      ]
      if (this.q.processing_delay)
        lines.push(`Délai de fabrication : ${PROCESSING_LABELS[this.q.processing_delay] || this.q.processing_delay}`)
      if (this.q.delivery_delay)
        lines.push(`Livraison : ${DELIVERY_LABELS[this.q.delivery_delay] || this.q.delivery_delay}`)
      if ((this.q.deposit_percent || 0) > 0)
        lines.push(`Acompte de ${this.q.deposit_percent}% à la commande`)
      lines.push(`Devis valable jusqu'au ${this.validityDate(this.q.quote_date, this.q.quote_validity_days || 30)}`)
      if (company.paymentIban) lines.push(`IBAN : ${company.paymentIban}`)
      return lines
    },

    totalsRows() {
      const rows = [
        ['Sous-total HT', this.fmtEur(this.totalHT)],
        [`TVA (${this.taxRate}%)`, this.fmtEur(this.totalTVA)],
      ]
      if ((this.q.deposit_percent || 0) > 0) {
        const acompte = (this.q.total_cost || 0) * (this.q.deposit_percent / 100)
        rows.push([`Acompte (${this.q.deposit_percent}%)`, this.fmtEur(acompte)])
      }
      return rows
    },

    costBase() {
      const q = this.q
      return q.subtotal_ht || ((q.material_cost || 0) + (q.equipment_cost || 0) + (q.work_cost || 0))
    },
    sellingHT() {
      return Math.round(this.costBase * (1 + (this.q.margin_percent || 40) / 100) * 100) / 100
    },

    validateSteps() {
      const acompte = (this.q.deposit_percent || 0) > 0
        ? `Versez l'acompte de ${this.q.deposit_percent}%`
        : 'Procédez au paiement'
      return [
        { num: 1, lines: ['Signez et datez ce document'] },
        { num: 2, lines: ['Renvoyez par email :', company.email] },
        { num: 3, lines: [acompte] },
      ]
    },
  },
  methods: {
    fmtEur(v) {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v ?? 0)
    },
    fmtDate(iso) {
      if (!iso) return '—'
      return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso))
    },
    validityDate(quoteDate, days) {
      if (!quoteDate || !days) return '—'
      const d = new Date(quoteDate)
      d.setDate(d.getDate() + Number(days))
      return this.fmtDate(d.toISOString())
    },
    async handleDownload() {
      this.downloading = true
      try {
        await generateQuotePDF(this.quote, this.mode)
      } finally {
        this.downloading = false
      }
    },
  },
}
</script>

<style scoped>
/* ── Overlay ── */
.preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 25, 35, 0.65);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* ── Modale ── */
.preview-modal {
  width: 100%;
  max-width: 760px;
  max-height: 92dvh;
  background: #f0f4f8;
  border-radius: 20px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.35);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Barre du haut ── */
.preview-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.25rem;
  background: #1b2f39;
  flex-shrink: 0;
}
.preview-bar-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.bar-icon { width: 1.1rem; height: 1.1rem; color: #2e9cab; flex-shrink: 0; }
.bar-title { font-size: 0.9rem; font-weight: 700; color: #fff; }
.bar-num {
  font-size: 0.72rem;
  font-weight: 500;
  color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.08);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}
.preview-bar--internal { background: #2d1b06; }
.preview-bar--internal .bar-icon { color: #d97706; }
.bar-badge-int {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  background: rgba(217,119,6,0.25);
  color: #fbbf24;
  padding: 0.12rem 0.45rem;
  border-radius: 999px;
}
.btn-dl--internal { background: #d97706; }
.btn-dl--internal:hover:not(:disabled) { filter: brightness(1.1); }
.preview-bar-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.btn-dl {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border: none;
  border-radius: 999px;
  background: #2e9cab;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: filter 0.2s ease;
}
.btn-dl:hover:not(:disabled) { filter: brightness(1.1); }
.btn-dl:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-dl-icon { width: 0.9rem; height: 0.9rem; }
.btn-close-modal {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  color: #fff;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}
.btn-close-modal:hover { background: rgba(255,255,255,0.2); }

/* ── Zone de défilement ── */
.preview-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1.25rem;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
}

/* ── Document (simule le PDF) ── */
.doc {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  padding: 1.75rem 2rem 1.5rem;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #1b2f39;
  font-size: 0.82rem;
  line-height: 1.45;
}

/* ── EN-TÊTE ── */
.d-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}
.d-brand { font-size: 1.35rem; font-weight: 900; color: #1b2f39; letter-spacing: -0.02em; }
.d-brand-sub { font-size: 0.72rem; color: #2e9cab; font-weight: 500; margin-top: 0.1rem; }
.d-header-right { text-align: right; }
.d-devis-label { font-size: 1.6rem; font-weight: 900; color: #1b2f39; letter-spacing: -0.02em; margin-bottom: 0.25rem; }
.d-meta-row { display: flex; gap: 0.4rem; justify-content: flex-end; margin-top: 0.1rem; }
.d-meta-lbl { font-size: 0.7rem; color: #718096; }
.d-meta-val { font-size: 0.7rem; font-weight: 700; color: #1b2f39; }

/* Séparateurs */
.d-sep-teal {
  height: 2px;
  background: #2e9cab;
  margin: 0.6rem 0 0.85rem;
  border-radius: 1px;
}
.d-sep-teal--footer { margin-top: 1.25rem; }
.d-sep-light {
  height: 1px;
  background: #e2e8f0;
  margin: 0.85rem 0 0.65rem;
}
.d-sep-grey {
  height: 1px;
  background: #e2e8f0;
  margin: 1.25rem 0 0;
}

/* ── CONTACTS ── */
.d-contacts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 0.25rem;
}
.d-contact-hdr {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #718096;
  margin-bottom: 0.35rem;
}
.d-contact-name { font-size: 0.9rem; font-weight: 800; color: #1b2f39; margin-bottom: 0.1rem; }
.d-contact-line { font-size: 0.75rem; color: #4a5568; margin-top: 0.12rem; }
.d-teal { color: #2e9cab !important; }
.d-grey { color: #718096 !important; }

/* ── OBJET ── */
.d-objet {
  margin: 0.65rem 0 0.85rem;
  font-size: 0.78rem;
  display: flex;
  gap: 0.5rem;
}
.d-objet-lbl { font-weight: 700; color: #718096; }

/* ── TABLEAU ── */
.d-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
  margin-bottom: 0;
}
.d-table th {
  background: #2e9cab;
  color: #fff;
  font-weight: 700;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.5rem 0.65rem;
  text-align: left;
  border: 1px solid #2e9cab;
}
.d-table td {
  padding: 0.6rem 0.65rem;
  border: 1px solid #e2e8f0;
  vertical-align: top;
  color: #1b2f39;
}
.d-table tbody tr:nth-child(even) td { background: #f9fafc; }
.th-desc { width: auto; }
.th-photo { width: 90px; text-align: center; }
.th-num { width: 72px; text-align: right; }
.th-ttc { font-weight: 900 !important; }
.td-desc { min-width: 200px; }
.td-title { font-weight: 800; font-size: 0.8rem; margin-bottom: 0.4rem; }
.td-specs {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.td-specs li {
  font-size: 0.72rem;
  color: #4a5568;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.td-specs li::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2e9cab;
  flex-shrink: 0;
}
.td-photo { text-align: center; vertical-align: middle; }
.d-ref-img {
  max-width: 80px;
  max-height: 70px;
  object-fit: contain;
  border-radius: 4px;
  display: block;
  margin: 0 auto 0.25rem;
}
.d-ref-lbl { font-size: 0.62rem; color: #a0aec0; font-style: italic; text-align: center; }
.td-c { text-align: center; }
.td-r { text-align: right; }
.td-bold { font-weight: 800; }

/* ── TOTAUX + CONDITIONS ── */
.d-bottom {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  margin-top: 0.75rem;
  align-items: start;
}
.d-conditions {
  background: #f0f4f8;
  padding: 0.75rem 0.9rem;
  border-radius: 8px;
}
.d-cond-title {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #718096;
  margin-bottom: 0.4rem;
}
.d-cond-line { font-size: 0.72rem; color: #4a5568; margin-top: 0.25rem; }
.d-totals {
  min-width: 195px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.d-tot-row { display: flex; justify-content: space-between; gap: 1rem; }
.d-tot-lbl { font-size: 0.75rem; color: #718096; }
.d-tot-val { font-size: 0.75rem; font-weight: 600; color: #1b2f39; }
.d-tot-ttc {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: #2e9cab;
  color: #fff;
  font-weight: 800;
  font-size: 0.9rem;
  padding: 0.45rem 0.7rem;
  border-radius: 6px;
  margin-top: 0.2rem;
}

/* ── DÉTAIL INTERNE ── */
.d-internal {
  margin-top: 0.75rem;
  background: #f0f4f8;
  border-radius: 10px;
  padding: 0.85rem 1rem 0.75rem;
}
.d-int-title {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #718096;
  margin-bottom: 0.65rem;
}
.d-int-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.d-int-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
}
.d-int-card-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #fff;
  text-align: center;
  padding: 0.3rem 0.4rem;
}
.d-int-card-value {
  font-size: 0.95rem;
  font-weight: 800;
  color: #1b2f39;
  text-align: center;
  padding: 0.5rem 0.4rem;
}
.d-int-card--green .d-int-card-label { background: #27ae60; }
.d-int-card--blue  .d-int-card-label { background: #4299e1; }
.d-int-card--red   .d-int-card-label { background: #e53e3e; }
.d-int-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: #4a5568;
  background: #fff;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
}
.d-int-arrow { color: #a0aec0; font-weight: 700; }
.d-int-selling { color: #2e9cab; font-size: 0.82rem; }

/* ── NOTES ── */
.d-notes {
  margin-top: 0.9rem;
  padding: 0.65rem 0.9rem;
  background: #f7f9fc;
  border-radius: 8px;
  border-left: 3px solid #e2e8f0;
}
.d-notes-title {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #718096;
  margin-bottom: 0.3rem;
}
.d-notes-text { font-size: 0.75rem; color: #4a5568; margin: 0; white-space: pre-wrap; }

/* ── POUR VALIDER ── */
.d-validate {
  margin-top: 0.9rem;
  background: #e8f7f9;
  border: 1.5px solid #2e9cab;
  border-radius: 10px;
  padding: 0.85rem 1rem;
}
.d-validate-title {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #2e9cab;
  margin-bottom: 0.75rem;
}
.d-vsteps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.d-vstep {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.45rem;
}
.d-vstep-circle {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #2e9cab;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.d-vstep-text { font-size: 0.7rem; color: #1b2f39; line-height: 1.4; }

/* ── SIGNATURES ── */
.d-sigs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1.25rem;
}
.d-sig-title {
  font-size: 0.68rem;
  font-weight: 700;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
}
.d-sig-field { font-size: 0.72rem; color: #4a5568; }
.d-sig-spacer { margin-top: 0.85rem; }
.d-sig-line {
  margin-top: 0.85rem;
  height: 1px;
  background: #cbd5e0;
}

/* ── FOOTER ── */
.d-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.62rem;
  color: #718096;
  padding-top: 0.4rem;
  gap: 1rem;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .preview-overlay { padding: 0.5rem; }
  .preview-modal { max-height: 96dvh; border-radius: 14px; }
  .doc { padding: 1.25rem 1rem; }
  .d-contacts { grid-template-columns: 1fr; gap: 0.75rem; }
  .d-bottom { grid-template-columns: 1fr; }
  .d-vsteps { grid-template-columns: 1fr; }
  .d-sigs { grid-template-columns: 1fr; gap: 1rem; }
  .d-footer { flex-direction: column; gap: 0.25rem; }
  .btn-dl span { display: none; }
}
</style>
