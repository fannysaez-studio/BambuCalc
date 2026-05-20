<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Save, FileText, Clock, CheckCircle2, Download, Shield, TrendingUp, LogOut } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import PasswordField from '@/components/ui/PasswordField.vue'
import ToastMessage from '@/components/ui/ToastMessage.vue'
import { generateQuotePDF } from '@/utils/generateQuotePDF'

const router = useRouter()

const toast     = ref(null)
const loading   = ref(true)
const saving    = ref(false)
const savingPwd = ref(false)

const email       = ref('')
const firstName   = ref('')
const lastName    = ref('')
const memberSince = ref('')
const isAnonymous = ref(false)

const phone   = ref('')
const company = ref('')

const quotes        = ref([])
const newPassword   = ref('')
const confirmPwd    = ref('')
const pwdError      = ref(null)
const quotesPage    = ref(1)
const quotesPerPage = 5

const fullName = computed(() =>
  [firstName.value, lastName.value].filter(Boolean).join(' ') || '—'
)
const initials = computed(() => {
  const f = firstName.value?.[0]?.toUpperCase() || ''
  const l = lastName.value?.[0]?.toUpperCase() || ''
  return f + l || '?'
})
const roleLabel = computed(() => isAnonymous.value ? 'Invité' : 'Client')

const totalQuotes    = computed(() => quotes.value.length)
const pendingQuotes  = computed(() => quotes.value.filter(q => !q.status || q.status === 'pending').length)
const acceptedQuotes = computed(() => quotes.value.filter(q => q.status === 'accepted').length)
const totalRevenue   = computed(() => quotes.value.reduce((s, q) => s + (q.total_cost || 0), 0))
const totalProfilePages = computed(() => Math.max(1, Math.ceil(quotes.value.length / quotesPerPage)))
const paginatedQuotes = computed(() => {
  const start = (quotesPage.value - 1) * quotesPerPage
  return quotes.value.slice(start, start + quotesPerPage)
})

let _scrollLock = null

onMounted(async () => {
  _scrollLock = () => {
    document.body.style.overflowY = window.innerWidth > 900 ? 'hidden' : ''
  }
  _scrollLock()
  window.addEventListener('resize', _scrollLock)

  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (!user) { router.push('/login'); return }

  email.value       = user.email || ''
  isAnonymous.value = user.is_anonymous ?? false
  memberSince.value = user.created_at
    ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(user.created_at))
    : '—'

  const meta  = user.user_metadata || {}
  const full  = meta.full_name || meta.name || ''
  const parts = full.split(' ')
  firstName.value = meta.first_name || parts[0] || ''
  lastName.value  = meta.last_name  || parts.slice(1).join(' ') || ''
  phone.value     = meta.phone     || ''
  company.value   = meta.company   || ''

  const { data: qData } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false })
  quotes.value = qData ?? []

  loading.value = false
})

onBeforeUnmount(() => {
  document.body.style.overflowY = ''
  if (_scrollLock) window.removeEventListener('resize', _scrollLock)
})

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
    if (data.user) {
      await supabase.from('profiles').update({ full_name: full }).eq('id', data.user.id)
    }
  }
  saving.value = false
  toast.value?.show(error ? 'Erreur lors de la sauvegarde.' : 'Profil mis à jour !', error ? 'error' : 'success')
}

async function savePassword() {
  pwdError.value = null
  if (newPassword.value.length < 8) {
    pwdError.value = 'Le mot de passe doit contenir au moins 8 caractères.'
    return
  }
  if (newPassword.value !== confirmPwd.value) {
    pwdError.value = 'Les mots de passe ne correspondent pas.'
    return
  }
  savingPwd.value = true
  const { error } = await supabase.auth.updateUser({ password: newPassword.value })
  savingPwd.value = false
  if (error) {
    pwdError.value = error.message || 'Erreur lors du changement.'
  } else {
    newPassword.value = ''
    confirmPwd.value  = ''
    toast.value?.show('Mot de passe modifié !', 'success')
  }
}

async function logout() {
  await supabase.auth.signOut()
  router.push('/login')
}

function statusLabel(s) {
  return { pending: 'En attente', accepted: 'Accepté', refused: 'Refusé', sent: 'Envoyé' }[s] || 'En attente'
}
function statusCls(s) {
  return { pending: 'st-pending', accepted: 'st-accepted', refused: 'st-refused', sent: 'st-sent' }[s] || 'st-pending'
}
function fmtEur(v) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v ?? 0)
}
function fmtDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}
</script>

<template>
  <div class="pp-page">
    <ToastMessage ref="toast" />

    <!-- ── Master Box (carte centrée, like the calculator wizard) ── -->
    <div class="pp-master">

      <!-- Wave banner spanning full width of the master box -->
      <div class="pp-banner" aria-hidden="true"></div>

      <!-- Nav bar: back button + avatar + identity, overlapping banner -->
      <div class="pp-master-nav">
        <button class="btn-back" @click="router.back()">
          <ArrowLeft class="btn-back-icon" /> Retour
        </button>
        <div class="pp-id-row">
          <div class="pp-avatar">{{ initials }}</div>
          <div class="pp-id-info">
            <p class="pp-eyebrow">Mon profil</p>
            <h2 class="pp-name">{{ fullName }}</h2>
            <span :class="['pp-role', isAnonymous ? 'pp-role--guest' : 'pp-role--client']">{{ roleLabel }}</span>
          </div>
        </div>
      </div>

      <!-- 3-column body -->
      <div class="pp-body">

        <!-- Col 1 : Identité -->
        <div class="pp-col pp-col--identity">
          <p class="pp-col-title">Identité</p>

          <div class="pp-meta">
            <div class="pp-meta-row">
              <span class="pp-meta-label">Email</span>
              <span class="pp-meta-val">{{ email || '—' }}</span>
            </div>
            <div class="pp-meta-row">
              <span class="pp-meta-label">Membre depuis</span>
              <span class="pp-meta-val">{{ memberSince }}</span>
            </div>
          </div>

          <template v-if="!loading">
            <div class="pp-fields-grid">
              <div class="pp-fields-group pp-fields-group--identity">
                <p class="pp-group-label">Identité</p>
                <div class="pp-field">
                  <label class="pp-field-label">Prénom</label>
                  <input class="pp-field-input" v-model="firstName" placeholder="Jean" />
                </div>
                <div class="pp-field">
                  <label class="pp-field-label">Nom</label>
                  <input class="pp-field-input" v-model="lastName" placeholder="Dupont" />
                </div>
              </div>
              <div class="pp-fields-group pp-fields-group--contact">
                <p class="pp-group-label">Contact</p>
                <div class="pp-field">
                  <label class="pp-field-label">Téléphone</label>
                  <input class="pp-field-input" type="tel" v-model="phone" placeholder="+33 6 00 00 00 00" />
                </div>
                <div class="pp-field">
                  <label class="pp-field-label">Entreprise</label>
                  <input class="pp-field-input" type="text" v-model="company" placeholder="Mon Entreprise SAS" />
                </div>
              </div>
            </div>
            <button class="btn-save" @click="saveProfile" :disabled="saving">
              <Save class="btn-icon" /> {{ saving ? 'Sauvegarde…' : 'Sauvegarder le profil' }}
            </button>
          </template>
          <div v-else class="pp-loading"><div class="spinner" /></div>
        </div>

        <!-- Col 2 : Sécurité -->
        <div class="pp-col pp-col--security">
          <p class="pp-col-title"><Shield class="pp-col-icon" /> Sécurité</p>

          <template v-if="!loading">
            <PasswordField id="new-pwd" label="Nouveau mot de passe" :show-strength="true" v-model="newPassword" />
            <PasswordField id="confirm-pwd" label="Confirmer le mot de passe" v-model="confirmPwd" />
            <p v-if="pwdError" class="pp-error">{{ pwdError }}</p>
            <button class="btn-outline" @click="savePassword" :disabled="savingPwd">
              {{ savingPwd ? 'Enregistrement…' : 'Changer le mot de passe' }}
            </button>
            <button class="btn-logout" @click="logout">
              <LogOut class="btn-icon" /> Se déconnecter
            </button>
          </template>
          <div v-else class="pp-loading"><div class="spinner" /></div>
        </div>

        <!-- Col 3 : Stats + Devis -->
        <div class="pp-col pp-col--quotes">

          <!-- Stats 2×2 -->
          <div class="pp-stats">
            <div class="pp-stat">
              <div class="pp-stat-icon pp-stat-icon--teal"><FileText /></div>
              <div>
                <p class="pp-stat-val">{{ totalQuotes }}</p>
                <p class="pp-stat-label">Devis créés</p>
              </div>
            </div>
            <div class="pp-stat">
              <div class="pp-stat-icon pp-stat-icon--amber"><Clock /></div>
              <div>
                <p class="pp-stat-val">{{ pendingQuotes }}</p>
                <p class="pp-stat-label">En attente</p>
              </div>
            </div>
            <div class="pp-stat">
              <div class="pp-stat-icon pp-stat-icon--green"><CheckCircle2 /></div>
              <div>
                <p class="pp-stat-val">{{ acceptedQuotes }}</p>
                <p class="pp-stat-label">Acceptés</p>
              </div>
            </div>
            <div class="pp-stat">
              <div class="pp-stat-icon pp-stat-icon--purple"><TrendingUp /></div>
              <div>
                <p class="pp-stat-val">{{ fmtEur(totalRevenue) }}</p>
                <p class="pp-stat-label">Total généré</p>
              </div>
            </div>
          </div>

          <!-- Table devis -->
          <div class="pp-quotes-card">
            <div class="pp-activity-header">
              <h3 class="pp-activity-title">Mes derniers devis</h3>
              <router-link to="/dashboard" class="pp-activity-link">Voir tout →</router-link>
            </div>

            <div v-if="loading" class="pp-empty">
              <div class="spinner" /><p>Chargement…</p>
            </div>

            <div v-else-if="quotes.length === 0" class="pp-empty">
              <FileText class="pp-empty-icon" />
              <p class="pp-empty-title">Aucun devis pour l'instant</p>
              <router-link to="/calculator/1" class="pp-cta">Créer mon premier devis</router-link>
            </div>

            <div v-else class="pp-qlist-wrap">

              <!-- Tableau — Desktop & Tablette -->
              <div class="pp-qlist-table">
                <table class="pp-table">
                  <thead>
                    <tr>
                      <th>N° Devis</th>
                      <th>Pièce</th>
                      <th class="th-hide-sm">Matière</th>
                      <th>Total TTC</th>
                      <th>Statut</th>
                      <th class="th-hide-sm">Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="q in paginatedQuotes" :key="q.id">
                      <td class="td-num">{{ q.quote_number || '—' }}</td>
                      <td class="td-name">{{ q.project_name || '—' }}</td>
                      <td class="th-hide-sm"><span class="mat-tag">{{ q.material || '—' }}</span></td>
                      <td class="td-total">{{ fmtEur(q.total_cost) }}</td>
                      <td><span :class="['st-badge', statusCls(q.status)]">{{ statusLabel(q.status) }}</span></td>
                      <td class="td-date th-hide-sm">{{ fmtDate(q.created_at) }}</td>
                      <td class="td-actions">
                        <button class="btn-pdf" @click="generateQuotePDF(q)" title="Télécharger PDF">
                          <Download class="action-icon" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Cartes — Mobile uniquement -->
              <div class="pp-qlist-cards">
                <div v-for="q in paginatedQuotes" :key="q.id" class="pqcard">
                  <div class="pqcard-top">
                    <span class="pqcard-name">{{ q.project_name || '—' }}</span>
                    <span :class="['st-badge', statusCls(q.status)]">{{ statusLabel(q.status) }}</span>
                  </div>
                  <div class="pqcard-mid">
                    <span class="pqcard-date">{{ fmtDate(q.created_at) }}</span>
                    <span class="pqcard-total">{{ fmtEur(q.total_cost) }}</span>
                  </div>
                  <div class="pqcard-foot">
                    <button class="btn-pdf pqcard-btn" @click="generateQuotePDF(q)" title="Télécharger PDF">
                      <Download class="action-icon" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <div v-if="totalProfilePages > 1" class="pp-pagination">
              <button class="pp-pag-btn" :disabled="quotesPage === 1" @click="quotesPage--">← Préc.</button>
              <div class="pp-pag-nums">
                <button v-for="p in totalProfilePages" :key="p"
                  :class="['pp-pag-num', quotesPage === p && 'pp-pag-num--active']"
                  @click="quotesPage = p">{{ p }}</button>
              </div>
              <button class="pp-pag-btn" :disabled="quotesPage === totalProfilePages" @click="quotesPage++">Suiv. →</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Page : centrage de la Master Box ── */
.pp-page {
  /* Subtract sticky header height (~4.5rem) so the page fills exactly the
     visible space below the header — master box is then truly centered. */
  height: calc(100dvh - 4.5rem);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f4f8;
  padding: 1.25rem;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
}

/* ── Master Box (la grande carte blanche centrée) ── */
.pp-master {
  width: 100%;
  max-width: 1100px;
  height: calc(100% - 2.5rem); /* relative: fills pp-page minus top+bottom padding */
  background: #fff;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.07);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Wave banner en haut de la Master Box ── */
.pp-banner {
  height: 6.5rem;
  background:
    url('/hero-userDashboard.svg') center / cover no-repeat,
    linear-gradient(135deg, #3fb2bf 0%, #2e9cab 60%, #667eea 100%);
  border-radius: 24px 24px 0 0;
  flex-shrink: 0;
}

/* ── Barre de navigation (avatar chevauche la bannière) ── */
.pp-master-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.5rem 0.85rem;
  margin-top: -1.45rem;
  border-bottom: 1px solid #f0f4f8;
  flex-shrink: 0;
}

.pp-id-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

/* ── Avatar ── */
.pp-avatar {
  width: 3.2rem; height: 3.2rem; border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff; font-size: 1rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(46, 156, 171, 0.3);
  flex-shrink: 0;
  border: 3px solid #fff;
}

.pp-id-info { display: flex; flex-direction: column; gap: 0.1rem; }
.pp-eyebrow {
  font-size: 0.6rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: #2e9cab; margin: 0;
}
.pp-name { font-size: 1rem; font-weight: 800; color: #1b2f39; margin: 0; letter-spacing: -0.02em; }
.pp-role {
  display: inline-block; padding: 0.1rem 0.5rem;
  border-radius: 999px; font-size: 0.65rem; font-weight: 700;
  letter-spacing: 0.04em; text-transform: uppercase;
}
.pp-role--client { background: #e8f7f9; color: #2e9cab; }
.pp-role--guest  { background: #fffaf0; color: #d69e2e; border: 1px solid #f6e05e; }

/* ── Corps 3 colonnes ── */
.pp-body {
  display: grid;
  grid-template-columns: 300px 235px 1fr;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ── Colonne générique ── */
.pp-col {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.25rem 1.3rem;
  overflow-y: auto;
  min-height: 0; /* allow grid item to shrink and overflow-y to trigger */
}
.pp-col--identity { border-right: 1px solid #f0f4f8; }
.pp-col--security { border-right: 1px solid #f0f4f8; }
.pp-col--quotes   { overflow: hidden; padding: 1.1rem 1.25rem; }

/* ── Titre de colonne ── */
.pp-col-title {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.68rem; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.07em; color: #a0aec0; margin: 0;
  flex-shrink: 0;
}
.pp-col-icon { width: 0.78rem; height: 0.78rem; }

/* ── Bloc meta (email, date) ── */
.pp-meta {
  display: flex; flex-direction: column;
  background: #f7f9fc; border-radius: 10px; overflow: hidden; flex-shrink: 0;
}
.pp-meta-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.5rem; padding: 0.45rem 0.7rem;
  border-bottom: 1px solid #f0f4f8;
  overflow: hidden; /* containment for ellipsis */
}
.pp-meta-row:last-child { border-bottom: none; }
.pp-meta-label { font-size: 0.7rem; font-weight: 700; color: #a0aec0; flex-shrink: 0; }
.pp-meta-val   {
  font-size: 0.75rem; font-weight: 600; color: #2d3748; text-align: right;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  min-width: 0; /* required for ellipsis inside flex */
}

/* ── Champs (empilés pour éviter l'overflow horizontal) ── */
.pp-field { display: flex; flex-direction: column; gap: 0.25rem; }
.pp-field-label { font-size: 0.72rem; font-weight: 700; color: #4a5568; }
.pp-field-input {
  border: 1.5px solid #e2e8f0; border-radius: 8px;
  padding: 0.5rem 0.7rem; font-size: 0.85rem;
  color: #1b2f39; font-family: inherit; background: #fff; outline: none;
  transition: border-color 0.2s; width: 100%; box-sizing: border-box;
}
.pp-field-input:focus { border-color: #2e9cab; }

/* ── Erreur ── */
.pp-error {
  font-size: 0.8rem; color: #c0392b;
  background: rgba(220, 53, 69, 0.07); border: 1px solid rgba(220, 53, 69, 0.2);
  border-radius: 8px; padding: 0.5rem 0.75rem; margin: 0;
}

/* ── Boutons ── */
.btn-back {
  display: inline-flex; align-items: center; gap: 0.3rem;
  padding: 0.4rem 0.9rem; border-radius: 999px;
  border: 1.5px solid #e2e8f0; background: #fff;
  color: #718096; font-size: 0.8rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.2s;
  flex-shrink: 0;
}
.btn-back:hover { border-color: #2e9cab; color: #2e9cab; }
.btn-back-icon { width: 0.85rem; height: 0.85rem; }

.btn-save {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.55rem 1.1rem; border: none; border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 12px rgba(46, 156, 171, 0.28); transition: filter 0.2s;
  align-self: flex-start;
}
.btn-save:disabled { opacity: 0.65; cursor: not-allowed; }
.btn-save:hover:not(:disabled) { filter: brightness(1.07); }
.btn-icon { width: 0.85rem; height: 0.85rem; }

.btn-outline {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0.55rem 1.1rem; border: 1.5px solid #2e9cab; border-radius: 999px;
  background: transparent; color: #2e9cab; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: background 0.2s;
}
.btn-outline:hover:not(:disabled) { background: #e8f7f9; }
.btn-outline:disabled { opacity: 0.65; cursor: not-allowed; }

.btn-logout {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 1.1rem; border: 1.5px solid #e2e8f0; border-radius: 999px;
  background: transparent; color: #718096; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.2s;
}
.btn-logout:hover { border-color: #e53e3e; color: #e53e3e; background: #fff5f5; }

/* ── Stats 2×2 ── */
.pp-stats {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem; flex-shrink: 0;
}
.pp-stat {
  background: #f7f9fc; border-radius: 12px; border: 1px solid #f0f4f8;
  padding: 0.8rem 0.9rem; display: flex; align-items: center; gap: 0.6rem;
}
.pp-stat-icon {
  width: 1.9rem; height: 1.9rem; border-radius: 9px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.pp-stat-icon svg { width: 0.95rem; height: 0.95rem; }
.pp-stat-icon--teal   { background: #e8f7f9; color: #2e9cab; }
.pp-stat-icon--amber  { background: #fffaf0; color: #d69e2e; }
.pp-stat-icon--green  { background: #f0fff4; color: #276749; }
.pp-stat-icon--purple { background: #f3f0ff; color: #5a67d8; }
.pp-stat-val   { font-size: 1rem; font-weight: 800; color: #1b2f39; margin: 0 0 0.1rem; letter-spacing: -0.02em; }
.pp-stat-label { font-size: 0.58rem; font-weight: 600; color: #a0aec0; margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }

/* ── Carte devis (col 3, flex:1, scroll interne) ── */
.pp-quotes-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #f0f4f8;
  border-radius: 16px;
}

.pp-activity-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.8rem 1.1rem; border-bottom: 1px solid #f0f4f8;
  flex-shrink: 0;
}
.pp-activity-title { font-size: 0.88rem; font-weight: 800; color: #1b2f39; margin: 0; }
.pp-activity-link  { font-size: 0.75rem; font-weight: 700; color: #2e9cab; text-decoration: none; transition: opacity 0.2s; }
.pp-activity-link:hover { opacity: 0.75; }

/* ── Empty / loading ── */
.pp-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.5rem; padding: 2rem 1.5rem; color: #a0aec0; text-align: center; flex: 1;
}
.pp-empty-icon  { width: 2.2rem; height: 2.2rem; color: #cbd5e0; }
.pp-empty-title { font-size: 0.88rem; font-weight: 700; color: #4a5568; margin: 0; }
.pp-cta {
  margin-top: 0.25rem; padding: 0.45rem 1rem; border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff; font-size: 0.8rem; font-weight: 700;
  text-decoration: none; box-shadow: 0 3px 10px rgba(46, 156, 171, 0.25);
}

/* ── Spinner ── */
.pp-loading { display: flex; justify-content: center; padding: 1rem 0; }
.spinner {
  width: 1.5rem; height: 1.5rem;
  border: 3px solid #e2e8f0; border-top-color: #2e9cab;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Quotes list dual-view (table desktop / cards mobile) ── */
.pp-qlist-wrap  { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
.pp-qlist-table { flex: 1; min-height: 0; overflow-y: auto; overflow-x: auto; }
.pp-qlist-cards { display: none; }

/* ── Carte devis (mobile) ── */
.pqcard {
  display: flex; flex-direction: column; gap: 0.35rem;
  padding: 0.85rem 1.1rem; border-bottom: 1px solid #f0f4f8;
}
.pqcard:last-child { border-bottom: none; }
.pqcard-top {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 0.5rem;
}
.pqcard-name {
  font-size: 0.95rem; font-weight: 800; color: #1b2f39;
  flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.pqcard-mid {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 0.3rem; border-top: 1px solid #f0f4f8;
}
.pqcard-date  { font-size: 0.73rem; color: #a0aec0; }
.pqcard-total { font-size: 1rem; font-weight: 800; color: #2e9cab; }
.pqcard-foot  { display: flex; justify-content: flex-end; padding-top: 0.1rem; }
.pqcard-btn   { width: 2.2rem !important; height: 2.2rem !important; border-radius: 10px !important; }
.pp-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.pp-table thead th {
  padding: 0.5rem 0.8rem; text-align: left;
  font-size: 0.6rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.06em; color: #a0aec0;
  background: #f7f9fc; border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}
.pp-table tbody tr { border-bottom: 1px solid #f0f4f8; transition: background 0.15s; }
.pp-table tbody tr:last-child { border-bottom: none; }
.pp-table tbody tr:hover { background: #f8fffe; }
.pp-table td { padding: 0.6rem 0.8rem; color: #2d3748; font-weight: 600; vertical-align: middle; }

.td-num   { font-family: 'Courier New', monospace; font-size: 0.7rem; color: #718096; }
.td-name  { font-weight: 700; color: #1b2f39; }
.td-total { font-weight: 800; color: #2e9cab; white-space: nowrap; }
.td-date  { color: #a0aec0; font-size: 0.73rem; white-space: nowrap; }
.td-actions { text-align: right; }
.th-hide-sm { }

.mat-tag {
  display: inline-block; padding: 0.1rem 0.45rem;
  background: rgba(46, 156, 171, 0.1); color: #1f7f97;
  border-radius: 999px; font-size: 0.68rem; font-weight: 700;
}
.st-badge {
  display: inline-block; padding: 0.12rem 0.5rem;
  border-radius: 999px; font-size: 0.66rem; font-weight: 700; white-space: nowrap;
}
.st-pending  { background: #fffaf0; color: #d69e2e; border: 1px solid #f6e05e; }
.st-accepted { background: #f0fff4; color: #276749; border: 1px solid #9ae6b4; }
.st-refused  { background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; }
.st-sent     { background: #ebf8ff; color: #2b6cb0; border: 1px solid #90cdf4; }

.btn-pdf {
  width: 1.7rem; height: 1.7rem; border: none; background: none; border-radius: 7px;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  color: #cbd5e0; transition: all 0.15s;
}
.btn-pdf:hover { background: #e8f7f9; color: #2e9cab; }
.action-icon { width: 0.85rem; height: 0.85rem; }

/* ── Pagination ── */
.pp-pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 0.5rem; padding: 0.6rem 1.1rem;
  border-top: 1px solid #f0f4f8; flex-shrink: 0;
}
.pp-pag-btn {
  padding: 0.28rem 0.6rem; border: 1.5px solid #e2e8f0; border-radius: 7px;
  background: #fff; color: #718096; font-size: 0.7rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s; white-space: nowrap;
}
.pp-pag-btn:hover:not(:disabled) { border-color: #2e9cab; color: #2e9cab; }
.pp-pag-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pp-pag-nums { display: flex; gap: 0.2rem; }
.pp-pag-num {
  width: 1.6rem; height: 1.6rem; border: 1.5px solid #e2e8f0; border-radius: 7px;
  background: #fff; color: #718096; font-size: 0.7rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.pp-pag-num:hover { border-color: #2e9cab; color: #2e9cab; }
.pp-pag-num--active { border-color: #2e9cab; background: #e8f7f9; color: #2e9cab; }

/* ═══════════════════════════════════════════════════════════════════
   PROFIL — Responsive
   ≥ 1025px     : 3 colonnes desktop (défaut)
   641 – 1024px : 2 colonnes tablette (identity | security+quotes)
   ≤ 640px      : 1 colonne mobile empilée
═══════════════════════════════════════════════════════════════════ */

/* Champs formulaire : grille par défaut (1 col desktop, surchargé ci-dessous) */
.pp-fields-grid  { display: flex; flex-direction: column; gap: 0.85rem; }
.pp-fields-group { display: flex; flex-direction: column; gap: 0.85rem; }
.pp-group-label  { display: none; }

/* ── Tablette (641px – 1024px) ── */
@media (min-width: 641px) and (max-width: 1024px) {
  .pp-page {
    height: auto;
    min-height: calc(100dvh - 4.5rem);
    overflow: visible;
    padding: 0.75rem;
    align-items: flex-start;
  }
  .pp-master { height: auto; border-radius: 16px; }
  .pp-banner { height: 5rem; border-radius: 16px 16px 0 0; }
  .pp-master-nav { margin-top: -1.2rem; }

  /* Grille 2 colonnes : identity (gauche) | security+quotes (droite empilés) */
  .pp-body {
    display: grid;
    grid-template-columns: 1fr 2fr;
    grid-template-rows: auto auto;
    overflow: visible;
  }
  .pp-col--identity {
    grid-column: 1;
    grid-row: 1 / 3;
    border-right: 1px solid #f0f4f8;
    border-bottom: none;
    overflow-y: visible;
  }
  .pp-col--security {
    grid-column: 2;
    grid-row: 1;
    border-right: none;
    border-bottom: 1px solid #f0f4f8;
    overflow-y: visible;
  }
  .pp-col--quotes {
    grid-column: 2;
    grid-row: 2;
    overflow: visible;
    min-height: 22rem;
  }
  .pp-col         { overflow-y: visible; }
  .pp-quotes-card { min-height: 18rem; }
  .pp-stats       { grid-template-columns: repeat(2, 1fr); }
  .th-hide-sm     { display: none; }

  /* Sous-grille 2 colonnes pour les champs du formulaire */
  .pp-fields-grid  { display: flex; flex-direction: column; gap: 0.75rem; }
  .pp-fields-group { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
}

/* ── Mobile (≤ 640px) ── */
@media (max-width: 640px) {
  /* ─ Layout page ─ */
  .pp-page {
    height: auto;
    min-height: calc(100dvh - 4.5rem);
    overflow: visible;
    padding: 0.5rem;
    align-items: flex-start;
  }
  .pp-master { height: auto; border-radius: 16px; }

  /* ─ En-tête ultra-compact ─ */
  .pp-banner     { height: 3.5rem; border-radius: 16px 16px 0 0; }
  .pp-master-nav { margin-top: -1.5rem; padding: 0 0.85rem 0.85rem; gap: 0.65rem; }
  .pp-avatar     { width: 3.5rem; height: 3.5rem; font-size: 0.95rem; }
  .pp-name       { font-size: 0.95rem; }

  /* ─ Corps : 1 colonne empilée ─ */
  .pp-body { grid-template-columns: 1fr; overflow: visible; }
  .pp-col  { overflow-y: visible; padding: 1rem 0.85rem; gap: 0.75rem; }
  .pp-col--identity,
  .pp-col--security { border-right: none; border-bottom: 1px solid #f0f4f8; }
  .pp-col--quotes   { overflow: visible; min-height: 18rem; padding: 1rem 0.85rem; }
  .pp-quotes-card   { min-height: 16rem; }
  .pp-stats         { grid-template-columns: repeat(2, 1fr); gap: 0.45rem; }
  .th-hide-sm       { display: none; }

  /* ─ Grille hybride de champs ─ */
  .pp-fields-grid { display: flex; flex-direction: column; gap: 0.6rem; }

  /* Chaque groupe = tuile blanche avec grille 2 colonnes (style dashboard) */
  .pp-fields-group {
    background: #fff;
    border: 1px solid #f0f4f8;
    border-radius: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 0.9rem;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.6rem 0.7rem;
  }
  /* Titre de tuile : span toute la largeur */
  .pp-group-label {
    display: block;
    grid-column: 1 / -1;
    font-size: 0.6rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #a0aec0;
    margin: 0 0 0.05rem;
  }
  /* Identité : Prénom | Nom côte à côte (1 col chacun) */
  /* Contact  : champs en pleine largeur */
  .pp-fields-group--contact .pp-field { grid-column: 1 / -1; }

  /* Inputs format app native */
  .pp-field-input { padding: 0.42rem 0.65rem; font-size: 0.82rem; }

  /* ─ Boutons d'action ─ */
  .btn-save    { width: 100%; justify-content: center; align-self: stretch; padding: 0.65rem; }
  .btn-outline { width: 100%; justify-content: center; align-self: stretch; }

  /* Déconnexion : isolée tout en bas */
  .btn-logout  { width: 100%; justify-content: center; align-self: stretch; margin-top: 2rem; }

  /* ─ Section devis : cartes sur mobile ─ */
  .pp-qlist-table { display: none; }
  .pp-qlist-cards {
    display: flex; flex-direction: column;
    flex: 1; min-height: 0; overflow-y: auto;
  }
}
</style>
