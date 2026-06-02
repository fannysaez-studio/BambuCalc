<template>
  <div class="panel-card">
    <div class="panel-header">
      <h2 class="panel-title"><Archive class="ptitle-icon" /> Archives</h2>
      <div class="panel-actions">
        <select class="filter-select" v-model.number="archiveYear">
          <option v-for="y in archiveYears" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="empty-state"><div class="spinner" /><p>Chargement…</p></div>

    <div v-else-if="filteredArchives.length === 0" class="empty-state">
      <Archive class="empty-icon" />
      <p class="empty-title">Aucun devis archivé pour {{ archiveYear }}</p>
      <p class="empty-hint">Sélectionnez une autre année dans le menu.</p>
    </div>

    <template v-else>
      <!-- ── Tableau Desktop / Tablette ── -->
      <div class="table-wrap dq-table-view">
        <table class="data-table">
          <thead>
            <tr>
              <th>N° Devis</th>
              <th>Pièce</th>
              <th class="th-hide-sm">Client</th>
              <th class="th-hide-sm">Matière</th>
              <th>Total TTC</th>
              <th class="th-hide-sm">Statut</th>
              <th class="th-hide-md">Date création</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in filteredArchives" :key="q.id">
              <td class="td-num">{{ q.quote_number || '—' }}</td>
              <td class="td-name">{{ q.project_name || '—' }}</td>
              <td class="td-hide-sm td-client">{{ q.client_name || '—' }}</td>
              <td class="td-hide-sm"><span class="mat-tag">{{ q.material || '—' }}</span></td>
              <td class="td-total">{{ fmtEur(q.total_cost) }}</td>
              <td class="td-hide-sm">
                <span :class="['arch-status', 'arch-status--' + (q.status || 'pending')]">
                  {{ statusLabel(q.status) }}
                </span>
              </td>
              <td class="td-date td-hide-md">{{ fmtDate(q.created_at) }}</td>
              <td class="td-actions">
                <button class="btn-act btn-preview" @click="previewingQuote = q" title="Aperçu du devis">
                  <Eye class="act-icon" />
                </button>
                <button class="btn-act btn-pdf" @click="generateQuotePDF(q)" title="Télécharger PDF">
                  <Download class="act-icon" />
                </button>
                <button class="btn-act btn-restore" @click="emit('restore-quote', q)" title="Restaurer dans la liste active">
                  <RotateCcw class="act-icon" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Cartes Mobile ── -->
      <div class="dq-cards-view">
        <div v-for="q in filteredArchives" :key="q.id" class="arch-card">
          <!-- Ligne 1 : pièce + numéro / statut -->
          <div class="arch-card-top">
            <div class="arch-card-left">
              <p class="arch-card-name">{{ q.project_name || '—' }}</p>
              <p class="arch-card-num">{{ q.quote_number || '—' }}</p>
            </div>
            <span :class="['arch-status', 'arch-status--' + (q.status || 'pending')]">
              {{ statusLabel(q.status) }}
            </span>
          </div>
          <!-- Ligne 2 : client -->
          <p v-if="q.client_name" class="arch-card-client">{{ q.client_name }}</p>
          <!-- Ligne 3 : date · matière · total -->
          <div class="arch-card-mid">
            <span class="arch-card-date">{{ fmtDate(q.created_at) }}</span>
            <span class="mat-tag">{{ q.material || '—' }}</span>
            <span class="arch-card-total">{{ fmtEur(q.total_cost) }}</span>
          </div>
          <!-- Ligne 4 : boutons -->
          <div class="arch-card-foot">
            <button class="btn-act btn-preview arch-btn" @click="previewingQuote = q" title="Aperçu">
              <Eye class="act-icon" />
            </button>
            <button class="btn-act btn-pdf arch-btn" @click="generateQuotePDF(q)" title="Télécharger PDF">
              <Download class="act-icon" />
            </button>
            <button class="btn-act btn-restore arch-btn" @click="emit('restore-quote', q)" title="Restaurer">
              <RotateCcw class="act-icon" />
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- Aperçu devis -->
  <QuotePreviewModal
    v-if="previewingQuote"
    :quote="previewingQuote"
    @close="previewingQuote = null"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Archive, Download, Eye, RotateCcw } from 'lucide-vue-next'
import { generateQuotePDF } from '@/utils/generateQuotePDF'
import QuotePreviewModal from '@/components/ui/QuotePreviewModal.vue'

const props = defineProps({
  quotes:  { type: Array,   default: () => [] },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['restore-quote', 'count-change'])

const archiveYear    = ref(new Date().getFullYear())
const previewingQuote = ref(null)

// Seuls les devis archivés
const archivedQuotes = computed(() => props.quotes.filter(q => q.archived === true))

const archiveYears = computed(() => {
  const years = [...new Set(
    archivedQuotes.value.filter(q => q.created_at).map(q => new Date(q.created_at).getFullYear())
  )].sort((a, b) => b - a)
  return years.length ? years : [new Date().getFullYear()]
})

const filteredArchives = computed(() =>
  archivedQuotes.value.filter(q => q.created_at && new Date(q.created_at).getFullYear() === archiveYear.value)
)

watch(filteredArchives, (v) => emit('count-change', v.length), { immediate: true })

const STATUS_LABELS = {
  pending: 'En attente', sent: 'Envoyé', accepted: 'Accepté',
  refused: 'Refusé', 'Prêt': 'Prêt', 'Fini': 'Fini', 'Accepté': 'Accepté',
}
function statusLabel(s) { return STATUS_LABELS[s] || s || 'En attente' }
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
.panel-title { font-size: 1rem; font-weight: 800; color: #1b2f39; margin: 0; display: flex; align-items: center; gap: 0.4rem; }
.ptitle-icon { width: 0.78rem; height: 0.78rem; color: #667eea; flex-shrink: 0; }
.panel-actions { display: flex; align-items: center; gap: 0.65rem; margin-left: auto; flex-wrap: wrap; }

.filter-select {
  border: 1.5px solid #e2e8f0; border-radius: 8px;
  padding: 0.3rem 0.6rem; font-size: 0.8rem; font-family: inherit;
  color: #1b2f39; background: #fff; outline: none; cursor: pointer;
  transition: border-color 0.2s;
}
.filter-select:focus { border-color: #2e9cab; }

/* ── Empty / Loading ── */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.5rem; padding: 3rem 1.5rem; text-align: center; flex: 1;
}
.empty-icon  { width: 2rem; height: 2rem; color: #cbd5e0; }
.empty-title { font-size: 0.9rem; font-weight: 700; color: #718096; margin: 0; }
.empty-hint  { font-size: 0.78rem; color: #a0aec0; margin: 0; }
.spinner {
  width: 1.6rem; height: 1.6rem; border-radius: 50%;
  border: 3px solid #e2e8f0; border-top-color: #2e9cab;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Tableau ── */
.table-wrap { flex: 1; overflow-y: auto; overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.data-table thead th {
  padding: 0.6rem 1rem; text-align: left;
  font-size: 0.67rem; font-weight: 800; color: #a0aec0;
  text-transform: uppercase; letter-spacing: 0.06em;
  background: #f7f9fc; border-bottom: 1px solid #f0f4f8; white-space: nowrap;
}
.data-table tbody tr { border-bottom: 1px solid #f7f9fc; transition: background 0.12s; }
.data-table tbody tr:last-child { border-bottom: none; }
.data-table tbody tr:hover { background: #f7f9fc; }
.data-table td { padding: 0.65rem 1rem; color: #2d3748; vertical-align: middle; }
.td-num    { font-size: 0.72rem; font-weight: 700; color: #a0aec0; font-variant-numeric: tabular-nums; }
.td-name   { font-weight: 600; color: #1b2f39; }
.td-client { color: #718096; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.td-total  { font-weight: 800; color: #2e9cab; font-variant-numeric: tabular-nums; }
.td-date   { font-size: 0.75rem; color: #a0aec0; white-space: nowrap; }
.td-actions { display: flex; gap: 0.35rem; align-items: center; }

@media (max-width: 760px) { .th-hide-md, .td-hide-md { display: none; } }
@media (max-width: 540px) { .th-hide-sm, .td-hide-sm { display: none; } }

/* ── Boutons d'action ── */
.btn-act {
  padding: 0.32rem 0.5rem;
  border: 1.5px solid #e2e8f0; border-radius: 8px;
  background: #fff; color: #718096; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.15s ease; font-family: inherit;
}
.btn-preview:hover { border-color: #2e9cab; color: #2e9cab; background: #e8f7f9; }
.btn-pdf:hover     { border-color: #2e9cab; color: #2e9cab; background: #ebf8ff; }
.btn-restore:hover { border-color: #d97706; color: #d97706; background: #fffbeb; }
.act-icon { width: 0.88rem; height: 0.88rem; }

/* ── Badges statut ── */
.mat-tag {
  display: inline-block; padding: 0.1rem 0.4rem; border-radius: 6px;
  background: #f0e6ff; color: #7c3aed; font-size: 0.67rem; font-weight: 700;
}
.arch-status {
  display: inline-block; padding: 0.18rem 0.55rem;
  border-radius: 999px; font-size: 0.7rem; font-weight: 700; white-space: nowrap;
}
.arch-status--pending  { background: #fffaf0; color: #d69e2e; border: 1px solid #f6e05e; }
.arch-status--accepted,
.arch-status--Accepté  { background: #f0fff4; color: #276749; border: 1px solid #9ae6b4; }
.arch-status--refused  { background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; }
.arch-status--sent     { background: #ebf8ff; color: #2b6cb0; border: 1px solid #90cdf4; }
.arch-status--Prêt,
.arch-status--Fini     { background: #f0e6ff; color: #7c3aed; border: 1px solid #c4b5fd; }

/* ── Responsive tablette ── */
@media (max-width: 1023px) {
  .panel-card { flex: none; overflow: visible; }
  .table-wrap { flex: none; min-height: auto; overflow-y: visible; }
}
@media (min-width: 761px) and (max-width: 1023px) {
  .panel-card { flex: 1; min-height: 0; overflow: visible; display: flex; flex-direction: column; }
  .table-wrap { flex: 1; min-height: 0; overflow-y: auto; overflow-x: auto; }
}
@media (max-width: 540px) {
  .panel-header { flex-direction: column; align-items: flex-start; }
  .panel-actions { width: 100%; }
}

/* ══════════════════════════════════════════
   MOBILE — layout cartes (≤ 640px)
══════════════════════════════════════════ */
.dq-table-view { display: block; }
.dq-cards-view { display: none; }

@media (max-width: 640px) {
  .dq-table-view { display: none; }
  .dq-cards-view {
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0.85rem 1rem;
    gap: 0.75rem;
  }

  .arch-card {
    background: #f7f9fc;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 0.9rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  /* Ligne 1 : nom + statut */
  .arch-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .arch-card-left { flex: 1; min-width: 0; }
  .arch-card-name {
    font-size: 0.92rem; font-weight: 700; color: #1b2f39;
    margin: 0 0 0.15rem;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .arch-card-num {
    font-size: 0.68rem; font-family: 'Courier New', monospace;
    color: #a0aec0; margin: 0;
  }

  /* Ligne 2 : client */
  .arch-card-client {
    font-size: 0.78rem; color: #718096; margin: 0;
  }

  /* Ligne 3 : date · matière · total */
  .arch-card-mid {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    padding-top: 0.4rem;
    border-top: 1px solid #e2e8f0;
  }
  .arch-card-date  { font-size: 0.75rem; color: #a0aec0; }
  .arch-card-total { font-size: 0.95rem; font-weight: 800; color: #2e9cab; margin-left: auto; }

  /* Ligne 4 : boutons */
  .arch-card-foot {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    padding-top: 0.15rem;
  }
  .arch-btn {
    width: 38px !important;
    height: 38px !important;
    padding: 0 !important;
    border-radius: 10px !important;
  }
}
</style>
