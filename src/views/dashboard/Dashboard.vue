<template>
  <div class="dash-page" @click="dashBsOpen = false">

    <!-- Bannière mode invité -->
    <div v-if="isAnonymous" class="anon-banner">
      <UserX class="anon-banner-icon" />
      <div class="anon-banner-text">
        <strong>Mode invité</strong> — vos devis sont sauvegardés temporairement. Créez un compte pour les conserver définitivement.
      </div>
      <button class="btn-link-toggle" @click="showLinkForm = !showLinkForm">
        {{ showLinkForm ? 'Fermer' : 'Lier mon email' }}
      </button>
    </div>

    <!-- Formulaire de liaison -->
    <div v-if="isAnonymous && showLinkForm" class="link-form-card">
      <h3 class="link-form-title">Créer mon compte</h3>
      <p class="link-form-sub">Vos devis existants seront conservés.</p>
      <form class="link-form" @submit.prevent="linkAccount">
        <div class="link-field">
          <label>Email</label>
          <input v-model="linkEmail" type="email" placeholder="vous@exemple.com" required />
        </div>
        <div class="link-field">
          <label>Mot de passe</label>
          <input v-model="linkPassword" type="password" placeholder="••••••••" minlength="6" required />
        </div>
        <p v-if="linkError" class="link-error">{{ linkError }}</p>
        <p v-if="linkSuccess" class="link-success">✓ Email de confirmation envoyé ! Vérifiez votre boîte mail.</p>
        <button type="submit" class="btn-link-submit" :disabled="linking">
          {{ linking ? 'Envoi…' : 'Créer mon compte' }}
        </button>
      </form>
    </div>

    <!-- Hero bar -->
    <div class="dash-hero">
      <div class="dash-hero-left">
        <div class="dash-avatar">
          <User class="dash-avatar-icon" />
        </div>
        <div>
          <p class="dash-eyebrow">Tableau de bord</p>
          <h1 class="dash-greeting">Bonjour{{ displayName ? ', ' + displayName : '' }} !</h1>
        </div>
      </div>
      <div class="dash-hero-actions">
        <div class="hero-bell-mobile">
          <NotificationBell :topPanel="true" />
        </div>
        <CalendarPanel v-if="!isAnonymous && !isAdminUser" class="hero-rdv-btn" />
        <router-link to="/calculator/1" class="btn-new" title="Nouveau devis">
          <Plus class="btn-new-icon" />
          <span class="btn-new-text">Nouveau devis</span>
        </router-link>
      </div>
    </div>

    <!-- Tab bar desktop (≥641px) -->
    <div v-if="!isAnonymous" class="client-tabs">
      <button :class="['ctab-btn', activeTab === 'quotes' && 'ctab-btn--active']" @click="activeTab = 'quotes'">
        <FileText class="ctab-icon" />
        <span class="ctab-label-long">Mes devis</span>
        <span class="ctab-label-short">Devis</span>
        <span v-if="quotes.length > 0" class="ctab-count">{{ quotes.length }}</span>
      </button>
      <button :class="['ctab-btn', activeTab === 'rdv' && 'ctab-btn--active']" @click="activeTab = 'rdv'">
        <Calendar class="ctab-icon" />
        <span class="ctab-label-long">Mes rendez-vous</span>
        <span class="ctab-label-short">RDV</span>
        <span v-if="rdvTabs.find(t => t.id === 'upcoming')?.count > 0" class="ctab-count">{{ rdvTabs.find(t => t.id === 'upcoming')?.count }}</span>
      </button>
      <button :class="['ctab-btn', activeTab === 'profile' && 'ctab-btn--active']" @click="activeTab = 'profile'">
        <User class="ctab-icon" />
        <span class="ctab-label-long">Mon profil</span>
        <span class="ctab-label-short">Profil</span>
      </button>
    </div>

    <!-- Trigger mobile (≤640px) — ouvre le bottom sheet -->
    <div v-if="!isAnonymous" class="dash-trigger-wrap" @click.stop>
      <button class="dash-trigger" @click="dashBsOpen = !dashBsOpen">
        <component :is="currentTabIcon" class="dash-trigger-icon" />
        <span class="dash-trigger-label">{{ currentTabLabel }}</span>
        <ChevronDown :class="['dash-trigger-chevron', dashBsOpen && 'dash-trigger-chevron--open']" />
      </button>
    </div>

    <!-- Bottom sheet client (Teleport → body) -->
    <Teleport to="body">
      <Transition name="bs">
        <div v-if="dashBsOpen" class="bs-overlay" @click="dashBsOpen = false">
          <div class="dash-bs-sheet" @click.stop>
            <div class="dash-bs-handle" />
            <div
              :class="['dash-bs-item', activeTab === 'quotes' && 'dash-bs-item--active']"
              @click="activeTab = 'quotes'; dashBsOpen = false"
            >
              <FileText class="dash-bs-icon" />Mes devis
              <span v-if="quotes.length > 0" class="dash-bs-count">{{ quotes.length }}</span>
            </div>
            <div
              :class="['dash-bs-item', activeTab === 'rdv' && 'dash-bs-item--active']"
              @click="activeTab = 'rdv'; dashBsOpen = false"
            >
              <Calendar class="dash-bs-icon" />Mes rendez-vous
              <span v-if="rdvTabs.find(t => t.id === 'upcoming')?.count > 0" class="dash-bs-count">{{ rdvTabs.find(t => t.id === 'upcoming')?.count }}</span>
            </div>
            <div
              :class="['dash-bs-item', activeTab === 'profile' && 'dash-bs-item--active']"
              @click="activeTab = 'profile'; dashBsOpen = false"
            >
              <User class="dash-bs-icon" />Mon profil
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Stats -->
    <div v-show="activeTab === 'quotes'" class="stats-row">
      <div class="stat-card">
        <FileText class="stat-icon" />
        <div>
          <p class="stat-value">{{ quotes.length }}</p>
          <p class="stat-label">Devis créés</p>
        </div>
      </div>
      <div class="stat-card">
        <TrendingUp class="stat-icon stat-icon--teal" />
        <div>
          <p class="stat-value">{{ fmtEur(avgCost) }}</p>
          <p class="stat-label">Coût moyen</p>
        </div>
      </div>
      <div class="stat-card">
        <Package class="stat-icon stat-icon--amber" />
        <div>
          <p class="stat-value">{{ topMaterial || '—' }}</p>
          <p class="stat-label">Matière fréquente</p>
        </div>
      </div>
      <div class="stat-card">
        <Wallet class="stat-icon stat-icon--purple" />
        <div>
          <p class="stat-value">{{ fmtEur(totalRevenue) }}</p>
          <p class="stat-label">Total généré</p>
        </div>
      </div>
    </div>

    <!-- Liste des devis -->
    <div v-show="activeTab === 'quotes'" class="quotes-card">
      <div class="quotes-header">
        <h2 class="quotes-title"><FileText class="qh-icon" /> Mes devis</h2>
        <span class="quotes-count">{{ quotes.length }} devis</span>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="empty-state">
        <div class="spinner" />
        <p>Chargement…</p>
      </div>

      <!-- Vide -->
      <div v-else-if="quotes.length === 0" class="empty-state">
        <FileText class="empty-icon" />
        <p class="empty-title">Aucun devis pour l'instant</p>
        <p class="empty-sub">Lance le calculateur pour créer ton premier devis.</p>
      </div>

      <!-- Vue Tableau (≥641px) / Vue Cartes (≤640px) -->
      <template v-else>
        <!-- Tableau — Desktop & Tablette -->
        <div class="dq-table-view">
          <table class="quotes-table">
            <thead>
              <tr>
                <th>N° Devis</th>
                <th>Pièce</th>
                <th class="th-photo">Photo</th>
                <th>Client</th>
                <th>Matière</th>
                <th>Total TTC</th>
                <th>Statut</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="q in quotes" :key="q.id">
                <td class="td-num">{{ q.quote_number || '—' }}</td>
                <td class="td-name">{{ q.project_name || '—' }}</td>
                <td class="td-photo">
                  <img v-if="q.reference_image_url" :src="q.reference_image_url" class="ref-thumb" :alt="q.project_name" loading="lazy" @click="zoomedImageUrl = q.reference_image_url" />
                  <span v-else class="ref-thumb-empty" title="Aucune photo"></span>
                </td>
                <td class="td-client">{{ q.client_name || '—' }}</td>
                <td><span class="mat-tag">{{ q.material || '—' }}</span></td>
                <td class="td-total">{{ fmtEur(q.total_cost) }}</td>
                <td><span :class="['status-badge', 'status-' + (q.status || 'pending')]">{{ statusLabel(q.status) }}</span></td>
                <td class="td-date">
                  {{ fmtDate(q.updated_at || q.created_at) }}
                  <span v-if="wasEdited(q)" class="date-edited" title="Devis modifié par le prestataire">modifié</span>
                </td>
                <td class="td-actions">
                  <router-link
                    v-if="q.payment_status !== 'paid'"
                    :to="{ name: 'payment', params: { quoteId: q.id } }"
                    class="btn-pay-quote"
                    title="Payer ce devis"
                  >
                    <CreditCard class="del-icon" />
                  </router-link>
                  <button class="btn-preview" @click="previewingQuote = q" title="Aperçu du devis">
                    <Eye class="del-icon" />
                  </button>
                  <button class="btn-pdf" @click="downloadPDF(q)" title="Télécharger le devis PDF">
                    <Download class="del-icon" />
                  </button>
                  <button class="btn-archive" @click="confirmArchive(q)" title="Archiver">
                    <Archive class="del-icon" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cartes — Mobile (≤640px) -->
        <div class="dq-cards-view">
          <div v-for="q in quotes" :key="q.id" class="dqcard">
            <div class="dqcard-top">
              <div class="dqcard-left">
                <p class="dqcard-name">{{ q.project_name || '—' }}</p>
                <p class="dqcard-num">{{ q.quote_number || '—' }}</p>
              </div>
              <div class="dqcard-top-right">
                <img v-if="q.reference_image_url" :src="q.reference_image_url" class="ref-thumb-card" :alt="q.project_name" loading="lazy" @click="zoomedImageUrl = q.reference_image_url" />
                <span :class="['status-badge', 'status-' + (q.status || 'pending')]">{{ statusLabel(q.status) }}</span>
              </div>
            </div>
            <div class="dqcard-mid">
              <span class="dqcard-date">
                {{ fmtDate(q.updated_at || q.created_at) }}
                <span v-if="wasEdited(q)" class="date-edited">modifié</span>
              </span>
              <span class="dqcard-total">{{ fmtEur(q.total_cost) }}</span>
            </div>
            <div class="dqcard-foot">
              <router-link
                v-if="q.payment_status !== 'paid'"
                :to="{ name: 'payment', params: { quoteId: q.id } }"
                class="btn-pay-quote dqcard-btn"
                title="Payer ce devis"
              >
                <CreditCard class="del-icon" />
              </router-link>
              <button class="btn-preview dqcard-btn" @click="previewingQuote = q" title="Aperçu du devis">
                <Eye class="del-icon" />
              </button>
              <button class="btn-pdf dqcard-btn" @click="downloadPDF(q)" title="Télécharger PDF">
                <Download class="del-icon" />
              </button>
              <button class="btn-archive dqcard-btn" @click="confirmArchive(q)" title="Archiver">
                <Archive class="del-icon" />
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ── Section Mes rendez-vous ── -->
    <div v-if="!isAnonymous && activeTab === 'rdv'" class="rdv-section-card">
      <div class="rdv-section-header">
        <div class="rdv-section-title-wrap">
          <Calendar class="rdv-section-icon" />
          <h2 class="rdv-section-title">Mes rendez-vous</h2>
        </div>
        <div class="rdv-tabs">
          <button
            v-for="tab in rdvTabs"
            :key="tab.id"
            :class="['rdv-tab', rdvFilter === tab.id && 'rdv-tab--active']"
            @click="rdvFilter = tab.id"
          >
            {{ tab.label }}
            <span v-if="tab.count > 0" class="rdv-tab-count">{{ tab.count }}</span>
          </button>
        </div>
      </div>

      <div v-if="loadingRdv" class="empty-state">
        <div class="spinner" />
        <p>Chargement…</p>
      </div>

      <div v-else-if="filteredRdv.length === 0" class="empty-state">
        <Calendar class="empty-icon" />
        <p class="empty-title">Aucun rendez-vous</p>
        <p v-if="rdvFilter === 'upcoming'" class="empty-sub">Prends rendez-vous pour démarrer ton projet.</p>
      </div>

      <template v-else>
        <!-- Desktop (≥641px) -->
        <div class="dq-table-view">
          <table class="quotes-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Heure</th>
                <th>Format</th>
                <th>Objet</th>
                <th>Devis lié</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in filteredRdv" :key="a.id" :class="{ 'tr--rdv-canceled': a.status === 'canceled' }">
                <td class="td-date">{{ fmtDate(a.start_at) }}</td>
                <td>
                  <span class="rdv-time">{{ fmtTime(a.start_at) }}</span>
                  <span class="rdv-dur">{{ duration(a.start_at, a.end_at) }}</span>
                </td>
                <td>
                  <span :class="['rdv-fmt-badge', `rdv-fmt-badge--${a.format}`]">
                    {{ a.format === 'online' ? 'En ligne' : 'Extérieur' }}
                  </span>
                </td>
                <td class="td-rdv-obj">{{ getObjectRdv(a) }}</td>
                <td class="td-rdv-devis">
                  <template v-if="linkedQuotes.length">
                    <span
                      v-for="q in linkedQuotes"
                      :key="q.id"
                      :class="['status-badge', 'status-' + (q.status || 'pending')]"
                      style="font-size:0.68rem"
                    >#{{ q.quote_number }}</span>
                  </template>
                  <span v-else class="rdv-none">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile (≤640px) -->
        <div class="dq-cards-view">
          <div v-for="a in filteredRdv" :key="a.id" class="rdv-mcard" :class="{ 'rdv-mcard--canceled': a.status === 'canceled' }">
            <div class="rdv-mcard-top">
              <div>
                <p class="rdv-mcard-date">{{ fmtDate(a.start_at) }}</p>
                <p class="rdv-mcard-time">{{ fmtTime(a.start_at) }} · {{ duration(a.start_at, a.end_at) }}</p>
              </div>
              <span :class="['rdv-fmt-badge', `rdv-fmt-badge--${a.format}`]">
                {{ a.format === 'online' ? 'En ligne' : 'Extérieur' }}
              </span>
            </div>
            <p v-if="getObjectRdv(a) !== '—'" class="rdv-mcard-obj">{{ getObjectRdv(a) }}</p>
            <div v-if="linkedQuotes.length" class="rdv-mcard-devis">
              <span
                v-for="q in linkedQuotes"
                :key="q.id"
                :class="['status-badge', 'status-' + (q.status || 'pending')]"
                style="font-size:0.68rem"
              >#{{ q.quote_number }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ── Section Archives ── -->
    <div v-if="archivedCount > 0 && activeTab === 'quotes'" class="archives-block">
      <button class="btn-archives-toggle" @click="toggleArchives">
        <Archive :size="14" />
        <span>{{ showArchives ? 'Masquer les archives' : `Archives — ${archivedCount} devis` }}</span>
        <ChevronDown :size="14" :class="['chevron', { 'chevron--open': showArchives }]" />
      </button>

      <div v-if="showArchives" class="archives-content">
        <div v-if="loadingArchives" class="empty-state">
          <div class="spinner" /><p>Chargement…</p>
        </div>
        <template v-else>
          <div v-for="(yearGroup, year) in archivedByYear" :key="year" class="archive-year-block">
            <div class="archive-year-label">{{ year }}</div>

            <!-- Tableau (≥641px) -->
            <div class="dq-table-view">
              <table class="quotes-table quotes-table--dim">
                <tbody>
                  <tr v-for="q in yearGroup" :key="q.id">
                    <td class="td-num">{{ q.quote_number || '—' }}</td>
                    <td class="td-name">{{ q.project_name || '—' }}</td>
                    <td class="td-total">{{ fmtEur(q.total_cost) }}</td>
                    <td class="td-date">{{ fmtDate(q.updated_at || q.created_at) }}</td>
                    <td class="td-actions">
                      <button class="btn-preview" @click="previewingQuote = q" title="Aperçu">
                        <Eye class="del-icon" />
                      </button>
                      <button class="btn-pdf" @click="downloadPDF(q)" title="Télécharger PDF">
                        <Download class="del-icon" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Cartes (≤640px) -->
            <div class="dq-cards-view">
              <div v-for="q in yearGroup" :key="q.id" class="dqcard dqcard--dim">
                <div class="dqcard-top">
                  <div class="dqcard-left">
                    <p class="dqcard-name">{{ q.project_name || '—' }}</p>
                    <p class="dqcard-num">{{ q.quote_number || '—' }}</p>
                  </div>
                  <div class="dqcard-top-right">
                    <img v-if="q.reference_image_url" :src="q.reference_image_url" class="ref-thumb-card" :alt="q.project_name" loading="lazy" />
                  </div>
                </div>
                <div class="dqcard-mid">
                  <span class="dqcard-date">{{ fmtDate(q.updated_at || q.created_at) }}</span>
                  <span class="dqcard-total">{{ fmtEur(q.total_cost) }}</span>
                </div>
                <div class="dqcard-foot">
                  <button class="btn-preview dqcard-btn" @click="previewingQuote = q" title="Aperçu">
                    <Eye class="del-icon" />
                  </button>
                  <button class="btn-pdf dqcard-btn" @click="downloadPDF(q)" title="Télécharger PDF">
                    <Download class="del-icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- ── Onglet Mon profil ── -->
    <div v-if="!isAnonymous && activeTab === 'profile'" class="profile-inline">
      <div class="pi-infobar">
        <div class="pi-meta-row">
          <span class="pi-meta-label">Email</span>
          <span class="pi-meta-val">{{ userEmail || '—' }}</span>
        </div>
        <div class="pi-meta-row">
          <span class="pi-meta-label">Membre depuis</span>
          <span class="pi-meta-val">{{ memberSince }}</span>
        </div>
      </div>

      <div class="pi-cols">
        <!-- Identité -->
        <div class="pi-col">
          <p class="pi-col-title">Identité</p>
          <div class="pi-field">
            <label class="pi-label">Prénom</label>
            <input class="pi-input" v-model="firstName" placeholder="Jean" />
          </div>
          <div class="pi-field">
            <label class="pi-label">Nom</label>
            <input class="pi-input" v-model="lastName" placeholder="Dupont" />
          </div>
          <div class="pi-field">
            <label class="pi-label">Téléphone</label>
            <input class="pi-input" type="tel" v-model="phone" placeholder="+33 6 00 00 00 00" />
          </div>
          <div class="pi-field">
            <label class="pi-label">Entreprise</label>
            <input class="pi-input" v-model="company" placeholder="Mon Entreprise SAS" />
          </div>
          <button class="pi-btn-save" @click="saveProfile" :disabled="saving">
            <Save class="pi-btn-icon" />
            {{ saving ? 'Sauvegarde…' : 'Sauvegarder' }}
          </button>
        </div>

        <!-- Sécurité -->
        <div class="pi-col">
          <p class="pi-col-title"><Shield class="pi-col-icon" /> Sécurité</p>
          <PasswordField id="dash-new-pwd"     label="Nouveau mot de passe" :show-strength="true" v-model="newPassword" />
          <PasswordField id="dash-confirm-pwd" label="Confirmer le mot de passe" v-model="confirmPwd" />
          <p v-if="pwdError" class="pi-error">{{ pwdError }}</p>
          <button class="pi-btn-outline" @click="savePassword" :disabled="savingPwd">
            {{ savingPwd ? 'Enregistrement…' : 'Changer le mot de passe' }}
          </button>
          <button class="pi-btn-logout" @click="logout">
            <LogOut class="pi-btn-icon" /> Se déconnecter
          </button>
        </div>
      </div>
    </div>

    <!-- Modal confirmation archivage -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="archiveTarget" class="modal-overlay" @click.self="archiveTarget = null">
          <div class="modal-box">
            <div class="modal-icon-wrap modal-icon-wrap--archive">
              <Archive class="modal-icon modal-icon--archive" />
            </div>
            <h3 class="modal-title">Archiver ce devis ?</h3>
            <p class="modal-sub">
              <strong>{{ archiveTarget.quote_number }}</strong> — {{ archiveTarget.project_name }}<br />
              Le devis sera conservé dans vos archives.
            </p>
            <div class="modal-actions">
              <button class="btn-cancel" @click="archiveTarget = null">Annuler</button>
              <button class="btn-confirm-archive" :disabled="archiving" @click="doArchive">
                {{ archiving ? 'Archivage…' : 'Archiver' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ToastMessage ref="toast" />
    <QuotePreviewModal
      v-if="previewingQuote"
      :quote="previewingQuote"
      @close="previewingQuote = null"
    />

    <Teleport to="body">
      <div v-if="zoomedImageUrl" class="photo-lightbox" @click="zoomedImageUrl = null">
        <img :src="zoomedImageUrl" class="photo-lightbox-img" @click.stop />
        <button class="photo-lightbox-close" @click="zoomedImageUrl = null">✕</button>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { getQuotes, getArchivedQuotes, archiveQuote } from '@/utils/quotes'
import { generateQuotePDF } from '@/utils/generateQuotePDF'
import { fmtEur } from '@/utils/formatters'
import { deriveFormat, getObjectRdv, fmtTime, duration } from '@/utils/rdvUtils'
import ToastMessage from '@/components/ui/ToastMessage.vue'
import NotificationBell from '@/components/ui/NotificationBell.vue'
import QuotePreviewModal from '@/components/ui/QuotePreviewModal.vue'
import PasswordField from '@/components/ui/PasswordField.vue'
import CalendarPanel from '@/components/ui/CalendarPanel.vue'
import { User, Plus, FileText, TrendingUp, Package, Wallet, Archive, ChevronDown, Download, UserX, CreditCard, Eye, Calendar, Shield, LogOut, Save } from 'lucide-vue-next'

// Tab labels pour le trigger mobile
const tabMeta = {
  quotes:  { icon: FileText,  label: 'Mes devis' },
  rdv:     { icon: Calendar,  label: 'Mes rendez-vous' },
  profile: { icon: User,      label: 'Mon profil' },
}
const currentTabIcon  = computed(() => tabMeta[activeTab.value]?.icon  ?? FileText)
const currentTabLabel = computed(() => tabMeta[activeTab.value]?.label ?? 'Mes devis')
const dashBsOpen = ref(false)

// ── State ──
const displayName = ref('')
const isAnonymous = ref(false)
const userEmail = ref('')
const quotes = ref([])
const appointments = ref([])
const loadingRdv = ref(false)
const rdvFilter = ref('upcoming')
const activeTab = ref('quotes')
const isAdminUser = ref(false)

// ── Profil inline ──
const firstName   = ref('')
const lastName    = ref('')
const phone       = ref('')
const company     = ref('')
const memberSince = ref('')
const saving      = ref(false)
const savingPwd   = ref(false)
const newPassword = ref('')
const confirmPwd  = ref('')
const pwdError    = ref(null)
const loading = ref(true)
const archiveTarget = ref(null)
const archiving = ref(false)
const archivedQuotes = ref([])
const archivedCount = ref(0)
const showArchives = ref(false)
const loadingArchives = ref(false)
const previewingQuote = ref(null)
const zoomedImageUrl = ref(null)
const showLinkForm = ref(false)
const linkEmail = ref('')
const linkPassword = ref('')
const linking = ref(false)
const linkSuccess = ref(false)
const linkError = ref(null)
const toast = ref(null)

// ── Computed ──
const avgCost = computed(() => {
  if (!quotes.value.length) return 0
  const sum = quotes.value.reduce((a, q) => a + (q.total_cost || 0), 0)
  return sum / quotes.value.length
})

const totalRevenue = computed(() =>
  quotes.value.reduce((a, q) => a + (q.total_cost || 0), 0)
)

const topMaterial = computed(() => {
  if (!quotes.value.length) return ''
  const counts = {}
  quotes.value.forEach(q => { if (q.material) counts[q.material] = (counts[q.material] || 0) + 1 })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
})

// ── RDV computed ──
function isPastRdv(a) { return a.start_at && new Date(a.start_at) < new Date() }

const rdvTabs = computed(() => [
  { id: 'upcoming', label: 'À venir',  count: appointments.value.filter(a => !isPastRdv(a) && a.status === 'active').length },
  { id: 'past',     label: 'Passés',   count: appointments.value.filter(a => isPastRdv(a)   && a.status === 'active').length },
  { id: 'canceled', label: 'Annulés',  count: appointments.value.filter(a => a.status === 'canceled').length },
])

const filteredRdv = computed(() => {
  if (rdvFilter.value === 'upcoming') return appointments.value.filter(a => !isPastRdv(a) && a.status === 'active')
  if (rdvFilter.value === 'past')     return appointments.value.filter(a => isPastRdv(a)   && a.status === 'active')
  return appointments.value.filter(a => a.status === 'canceled')
})

const linkedQuotes = computed(() =>
  quotes.value.filter(q => !q.archived && q.client_email === userEmail.value)
)

const archivedByYear = computed(() => {
  const grouped = {}
  for (const q of archivedQuotes.value) {
    const year = q.created_at ? new Date(q.created_at).getFullYear() : 'Inconnue'
    if (!grouped[year]) grouped[year] = []
    grouped[year].push(q)
  }
  return Object.fromEntries(Object.entries(grouped).sort((a, b) => b[0] - a[0]))
})

// ── Formatters ──
function fmtDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}

function wasEdited(q) {
  if (!q.updated_at || !q.created_at) return false
  return Math.abs(new Date(q.updated_at) - new Date(q.created_at)) > 60_000
}

function statusLabel(status) {
  return { pending: 'En attente', accepted: 'Accepté', refused: 'Refusé', sent: 'Envoyé' }[status] || 'En attente'
}

// ── Data loading ──
async function loadAppointments(email) {
  loadingRdv.value = true
  const { data } = await supabase
    .from('appointments')
    .select('id, event_name, invitee_name, start_at, end_at, status, format, raw')
    .eq('invitee_email', email)
    .order('start_at', { ascending: false })
  appointments.value = (data ?? []).map(a => ({
    ...a,
    format: a.format ?? deriveFormat(a),
  }))
  loadingRdv.value = false
}

async function loadQuotes() {
  loading.value = true
  try {
    const [result, { count }] = await Promise.all([
      getQuotes(),
      supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('archived', true),
    ])
    quotes.value = result ?? []
    archivedCount.value = count ?? 0
  } catch (e) {
    console.error('[Dashboard] loadQuotes error:', e)
    toast.value?.show(`Erreur : ${e?.message || JSON.stringify(e)}`, 'error')
  } finally {
    loading.value = false
  }
}

// ── Realtime ──
let realtimeChannel = null

function setupRealtime(userId) {
  realtimeChannel = supabase
    .channel(`dashboard-quotes-${Date.now()}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'quotes', filter: `user_id=eq.${userId}` },
      (payload) => {
        const idx = quotes.value.findIndex(q => q.id === payload.new.id)
        if (idx !== -1) quotes.value[idx] = { ...quotes.value[idx], ...payload.new }
      }
    )
    .subscribe()
}

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})

// ── Init (équivalent de created()) ──
;(async () => {
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (user) {
    isAnonymous.value = user.is_anonymous ?? false
    userEmail.value = user.email || ''
    const { data: adminRow } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
    isAdminUser.value = !!adminRow
    if (isAnonymous.value) {
      displayName.value = 'Invité'
    } else {
      const meta = user.user_metadata || {}
      const full = meta.full_name || meta.name || ''
      const parts = full.split(' ')
      displayName.value = meta.first_name || parts[0] || user.email?.split('@')[0] || ''
      firstName.value   = meta.first_name || parts[0] || ''
      lastName.value    = meta.last_name  || parts.slice(1).join(' ') || ''
      phone.value       = meta.phone   || ''
      company.value     = meta.company || ''
      memberSince.value = user.created_at
        ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
            .format(new Date(user.created_at))
        : '—'
    }
  }
  const rdvPromise = (!isAnonymous.value && userEmail.value)
    ? loadAppointments(userEmail.value)
    : Promise.resolve()
  await Promise.all([loadQuotes(), rdvPromise])
  if (user) setupRealtime(user.id)  // après loadQuotes — on subscribe depuis un état connu
})()

// ── Actions ──
async function downloadPDF(q) {
  await generateQuotePDF(q)
}

function confirmArchive(q) {
  archiveTarget.value = q
}

async function doArchive() {
  archiving.value = true
  try {
    await archiveQuote(archiveTarget.value.id)
    quotes.value = quotes.value.filter(q => q.id !== archiveTarget.value.id)
    archivedCount.value++
    if (showArchives.value) archivedQuotes.value = await getArchivedQuotes()
    toast.value?.show('Devis archivé.', 'success', 2500)
    archiveTarget.value = null
  } catch {
    toast.value?.show("Erreur lors de l'archivage.", 'error')
  } finally {
    archiving.value = false
  }
}

async function toggleArchives() {
  showArchives.value = !showArchives.value
  if (showArchives.value && archivedQuotes.value.length === 0) {
    loadingArchives.value = true
    try {
      archivedQuotes.value = await getArchivedQuotes()
    } catch {
      toast.value?.show('Erreur chargement archives.', 'error')
    } finally {
      loadingArchives.value = false
    }
  }
}

async function saveProfile() {
  saving.value = true
  const fn   = firstName.value.trim()
  const ln   = lastName.value.trim()
  const full = [fn, ln].filter(Boolean).join(' ')
  const { error } = await supabase.auth.updateUser({
    data: { full_name: full, first_name: fn, last_name: ln, phone: phone.value.trim(), company: company.value.trim() },
  })
  if (!error) {
    const { data } = await supabase.auth.getUser()
    if (data.user) await supabase.from('profiles').update({ full_name: full }).eq('id', data.user.id)
  }
  saving.value = false
  toast.value?.show(error ? 'Erreur lors de la sauvegarde.' : 'Profil mis à jour !', error ? 'error' : 'success')
}

async function savePassword() {
  pwdError.value = null
  if (newPassword.value.length < 8) { pwdError.value = 'Le mot de passe doit contenir au moins 8 caractères.'; return }
  if (newPassword.value !== confirmPwd.value) { pwdError.value = 'Les mots de passe ne correspondent pas.'; return }
  savingPwd.value = true
  const { error } = await supabase.auth.updateUser({ password: newPassword.value })
  savingPwd.value = false
  if (error) { pwdError.value = error.message || 'Erreur lors du changement.' }
  else { newPassword.value = ''; confirmPwd.value = ''; toast.value?.show('Mot de passe modifié !', 'success') }
}

async function logout() {
  await supabase.auth.signOut()
  window.location.href = '/login'
}

async function linkAccount() {
  linking.value = true
  linkError.value = null
  linkSuccess.value = false
  try {
    const { error } = await supabase.auth.updateUser({
      email: linkEmail.value,
      password: linkPassword.value,
    })
    if (error) throw error
    linkSuccess.value = true
    isAnonymous.value = false
  } catch (e) {
    linkError.value = e.message || 'Une erreur est survenue.'
  } finally {
    linking.value = false
  }
}
</script>

<style scoped>
.dash-page {
  background: #f0f4f8;
  padding: 1.75rem 1.75rem 3.5rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Bannière invité ── */
.anon-banner {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1.1rem;
  background: linear-gradient(135deg, #fff7e6, #fff3d6);
  border: 1px solid #f6c05c;
  border-radius: 14px;
  margin-bottom: 1rem;
  font-size: 0.84rem;
  color: #7a5c1a;
}
.anon-banner-icon {
  width: 1.2rem;
  height: 1.2rem;
  flex-shrink: 0;
  color: #d4a017;
}
.anon-banner-text { flex: 1; line-height: 1.5; }
.btn-link-toggle {
  padding: 0.45rem 1rem;
  border: none;
  border-radius: 999px;
  background: #1b2f39;
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;
  transition: opacity 0.2s ease;
}
.btn-link-toggle:hover { opacity: 0.85; }

/* ── Formulaire liaison ── */
.link-form-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.link-form-title {
  font-size: 1rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0 0 0.2rem;
}
.link-form-sub {
  font-size: 0.8rem;
  color: #718096;
  margin: 0 0 1rem;
}
.link-form { display: grid; gap: 0.75rem; }
.link-field { display: grid; gap: 0.3rem; }
.link-field label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #718096;
}
.link-field input {
  border: 1px solid #c8c5c9;
  border-radius: 0.5rem;
  padding: 0.65rem 0.9rem;
  font: inherit;
  font-size: 0.88rem;
  color: #1f1e23;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.link-field input:focus {
  border-color: #2e9cab;
  box-shadow: 0 0 0 3px rgba(46,154,171,0.16);
}
.link-error {
  font-size: 0.8rem;
  color: #c0392b;
  background: rgba(220,53,69,0.07);
  border: 1px solid rgba(220,53,69,0.2);
  padding: 0.5rem 0.75rem;
  border-radius: 0.4rem;
  margin: 0;
}
.link-success {
  font-size: 0.82rem;
  color: #276749;
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  padding: 0.5rem 0.75rem;
  border-radius: 0.4rem;
  margin: 0;
}
.btn-link-submit {
  padding: 0.65rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 12px rgba(46,156,171,0.25);
  transition: filter 0.2s ease;
}
.btn-link-submit:hover:not(:disabled) { filter: brightness(1.07); }
.btn-link-submit:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Trigger mobile dashboard ── */
.dash-trigger-wrap { display: none; }

.dash-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.58rem 0.85rem;
  border-radius: 12px;
  border: 1.5px solid rgba(46,156,171,0.25);
  background: rgba(255,255,255,0.97);
  color: #2e9cab;
  font-size: 0.85rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  box-shadow: 0 2px 8px rgba(46,156,171,0.1);
}
.dash-trigger-icon { width: 1rem; height: 1rem; flex-shrink: 0; }
.dash-trigger-label { flex: 1; }
.dash-trigger-chevron { width: 0.85rem; height: 0.85rem; flex-shrink: 0; transition: transform 0.2s ease; }
.dash-trigger-chevron--open { transform: rotate(180deg); }

/* Bottom sheet client */
.dash-bs-sheet {
  width: 100%;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 0.5rem 0.75rem calc(1.25rem + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -8px 40px rgba(0,0,0,0.18);
}
.dash-bs-handle {
  width: 40px; height: 4px;
  background: #e2e8f0; border-radius: 999px;
  margin: 0.35rem auto 0.85rem;
}
.dash-bs-item {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.65rem 0.75rem; border-radius: 12px;
  color: #4a5568; font-size: 0.88rem; font-weight: 600;
  font-family: inherit; cursor: pointer;
  transition: background 0.15s, color 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.dash-bs-item:hover    { background: #e8f7f9; color: #2e9cab; }
.dash-bs-item--active  { background: #e8f7f9; color: #2e9cab; font-weight: 700; }
.dash-bs-icon  { width: 1rem; height: 1rem; flex-shrink: 0; }
.dash-bs-count {
  margin-left: auto; font-size: 0.65rem; font-weight: 700;
  background: rgba(46,156,171,0.12); color: #2e9cab;
  padding: 0.05rem 0.38rem; border-radius: 999px; flex-shrink: 0;
}

/* ── Tab bar client ── */
.client-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.ctab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  color: #718096;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.ctab-btn:hover { border-color: #2e9cab; color: #2e9cab; }
.ctab-btn--active {
  border-color: #2e9cab;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  box-shadow: 0 3px 10px rgba(46,156,171,0.25);
}
.ctab-icon { width: 0.85rem; height: 0.85rem; flex-shrink: 0; }
.ctab-label-short { display: none; }
.ctab-label-long  { display: inline; }
.ctab-count {
  background: rgba(255,255,255,0.25);
  border-radius: 999px;
  font-size: 0.62rem;
  font-weight: 800;
  padding: 0.05rem 0.38rem;
  line-height: 1.5;
}
.ctab-btn:not(.ctab-btn--active) .ctab-count {
  background: #e8f7f9;
  color: #2e9cab;
}

/* ── Hero ── */
.dash-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.dash-hero-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.dash-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(46,156,171,0.3);
  flex-shrink: 0;
}

.dash-avatar-icon { width: 1.4rem; height: 1.4rem; color: #fff; }

.dash-eyebrow {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #2e9cab;
  margin: 0 0 0.1rem;
}

.dash-greeting {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0;
  letter-spacing: -0.02em;
}

/* ── Bouton nouveau devis ── */
.btn-new {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(46,156,171,0.3);
  transition: filter 0.2s ease, transform 0.2s ease;
  font-family: inherit;
  border: none;
  cursor: pointer;
}
.btn-new:hover { filter: brightness(1.06); transform: translateY(-1px); }
.btn-new--sm { margin-top: 0.75rem; font-size: 0.82rem; }

.btn-new-icon { width: 0.95rem; height: 0.95rem; }

.dash-hero-actions { display: flex; align-items: center; gap: 0.65rem; }

/* CalendarPanel dans le hero — même hauteur que les autres boutons */
.hero-rdv-btn :deep(.cal-btn) {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 999px;
  border: 1.5px solid #e2e8f0;
  background: rgba(255,255,255,0.9);
  color: #718096;
  transition: all 0.2s;
}
.hero-rdv-btn :deep(.cal-btn):hover { border-color: #2e9cab; color: #2e9cab; }
.hero-bell-mobile { display: none; }
@media (max-width: 640px) { .hero-bell-mobile { display: flex; } }
.btn-profile {
  display: inline-flex; align-items: center; justify-content: center;
  width: 2.4rem; height: 2.4rem; border-radius: 999px;
  border: 1.5px solid #e2e8f0; background: rgba(255,255,255,0.9);
  color: #718096; text-decoration: none; transition: all 0.2s;
}
.btn-profile:hover { border-color: #2e9cab; color: #2e9cab; }
.btn-profile-icon { width: 1rem; height: 1rem; }

/* ── Stats ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.stat-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #a0aec0;
  flex-shrink: 0;
}
.stat-icon--teal   { color: #2e9cab; }
.stat-icon--amber  { color: #d69e2e; }
.stat-icon--purple { color: #805ad5; }

.stat-value {
  font-size: 1.2rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0 0 0.1rem;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: #a0aec0;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Carte des devis ── */
.quotes-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  overflow: hidden;
}

.quotes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f4f8;
}

.quotes-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.qh-icon { width: 0.85rem; height: 0.85rem; color: #2e9cab; flex-shrink: 0; }

.quotes-count {
  font-size: 0.72rem;
  font-weight: 700;
  color: #a0aec0;
  background: #f0f4f8;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

/* ── Empty / Loading ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem 1.5rem;
  color: #a0aec0;
  text-align: center;
}

.empty-icon { width: 2.5rem; height: 2.5rem; color: #cbd5e0; }

.empty-title { font-size: 0.95rem; font-weight: 700; color: #4a5568; margin: 0; }
.empty-sub   { font-size: 0.8rem; color: #a0aec0; margin: 0; }

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e2e8f0;
  border-top-color: #2e9cab;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Table ── */
.quotes-table-wrap { overflow-x: auto; }

.quotes-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.quotes-table thead th {
  padding: 0.6rem 0.85rem;
  text-align: left;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #a0aec0;
  background: #f7f9fc;
  border-bottom: 1px solid #e2e8f0;
}

.quotes-table tbody tr {
  border-bottom: 1px solid #f0f4f8;
  transition: background 0.15s ease;
}
.quotes-table tbody tr:last-child { border-bottom: none; }
.quotes-table tbody tr:hover { background: #f8fffe; }

.quotes-table td {
  padding: 0.75rem 0.85rem;
  color: #2d3748;
  font-weight: 600;
  vertical-align: middle;
}

.td-num    { font-family: 'Courier New', monospace; font-size: 0.75rem; color: #718096; white-space: nowrap; }
.td-name   { font-weight: 700; color: #1b2f39; }
.td-client { color: #718096; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
.td-center { text-align: center; }
.td-total  { font-weight: 800; color: #2e9cab; white-space: nowrap; }
.td-date   { color: #a0aec0; font-size: 0.78rem; white-space: nowrap; }
.th-photo  { width: 52px; text-align: center; }
.td-photo  { text-align: center; vertical-align: middle; padding: 0.3rem 0.4rem; }
.ref-thumb {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  display: block;
  margin: 0 auto;
  cursor: zoom-in;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s;
}
.ref-thumb:hover {
  transform: scale(1.8);
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
  z-index: 10;
  position: relative;
  border-color: #2e9cab;
}
.ref-thumb-card { cursor: zoom-in; }
.ref-thumb-empty {
  display: block;
  width: 28px;
  height: 28px;
  margin: 0 auto;
  border-radius: 6px;
  background: #f0f4f8;
  border: 1.5px dashed #cbd5e0;
}
.date-edited {
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
.td-actions{ text-align: right; }

.mat-tag {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  background: rgba(46,156,171,0.1);
  color: #1f7f97;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
}
.status-pending  { background: #fffaf0; color: #d69e2e; border: 1px solid #f6e05e; }
.status-accepted { background: #f0fff4; color: #276749; border: 1px solid #9ae6b4; }
.status-refused  { background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; }
.status-sent     { background: #ebf8ff; color: #2b6cb0; border: 1px solid #90cdf4; }

/* ── Boutons d'action ── */
.btn-preview, .btn-pdf, .btn-archive {
  width: 1.9rem;
  height: 1.9rem;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e0;
  transition: background 0.15s ease, color 0.15s ease;
  font-family: inherit;
}
.btn-preview:hover  { background: #e8f7f9; color: #2e9cab; }
.btn-pdf:hover      { background: #ebf8ff; color: #2e9cab; }
.btn-archive:hover  { background: #fffbeb; color: #d97706; }
.del-icon { width: 0.9rem; height: 0.9rem; }
.td-actions { text-align: right; display: flex; justify-content: flex-end; align-items: center; gap: 0.2rem; }

/* ── Bouton Payer ── */
.btn-pay-quote {
  width: 1.9rem;
  height: 1.9rem;
  border: none;
  background: none;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #9f7aea;
  transition: background 0.15s ease, color 0.15s ease;
  text-decoration: none;
}
.btn-pay-quote:hover { background: #faf5ff; color: #7c3aed; }

/* ── Modal suppression ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-box {
  background: #fff;
  border-radius: 20px;
  padding: 2rem;
  max-width: 380px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
}

.modal-icon-wrap {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 999px;
  background: #fff5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
}
.modal-icon { width: 1.4rem; height: 1.4rem; color: #e53e3e; }

.modal-title { font-size: 1.05rem; font-weight: 800; color: #1b2f39; margin: 0; }
.modal-sub   { font-size: 0.82rem; color: #718096; margin: 0; line-height: 1.5; }

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
  width: 100%;
}

.btn-cancel {
  flex: 1;
  padding: 0.6rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #718096;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s ease;
}
.btn-cancel:hover { border-color: #cbd5e0; }

.modal-icon-wrap--archive { background: #fffbeb !important; }
.modal-icon--archive { color: #d97706 !important; }

.btn-confirm-archive {
  flex: 1;
  padding: 0.6rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(180deg, #fbbf24 0%, #d97706 100%);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 12px rgba(217,119,6,0.3);
  transition: filter 0.15s ease;
}
.btn-confirm-archive:hover:not(:disabled) { filter: brightness(1.06); }
.btn-confirm-archive:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Archives ── */
.archives-block {
  margin-top: 1rem;
}
.btn-archives-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1.25rem;
  border: 1.5px dashed #cbd5e0;
  border-radius: 14px;
  background: #f7f9fc;
  color: #718096;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.btn-archives-toggle:hover { border-color: #d97706; color: #d97706; background: #fffbeb; }
.chevron { transition: transform 0.25s ease; flex-shrink: 0; margin-left: auto; }
.chevron--open { transform: rotate(180deg); }

.archives-content {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 0 0 14px 14px;
  border-top: none;
  overflow: hidden;
}
.archive-year-block { border-bottom: 1px solid #f0f4f8; }
.archive-year-block:last-child { border-bottom: none; }
.archive-year-label {
  padding: 0.55rem 1.25rem 0.3rem;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #a0aec0;
  background: #f7f9fc;
  border-bottom: 1px solid #f0f4f8;
}
.quotes-table--dim tbody tr { opacity: 0.72; }
.quotes-table--dim tbody tr:hover { opacity: 1; background: #fffbeb; }
.dqcard--dim { opacity: 0.72; }

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

/* ── Transition modal ── */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .modal-box, .modal-leave-active .modal-box { transition: transform 0.2s ease; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.94) translateY(8px); }

/* ═══════════════════════════════════════════════════════════════════
   LISTE DES DEVIS — Responsive
   ≥ 641px : tableau (dq-table-view visible, dq-cards-view caché)
   ≤ 640px : cartes (dq-cards-view visible, dq-table-view caché)
═══════════════════════════════════════════════════════════════════ */
.dq-table-view { display: block; overflow-x: auto; }
.dq-cards-view { display: none; }

/* ── Section Mes rendez-vous ── */
.rdv-section-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  overflow: hidden;
}

.rdv-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f4f8;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.rdv-section-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.rdv-section-icon {
  width: 1rem;
  height: 1rem;
  color: #2e9cab;
  flex-shrink: 0;
}

.rdv-section-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #1b2f39;
  margin: 0;
}

.rdv-tabs { display: flex; gap: 0.3rem; flex-wrap: wrap; }

.rdv-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.28rem 0.65rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  color: #718096;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}
.rdv-tab:hover { border-color: #2e9cab; color: #2e9cab; }
.rdv-tab--active { border-color: #2e9cab; background: #e8f7f9; color: #1f7f97; }

.rdv-tab-count {
  background: #2e9cab;
  color: #fff;
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 0.05rem 0.32rem;
  line-height: 1.5;
}

.rdv-time { display: block; font-size: 0.82rem; font-weight: 700; color: #2e9cab; }
.rdv-dur  { display: block; font-size: 0.68rem; color: #a0aec0; margin-top: 1px; }

.td-rdv-obj {
  font-size: 0.78rem;
  color: #4a5568;
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.td-rdv-devis { white-space: nowrap; }
.rdv-none { color: #a0aec0; font-size: 0.72rem; }

.rdv-fmt-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.18rem 0.55rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;
}
.rdv-fmt-badge--online   { background: #ebf8ff; color: #2b6cb0; border: 1px solid #90cdf4; }
.rdv-fmt-badge--inperson { background: #f0fff4; color: #276749; border: 1px solid #9ae6b4; }

.tr--rdv-canceled td { opacity: 0.5; }

/* ── Profil inline ── */
.profile-inline {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  overflow: hidden;
}
.pi-infobar { display: flex; background: #f7f9fc; border-bottom: 1px solid #f0f4f8; }
.pi-meta-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; padding: 0.55rem 1.25rem; flex: 1;
  border-right: 1px solid #f0f4f8;
}
.pi-meta-row:last-child { border-right: none; }
.pi-meta-label { font-size: 0.7rem; font-weight: 700; color: #a0aec0; white-space: nowrap; }
.pi-meta-val   { font-size: 0.78rem; font-weight: 600; color: #2d3748; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pi-cols { display: grid; grid-template-columns: 1fr 1fr; }
.pi-col {
  display: flex; flex-direction: column; gap: 0.85rem;
  padding: 1.25rem; border-right: 1px solid #f0f4f8;
}
.pi-col:last-child { border-right: none; }
.pi-col-title {
  font-size: 0.68rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.07em; color: #a0aec0; margin: 0;
  display: flex; align-items: center; gap: 0.35rem;
}
.pi-col-icon { width: 0.75rem; height: 0.75rem; }
.pi-field { display: flex; flex-direction: column; gap: 0.25rem; }
.pi-label { font-size: 0.72rem; font-weight: 700; color: #4a5568; }
.pi-input {
  border: 1.5px solid #e2e8f0; border-radius: 8px;
  padding: 0.5rem 0.75rem; font-size: 0.85rem;
  color: #1b2f39; font-family: inherit; background: #fff;
  outline: none; transition: border-color 0.2s;
}
.pi-input:focus { border-color: #2e9cab; box-shadow: 0 0 0 3px rgba(46,154,171,0.12); }
.pi-error {
  font-size: 0.8rem; color: #c0392b;
  background: rgba(220,53,69,0.07); border: 1px solid rgba(220,53,69,0.2);
  border-radius: 8px; padding: 0.5rem 0.75rem; margin: 0;
}
.pi-btn-save {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.55rem 1.1rem; border: none; border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 12px rgba(46,156,171,0.28);
  transition: filter 0.2s; align-self: flex-start;
}
.pi-btn-save:disabled { opacity: 0.65; cursor: not-allowed; }
.pi-btn-save:hover:not(:disabled) { filter: brightness(1.07); }
.pi-btn-outline {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0.55rem 1.1rem; border: 1.5px solid #2e9cab; border-radius: 999px;
  background: transparent; color: #2e9cab; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: background 0.2s;
}
.pi-btn-outline:hover:not(:disabled) { background: #e8f7f9; }
.pi-btn-outline:disabled { opacity: 0.65; cursor: not-allowed; }
.pi-btn-logout {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 1.1rem; border: 1.5px solid #e2e8f0; border-radius: 999px;
  background: transparent; color: #718096; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.2s;
}
.pi-btn-logout:hover { border-color: #e53e3e; color: #e53e3e; background: #fff5f5; }
.pi-btn-icon { width: 0.85rem; height: 0.85rem; }

/* Tablette : padding bas pour la nav island */
@media (max-width: 900px) and (min-width: 641px) {
  .dash-page { padding-bottom: 5rem; }
}

/* Tablette portrait (641–760px) : masque Matière + Date dans le tableau */
@media (min-width: 641px) and (max-width: 760px) {
  .quotes-table thead th:nth-child(4),
  .quotes-table td:nth-child(4),
  .quotes-table thead th:nth-child(7),
  .quotes-table td:nth-child(7) { display: none; }
}

/* Mobile (≤ 640px) : cartes à la place du tableau */
@media (max-width: 640px) {
  .dash-page {
    padding: 1.25rem 1rem 5rem;
    min-height: 100dvh;
    gap: 1rem;
  }
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.65rem;
  }
  .stat-card { padding: 0.9rem 0.85rem; gap: 0.6rem; }
  .dash-greeting { font-size: 1.05rem; }
  /* Hero reste sur une ligne */
  .dash-hero {
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;
    gap: 0.5rem;
  }
  .dash-hero-left { flex: 1; min-width: 0; }
  .dash-hero-actions { width: auto; flex-shrink: 0; gap: 0.4rem; }
  /* btn-new → icône ronde */
  .btn-new-text { display: none; }
  .btn-new {
    width: 2.4rem; height: 2.4rem;
    padding: 0; border-radius: 50%; gap: 0;
    justify-content: center;
  }
  .btn-new-icon { width: 1.05rem; height: 1.05rem; }
  /* Mobile : cacher les pills, afficher le trigger */
  .client-tabs { display: none; }
  .dash-trigger-wrap { display: block; }
  .anon-banner { flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.75rem; }
  .btn-link-toggle { width: 100%; }

  /* Bascule tableau → cartes */
  .dq-table-view { display: none; }
  .dq-cards-view {
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0.75rem 0.75rem;
    gap: 0;
  }

  /* Carte individuelle */
  .dqcard {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    padding: 0.9rem 0.25rem;
    border-bottom: 1px solid #f0f4f8;
  }
  .dqcard:last-child { border-bottom: none; }

  /* Ligne 1 : pièce + numéro / badge statut */
  .dqcard-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .dqcard-left { flex: 1; min-width: 0; }
  .dqcard-top-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.35rem; flex-shrink: 0; }
  .ref-thumb-card {
    width: 42px; height: 42px; object-fit: cover;
    border-radius: 8px; border: 1.5px solid #e2e8f0;
  }
  .dqcard-name {
    font-size: 0.95rem;
    font-weight: 700;
    color: #1b2f39;
    margin: 0 0 0.12rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dqcard-num {
    font-size: 0.7rem;
    font-family: 'Courier New', monospace;
    color: #a0aec0;
    margin: 0;
  }

  /* Ligne 2 : date + montant */
  .dqcard-mid {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 0.4rem;
    border-top: 1px solid #f0f4f8;
  }
  .dqcard-date  { font-size: 0.78rem; color: #718096; }
  .dqcard-total { font-size: 1rem; font-weight: 800; color: #2e9cab; }

  /* Ligne 3 : boutons d'action */
  .dqcard-foot { display: flex; gap: 0.5rem; justify-content: flex-end; }
  .dqcard-btn  { width: 38px !important; height: 38px !important; border-radius: 10px !important; }
  .dqcard--dim { opacity: 0.75; }
  .archives-block { margin-top: 0.75rem; }
  .btn-archives-toggle { padding: 0.7rem 1rem; font-size: 0.78rem; }

  /* ── Profil mobile ── */
  .profile-inline { margin-top: 0; }
  .pi-infobar { flex-direction: column; }
  .pi-meta-row { border-right: none; border-bottom: 1px solid #f0f4f8; }
  .pi-meta-row:last-child { border-bottom: none; }
  .pi-cols { grid-template-columns: 1fr; }
  .pi-col { border-right: none; border-bottom: 1px solid #f0f4f8; }
  .pi-col:last-child { border-bottom: none; }
  .pi-btn-save, .pi-btn-outline, .pi-btn-logout { width: 100%; justify-content: center; align-self: stretch; }

  /* ── RDV mobile cards ── */
  .rdv-section-card { margin-top: 0.75rem; }
  .rdv-section-header { padding: 0.85rem 1rem; }
  .rdv-mcard {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    padding: 0.9rem 0.25rem;
    border-bottom: 1px solid #f0f4f8;
  }
  .rdv-mcard:last-child { border-bottom: none; }
  .rdv-mcard--canceled { opacity: 0.55; }
  .rdv-mcard-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .rdv-mcard-date {
    font-size: 0.88rem;
    font-weight: 700;
    color: #1b2f39;
    margin: 0 0 0.1rem;
  }
  .rdv-mcard-time {
    font-size: 0.75rem;
    color: #2e9cab;
    font-weight: 600;
    margin: 0;
  }
  .rdv-mcard-obj {
    font-size: 0.78rem;
    color: #4a5568;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .rdv-mcard-devis { display: flex; flex-wrap: wrap; gap: 0.3rem; }
}
</style>

<style>
/* ── Bottom sheet overlay client (global — Teleport to body) ── */
.bs-overlay {
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(15,23,42,0.45);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  display: flex; align-items: flex-end;
}
.bs-enter-active { transition: opacity 0.22s ease; }
.bs-leave-active { transition: opacity 0.18s ease; }
.bs-enter-from, .bs-leave-to { opacity: 0; }
.bs-enter-active .dash-bs-sheet { transition: transform 0.32s cubic-bezier(0.34,1.1,0.64,1); }
.bs-leave-active  .dash-bs-sheet { transition: transform 0.2s ease; }
.bs-enter-from .dash-bs-sheet, .bs-leave-to .dash-bs-sheet { transform: translateY(100%); }
</style>
