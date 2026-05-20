<!--
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │  FICHIER DE RÉFÉRENCE — NE PAS UTILISER DIRECTEMENT                        │
  │                                                                             │
  │  Ceci est l'état FINAL de src/views/AdminDashboard.vue après que les       │
  │  6 onglets auront été extraits dans leurs composants enfants.               │
  │                                                                             │
  │  Plan de migration (un onglet à la fois) :                                  │
  │    1. CatalogueTab   → src/components/admin/CatalogueTab.vue  ← EN COURS  │
  │    2. SettingsTab    → src/components/admin/SettingsTab.vue                │
  │    3. StatsTab       → src/components/admin/StatsTab.vue                   │
  │    4. EmailsTab      → src/components/admin/EmailsTab.vue                  │
  │    5. GestionDevisTab → src/components/admin/GestionDevisTab.vue           │
  │    6. ArchivesTab    → src/components/admin/ArchivesTab.vue                │
  │                                                                             │
  │  Quand TOUS les enfants fonctionnent : copier ce fichier vers              │
  │  src/views/AdminDashboard.vue (en remplacement).                            │
  └─────────────────────────────────────────────────────────────────────────────┘
-->
<template>
  <div class="admin-page" @click="dossierDropdownOpen = false; burgerOpen = false">

    <!-- Bannière décorative -->
    <div class="admin-banner" aria-hidden="true" />

    <!-- ── Hero ────────────────────────────────────────────────────────────── -->
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
        <button class="btn-new-quote" @click="startNewQuote">+ Nouveau devis</button>
        <router-link to="/dashboard" class="btn-back-dash">← Mon dashboard</router-link>
      </div>
    </div>

    <!-- ── Stats globales ──────────────────────────────────────────────────── -->
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

    <!-- ── Burger menu mobile (≤640px) ────────────────────────────────────── -->
    <div class="tabs-burger" @click.stop>
      <button class="burger-trigger" @click="burgerOpen = !burgerOpen">
        <component :is="currentTabIcon" class="burger-trigger-icon" />
        <span class="burger-trigger-label">{{ currentTabLabel }}</span>
        <ChevronDown :class="['burger-trigger-chevron', burgerOpen && 'burger-trigger-chevron--open']" />
      </button>
      <Transition name="dropdown">
        <div v-if="burgerOpen" class="burger-menu">
          <div class="burger-group-label">Clients &amp; Devis</div>
          <button
            class="burger-item" :class="activeTab === 'clients' && 'burger-item--active'"
            @click="activeTab = 'clients'; burgerOpen = false; dossierDropdownOpen = false"
          >
            <Users class="burger-item-icon" />Liste des clients
            <span class="burger-item-count">{{ clientCount }}</span>
          </button>
          <button
            class="burger-item" :class="activeTab === 'quotes' && 'burger-item--active'"
            @click="activeTab = 'quotes'; burgerOpen = false; dossierDropdownOpen = false"
          >
            <FileText class="burger-item-icon" />Tous les devis
            <span class="burger-item-count">{{ quotes.length }}</span>
          </button>
          <div class="burger-sep" />
          <button
            v-for="tab in tabs" :key="tab.id"
            class="burger-item" :class="activeTab === tab.id && 'burger-item--active'"
            @click="activeTab = tab.id; burgerOpen = false; dossierDropdownOpen = false"
          >
            <component :is="tab.icon" class="burger-item-icon" />
            {{ tab.label }}
            <span v-if="tab.count !== undefined" class="burger-item-count">{{ tab.count }}</span>
          </button>
        </div>
      </Transition>
    </div>

    <!-- ── Barre d'onglets Desktop ────────────────────────────────────────── -->
    <div class="tabs-bar">

      <!-- Dropdown "Clients & Devis" -->
      <div class="tab-dropdown-wrap" @click.stop>
        <button
          :class="['tab-btn', ['clients','quotes'].includes(activeTab) && 'tab-btn--active']"
          @click="dossierDropdownOpen = !dossierDropdownOpen"
        >
          <Users class="tab-icon" />
          Clients & Devis
          <span class="tab-count">{{ clientCount + quotes.length }}</span>
          <ChevronDown :class="['tab-chevron', dossierDropdownOpen && 'tab-chevron--open']" />
        </button>
        <Transition name="dropdown">
          <div v-if="dossierDropdownOpen" class="tab-dropdown">
            <button
              :class="['tab-dropdown-item', activeTab === 'clients' && 'tab-dropdown-item--active']"
              @click="activeTab = 'clients'; dossierDropdownOpen = false"
            >
              <Users class="tab-dropdown-icon" />Liste des clients
              <span class="tab-dropdown-count">{{ clientCount }}</span>
            </button>
            <button
              :class="['tab-dropdown-item', activeTab === 'quotes' && 'tab-dropdown-item--active']"
              @click="activeTab = 'quotes'; dossierDropdownOpen = false"
            >
              <FileText class="tab-dropdown-icon" />Tous les devis
              <span class="tab-dropdown-count">{{ quotes.length }}</span>
            </button>
          </div>
        </Transition>
      </div>

      <!-- Onglets réguliers -->
      <button
        v-for="tab in tabs" :key="tab.id"
        :class="['tab-btn', activeTab === tab.id && 'tab-btn--active']"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" class="tab-icon" />
        {{ tab.label }}
        <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
      </button>

    </div>

    <!-- ── Contenu : un composant par onglet ──────────────────────────────── -->
    <!-- v-if = lazy mount — chaque onglet charge ses données à la demande     -->
    <ClientsTab
      v-if="activeTab === 'clients'"
      :profiles="profiles" :quotes="quotes" :loading="loading"
      @reload="loadData"
    />
    <GestionDevisTab
      v-if="activeTab === 'quotes'"
      :profiles="profiles" :quotes="quotes" :loading="loading"
      @reload="loadData" @update-quotes="q => quotes = q"
    />
    <ManageTab
      v-if="activeTab === 'manage'"
      :profiles="profiles" :quotes="quotes" :loading="loading"
      @reload="loadData"
    />
    <EmailsTab
      v-if="activeTab === 'emails'"
      :quotes="quotes"
    />
    <ArchivesTab
      v-if="activeTab === 'archives'"
      :quotes="quotes"
      @count-change="n => archiveCount = n"
    />
    <StatsTab
      v-if="activeTab === 'stats'"
      :quotes="quotes" :profiles="profiles"
    />
    <CatalogueTab
      v-if="activeTab === 'catalogue'"
      @count-change="n => catalogueCount = n"
    />
    <SettingsTab
      v-if="activeTab === 'settings'"
    />

    <ToastMessage ref="toast" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { getAllQuotesAdmin, getAllProfilesAdmin } from '@/utils/auth'
import ToastMessage from '@/components/ui/ToastMessage.vue'

// ── Composants enfants (décommenter au fur et à mesure du découpage) ──────────
import CatalogueTab    from '@/components/admin/CatalogueTab.vue'
// import SettingsTab     from '@/components/admin/SettingsTab.vue'
// import StatsTab        from '@/components/admin/StatsTab.vue'
// import EmailsTab       from '@/components/admin/EmailsTab.vue'
// import GestionDevisTab from '@/components/admin/GestionDevisTab.vue'
// import ArchivesTab     from '@/components/admin/ArchivesTab.vue'
// import ClientsTab      from '@/components/admin/ClientsTab.vue'
// import ManageTab       from '@/components/admin/ManageTab.vue'

// ── Icônes de navigation (uniquement celles utilisées dans le shell) ───────────
import {
  ShieldCheck, Users, FileText, Wallet, TrendingUp, ChevronDown,
  Send, Mail, Archive, BarChart2, SlidersHorizontal, Package,
} from 'lucide-vue-next'

const router = useRouter()
const toast  = ref(null)

// ── Navigation ─────────────────────────────────────────────────────────────────
const activeTab           = ref('clients')
const dossierDropdownOpen = ref(false)
const burgerOpen          = ref(false)

// ── Auth ───────────────────────────────────────────────────────────────────────
const displayName   = ref('')
const currentUserId = ref(null)

// ── Données partagées (stats globales + props des onglets clients/devis) ───────
const profiles = ref([])
const quotes   = ref([])
const loading  = ref(true)

// ── Compteurs remontés depuis les enfants via @count-change ────────────────────
const catalogueCount = ref(0)
const archiveCount   = ref(0)

// ── Stats calculées à partir des données du shell ─────────────────────────────
const clientCount  = computed(() => profiles.value.length)
const totalRevenue = computed(() => quotes.value.reduce((s, q) => s + (q.total_cost ?? 0), 0))
const avgCost      = computed(() => quotes.value.length ? totalRevenue.value / quotes.value.length : 0)

function fmtEur(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n ?? 0)
}

// ── Définition des onglets ─────────────────────────────────────────────────────
// Les icônes sont des COMPOSANTS (pas des strings) → type-safe en Composition API
const tabs = computed(() => [
  {
    id: 'manage', label: 'Gestion Devis', icon: Send,
    count: quotes.value.filter(
      q => ['Fini', 'Prêt', 'Accepté', 'accepted'].includes(q.status) && q.client_email
    ).length + quotes.value.filter(q => q.status === 'sent').length,
  },
  { id: 'emails',    label: 'Emails',        icon: Mail },
  { id: 'archives',  label: 'Archives',      icon: Archive,           count: archiveCount.value },
  { id: 'stats',     label: 'Statistiques',  icon: BarChart2 },
  { id: 'catalogue', label: 'Catalogue',     icon: Package,           count: catalogueCount.value || undefined },
  { id: 'settings',  label: 'Paramètres',    icon: SlidersHorizontal },
])

const currentTabIcon = computed(() => {
  if (activeTab.value === 'clients') return Users
  if (activeTab.value === 'quotes')  return FileText
  return tabs.value.find(t => t.id === activeTab.value)?.icon ?? null
})

const currentTabLabel = computed(() => {
  if (activeTab.value === 'clients') return 'Liste des clients'
  if (activeTab.value === 'quotes')  return 'Tous les devis'
  return tabs.value.find(t => t.id === activeTab.value)?.label ?? ''
})

// ── Chargement des données partagées ──────────────────────────────────────────
async function loadData() {
  loading.value = true
  try {
    const [q, p] = await Promise.all([getAllQuotesAdmin(), getAllProfilesAdmin()])
    quotes.value   = q
    profiles.value = p
  } catch {
    toast.value?.show('Impossible de charger les données.', 'error')
  } finally {
    loading.value = false
  }
}

function startNewQuote() {
  router.push('/calculator/1')
}

// ── Scroll lock Desktop ────────────────────────────────────────────────────────
let lockScroll = null

onMounted(async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) { router.replace({ name: 'login' }); return }

  currentUserId.value = data.user.id
  const meta = data.user.user_metadata || {}
  const full = meta.full_name || meta.name || ''
  displayName.value = full.split(' ')[0] || data.user.email?.split('@')[0] || ''

  await loadData()

  lockScroll = () => {
    document.body.style.overflowY = window.innerWidth > 1023 ? 'hidden' : ''
  }
  lockScroll()
  window.addEventListener('resize', lockScroll)
})

onBeforeUnmount(() => {
  document.body.style.overflowY = ''
  if (lockScroll) window.removeEventListener('resize', lockScroll)
})
</script>

<!--
  CSS : conserver ici uniquement les classes de navigation/layout du shell.
  Chercher dans AdminDashboard.vue les sélecteurs suivants et les garder ici :
    .admin-page, .admin-banner, .admin-hero, .admin-avatar, .admin-eyebrow,
    .admin-title, .admin-hero-left, .admin-hero-actions, .btn-new-quote,
    .btn-back-dash, .stats-row, .stat-card, .stat-icon,
    .tabs-burger, .burger-trigger, .burger-menu, .burger-item, .burger-sep,
    .burger-group-label, .tabs-bar, .tab-btn, .tab-btn--active, .tab-icon,
    .tab-count, .tab-dropdown-wrap, .tab-dropdown, .tab-dropdown-item,
    .tab-chevron, .dropdown-enter-active, ...

  Tout le reste (classes spécifiques aux onglets) va dans les enfants.
-->
<style scoped>
/* TODO : coller ici uniquement le CSS de navigation depuis AdminDashboard.vue */
</style>
