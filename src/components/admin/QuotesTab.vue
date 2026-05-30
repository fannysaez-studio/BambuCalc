<template>
  <div class="panel-card">
    <div class="panel-header">
      <h2 class="panel-title">
        Tous les devis
        <span v-if="filterUserId" class="filter-active-badge">
          {{ clientLabelFor(filterUserId) }}
          <button class="clear-filter" @click="filterUserId = ''" title="Effacer le filtre">×</button>
        </span>
      </h2>
      <div class="panel-actions">
        <select class="filter-select" v-model="filterUserId">
          <option value="">Tous les clients</option>
          <option v-for="p in visibleProfiles" :key="p.id" :value="p.id">
            {{ p.full_name || quoteInfoByUser[p.id]?.name || p.id.slice(0, 8) }}
          </option>
        </select>
        <button class="btn-export" @click="exportPDF">
          <Download class="btn-export-icon" />Export PDF
        </button>
      </div>
    </div>

    <div v-if="loading" class="empty-state"><div class="spinner" /><p>Chargement…</p></div>
    <div v-else-if="filteredQuotes.length === 0" class="empty-state">
      <FileText class="empty-icon" />
      <p class="empty-title">Aucun devis</p>
    </div>
    <template v-else>

      <!-- ══ Vue Tableau — Desktop & Tablette (≥ 641 px) ══ -->
      <div class="quotes-table-view">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>N° Devis</th>
                <th>Pièce</th>
                <th class="th-hide-sm">Client</th>
                <th class="th-hide-sm">Matière</th>
                <th>Total TTC</th>
                <th>Statut</th>
                <th class="th-hide-md">Créé par</th>
                <th class="th-hide-md">Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="q in paginatedQuotes" :key="q.id"
                  :class="{ 'quote-row--highlight': q.id === props.highlightedQuoteId }">
                <td class="td-num">{{ q.quote_number || '—' }}</td>
                <td class="td-name">{{ q.project_name || '—' }}</td>
                <td class="td-client td-hide-sm">
                  <button class="client-link" @click="goToClientFilter(q.user_id)" title="Filtrer ce client">
                    {{ q.client_name || '—' }}
                  </button>
                </td>
                <td class="td-hide-sm"><span class="mat-tag">{{ q.material || '—' }}</span></td>
                <td class="td-total">{{ fmtEur(q.total_cost) }}</td>
                <td>
                  <select :class="['status-select', 'status-' + (q.status || 'pending')]"
                    :value="q.status || 'pending'"
                    @change="changeStatus(q, $event.target.value)">
                    <option value="pending">En attente</option>
                    <option value="sent">Envoyé</option>
                    <option value="accepted">Accepté</option>
                    <option value="refused">Refusé</option>
                  </select>
                </td>
                <td class="td-creator td-hide-md">{{ creatorOf(q.user_id) }}</td>
                <td class="td-date td-hide-md">{{ fmtDate(q.created_at) }}</td>
                <td class="td-actions">
                  <button class="btn-edit" @click="editQuote(q)" title="Compléter / modifier">
                    <Pencil class="del-icon" />
                  </button>
                  <button class="btn-pdf" @click="generateQuotePDF(q)" title="Télécharger PDF">
                    <Download class="del-icon" />
                  </button>
                  <button v-if="q.status === 'accepted' && q.client_email"
                    class="btn-send-row" @click="emit('open-send-modal', q)" title="Envoyer par e-mail">
                    <Send class="del-icon" />
                  </button>
                  <button class="btn-del" @click="emit('delete-quote', q)" title="Supprimer">
                    <Trash2 class="del-icon" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="totalQuotesPages > 1" class="pagination quotes-pgn">
          <button class="page-btn" :disabled="quotesPage === 1" @click="quotesPage--">← Préc.</button>
          <span class="quotes-pgn-info">Page {{ quotesPage }} / {{ totalQuotesPages }}</span>
          <button class="page-btn" :disabled="quotesPage === totalQuotesPages" @click="quotesPage++">Suiv. →</button>
        </div>
      </div>

      <!-- ══ Vue Cartes — Mobile (≤ 640 px) ══ -->
      <div class="quotes-cards-view">
        <div v-for="q in paginatedQuotes" :key="q.id"
             :class="['qcard', { 'qcard--highlight': q.id === props.highlightedQuoteId }]">
          <div class="qcard-top">
            <button class="qcard-client client-link" @click="goToClientFilter(q.user_id)">
              {{ q.client_name || '—' }}
            </button>
            <span :class="['qcard-badge', 'arch-status--' + (q.status || 'pending')]">
              {{ { pending: 'En attente', sent: 'Envoyé', accepted: 'Accepté', refused: 'Refusé' }[q.status] || 'En attente' }}
            </span>
          </div>
          <div class="qcard-meta">
            <p class="qcard-piece">{{ q.project_name || '—' }}</p>
            <p class="qcard-sub">
              N°&nbsp;{{ q.quote_number || '—' }}
              <span v-if="q.material" class="mat-tag">{{ q.material }}</span>
            </p>
          </div>
          <div class="qcard-row">
            <span class="qcard-date">{{ fmtDate(q.created_at) }}</span>
            <span class="qcard-total">{{ fmtEur(q.total_cost) }}</span>
          </div>
          <div class="qcard-bottom">
            <select
              :class="['status-select', 'qcard-status-sel', 'status-' + (q.status || 'pending')]"
              :value="q.status || 'pending'"
              @change="changeStatus(q, $event.target.value)">
              <option value="pending">En attente</option>
              <option value="sent">Envoyé</option>
              <option value="accepted">Accepté</option>
              <option value="refused">Refusé</option>
            </select>
            <div class="qcard-actions">
              <button class="btn-edit" @click="editQuote(q)" title="Modifier"><Pencil class="del-icon" /></button>
              <button class="btn-pdf" @click="generateQuotePDF(q)" title="PDF"><Download class="del-icon" /></button>
              <button v-if="q.status === 'accepted' && q.client_email"
                class="btn-send-row" @click="emit('open-send-modal', q)" title="Envoyer par e-mail">
                <Send class="del-icon" />
              </button>
              <button class="btn-del" @click="emit('delete-quote', q)" title="Supprimer"><Trash2 class="del-icon" /></button>
            </div>
          </div>
        </div>
        <div v-if="totalQuotesPages > 1" class="pagination quotes-pgn">
          <button class="page-btn" :disabled="quotesPage === 1" @click="quotesPage--">← Préc.</button>
          <span class="quotes-pgn-info">Page {{ quotesPage }} / {{ totalQuotesPages }}</span>
          <button class="page-btn" :disabled="quotesPage === totalQuotesPages" @click="quotesPage++">Suiv. →</button>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { FileText, Download, Pencil, Send, Trash2 } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'
import { useCalculatorStore } from '@/stores/calculator'
import { generateQuotePDF } from '@/utils/generateQuotePDF'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const props = defineProps({
  quotes:              { type: Array,   default: () => [] },
  profiles:            { type: Array,   default: () => [] },
  loading:             { type: Boolean, default: false },
  initialFilterUserId: { type: String,  default: '' },
  highlightedQuoteId:  { type: String,  default: null },
})
const emit = defineEmits(['delete-quote', 'open-send-modal', 'reload'])

const router = useRouter()
const calculatorStore = useCalculatorStore()

const filterUserId  = ref(props.initialFilterUserId)
const quotesPage    = ref(1)
const quotesPerPage = 10

watch(() => props.initialFilterUserId, (v) => { filterUserId.value = v; quotesPage.value = 1 })
watch(filterUserId, () => { quotesPage.value = 1 })

const quoteInfoByUser = computed(() => {
  const map = {}
  for (const q of props.quotes) {
    if (!map[q.user_id] && (q.client_name || q.client_email))
      map[q.user_id] = { name: q.client_name || '', email: q.client_email || '' }
  }
  return map
})
const visibleProfiles = computed(() =>
  props.profiles.filter(p => {
    const isAnon = !p.full_name && !p.email
    return isAnon ? props.quotes.some(q => q.user_id === p.id) : true
  })
)
const filteredQuotes = computed(() =>
  filterUserId.value
    ? props.quotes.filter(q => q.user_id === filterUserId.value)
    : props.quotes
)
const paginatedQuotes = computed(() => {
  const start = (quotesPage.value - 1) * quotesPerPage
  return filteredQuotes.value.slice(start, start + quotesPerPage)
})
const totalQuotesPages = computed(() =>
  Math.max(1, Math.ceil(filteredQuotes.value.length / quotesPerPage))
)

function quoteCountFor(userId) {
  return props.quotes.filter(q => q.user_id === userId).length
}
function creatorOf(userId) {
  const p = props.profiles.find(p => p.id === userId)
  return p ? (p.full_name?.split(' ')[0] || p.email?.split('@')[0] || '—') : '—'
}
function clientLabelFor(userId) {
  const p = props.profiles.find(p => p.id === userId)
  return p?.full_name || quoteInfoByUser.value[userId]?.name || p?.email || userId?.slice(0, 8) || '?'
}
function goToClientFilter(userId) {
  if (!quoteCountFor(userId)) return
  filterUserId.value = userId
  quotesPage.value = 1
}
async function changeStatus(quote, newStatus) {
  const { error } = await supabase.from('quotes').update({ status: newStatus }).eq('id', quote.id)
  if (error) return
  quote.status = newStatus
  emit('reload')
}
function editQuote(q) {
  calculatorStore.$patch({
    editingQuoteId:    q.id,
    quoteNumber:       q.quote_number        || '',
    quoteDate:         q.quote_date          || '',
    quoteValidityDays: q.quote_validity_days ?? 30,
    paymentMethod:     q.payment_method      || 'virement',
    depositPercent:    q.deposit_percent     ?? 0,
    quoteNotes:        q.quote_notes         || '',
    clientType:        q.client_type         || 'particulier',
    clientCivility:    q.client_civility     || 'M.',
    clientFirstName:   q.client_first_name   || '',
    clientLastName:    q.client_last_name    || '',
    clientName:        q.client_name         || '',
    clientContactName: q.client_contact_name || '',
    clientEmail:       q.client_email        || '',
    clientPhone:       q.client_phone        || '',
    clientAddress:     q.client_address      || '',
    clientPostalCode:  q.client_postal_code  || '',
    clientCity:        q.client_city         || '',
    clientCountry:     q.client_country      || 'France',
    clientSiret:       q.client_siret        || '',
    clientVatNumber:   q.client_vat_number   || '',
    projectName:       q.project_name        || '',
    quantity:          q.quantity            ?? 1,
    printProfile:      q.print_profile       || 'normal',
    printerModel:      q.printer_model       || 'p2s-combo',
    nozzleSize:        q.nozzle_size         || '0.4',
    material:          q.material            || 'PLA+',
    costPerKg:         q.cost_per_kg         ?? 16.99,
    weight:            q.weight              ?? 0,
    lossPercent:       q.loss_percent        ?? 5,
    colorCount:        q.color_count         ?? 1,
    purgeWaste:        q.purge_waste         ?? 0,
    printHours:        q.print_hours         ?? 0,
    printMinutes:      q.print_minutes       ?? 0,
    prepTime:          q.prep_time           ?? 15,
    postTime:          q.post_time           ?? 0,
    hourlyRate:        q.hourly_rate         ?? 20,
    packagingCost:     q.packaging_cost      ?? 0,
    taxRate:           q.tax_rate            ?? 20,
    selectedPricing:   q.selected_pricing    || 'standard',
    customMargin:      q.custom_margin       ?? 50,
    referenceImage:    null,
    referenceImageUrl: q.reference_image_url || '',
  })
  router.push({ path: '/calculator/3', query: { editId: q.id } })
}
function exportPDF() {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const rows = filteredQuotes.value
  const dateExport = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date())
  doc.setFillColor(46, 156, 171)
  doc.rect(0, 0, 297, 22, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16); doc.setFont('helvetica', 'bold')
  doc.text('BambuCalc', 14, 10)
  doc.setFontSize(10); doc.setFont('helvetica', 'normal')
  doc.text('Export des devis', 14, 17)
  doc.setFontSize(9)
  doc.text(`Généré le ${dateExport}`, 297 - 14, 14, { align: 'right' })
  doc.setTextColor(30, 47, 57); doc.setFontSize(9); doc.setFont('helvetica', 'normal')
  const totalRev = rows.reduce((a, q) => a + (q.total_cost || 0), 0)
  doc.text(`${rows.length} devis  •  Total : ${fmtEur(totalRev)}  •  Moyenne : ${fmtEur(rows.length ? totalRev / rows.length : 0)}`, 14, 30)
  autoTable(doc, {
    startY: 34,
    head: [['N° Devis', 'Pièce', 'Client', 'Email client', 'Matière', 'Qté', 'Total TTC', 'Créé par', 'Date']],
    body: rows.map(q => [
      q.quote_number || '—', q.project_name || '—', q.client_name || '—',
      q.client_email || '—', q.material || '—', q.quantity ?? 1,
      fmtEur(q.total_cost), creatorOf(q.user_id),
      q.created_at ? new Date(q.created_at).toLocaleDateString('fr-FR') : '—',
    ]),
    styles: { fontSize: 8, cellPadding: 3, textColor: [30, 47, 57] },
    headStyles: { fillColor: [46, 156, 171], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 252, 255] },
    columnStyles: {
      0: { cellWidth: 32 }, 5: { cellWidth: 12, halign: 'center' },
      6: { cellWidth: 24, halign: 'right', fontStyle: 'bold' }, 8: { cellWidth: 22 },
    },
    didDrawPage: (data) => {
      doc.setFontSize(8); doc.setTextColor(160, 174, 192)
      doc.text(`Page ${data.pageNumber} / ${doc.internal.getNumberOfPages()}  —  BambuCalc`, 297 / 2, 205, { align: 'center' })
    },
  })
  doc.save(`bambucalc-devis-${new Date().toISOString().split('T')[0]}.pdf`)
}

function fmtEur(v) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v ?? 0) }
function fmtDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}
</script>

<style scoped>
.panel-card {
  background: #fff; border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  display: flex; flex-direction: column;
  flex: 1; min-height: 0; overflow: hidden;
}
.panel-header {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #f0f4f8;
  flex-shrink: 0; flex-wrap: wrap;
}
.panel-title { font-size: 0.95rem; font-weight: 800; color: #1b2f39; margin: 0; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.panel-actions { display: flex; align-items: center; gap: 0.6rem; margin-left: auto; flex-wrap: wrap; }

.filter-active-badge {
  display: inline-flex; align-items: center; gap: 0.3rem;
  font-size: 0.72rem; font-weight: 700;
  background: #e8f7f9; color: #2e9cab;
  padding: 0.15rem 0.5rem 0.15rem 0.6rem;
  border-radius: 999px; border: 1px solid #b2e8ef;
}
.clear-filter { border: none; background: none; color: #2e9cab; cursor: pointer; font-size: 1rem; line-height: 1; padding: 0; font-weight: 700; }
.clear-filter:hover { color: #e53e3e; }

.filter-select {
  padding: 0.45rem 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 0.82rem; font-weight: 600; color: #4a5568; background: #fff;
  font-family: inherit; cursor: pointer; outline: none;
}
.filter-select:focus { border-color: #5a67d8; }

.btn-export {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.45rem 0.9rem; border-radius: 8px; border: none;
  background: linear-gradient(180deg, #667eea 0%, #5a67d8 100%);
  color: #fff; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 3px 10px rgba(90,103,216,0.3); transition: filter 0.2s ease;
}
.btn-export:hover { filter: brightness(1.07); }
.btn-export-icon { width: 0.85rem; height: 0.85rem; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.5rem; padding: 3rem 1.5rem; color: #a0aec0; text-align: center; flex: 1;
}
.empty-icon  { width: 2.5rem; height: 2.5rem; color: #cbd5e0; }
.empty-title { font-size: 0.95rem; font-weight: 700; color: #4a5568; margin: 0; }
.spinner {
  width: 2rem; height: 2rem;
  border: 3px solid #e2e8f0; border-top-color: #7c3aed;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.table-wrap { flex: 1; min-height: 0; overflow-y: auto; overflow-x: auto; }
.data-table { width: 100%; min-width: 560px; border-collapse: collapse; font-size: 0.82rem; }
.data-table thead th {
  padding: 0.6rem 0.85rem; text-align: left;
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.06em; color: #a0aec0;
  background: #f7f9fc; border-bottom: 1px solid #e2e8f0;
}
.data-table tbody tr { border-bottom: 1px solid #f0f4f8; transition: background 0.15s ease; }
.data-table tbody tr:last-child { border-bottom: none; }
.data-table tbody tr:hover { background: #f8f7ff; }
.data-table td { padding: 0.75rem 0.85rem; color: #2d3748; font-weight: 600; vertical-align: middle; }

.td-num     { font-family: 'Courier New', monospace; font-size: 0.75rem; color: #718096; }
.td-name    { font-weight: 700; color: #1b2f39; }
.td-client  { color: #718096; }
.td-creator { color: #718096; font-size: 0.8rem; }
.td-total   { font-weight: 800; color: #2e9cab; white-space: nowrap; }
.td-date    { color: #a0aec0; font-size: 0.78rem; white-space: nowrap; }
.td-actions { text-align: right; display: flex; justify-content: flex-end; align-items: center; gap: 0.2rem; }

.mat-tag {
  display: inline-block; padding: 0.15rem 0.55rem;
  background: rgba(46,156,171,0.1); color: #1f7f97;
  border-radius: 999px; font-size: 0.72rem; font-weight: 700;
}
.client-link {
  border: none; background: none; color: #4a5568; font-weight: 600;
  font-size: 0.82rem; cursor: pointer; font-family: inherit; padding: 0;
  text-decoration: underline; text-decoration-style: dotted;
  text-underline-offset: 2px; transition: color 0.15s;
}
.client-link:hover { color: #2e9cab; }

.status-select {
  padding: 0.25rem 0.5rem; border-radius: 999px;
  font-size: 0.7rem; font-weight: 700; border: 1px solid;
  cursor: pointer; font-family: inherit; outline: none;
  appearance: none; -webkit-appearance: none; text-align: center;
}
.status-select.status-pending  { background: #fffaf0; color: #d69e2e; border-color: #f6e05e; }
.status-select.status-accepted { background: #f0fff4; color: #276749; border-color: #9ae6b4; }
.status-select.status-refused  { background: #fff5f5; color: #c53030; border-color: #feb2b2; }
.status-select.status-sent     { background: #ebf8ff; color: #2b6cb0; border-color: #90cdf4; }

.btn-edit, .btn-pdf, .btn-send-row, .btn-del {
  width: 1.9rem; height: 1.9rem; border: none; background: none; border-radius: 8px;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  color: #cbd5e0; transition: background 0.15s ease, color 0.15s ease; font-family: inherit;
}
.btn-del:disabled { opacity: 0.25; cursor: not-allowed; }
.btn-edit:hover     { background: #ebf0ff; color: #5a67d8; }
.btn-pdf:hover      { background: #ebf8ff; color: #2e9cab; }
.btn-send-row:hover { background: #e8f7f9; color: #2e9cab; }
.btn-del:hover      { background: #fff5f5; color: #e53e3e; }
.del-icon { width: 0.9rem; height: 0.9rem; }

/* Badge statut cartes */
.arch-status--pending  { display: inline-block; padding: 0.18rem 0.55rem; border-radius: 999px; font-size: 0.7rem; font-weight: 700; background: #fffaf0; color: #d69e2e; border: 1px solid #f6e05e; }
.arch-status--accepted { display: inline-block; padding: 0.18rem 0.55rem; border-radius: 999px; font-size: 0.7rem; font-weight: 700; background: #f0fff4; color: #276749; border: 1px solid #9ae6b4; }
.arch-status--refused  { display: inline-block; padding: 0.18rem 0.55rem; border-radius: 999px; font-size: 0.7rem; font-weight: 700; background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; }
.arch-status--sent     { display: inline-block; padding: 0.18rem 0.55rem; border-radius: 999px; font-size: 0.7rem; font-weight: 700; background: #ebf8ff; color: #2b6cb0; border: 1px solid #90cdf4; }

/* Responsive column hiding */
.th-hide-sm, .td-hide-sm { }
.th-hide-md, .td-hide-md { }
@media (max-width: 760px)  { .th-hide-md, .td-hide-md { display: none; } }
@media (max-width: 540px)  { .th-hide-sm, .td-hide-sm { display: none; } }

/* Pagination */
.pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 0.5rem; padding: 1rem 1.25rem;
  border-top: 1px solid #f0f4f8; flex-shrink: 0;
}
.page-btn {
  padding: 0.4rem 0.85rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
  background: #fff; color: #718096; font-size: 0.78rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s ease; white-space: nowrap;
}
.page-btn:hover:not(:disabled) { border-color: #5a67d8; color: #5a67d8; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.quotes-pgn { gap: 0.55rem; }
.quotes-pgn-info { font-size: 0.78rem; font-weight: 600; color: #718096; white-space: nowrap; min-width: 80px; text-align: center; }

/* Table / Cards switch */
.quotes-table-view { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.quotes-cards-view { display: none; }

/* Mobile cards */
@media (max-width: 640px) {
  .quotes-table-view { display: none; }
  .quotes-cards-view {
    display: flex; flex-direction: column; gap: 0.75rem;
    padding: 0.85rem; overflow-y: auto; flex: 1; min-height: 0;
  }
  .qcard {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
    padding: 0.9rem 1rem; display: flex; flex-direction: column; gap: 0.6rem;
    box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  }
  .qcard-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
  .qcard-client {
    font-size: 0.95rem; font-weight: 800; color: #1b2f39;
    background: none; border: none; cursor: pointer; padding: 0;
    text-align: left; font-family: inherit;
    flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    transition: color 0.15s;
  }
  .qcard-client:hover { color: #7c3aed; }
  .qcard-badge { flex-shrink: 0; font-size: 0.65rem; }
  .qcard-meta { display: flex; flex-direction: column; gap: 0.12rem; }
  .qcard-piece { font-size: 0.88rem; font-weight: 700; color: #2d3748; margin: 0; }
  .qcard-sub { font-size: 0.72rem; color: #a0aec0; margin: 0; display: flex; align-items: center; gap: 0.4rem; }
  .qcard-row { display: flex; align-items: center; justify-content: space-between; padding-top: 0.3rem; border-top: 1px solid #f0f4f8; }
  .qcard-date  { font-size: 0.75rem; color: #718096; }
  .qcard-total { font-size: 1.05rem; font-weight: 800; color: #1b2f39; }
  .qcard-bottom { display: flex; align-items: center; gap: 0.5rem; }
  .qcard-status-sel { flex: 1; font-size: 0.78rem; }
  .qcard-actions { display: flex; gap: 0.35rem; flex-shrink: 0; }
  .qcard-actions .btn-edit,
  .qcard-actions .btn-pdf,
  .qcard-actions .btn-send-row,
  .qcard-actions .btn-del { width: 34px; height: 34px; }
}

/* Tablet scroll */
@media (min-width: 641px) and (max-width: 1024px) {
  .quotes-table-view .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .data-table { font-size: 0.85rem; }
}

@media (max-width: 1023px) {
  .panel-card { flex: none; overflow: visible; }
  .quotes-table-view { flex: none; min-height: auto; }
}
@media (min-width: 761px) and (max-width: 1023px) {
  .panel-card { flex: 1; min-height: 0; overflow: visible; display: flex; flex-direction: column; }
  .quotes-table-view { flex: 1; min-height: 0; overflow: hidden; }
}
@media (max-width: 540px) {
  .panel-header { flex-direction: column; align-items: flex-start; }
  .panel-actions { width: 100%; }
}

@keyframes rowPulse {
  0%   { background-color: rgba(46, 156, 171, 0.18); }
  70%  { background-color: rgba(46, 156, 171, 0.08); }
  100% { background-color: transparent; }
}
.quote-row--highlight { animation: rowPulse 3s ease forwards; }
.qcard--highlight     { animation: rowPulse 3s ease forwards; }
</style>
