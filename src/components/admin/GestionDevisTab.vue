<template>
  <div class="panel-card">

    <div class="panel-header">
      <h2 class="panel-title">
        <component :is="managePage === 1 ? FileText : Send" class="ptitle-icon" />
        {{ managePage === 1 ? 'Devis sauvegardés' : 'Transmettre un devis' }}
      </h2>
      <div class="settings-page-indicator">
        <span :class="['spi-dot', managePage === 1 && 'spi-dot--active']" @click="managePage = 1"></span>
        <span :class="['spi-dot', managePage === 2 && 'spi-dot--active']" @click="managePage = 2"></span>
      </div>
      <div v-if="managePage === 1" class="panel-actions">
        <select class="filter-select" v-model="filterUserId">
          <option value="">Tous les clients</option>
          <option v-for="p in visibleProfiles" :key="p.id" :value="p.id">
            {{ p.full_name || quoteInfoByUser[p.id]?.name || p.id.slice(0, 8) }}
          </option>
        </select>
        <button class="btn-manage-transmit" @click="managePage = 2">
          Transmettre →
        </button>
      </div>
    </div>

    <!-- ══ Page 1 : Tableau complet des devis ══ -->
    <template v-if="managePage === 1">
      <div v-if="props.loading" class="empty-state"><div class="spinner" /><p>Chargement…</p></div>
      <div v-else-if="filteredQuotes.length === 0" class="empty-state">
        <FileText class="empty-icon" />
        <p class="empty-title">Aucun devis</p>
        <p class="empty-hint">Créez votre premier devis depuis le calculateur.</p>
      </div>
      <template v-else>

        <!-- Vue Tableau — Desktop (≥1025px) -->
        <div class="manage-table-view">
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>N° Devis</th>
                  <th>Pièce</th>
                  <th class="th-photo">Photo</th>
                  <th>Client</th>
                  <th class="th-hide-sm">Matière</th>
                  <th>Total TTC</th>
                  <th>Statut</th>
                  <th class="th-hide-md">Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="q in paginatedManageQuotes" :key="q.id"
                    :class="sendableQuotes.some(s => s.id === q.id) ? 'tr--sendable' : ''">
                  <td class="td-num">{{ q.quote_number || '—' }}</td>
                  <td class="td-name">{{ q.project_name || '—' }}</td>
                  <td class="td-photo">
                    <img v-if="q.reference_image_url" :src="q.reference_image_url" class="ref-thumb" :alt="q.project_name" loading="lazy" @click="zoomedImageUrl = q.reference_image_url" />
                    <span v-else class="ref-thumb-empty"></span>
                  </td>
                  <td class="td-client">{{ q.client_name || '—' }}</td>
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
                  <td class="td-date td-hide-md">
                    {{ fmtDate(q.updated_at || q.created_at) }}
                    <span v-if="wasEdited(q)" class="badge-edited" title="Devis modifié">modifié</span>
                  </td>
                  <td class="td-actions">
                    <button class="btn-edit" @click="editQuote(q)" title="Modifier">
                      <Pencil class="del-icon" />
                    </button>
                    <!-- ── Groupe Client ── -->
                    <div class="act-group" @click.stop>
                      <button
                        class="btn-group btn-group--client"
                        :class="{ 'btn-group--open': openDrop?.quoteId === q.id && openDrop?.group === 'client' }"
                        @click="toggleDrop($event, q.id, 'client', q)"
                        title="Aperçu &amp; PDF client"
                      ><Users class="del-icon" /></button>
                    </div>
                    <!-- ── Groupe Interne ── -->
                    <div class="act-group" @click.stop>
                      <button
                        class="btn-group btn-group--int"
                        :class="{ 'btn-group--open': openDrop?.quoteId === q.id && openDrop?.group === 'internal' }"
                        @click="toggleDrop($event, q.id, 'internal', q)"
                        title="Aperçu &amp; PDF coûts"
                      ><FileBarChart2 class="del-icon" /></button>
                    </div>
                    <button v-if="sendableQuotes.some(s => s.id === q.id)"
                      class="btn-send-row"
                      @click="selectedQuoteId = q.id; selectedQuote = q; managePage = 2"
                      title="Transmettre par e-mail">
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
          <div v-if="totalManagePages > 1" class="pagination manage-pgn">
            <button class="page-btn" :disabled="managePaginePage === 1" @click="managePaginePage--">← Préc.</button>
            <span class="manage-pgn-info">Page {{ managePaginePage }} / {{ totalManagePages }}</span>
            <button class="page-btn" :disabled="managePaginePage === totalManagePages" @click="managePaginePage++">Suiv. →</button>
          </div>
        </div>

        <!-- Vue Grille 2 colonnes — Tablette (641px–1024px) -->
        <div class="manage-tab-grid">
          <div v-for="q in paginatedManageQuotes" :key="q.id" class="mtcard">
            <div class="mtcard-head">
              <span class="mtcard-client">{{ q.client_name || '—' }}</span>
              <span :class="['mtcard-badge', 'arch-status--' + (q.status || 'pending')]">
                {{ { pending: 'En attente', sent: 'Envoyé', accepted: 'Accepté', refused: 'Refusé' }[q.status] || 'En attente' }}
              </span>
            </div>
            <div class="mtcard-body">
              <div class="mtcard-field">
                <span class="mtcard-label">Pièce</span>
                <div class="mtcard-piece-with-photo">
                  <img v-if="q.reference_image_url" :src="q.reference_image_url" class="ref-thumb" :alt="q.project_name" loading="lazy" @click="zoomedImageUrl = q.reference_image_url" />
                  <span v-else class="ref-thumb-empty"></span>
                  <span class="mtcard-value">{{ q.project_name || '—' }}</span>
                </div>
              </div>
              <div class="mtcard-field">
                <span class="mtcard-label">N° Devis</span>
                <span class="mtcard-value mtcard-value--mono">{{ q.quote_number || '—' }}</span>
              </div>
              <div class="mtcard-row2">
                <div class="mtcard-field">
                  <span class="mtcard-label">Matière</span>
                  <span class="mat-tag">{{ q.material || '—' }}</span>
                </div>
                <div class="mtcard-field">
                  <span class="mtcard-label">Date</span>
                  <span class="mtcard-value">
                    {{ fmtDate(q.updated_at || q.created_at) }}
                    <span v-if="wasEdited(q)" class="badge-edited">modifié</span>
                  </span>
                </div>
              </div>
              <div class="mtcard-total">{{ fmtEur(q.total_cost) }}</div>
            </div>
            <div class="mtcard-foot">
              <select :class="['status-select', 'status-' + (q.status || 'pending'), 'mtcard-status-sel']"
                :value="q.status || 'pending'"
                @change="changeStatus(q, $event.target.value)">
                <option value="pending">En attente</option>
                <option value="sent">Envoyé</option>
                <option value="accepted">Accepté</option>
                <option value="refused">Refusé</option>
              </select>
              <div class="mtcard-btns">
                <button class="btn-edit" @click="editQuote(q)" title="Modifier"><Pencil class="del-icon" /></button>
                <!-- ── Groupe Client ── -->
                <div class="act-group" @click.stop>
                  <button
                    class="btn-group btn-group--client"
                    :class="{ 'btn-group--open': openDrop?.quoteId === q.id && openDrop?.group === 'client' }"
                    @click="toggleDrop($event, q.id, 'client', q)"
                    title="Aperçu &amp; PDF client"
                  ><Users class="del-icon" /></button>
                </div>
                <!-- ── Groupe Interne ── -->
                <div class="act-group" @click.stop>
                  <button
                    class="btn-group btn-group--int"
                    :class="{ 'btn-group--open': openDrop?.quoteId === q.id && openDrop?.group === 'internal' }"
                    @click="toggleDrop($event, q.id, 'internal', q)"
                    title="Aperçu &amp; PDF coûts"
                  ><FileBarChart2 class="del-icon" /></button>
                </div>
                <button v-if="sendableQuotes.some(s => s.id === q.id)"
                  class="btn-send-row"
                  @click="selectedQuoteId = q.id; selectedQuote = q; managePage = 2"
                  title="Transmettre par e-mail">
                  <Send class="del-icon" />
                </button>
                <button class="btn-del" @click="emit('delete-quote', q)" title="Supprimer"><Trash2 class="del-icon" /></button>
              </div>
            </div>
          </div>
          <div v-if="totalManagePages > 1" class="pagination manage-pgn manage-tab-pgn">
            <button class="page-btn" :disabled="managePaginePage === 1" @click="managePaginePage--">← Préc.</button>
            <span class="manage-pgn-info">Page {{ managePaginePage }} / {{ totalManagePages }}</span>
            <button class="page-btn" :disabled="managePaginePage === totalManagePages" @click="managePaginePage++">Suiv. →</button>
          </div>
        </div>

        <!-- Vue Cartes — Mobile (≤640px) -->
        <div class="manage-cards-view">
          <div v-for="q in paginatedManageQuotes" :key="q.id" class="mcard">
            <div class="mcard-top">
              <span class="mcard-client">{{ q.client_name || '—' }}</span>
              <span :class="['mcard-badge', 'arch-status--' + (q.status || 'pending')]">
                {{ { pending: 'En attente', sent: 'Envoyé', accepted: 'Accepté', refused: 'Refusé' }[q.status] || 'En attente' }}
              </span>
            </div>
            <div class="mcard-meta">
              <div class="mcard-meta-row">
                <div>
                  <p class="mcard-piece">{{ q.project_name || '—' }}</p>
                  <p class="mcard-sub">N° {{ q.quote_number || '—' }} · {{ q.material || '—' }}</p>
                </div>
                <img v-if="q.reference_image_url" :src="q.reference_image_url" class="ref-thumb-card" :alt="q.project_name" loading="lazy" @click="zoomedImageUrl = q.reference_image_url" />
                <span v-else class="ref-thumb-empty ref-thumb-card-empty"></span>
              </div>
            </div>
            <div class="mcard-row">
              <span class="mcard-date">
                {{ fmtDate(q.updated_at || q.created_at) }}
                <span v-if="wasEdited(q)" class="badge-edited">modifié</span>
              </span>
              <span class="mcard-total">{{ fmtEur(q.total_cost) }}</span>
            </div>
            <div class="mcard-bottom">
              <select :class="['status-select', 'status-' + (q.status || 'pending'), 'mcard-status-sel']"
                :value="q.status || 'pending'"
                @change="changeStatus(q, $event.target.value)">
                <option value="pending">En attente</option>
                <option value="sent">Envoyé</option>
                <option value="accepted">Accepté</option>
                <option value="refused">Refusé</option>
              </select>
              <div class="mcard-actions">
                <!-- Modifier -->
                <button class="btn-edit" @click="editQuote(q)" title="Modifier"><Pencil class="del-icon" /></button>

                <!-- ── Groupe Client (aperçu + PDF) ── -->
                <div class="act-group" @click.stop>
                  <button
                    class="btn-group btn-group--client"
                    :class="{ 'btn-group--open': openDrop?.quoteId === q.id && openDrop?.group === 'client' }"
                    @click="toggleDrop($event, q.id, 'client', q)"
                    title="Aperçu &amp; PDF client"
                  ><Users class="del-icon" /></button>
                </div>

                <!-- ── Groupe Interne (aperçu coûts + PDF) ── -->
                <div class="act-group" @click.stop>
                  <button
                    class="btn-group btn-group--int"
                    :class="{ 'btn-group--open': openDrop?.quoteId === q.id && openDrop?.group === 'internal' }"
                    @click="toggleDrop($event, q.id, 'internal', q)"
                    title="Aperçu &amp; PDF coûts"
                  ><FileBarChart2 class="del-icon" /></button>
                </div>

                <!-- Transmettre (conditionnel) -->
                <button v-if="sendableQuotes.some(s => s.id === q.id)"
                  class="btn-send-row"
                  @click="selectedQuoteId = q.id; selectedQuote = q; managePage = 2"
                  title="Transmettre par e-mail">
                  <Send class="del-icon" />
                </button>

                <!-- Supprimer -->
                <button class="btn-del" @click="emit('delete-quote', q)" title="Supprimer"><Trash2 class="del-icon" /></button>
              </div>
            </div>
          </div>
          <div v-if="totalManagePages > 1" class="pagination manage-pgn">
            <button class="page-btn" :disabled="managePaginePage === 1" @click="managePaginePage--">← Préc.</button>
            <span class="manage-pgn-info">Page {{ managePaginePage }} / {{ totalManagePages }}</span>
            <button class="page-btn" :disabled="managePaginePage === totalManagePages" @click="managePaginePage++">Suiv. →</button>
          </div>
        </div>

      </template>
    </template>

    <!-- ══ Page 2 : Transmettre un devis ══ -->
    <div v-if="managePage === 2" class="manage-single-col">
      <button class="btn-manage-prev" @click="managePage = 1">
        ← Retour aux devis sauvegardés
      </button>

      <div class="manage-send-card">
        <!-- Sélecteur -->
        <div class="manage-send-section">
          <p class="manage-send-label"><Send class="manage-send-label-icon" /> Sélectionner un devis à transmettre</p>
          <select class="ecf-select" v-model="selectedQuoteId" @change="onQuoteSelect">
            <option value="">— Choisir un devis —</option>
            <option v-for="opt in quoteSelectOptions" :key="opt.id" :value="opt.id">
              {{ opt.label }}
            </option>
          </select>
          <p v-if="quoteSelectOptions.length === 0" class="ecf-hint ecf-hint--warn">
            Aucun devis avec adresse e-mail client trouvé.
          </p>
        </div>

        <!-- Destinataire -->
        <div v-if="selectedQuote" class="ecf-recipient">
          <span class="ecf-recipient-label">Destinataire</span>
          <span class="ecf-recipient-email">{{ selectedQuote.client_email }}</span>
          <span class="ecf-recipient-badge">✓</span>
        </div>

        <!-- Aperçu mail -->
        <div v-if="selectedQuote" class="ecf-preview-block manage-preview-block">
          <p class="ecf-preview-label">Aperçu de l'email</p>
          <p class="ecf-preview-subject">{{ resolvedSubject(selectedQuote) }}</p>
          <p v-if="resolvedIntro(selectedQuote)" class="ecf-preview-intro">{{ resolvedIntro(selectedQuote) }}</p>
          <div v-else class="preview-intro preview-intro--muted">Aucun texte d'introduction — configurez le modèle dans l'onglet Emails.</div>
        </div>

        <!-- Stripe Payment Link -->
        <div v-if="selectedQuote" class="stripe-link-row">
          <label class="stripe-link-label">🔗 Lien de paiement Stripe</label>
          <div class="stripe-link-wrap">
            <input type="url" class="stripe-link-input"
              v-model="selectedQuote.stripe_payment_link"
              placeholder="https://buy.stripe.com/…"
              @change="saveStripeLink(selectedQuote)" />
            <button v-if="selectedQuote.stripe_payment_link"
              class="stripe-copy-btn"
              @click="copyStripeLink(selectedQuote.stripe_payment_link)"
              title="Copier le lien">
              📋
            </button>
          </div>
          <p class="stripe-link-hint">Générez ce lien depuis le <a href="https://dashboard.stripe.com/payment-links" target="_blank">Dashboard Stripe</a>, collez-le ici, puis envoyez-le au client par email.</p>
        </div>

        <!-- Actions -->
        <div v-if="selectedQuote" class="manage-send-actions">
          <button
            v-if="!['Prêt','Fini','Accepté','accepted','sent'].includes(selectedQuote.status)"
            class="btn-validate-quote"
            @click="saveQuote">
            <CheckCircle class="btn-send-icon-sm" />
            Marquer comme Prêt
          </button>
          <button class="btn-confirm-send" @click="emit('open-send-modal', selectedQuote)">
            <Send class="btn-send-icon-sm" />
            Envoyer {{ selectedQuote.quote_number }}
          </button>
        </div>
        <div v-else class="manage-empty-send">
          <Send class="empty-icon manage-empty-icon" />
          <p class="empty-title">Sélectionnez un devis ci-dessus</p>
          <p class="empty-hint">Seuls les devis avec une adresse e-mail client sont disponibles.</p>
        </div>
      </div>
    </div>

    <ToastMessage ref="toast" />
    <QuotePreviewModal
      v-if="previewingQuote"
      :quote="previewingQuote"
      :mode="previewMode"
      @close="previewingQuote = null"
    />

    <Teleport to="body">
      <div v-if="zoomedImageUrl" class="photo-lightbox" @click="zoomedImageUrl = null">
        <img :src="zoomedImageUrl" class="photo-lightbox-img" @click.stop />
        <button class="photo-lightbox-close" @click="zoomedImageUrl = null">✕</button>
      </div>
    </Teleport>

    <!-- ── Dropdown actions mobile (Teleport → évite le clipping overflow) ── -->
    <Teleport to="body">
      <div
        v-if="openDrop"
        class="act-drop-portal"
        :class="openDrop.group === 'client' ? 'act-drop--client' : 'act-drop--int'"
        :style="{
          top:    openDrop.top    != null ? openDrop.top    + 'px' : undefined,
          bottom: openDrop.bottom != null ? openDrop.bottom + 'px' : undefined,
          right:  openDrop.right  + 'px',
        }"
        @click.stop
      >
        <template v-if="openDrop.group === 'client'">
          <button class="act-drop-item" @click="openPreview(openDrop.quote, 'client'); closeDrop()">
            <Eye class="drop-icon" /><span>Aperçu client</span>
          </button>
          <button class="act-drop-item" @click="downloadPDF(openDrop.quote); closeDrop()">
            <Download class="drop-icon" /><span>PDF client</span>
          </button>
        </template>
        <template v-else>
          <button class="act-drop-item" @click="openPreview(openDrop.quote, 'internal'); closeDrop()">
            <Eye class="drop-icon" /><span>Aperçu coûts</span>
          </button>
          <button class="act-drop-item" @click="downloadPDFInternal(openDrop.quote); closeDrop()">
            <Download class="drop-icon" /><span>PDF coûts</span>
          </button>
        </template>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useCalculatorStore } from '@/stores/calculator'
import { generateQuotePDF } from '@/utils/generateQuotePDF'
import ToastMessage from '@/components/ui/ToastMessage.vue'
import QuotePreviewModal from '@/components/ui/QuotePreviewModal.vue'
import {
  FileText, Pencil, Download, Send, Trash2, CheckCircle, FileBarChart2, Eye, Users,
} from 'lucide-vue-next'

// ── Props ─────────────────────────────────────────────────────────────────────
const props = defineProps({
  quotes:           { type: Array,  default: () => [] },
  profiles:         { type: Array,  default: () => [] },
  loading:          { type: Boolean, default: false },
  emailSubject:     { type: String, default: 'Votre devis BambuCalc — [numéro]' },
  emailIntroClient: { type: String, default: '' },
  senderName:       { type: String, default: 'BambuCalc' },
})

// ── Emits ─────────────────────────────────────────────────────────────────────
const emit = defineEmits(['open-send-modal', 'delete-quote', 'count-change'])

// ── Services ─────────────────────────────────────────────────────────────────
const router          = useRouter()
const calculatorStore = useCalculatorStore()
const toast           = ref(null)

// ── État local ────────────────────────────────────────────────────────────────
const managePage      = ref(1)
const managePaginePage = ref(1)
const quotesPerPage   = 10
const filterUserId    = ref('')
const selectedQuoteId = ref('')
const selectedQuote   = ref(null)
const previewingQuote = ref(null)
const previewMode     = ref('client')
const zoomedImageUrl  = ref(null)

// ── Dropdown actions mobile ───────────────────────────────────────────────────
const openDrop = ref(null) // { quoteId, quote, group, bottom, right }

function toggleDrop(event, quoteId, group, quote) {
  if (openDrop.value?.quoteId === quoteId && openDrop.value?.group === group) {
    openDrop.value = null
    return
  }
  const rect       = event.currentTarget.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const openUpward = spaceBelow < 110
  openDrop.value = {
    quoteId,
    quote,
    group,
    right: window.innerWidth - rect.right,
    ...(openUpward
      ? { bottom: window.innerHeight - rect.top + 4 }
      : { top:    rect.bottom + 4 }),
  }
}
function closeDrop() { openDrop.value = null }

onMounted(()       => document.addEventListener('click', closeDrop))
onBeforeUnmount(() => document.removeEventListener('click', closeDrop))

// ── Computed ──────────────────────────────────────────────────────────────────
const quoteInfoByUser = computed(() => {
  const map = {}
  for (const q of props.quotes) {
    if (!map[q.user_id] && (q.client_name || q.client_email)) {
      map[q.user_id] = { name: q.client_name || '', email: q.client_email || '' }
    }
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

const sendableQuotes = computed(() =>
  props.quotes.filter(q =>
    ['Fini', 'Prêt', 'Accepté', 'accepted'].includes(q.status) && q.client_email
  )
)

const sentQuotes = computed(() =>
  props.quotes.filter(q => q.status === 'sent')
)

const quoteSelectOptions = computed(() =>
  props.quotes
    .filter(q => q.client_email)
    .map(q => {
      const civ  = q.client_civility ? q.client_civility + ' ' : ''
      const name = q.client_last_name
        ? `${civ}${q.client_last_name}`
        : (q.client_name || q.client_email || '—')
      const badge = q.status === 'accepted' ? ' ✓' : ''
      return { id: q.id, label: `${q.quote_number || '—'} — ${name}${badge}` }
    })
)

const paginatedManageQuotes = computed(() => {
  const start = (managePaginePage.value - 1) * quotesPerPage
  return filteredQuotes.value.slice(start, start + quotesPerPage)
})

const totalManagePages = computed(() =>
  Math.max(1, Math.ceil(filteredQuotes.value.length / quotesPerPage))
)

// ── Watchers ──────────────────────────────────────────────────────────────────
watch(filterUserId, () => { managePaginePage.value = 1 })

// Badge de navigation : notifier le parent du compte sendable+sent
watch([sendableQuotes, sentQuotes], () => {
  emit('count-change', sendableQuotes.value.length + sentQuotes.value.length)
}, { immediate: true })

// Auto-sélection du premier devis disponible à la page 2
watch(quoteSelectOptions, (opts) => {
  if (opts.length && !selectedQuoteId.value) {
    selectedQuoteId.value = opts[0].id
    selectedQuote.value = props.quotes.find(q => q.id === selectedQuoteId.value) || null
  }
}, { immediate: true })

// ── Méthodes ──────────────────────────────────────────────────────────────────

function onQuoteSelect() {
  selectedQuote.value = props.quotes.find(q => q.id === selectedQuoteId.value) || null
}

async function changeStatus(quote, newStatus) {
  const { error } = await supabase.from('quotes').update({ status: newStatus }).eq('id', quote.id)
  if (error) { toast.value?.show('Erreur lors de la mise à jour du statut.', 'error'); return }
  quote.status = newStatus
  toast.value?.show('Statut mis à jour.', 'success', 1800)
}

async function saveQuote() {
  if (!selectedQuote.value) return
  try {
    const { error } = await supabase.from('quotes').update({ status: 'Prêt' }).eq('id', selectedQuote.value.id)
    if (error) throw error
    selectedQuote.value.status = 'Prêt'
    toast.value?.show(`Devis ${selectedQuote.value.quote_number} marqué comme "Prêt" — visible dans la liste.`, 'success', 3000)
  } catch (err) {
    toast.value?.show(`Erreur : ${err.message}`, 'error')
  }
}

async function saveStripeLink(quote) {
  if (!quote?.id) return
  const { error } = await supabase
    .from('quotes')
    .update({ stripe_payment_link: quote.stripe_payment_link || null })
    .eq('id', quote.id)
  if (error) {
    toast.value?.show('Erreur sauvegarde lien Stripe : ' + error.message, 'error')
  } else {
    toast.value?.show('Lien Stripe sauvegardé.', 'success', 2000)
  }
}

function copyStripeLink(url) {
  if (!url) return
  navigator.clipboard.writeText(url)
    .then(() => toast.value?.show('Lien copié !', 'success', 1500))
    .catch(() => toast.value?.show('Impossible de copier.', 'error'))
}

async function downloadPDF(q) {
  await generateQuotePDF(q, 'client')
}

async function downloadPDFInternal(q) {
  await generateQuotePDF(q, 'internal')
}

function openPreview(q, mode = 'client') {
  previewMode.value     = mode
  previewingQuote.value = q
}

function editQuote(q) {
  calculatorStore.$patch({
    editingQuoteId:    q.id,
    quoteNumber:       q.quote_number        || '',
    quoteDate:         q.quote_date          || '',
    quoteValidityDays: q.quote_validity_days ?? 30,
    paymentMethod:     q.payment_method      || 'virement',
    depositPercent:    q.deposit_percent     ?? 0,
    processingDelay:   q.processing_delay    || '5-7j',
    deliveryDelay:     q.delivery_delay      || 'pickup',
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
    // Blob URLs (blob:http://...) viennent d'une session périmée — les ignorer
    referenceImageUrl: (q.reference_image_url || '').startsWith('blob:') ? '' : (q.reference_image_url || ''),
  })
  router.push({ path: '/calculator/3', query: { editId: q.id } })
}

function resolvedSubject(quote) {
  if (!quote) return ''
  const civility  = quote.client_civility ? quote.client_civility + ' ' : ''
  const lastName  = quote.client_last_name || ''
  const firstName = quote.client_first_name || quote.client_name?.split(' ')[0] || 'client'
  return (props.emailSubject || 'Votre devis BambuCalc — [numéro]')
    .replace(/\[numéro\]/gi, quote.quote_number || '')
    .replace(/\[senderName\]/gi, props.senderName || 'BambuCalc')
    .replace(/\[projet\]/gi, quote.project_name || '')
    .replace(/\[client\]/gi, firstName)
    .replace(/\[client_nom\]/gi, civility + (lastName || firstName))
}

function resolvedIntro(quote) {
  if (!quote) return ''
  const civility   = quote.client_civility ? quote.client_civility + ' ' : ''
  const lastName   = quote.client_last_name || ''
  const firstName  = quote.client_first_name || quote.client_name?.split(' ')[0] || 'client'
  const fullPolite = civility + (lastName || firstName)
  return (props.emailIntroClient || '')
    .replace(/\[client\]/gi, firstName)
    .replace(/\[client_nom\]/gi, fullPolite)
    .replace(/\[civilité\]/gi, civility.trim())
    .replace(/\[numéro\]/gi, quote.quote_number || '')
    .replace(/\[projet\]/gi, quote.project_name || '')
    .replace(/\[total\]/gi, fmtEur(quote.total_cost))
}

// ── Utilitaires ───────────────────────────────────────────────────────────────
function fmtEur(v) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v ?? 0)
}
function fmtDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}
function wasEdited(q) {
  if (!q.updated_at || !q.created_at) return false
  return Math.abs(new Date(q.updated_at) - new Date(q.created_at)) > 60_000
}
</script>

<style scoped>
/* ── Panel card ── */
.panel-card {
  background: #fff; border-radius: 20px; border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06); overflow: hidden;
  flex: 1; min-height: 0; display: flex; flex-direction: column;
}
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 1.25rem; border-bottom: 1px solid #f0f4f8;
  gap: 0.75rem; flex-wrap: wrap; flex-shrink: 0;
}
.panel-title {
  font-size: 0.95rem; font-weight: 800; color: #1b2f39; margin: 0;
  display: flex; align-items: center; gap: 0.5rem;
}
.ptitle-icon { width: 0.78rem; height: 0.78rem; color: #667eea; flex-shrink: 0; }
.panel-actions { display: flex; align-items: center; gap: 0.6rem; margin-left: auto; }

/* ── Indicateur de page (points) ── */
.settings-page-indicator { display: flex; align-items: center; gap: 0.45rem; }
.spi-dot {
  width: 0.55rem; height: 0.55rem; border-radius: 50%;
  background: #e2e8f0; cursor: pointer; transition: all 0.2s ease;
}
.spi-dot--active { background: #7c3aed; transform: scale(1.25); }

/* ── Filtre client ── */
.filter-select {
  padding: 0.45rem 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 0.82rem; font-weight: 600; color: #4a5568; background: #fff;
  font-family: inherit; cursor: pointer; outline: none;
}
.filter-select:focus { border-color: #5a67d8; }

/* ── Bouton Transmettre ── */
.btn-manage-transmit {
  display: inline-flex; align-items: center;
  padding: 0.42rem 1rem; border: 1.5px solid #d6bcfa; border-radius: 999px;
  background: #f7f0ff; color: #7c3aed;
  font-size: 0.78rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s ease; white-space: nowrap;
}
.btn-manage-transmit:hover { background: #ede9fe; border-color: #9f7aea; }

/* ── États vide / chargement ── */
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.5rem; padding: 3rem 1.5rem; color: #a0aec0; text-align: center; flex: 1;
}
.empty-icon  { width: 2.5rem; height: 2.5rem; color: #cbd5e0; }
.empty-title { font-size: 0.95rem; font-weight: 700; color: #4a5568; margin: 0; }
.empty-hint  { font-size: 0.82rem; color: #a0aec0; margin: 0; text-align: center; }
.spinner {
  width: 2rem; height: 2rem;
  border: 3px solid #e2e8f0; border-top-color: #7c3aed;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Tableau ── */
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
.td-num    { font-family: 'Courier New', monospace; font-size: 0.75rem; color: #718096; white-space: nowrap; }
.td-name   { font-weight: 700; color: #1b2f39; }
.td-client { color: #718096; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
.td-total  { font-weight: 800; color: #2e9cab; white-space: nowrap; }
.td-date   { color: #a0aec0; font-size: 0.78rem; white-space: nowrap; }
.td-actions { text-align: right; display: flex; justify-content: flex-end; align-items: center; gap: 0.2rem; }
.th-hide-sm, .td-hide-sm { }
.th-hide-md, .td-hide-md { }

/* ── Photo de référence ── */
.th-photo { width: 52px; text-align: center; }
.td-photo  { text-align: center; width: 52px; }
.ref-thumb {
  width: 36px; height: 36px; object-fit: cover;
  border-radius: 8px; border: 1.5px solid #e2e8f0;
  display: block; cursor: zoom-in;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s;
}
.ref-thumb:hover {
  transform: scale(1.8); box-shadow: 0 4px 16px rgba(0,0,0,.18);
  z-index: 10; position: relative; border-color: #2e9cab;
}
.ref-thumb-empty {
  display: block; width: 28px; height: 28px;
  border-radius: 6px; background: #f0f4f8; border: 1.5px dashed #cbd5e0;
}

/* ── Lightbox photo ── */
.photo-lightbox {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,0.82); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  cursor: zoom-out;
}
.photo-lightbox-img {
  max-width: 82vw; max-height: 82vh; object-fit: contain;
  border-radius: 16px; box-shadow: 0 20px 80px rgba(0,0,0,0.6);
  border: 2px solid rgba(255,255,255,0.12); cursor: default;
}
.photo-lightbox-close {
  position: absolute; top: 1.25rem; right: 1.5rem;
  width: 2.4rem; height: 2.4rem; border-radius: 999px;
  background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
  color: #fff; font-size: 1rem; cursor: pointer; font-family: inherit;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.photo-lightbox-close:hover { background: rgba(255,255,255,0.25); }

/* ── Ligne sendable ── */
.tr--sendable       { background: #f0fff8; }
.tr--sendable:hover { background: #e6fff3; }

/* ── Status select ── */
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

/* ── Mat tag ── */
.mat-tag {
  display: inline-block; padding: 0.15rem 0.55rem;
  background: rgba(46,156,171,0.1); color: #1f7f97;
  border-radius: 999px; font-size: 0.72rem; font-weight: 700;
}

/* ── Boutons d'action icône ── */
.btn-edit, .btn-preview, .btn-preview-int, .btn-pdf, .btn-pdf-int, .btn-del, .btn-send-row {
  width: 1.9rem; height: 1.9rem; border: none; background: none; border-radius: 8px;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  color: #cbd5e0; transition: background 0.15s ease, color 0.15s ease; font-family: inherit;
}
.btn-del:disabled       { opacity: 0.25; cursor: not-allowed; }
.btn-edit:hover         { background: #ebf0ff; color: #5a67d8; }
.btn-preview:hover      { background: #e8f7f9; color: #2e9cab; }
.btn-preview-int:hover  { background: #fef3c7; color: #d97706; }
.btn-pdf:hover          { background: #ebf8ff; color: #2e9cab; }
.btn-pdf-int:hover      { background: #fef3c7; color: #d97706; }
.btn-send-row:hover     { background: #e8f7f9; color: #2e9cab; }
.btn-del:hover          { background: #fff5f5; color: #e53e3e; }
.del-icon               { width: 0.9rem; height: 0.9rem; }

.badge-edited {
  display: inline-block;
  font-size: 0.58rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: #e8f7f9;
  color: #2e9cab;
  padding: 0.1rem 0.35rem;
  border-radius: 999px;
  margin-left: 0.3rem;
  vertical-align: middle;
}

/* ── Pagination ── */
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
.manage-pgn { gap: 0.55rem; }
.manage-pgn-info {
  font-size: 0.78rem; font-weight: 600; color: #718096;
  white-space: nowrap; min-width: 80px; text-align: center;
}

/* ── Badges statut (cartes tablette/mobile) ── */
.arch-status--pending  { background: #fffaf0; color: #d69e2e; border: 1px solid #f6e05e; border-radius: 999px; padding: 0.18rem 0.55rem; }
.arch-status--accepted,
.arch-status--Accepté  { background: #f0fff4; color: #276749; border: 1px solid #9ae6b4; border-radius: 999px; padding: 0.18rem 0.55rem; }
.arch-status--refused  { background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; border-radius: 999px; padding: 0.18rem 0.55rem; }
.arch-status--sent     { background: #ebf8ff; color: #2b6cb0; border: 1px solid #90cdf4; border-radius: 999px; padding: 0.18rem 0.55rem; }
.arch-status--Prêt,
.arch-status--Fini     { background: #f0e6ff; color: #7c3aed; border: 1px solid #c4b5fd; border-radius: 999px; padding: 0.18rem 0.55rem; }

/* ── Page 2 : Envoi ── */
.manage-single-col {
  padding: 0.85rem 1.25rem 1rem;
  display: flex; flex-direction: column; gap: 0.85rem;
  overflow-y: auto; flex: 1;
}
.btn-manage-prev {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.38rem 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 999px;
  background: #fff; color: #718096;
  font-size: 0.78rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s ease; align-self: center;
}
.btn-manage-prev:hover { background: #f7f9fc; border-color: #cbd5e0; color: #4a5568; }
.manage-send-card {
  background: #fafbfd; border: 1px solid #e2e8f0; border-radius: 14px;
  padding: 1.1rem 1.25rem; display: flex; flex-direction: column; gap: 1rem; flex: 1;
}
.manage-send-section { display: flex; flex-direction: column; gap: 0.45rem; }
.manage-send-label {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.72rem; font-weight: 800; color: #7c3aed;
  text-transform: uppercase; letter-spacing: 0.07em; margin: 0;
}
.manage-send-label-icon { width: 0.75rem; height: 0.75rem; }
.manage-send-actions {
  display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;
  padding-top: 0.25rem; margin-top: auto;
}
.manage-empty-send { display: flex; flex-direction: column; align-items: center; padding: 2rem 1rem; gap: 0.5rem; flex: 1; }
.manage-empty-icon { width: 2.2rem; height: 2.2rem; color: #cbd5e0; }

/* ── Select devis ── */
.ecf-select {
  border: 1.5px solid #e2e8f0; border-radius: 8px;
  padding: 0.45rem 2rem 0.45rem 0.65rem; font-size: 0.82rem;
  font-family: inherit; color: #1b2f39; background: #fff;
  outline: none; width: 100%; transition: border-color 0.2s;
  box-sizing: border-box; cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23a0aec0' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 0.65rem center;
}
.ecf-select:focus { border-color: #2e9cab; }
.ecf-hint { font-size: 0.67rem; color: #a0aec0; margin: 0; }
.ecf-hint--warn { color: #d69e2e; }

/* ── Destinataire ── */
.ecf-recipient {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.42rem 0.7rem; border-radius: 8px;
  background: #e8f7f9; border: 1px solid #b2e8ef; flex-shrink: 0;
}
.ecf-recipient-label { font-size: 0.65rem; font-weight: 800; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.06em; flex-shrink: 0; }
.ecf-recipient-email { font-size: 0.8rem; font-weight: 700; color: #2e9cab; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ecf-recipient-badge { font-size: 0.85rem; color: #2e9cab; font-weight: 800; flex-shrink: 0; }

/* ── Aperçu mail ── */
.ecf-preview-block {
  background: #f7f9fc; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 0.7rem 0.85rem; display: flex; flex-direction: column; gap: 0.3rem; flex-shrink: 0;
}
.manage-preview-block { border-radius: 10px; }
.ecf-preview-label   { font-size: 0.58rem; font-weight: 800; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.07em; margin: 0; }
.ecf-preview-subject { font-size: 0.8rem; font-weight: 700; color: #1b2f39; margin: 0; }
.ecf-preview-intro   { font-size: 0.75rem; color: #4a5568; line-height: 1.55; margin: 0; white-space: pre-wrap; }
.preview-intro--muted { color: #a0aec0; font-style: italic; font-size: 0.75rem; }

/* ── Stripe Link ── */
.stripe-link-row { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #f0f4f8; }
.stripe-link-label { font-size: 0.75rem; font-weight: 700; color: #4a5568; display: block; margin-bottom: 0.35rem; }
.stripe-link-wrap { display: flex; gap: 0.4rem; align-items: center; }
.stripe-link-input {
  flex: 1; border: 1.5px solid #e2e8f0; border-radius: 8px;
  padding: 0.3rem 0.6rem; font-size: 0.78rem; font-family: inherit;
  outline: none; transition: border-color 0.2s;
}
.stripe-link-input:focus { border-color: #7c3aed; }
.stripe-copy-btn {
  padding: 0.3rem 0.5rem; border: 1.5px solid #e2e8f0; border-radius: 8px;
  background: #fff; cursor: pointer; font-size: 0.9rem; transition: background 0.15s;
}
.stripe-copy-btn:hover { background: #f0e6ff; border-color: #9f7aea; }
.stripe-link-hint { font-size: 0.7rem; color: #a0aec0; margin: 0.3rem 0 0; }
.stripe-link-hint a { color: #7c3aed; }

/* ── Boutons actions page 2 ── */
.btn-validate-quote {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.52rem 1.15rem; border: none; border-radius: 999px;
  background: #e8f7f9; color: #2e9cab;
  font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: background 0.2s ease;
}
.btn-validate-quote:hover { background: #d0eff4; }
.btn-confirm-send {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
  margin-left: auto; padding: 0.6rem 1.25rem; border: none; border-radius: 10px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff; font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 12px rgba(46,156,171,0.3); transition: filter 0.15s ease;
}
.btn-confirm-send:hover:not(:disabled) { filter: brightness(1.07); }
.btn-confirm-send:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-send-icon-sm { width: 0.85rem; height: 0.85rem; }

/* ══ Visibilité des vues (Desktop par défaut) ══ */
.manage-table-view { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.manage-tab-grid   { display: none; }
.manage-cards-view { display: none; }

.manage-table-view .data-table { table-layout: auto; width: 100%; min-width: 0; font-size: 0.9rem; }

/* ══ Tablette 641px–1024px : grille 2 colonnes ══ */
@media (min-width: 641px) and (max-width: 1024px) {
  .manage-table-view { display: none; }
  .manage-tab-grid {
    display: grid; grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem; padding: 1rem 1.25rem; overflow-y: auto; align-content: start;
  }
  .manage-tab-pgn { grid-column: 1 / -1; margin-top: 0.25rem; }
  .mtcard {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
    padding: 1rem 1.1rem; display: flex; flex-direction: column;
    gap: 0.85rem; box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }
  .mtcard-head { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
  .mtcard-client { font-size: 1rem; font-weight: 800; color: #1b2f39; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .mtcard-badge { flex-shrink: 0; font-size: 0.7rem; }
  .mtcard-body { display: flex; flex-direction: column; gap: 0.5rem; }
  .mtcard-field { display: flex; flex-direction: column; gap: 0.1rem; }
  .mtcard-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem; }
  .mtcard-label { font-size: 0.62rem; font-weight: 700; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.05em; }
  .mtcard-value { font-size: 0.9rem; font-weight: 700; color: #2d3748; }
  .mtcard-value--mono { font-family: 'Courier New', monospace; font-size: 0.8rem; color: #718096; }
  .mtcard-total { font-size: 1.25rem; font-weight: 800; color: #7c3aed; padding-top: 0.35rem; border-top: 1px solid #f0f4f8; }
  .mtcard-foot { display: flex; align-items: center; gap: 0.5rem; padding-top: 0.25rem; border-top: 1px solid #f0f4f8; }
  .mtcard-status-sel { flex: 1; font-size: 0.82rem; }
  .mtcard-btns { display: flex; gap: 0.3rem; flex-shrink: 0; }
  .mtcard-btns .btn-edit,
  .mtcard-btns .btn-send-row,
  .mtcard-btns .btn-del,
  .mtcard-btns .btn-group { width: 38px; height: 38px; border-radius: 10px; }
  .mtcard-piece-with-photo { display: flex; align-items: center; gap: 0.5rem; }
}

/* ══ Mobile ≤640px : cartes verticales ══ */
@media (max-width: 640px) {
  .manage-table-view { display: none; }
  .manage-cards-view {
    display: flex; flex-direction: column;
    gap: 0.75rem; padding: 0.85rem; overflow-y: auto; flex: 1;
  }
  .mcard {
    background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
    padding: 0.9rem 1rem; display: flex; flex-direction: column;
    gap: 0.6rem; box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  }
  .mcard-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
  .mcard-client { font-size: 0.95rem; font-weight: 800; color: #1b2f39; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .mcard-badge { flex-shrink: 0; font-size: 0.65rem; }
  .mcard-meta { display: flex; flex-direction: column; gap: 0.12rem; }
  .mcard-piece { font-size: 0.88rem; font-weight: 700; color: #2d3748; margin: 0; }
  .mcard-sub   { font-size: 0.72rem; color: #a0aec0; margin: 0; }
  .mcard-row { display: flex; align-items: center; justify-content: space-between; padding-top: 0.3rem; border-top: 1px solid #f0f4f8; }
  .mcard-date  { font-size: 0.75rem; color: #718096; }
  .mcard-total { font-size: 1.05rem; font-weight: 800; color: #2e9cab; }
  .mcard-bottom { display: flex; align-items: center; gap: 0.5rem; }
  .mcard-status-sel { flex: 1; font-size: 0.78rem; }
  .mcard-actions { display: flex; gap: 0.35rem; flex-shrink: 0; }
  .mcard-actions .btn-edit,
  .mcard-actions .btn-send-row,
  .mcard-actions .btn-del,
  .mcard-actions .btn-group { width: 34px; height: 34px; border-radius: 10px; }
  .manage-send-actions { flex-direction: column; }
  .th-hide-sm, .td-hide-sm { display: none; }
  .mcard-meta-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
  .ref-thumb-card { width: 42px; height: 42px; object-fit: cover; border-radius: 8px; border: 1.5px solid #e2e8f0; flex-shrink: 0; }
  .ref-thumb-card-empty { width: 36px; height: 36px; flex-shrink: 0; border-radius: 8px; }
}

@media (max-width: 760px) {
  .th-hide-md, .td-hide-md { display: none; }
}

/* ── Boutons de groupe (mobile uniquement) ── */
.act-group {
  position: relative;
  flex-shrink: 0;
}
.btn-group {
  width: 1.9rem; height: 1.9rem; padding: 0;
  border: 1.5px solid #e2e8f0; border-radius: 8px;
  background: #fff; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  color: #cbd5e0; transition: all 0.15s ease; font-family: inherit;
}
.btn-group--client:hover,
.btn-group--client.btn-group--open { border-color: #2e9cab; color: #2e9cab; background: #e8f7f9; }
.btn-group--int:hover,
.btn-group--int.btn-group--open    { border-color: #d97706; color: #d97706; background: #fef3c7; }

/* ── Dropdown portal (position:fixed, rendu à body) ── */
.act-drop-portal {
  position: fixed;
  z-index: 9999;
  min-width: 160px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06);
  padding: 0.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
}
.act-drop-item {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.52rem 0.75rem;
  border: none; background: none; border-radius: 9px;
  font-size: 0.84rem; font-weight: 600; font-family: inherit;
  color: #4a5568; cursor: pointer; text-align: left; width: 100%;
  white-space: nowrap;
  transition: background 0.12s ease, color 0.12s ease;
}
.act-drop--client .act-drop-item:hover { background: #e8f7f9; color: #2e9cab; }
.act-drop--int    .act-drop-item:hover { background: #fef3c7; color: #d97706; }
.drop-icon { width: 0.88rem; height: 0.88rem; flex-shrink: 0; }
</style>
