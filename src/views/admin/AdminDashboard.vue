<template>
  <div
    class="admin-page"
    @click="devisDropdownOpen = false; outilsDropdownOpen = false; burgerOpen = false"
  >
    <!-- Bannière décorative admin -->
    <div class="admin-banner" aria-hidden="true"></div>

    <!-- Hero -->
    <div class="admin-hero">
      <div class="admin-hero-left">
        <div class="admin-avatar">
          <ShieldCheck class="admin-avatar-icon" />
        </div>
        <div>
          <p class="admin-eyebrow">Administration</p>
          <h1 class="admin-title">Bonjour{{ displayName ? ', ' + displayName : '' }} !</h1>
        </div>
      </div>
      <div class="admin-hero-actions">
        <div class="hero-bell-mobile">
          <NotificationBell :topPanel="true" />
        </div>
        <button class="btn-new-quote" @click="startNewQuote" title="Nouveau devis">
          <Plus class="btn-cta-icon" />
          <span class="btn-cta-text">Nouveau devis</span>
        </button>
        <router-link to="/dashboard" class="btn-back-dash" title="Mon dashboard">
          <LayoutDashboard class="btn-cta-icon" />
          <span class="btn-cta-text">Mon dashboard</span>
        </router-link>
      </div>
    </div>

    <!-- Stats globales -->
    <div class="stats-row">
      <div class="stat-card">
        <Users class="stat-icon" />
        <div>
          <p class="stat-value">{{ clientCount }}</p>
          <p class="stat-label">Clients</p>
        </div>
      </div>
      <div class="stat-card">
        <FileText class="stat-icon stat-icon--teal" />
        <div>
          <p class="stat-value">{{ quotes.length }}</p>
          <p class="stat-label">Devis totaux</p>
        </div>
      </div>
      <div class="stat-card">
        <Wallet class="stat-icon stat-icon--purple" />
        <div>
          <p class="stat-value">{{ fmtEur(totalRevenue) }}</p>
          <p class="stat-label">Revenu total</p>
        </div>
      </div>
      <div class="stat-card">
        <TrendingUp class="stat-icon stat-icon--amber" />
        <div>
          <p class="stat-value">{{ fmtEur(avgCost) }}</p>
          <p class="stat-label">Coût moyen</p>
        </div>
      </div>
    </div>

    <!-- ── Burger menu mobile (≤640px) — remplace la barre d'onglets ── -->
    <div class="tabs-burger" @click.stop>
      <button class="burger-trigger" @click="burgerOpen = !burgerOpen">
        <component :is="currentTabIcon" class="burger-trigger-icon" />
        <span class="burger-trigger-label">{{ currentTabLabel }}</span>
        <ChevronDown
          :class="['burger-trigger-chevron', burgerOpen && 'burger-trigger-chevron--open']"
        />
      </button>
      <!-- Bottom sheet (Teleport → body pour position: fixed sans clip) -->
      <Teleport to="body">
        <Transition name="bs">
          <div v-if="burgerOpen" class="bs-overlay" @click="burgerOpen = false">
            <div class="bs-sheet" @click.stop>
              <div class="bs-handle" />

              <div class="bs-group-label bs-group-label">Clients</div>
              <div class="bs-item"
                :class="activeTab === 'clients' && 'bs-item--active'"
                @click="activeTab = 'clients'; burgerOpen = false"
              >
                <Users class="bs-item-icon" />Gestion des clients
                <span class="bs-item-count">{{ clientCount }}</span>
              </div>

              <div class="bs-sep" />
              <div class="bs-group-label">Gestion des devis</div>
              <div class="bs-item"
                :class="activeTab === 'quotes' && 'bs-item--active'"
                @click="activeTab = 'quotes'; burgerOpen = false"
              >
                <FileText class="bs-item-icon" />Tous les devis
                <span class="bs-item-count">{{ quotes.length }}</span>
              </div>
              <div class="bs-item"
                :class="activeTab === 'manage' && 'bs-item--active'"
                @click="activeTab = 'manage'; burgerOpen = false"
              >
                <Send class="bs-item-icon" />Devis sauvegardés
                <span class="bs-item-count">{{ manageCount }}</span>
              </div>
              <div class="bs-item"
                :class="activeTab === 'archives' && 'bs-item--active'"
                @click="activeTab = 'archives'; burgerOpen = false"
              >
                <Archive class="bs-item-icon" />Archive Devis
                <span class="bs-item-count">{{ archiveCount }}</span>
              </div>

              <div class="bs-sep" />
              <div class="bs-group-label bs-group-label">Emails & Communication</div>
              <div class="bs-item"
                v-for="tab in tabs"
                :key="tab.id"
                :class="activeTab === tab.id && 'bs-item--active'"
                @click="activeTab = tab.id; burgerOpen = false"
              >
                <component :is="tab.icon" class="bs-item-icon" />
                {{ tab.label }}
                <span v-if="tab.count !== undefined" class="bs-item-count">{{ tab.count }}</span>
              </div>

              <div class="bs-sep" />
              <div class="bs-group-label">Boîte à outils</div>
              <div class="bs-item"
                :class="activeTab === 'catalogue' && 'bs-item--active'"
                @click="activeTab = 'catalogue'; burgerOpen = false"
              >
                <Package class="bs-item-icon" />Catalogue
                <span class="bs-item-count">{{ catalogueCount }}</span>
              </div>
              <div class="bs-item"
                :class="activeTab === 'stats' && 'bs-item--active'"
                @click="activeTab = 'stats'; burgerOpen = false"
              >
                <BarChart2 class="bs-item-icon" />Statistiques
              </div>
              <div class="bs-item"
                :class="activeTab === 'settings' && 'bs-item--active'"
                @click="activeTab = 'settings'; burgerOpen = false"
              >
                <SlidersHorizontal class="bs-item-icon" />Paramètres
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>

    <!-- Onglets -->
    <div class="tabs-bar">
      <!-- ── Gestion des clients (direct) ── -->
      <button
        :class="['tab-btn', activeTab === 'clients' && 'tab-btn--active']"
        @click="activeTab = 'clients'"
      >
        <Users class="tab-icon" />
        Gestion des clients
        <span class="tab-count">{{ clientCount }}</span>
      </button>

      <!-- ── Dropdown "Gestion des devis" ── -->
      <div class="tab-dropdown-wrap" @click.stop>
        <button
          :class="['tab-btn', ['quotes', 'manage'].includes(activeTab) && 'tab-btn--active']"
          @click="devisDropdownOpen = !devisDropdownOpen"
        >
          <FileText class="tab-icon" />
          Gestion des devis
          <span class="tab-count">{{ quotes.length }}</span>
          <ChevronDown :class="['tab-chevron', devisDropdownOpen && 'tab-chevron--open']" />
        </button>
        <Transition name="dropdown">
          <div v-if="devisDropdownOpen" class="tab-dropdown">
            <button
              :class="['tab-dropdown-item', activeTab === 'quotes' && 'tab-dropdown-item--active']"
              @click="activeTab = 'quotes'; devisDropdownOpen = false"
            >
              <FileText class="tab-dropdown-icon" />
              Tous les devis
              <span class="tab-dropdown-count">{{ quotes.length }}</span>
            </button>
            <button
              :class="['tab-dropdown-item', activeTab === 'manage' && 'tab-dropdown-item--active']"
              @click="activeTab = 'manage'; devisDropdownOpen = false"
            >
              <Send class="tab-dropdown-icon" />
              Devis sauvegardés
              <span class="tab-dropdown-count">{{ manageCount }}</span>
            </button>
            <button
              :class="['tab-dropdown-item', activeTab === 'archives' && 'tab-dropdown-item--active']"
              @click="activeTab = 'archives'; devisDropdownOpen = false"
            >
              <Archive class="tab-dropdown-icon" />
              Archive Devis
              <span class="tab-dropdown-count">{{ archiveCount }}</span>
            </button>
          </div>
        </Transition>
      </div>

      <!-- ── Onglets normaux ── -->
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', activeTab === tab.id && 'tab-btn--active']"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" class="tab-icon" />
        {{ tab.label }}
        <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
      </button>

      <!-- ── Dropdown "Outils" (Statistiques + Paramètres) ── -->
      <div class="tab-dropdown-wrap" @click.stop>
        <button
          :class="['tab-btn', ['stats', 'settings'].includes(activeTab) && 'tab-btn--active']"
          @click="outilsDropdownOpen = !outilsDropdownOpen"
        >
          <Wrench class="tab-icon" />
          Boîte à outils
          <ChevronDown :class="['tab-chevron', outilsDropdownOpen && 'tab-chevron--open']" />
        </button>
        <Transition name="dropdown">
          <div v-if="outilsDropdownOpen" class="tab-dropdown tab-dropdown--right">
            <button
              :class="['tab-dropdown-item', activeTab === 'catalogue' && 'tab-dropdown-item--active']"
              @click="activeTab = 'catalogue'; outilsDropdownOpen = false"
            >
              <Package class="tab-dropdown-icon" />
              Catalogue
              <span v-if="catalogueCount" class="tab-dropdown-count">{{ catalogueCount }}</span>
            </button>
            <button
              :class="['tab-dropdown-item', activeTab === 'stats' && 'tab-dropdown-item--active']"
              @click="activeTab = 'stats'; outilsDropdownOpen = false"
            >
              <BarChart2 class="tab-dropdown-icon" />
              Statistiques
            </button>
            <button
              :class="['tab-dropdown-item', activeTab === 'settings' && 'tab-dropdown-item--active']"
              @click="activeTab = 'settings'; outilsDropdownOpen = false"
            >
              <SlidersHorizontal class="tab-dropdown-icon" />
              Paramètres
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- ── Onglet Clients ── -->
    <ClientsTab
      v-if="activeTab === 'clients'"
      :quotes="quotes"
      :profiles="profiles"
      :loading="loading"
      :current-user-id="currentUserId"
      @delete-user="confirmDeleteUser($event)"
      @go-to-quotes="onGoToQuotes($event)"
    />

    <!-- ── Onglet Devis ── -->
    <QuotesTab
      v-if="activeTab === 'quotes'"
      :quotes="quotes"
      :profiles="profiles"
      :loading="loading"
      :initial-filter-user-id="quotesFilterUserId"
      :highlighted-quote-id="highlightedQuoteId"
      @delete-quote="confirmDeleteQuote($event)"
      @open-send-modal="sendTarget = $event"
      @reload="loadData"
    />

    <!-- ── Onglet Emails ── -->
    <EmailsTab
      v-if="activeTab === 'emails'"
      :quotes="quotes"
      @open-send-modal="sendTarget = $event"
      @settings-changed="onEmailSettingsChanged"
    />

    <!-- ── Onglet Gestion Devis ── -->
    <GestionDevisTab
      v-if="activeTab === 'manage'"
      :quotes="quotes"
      :profiles="profiles"
      :loading="loading"
      :email-subject="emailSubject"
      :email-intro-client="emailIntroClient"
      :sender-name="senderName"
      @open-send-modal="sendTarget = $event"
      @delete-quote="confirmDeleteQuote($event)"
      @count-change="manageCount = $event"
    />

    <!-- ── Onglet Archives ── -->
    <ArchivesTab
      v-if="activeTab === 'archives'"
      :quotes="quotes"
      :loading="loading"
      @restore-quote="confirmRestoreQuote($event)"
      @count-change="archiveCount = $event"
    />

    <!-- ── Onglet Statistiques ── -->
    <StatsTab v-if="activeTab === 'stats'" :quotes="quotes" :loading="loading" />

    <!-- ── Onglet Catalogue ── -->
    <CatalogueTab v-if="activeTab === 'catalogue'" @count-change="catalogueCount = $event" />

    <!-- ── Onglet Paramètres ── -->
    <SettingsTab v-if="activeTab === 'settings'" @go-to="activeTab = $event" />

    <!-- ── Onglet RDV ── -->
    <RdvTab
      v-if="activeTab === 'rdv'"
      :profiles="profiles"
      :quotes="quotes"
      @go-to-client="quotesFilterUserId = $event; activeTab = 'clients'"
      @go-to-quotes="onGoToQuotes($event)"
      @count-change="rdvCount = $event"
    />

    <!-- ── Modal envoi devis ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="sendTarget" class="modal-overlay" @click.self="sendTarget = null">
          <div class="modal-box modal-box--send">
            <div class="send-modal-header">
              <div class="modal-icon-wrap modal-icon-wrap--teal">
                <Send class="modal-icon modal-icon--teal" />
              </div>
              <h3 class="modal-title">Envoyer ce devis</h3>
            </div>
            <div class="send-modal-summary">
              <div class="summary-row">
                <span class="summary-label">N° devis</span>
                <span class="summary-val summary-val--mono">{{ sendTarget.quote_number }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Pièce</span>
                <span class="summary-val">{{ sendTarget.project_name || '—' }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Client</span>
                <span class="summary-val">{{ sendTarget.client_name || '—' }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Email</span>
                <span class="summary-val summary-val--email">{{ sendTarget.client_email }}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Total TTC</span>
                <span class="summary-val summary-val--total">{{
                  fmtEur(sendTarget.total_cost)
                }}</span>
              </div>
            </div>
            <div class="send-modal-preview">
              <p class="preview-label">Aperçu de l'email</p>
              <div class="preview-subject">{{ resolvedSubject(sendTarget) }}</div>
              <div v-if="resolvedIntro(sendTarget)" class="preview-intro">
                {{ resolvedIntro(sendTarget) }}
              </div>
              <div v-else class="preview-intro preview-intro--muted">
                Aucun texte d'introduction configuré.
              </div>
            </div>
            <!-- Indicateur pièce jointe PDF -->
            <div
              class="send-pdf-indicator"
              :class="attachPdfAuto ? 'send-pdf-indicator--on' : 'send-pdf-indicator--off'"
            >
              <FileText class="send-pdf-icon" />
              <span v-if="attachPdfAuto">Devis PDF joint automatiquement</span>
              <span v-else>PDF non joint (désactivé dans la configuration)</span>
              <span class="send-pdf-status">{{ attachPdfAuto ? '✓' : '○' }}</span>
            </div>
            <div class="modal-actions">
              <button class="btn-cancel" @click="sendTarget = null">Annuler</button>
              <button class="btn-confirm-send" :disabled="isSending" @click="sendQuote">
                <Send class="btn-send-icon-sm" />
                {{ isSending ? 'Envoi…' : 'Envoyer' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Modal confirmation ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
          <div class="modal-box">
            <div
              :class="['modal-icon-wrap', deleteTarget.type === 'user' && 'modal-icon-wrap--red']"
            >
              <component :is="deleteTarget.type === 'user' ? Users : Trash2" class="modal-icon" />
            </div>
            <h3 class="modal-title">
              {{ deleteTarget.type === 'user' ? 'Supprimer ce client ?' : 'Supprimer ce devis ?' }}
            </h3>
            <p class="modal-sub" v-if="deleteTarget.type === 'user'">
              <strong>{{
                deleteTarget.data.full_name ||
                quoteInfoByUser[deleteTarget.data.id]?.name ||
                deleteTarget.data.email
              }}</strong
              ><br />
              Tous ses devis ({{ quoteCountFor(deleteTarget.data.id) }}) seront supprimés.<br />
              <span class="modal-warn">Action irréversible.</span>
            </p>
            <p class="modal-sub" v-else>
              <strong>{{ deleteTarget.data.quote_number }}</strong> —
              {{ deleteTarget.data.project_name }}<br />
              <span class="modal-warn">Action irréversible.</span>
            </p>
            <div class="modal-actions">
              <button class="btn-cancel" @click="deleteTarget = null">Annuler</button>
              <button class="btn-confirm-del" :disabled="deleting" @click="doDelete">
                {{ deleting ? 'Suppression…' : 'Supprimer' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ToastMessage ref="toast" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  adminDeleteQuote,
  adminDeleteUser,
  adminUnarchiveQuote,
} from '@/utils/quotes'
import { supabase } from '@/lib/supabase'
import { generateQuotePDFDoc, pdfToBase64 } from '@/utils/generateQuotePDF'
import { fmtEur } from '@/utils/formatters'
import { useCalculatorStore } from '@/stores/calculator'
import { usePushNotifications } from '@/composables/usePushNotifications'
import { useAdminRealtime }    from '@/composables/useAdminRealtime'
import ToastMessage from '@/components/ui/ToastMessage.vue'
import NotificationBell from '@/components/ui/NotificationBell.vue'
import CatalogueTab from '@/components/admin/CatalogueTab.vue'
import SettingsTab from '@/components/admin/SettingsTab.vue'
import RdvTab from '@/components/admin/RdvTab.vue'
import GestionDevisTab from '@/components/admin/GestionDevisTab.vue'
import EmailsTab from '@/components/admin/EmailsTab.vue'
import ArchivesTab from '@/components/admin/ArchivesTab.vue'
import StatsTab from '@/components/admin/StatsTab.vue'
import ClientsTab from '@/components/admin/ClientsTab.vue'
import QuotesTab from '@/components/admin/QuotesTab.vue'
import {
  ShieldCheck,
  Users,
  FileText,
  Wallet,
  TrendingUp,
  Trash2,
  Send,
  Archive,
  BarChart2,
  SlidersHorizontal,
  Package,
  CalendarDays,
  Wrench,
  ChevronDown,
  Mail,
  Bell,
  BellOff,
  Plus,
  LayoutDashboard,
} from 'lucide-vue-next'

const router = useRouter()
const calculatorStore = useCalculatorStore()
const toast = ref(null)
const { isSupported: pushSupported, isSubscribed, permission: pushPermission, loading: pushLoading, init: initPush, subscribe: subscribePush, unsubscribe: unsubscribePush } = usePushNotifications()

const saved = JSON.parse(localStorage.getItem('bambu_email_settings') || '{}')
const displayName = ref('')
const currentUserId = ref(null)
const activeTab = ref('clients')
const quotesFilterUserId = ref('')
const deleteTarget = ref(null)
const { quotes, profiles, loading, highlightedQuoteId, loadData } = useAdminRealtime(toast)

const deleting = ref(false)
const senderName = ref(saved.senderName || 'BambuCalc')
const emailSubject = ref(saved.emailSubject || 'Votre devis BambuCalc — [numéro]')
const emailIntroClient = ref(saved.emailIntroClient || '')
const attachPdfAuto = ref(saved.attachPdfAuto ?? true)
const sendTarget = ref(null)
const isSending = ref(false)
const devisDropdownOpen = ref(false)
const outilsDropdownOpen = ref(false)
const burgerOpen = ref(false)
const catalogueCount = ref(0)
const manageCount = ref(0)
const archiveCount = ref(0)
const rdvCount = ref(0)

const tabs = computed(() => [
  { id: 'emails', label: 'Gestion des emails/aperçus & envoi', icon: Mail },
  { id: 'rdv',    label: 'Gestion des rendez-vous', icon: CalendarDays, count: rdvCount.value || undefined },
])
const currentTabIcon = computed(() => {
  if (activeTab.value === 'clients')   return Users
  if (activeTab.value === 'quotes')    return FileText
  if (activeTab.value === 'manage')    return Send
  if (activeTab.value === 'stats')     return BarChart2
  if (activeTab.value === 'settings')  return SlidersHorizontal
  if (activeTab.value === 'catalogue') return Package
  const t = tabs.value.find((t) => t.id === activeTab.value)
  return t ? t.icon : ChevronDown
})
const currentTabLabel = computed(() => {
  if (activeTab.value === 'clients')   return 'Gestion des clients'
  if (activeTab.value === 'quotes')    return 'Tous les devis'
  if (activeTab.value === 'manage')   return 'Devis sauvegardés'
  if (activeTab.value === 'archives') return 'Archive Devis'
  if (activeTab.value === 'stats')     return 'Statistiques'
  if (activeTab.value === 'settings')  return 'Paramètres'
  if (activeTab.value === 'catalogue') return 'Catalogue'
  const t = tabs.value.find((t) => t.id === activeTab.value)
  return t ? t.label : ''
})
const totalRevenue = computed(() => quotes.value.reduce((a, q) => a + (q.total_cost || 0), 0))
const avgCost = computed(() => (quotes.value.length ? totalRevenue.value / quotes.value.length : 0))
const quoteInfoByUser = computed(() => {
  const map = {}
  for (const q of quotes.value) {
    if (!map[q.user_id] && (q.client_name || q.client_email))
      map[q.user_id] = { name: q.client_name || '', email: q.client_email || '' }
  }
  return map
})
const clientCount = computed(
  () =>
    profiles.value.filter((p) => {
      if (p.id === currentUserId.value) return false
      const isAnon = !p.full_name && !p.email
      return isAnon ? quotes.value.some((q) => q.user_id === p.id) : true
    }).length,
)

;(async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    router.replace({ name: 'login' })
    return
  }
  currentUserId.value = data.user.id
  const meta = data.user.user_metadata || {}
  const full = meta.full_name || meta.name || ''
  displayName.value = full.split(' ')[0] || data.user.email?.split('@')[0] || ''
})()

let lockScrollFn = null
onMounted(() => {
  lockScrollFn = () => {
    document.body.style.overflowY = window.innerWidth > 1023 ? 'hidden' : ''
  }
  lockScrollFn()
  window.addEventListener('resize', lockScrollFn)
  initPush()
})
onUnmounted(() => {
  document.body.style.overflowY = ''
  if (lockScrollFn) window.removeEventListener('resize', lockScrollFn)
})

function quoteCountFor(userId) {
  return quotes.value.filter((q) => q.user_id === userId).length
}
function onGoToQuotes(userId) {
  quotesFilterUserId.value = userId
  activeTab.value = 'quotes'
}
function confirmDeleteQuote(q) {
  deleteTarget.value = { type: 'quote', data: q }
}
async function confirmRestoreQuote(q) {
  try {
    await adminUnarchiveQuote(q.id)
    // Mettre à jour la liste locale : archived → false
    const idx = quotes.value.findIndex(x => x.id === q.id)
    if (idx !== -1) quotes.value[idx] = { ...quotes.value[idx], archived: false }
    toast.value?.show('Devis restauré dans la liste active.', 'success', 2800)
  } catch {
    toast.value?.show('Erreur lors de la restauration.', 'error')
  }
}
function confirmDeleteUser(p) {
  deleteTarget.value = { type: 'user', data: p }
}
async function doDelete() {
  deleting.value = true
  try {
    if (deleteTarget.value.type === 'quote') {
      await adminDeleteQuote(deleteTarget.value.data.id)
      quotes.value = quotes.value.filter((q) => q.id !== deleteTarget.value.data.id)
      toast.value?.show('Devis supprimé.', 'success', 2500)
    } else {
      await adminDeleteUser(deleteTarget.value.data.id)
      const uid = deleteTarget.value.data.id
      profiles.value = profiles.value.filter((p) => p.id !== uid)
      quotes.value = quotes.value.filter((q) => q.user_id !== uid)
      toast.value?.show('Client supprimé.', 'success', 2500)
    }
    deleteTarget.value = null
  } catch {
    toast.value?.show('Erreur lors de la suppression.', 'error')
  } finally {
    deleting.value = false
  }
}
function startNewQuote() {
  calculatorStore.resetForNewQuote()
  router.push('/calculator/1')
}
function onEmailSettingsChanged(s) {
  senderName.value = s.senderName
  emailSubject.value = s.emailSubject
  emailIntroClient.value = s.emailIntroClient
  attachPdfAuto.value = s.attachPdfAuto
}
function resolvedSubject(quote) {
  const civility = quote.client_civility ? quote.client_civility + ' ' : ''
  const lastName = quote.client_last_name || ''
  const firstName = quote.client_first_name || quote.client_name?.split(' ')[0] || 'client'
  return (emailSubject.value || 'Votre devis BambuCalc — [numéro]')
    .replace(/\[numéro\]/gi, quote.quote_number || '')
    .replace(/\[senderName\]/gi, senderName.value || 'BambuCalc')
    .replace(/\[projet\]/gi, quote.project_name || '')
    .replace(/\[client\]/gi, firstName)
    .replace(/\[client_nom\]/gi, civility + (lastName || firstName))
}
function resolvedIntro(quote) {
  const civility = quote.client_civility ? quote.client_civility + ' ' : ''
  const lastName = quote.client_last_name || ''
  const firstName = quote.client_first_name || quote.client_name?.split(' ')[0] || 'client'
  const fullPolite = civility + (lastName || firstName)
  return (emailIntroClient.value || '')
    .replace(/\[client\]/gi, firstName)
    .replace(/\[client_nom\]/gi, fullPolite)
    .replace(/\[civilité\]/gi, civility.trim())
    .replace(/\[numéro\]/gi, quote.quote_number || '')
    .replace(/\[projet\]/gi, quote.project_name || '')
    .replace(/\[total\]/gi, fmtEur(quote.total_cost))
}
async function sendQuote() {
  if (!sendTarget.value) return
  isSending.value = true
  try {
    let pdfBase64 = null,
      pdfFilename = null
    if (attachPdfAuto.value) {
      try {
        const doc = await generateQuotePDFDoc(sendTarget.value)
        pdfBase64 = pdfToBase64(doc)
        pdfFilename = `devis-${sendTarget.value.quote_number || 'bambucalc'}.pdf`
      } catch (pdfErr) {
        console.warn('[sendQuote] PDF failed:', pdfErr)
      }
    }
    const { error } = await supabase.functions.invoke('send-quote-email', {
      body: { quote: sendTarget.value, pdfBase64, filename: pdfFilename },
    })
    if (error) throw new Error(error.message || JSON.stringify(error))
    const { error: updateErr } = await supabase
      .from('quotes')
      .update({ status: 'sent' })
      .eq('id', sendTarget.value.id)
    if (!updateErr) {
      const idx = quotes.value.findIndex((q) => q.id === sendTarget.value.id)
      if (idx !== -1) quotes.value[idx].status = 'sent'
    }
    toast.value?.show(`Email envoyé à ${sendTarget.value.client_email} !`, 'success')
    sendTarget.value = null
  } catch (err) {
    toast.value?.show(`Erreur d'envoi : ${err.message || 'edge function indisponible'}`, 'error')
  } finally {
    isSending.value = false
  }
}
</script>


<style src="@/styles/admin-dashboard.css"></style>

