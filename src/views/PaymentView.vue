<template>
  <div class="pay-page">

    <!-- Chargement initial -->
    <div v-if="state === 'loading'" class="pay-card">
      <div class="pay-spinner" />
      <p class="pay-loading-text">Préparation du paiement…</p>
    </div>

    <!-- Consentement requis -->
    <div v-else-if="state === 'no-consent'" class="pay-card">
      <div class="pay-consent-icon-wrap">
        <ShieldOff class="pay-consent-icon" />
      </div>
      <h2 class="pay-title">Activez les cookies de paiement</h2>
      <p class="pay-subtitle">
        Stripe, notre prestataire de paiement sécurisé, nécessite votre accord
        pour les cookies tiers. Cliquez sur le bouton ci-dessous pour afficher
        le bandeau de consentement.
      </p>
      <button class="btn-consent" @click="requestConsent">
        Gérer mes préférences cookies
      </button>
      <router-link to="/dashboard" class="pay-back-link">← Retour au tableau de bord</router-link>
    </div>

    <!-- Erreur -->
    <div v-else-if="state === 'error'" class="pay-card pay-card--error">
      <div class="pay-error-icon-wrap">
        <AlertCircle class="pay-error-icon" />
      </div>
      <h2 class="pay-title">Une erreur est survenue</h2>
      <p class="pay-error-msg">{{ errorMessage }}</p>
      <div class="pay-error-actions">
        <button class="btn-retry" @click="init">Réessayer</button>
        <router-link to="/dashboard" class="pay-back-link">Retour au tableau de bord</router-link>
      </div>
    </div>

    <!-- Paiement confirmé -->
    <div v-else-if="state === 'success'" class="pay-card pay-card--success">
      <div class="pay-success-icon-wrap">
        <CheckCircle class="pay-success-icon" />
      </div>
      <h2 class="pay-title">Paiement confirmé !</h2>
      <p class="pay-subtitle">
        Votre paiement a bien été enregistré. Un récapitulatif vous sera envoyé par email.
      </p>
      <router-link to="/dashboard" class="btn-pay btn-pay--success">
        Retour au tableau de bord
      </router-link>
    </div>

    <!-- Formulaire de paiement -->
    <div v-else-if="state === 'ready' || state === 'paying'" class="pay-card">

      <!-- En-tête -->
      <div class="pay-header">
        <div class="pay-header-icon-wrap">
          <CreditCard class="pay-header-icon" />
        </div>
        <div>
          <h2 class="pay-title pay-title--inline">Paiement sécurisé</h2>
          <p class="pay-subtitle pay-subtitle--sm">Traité par Stripe</p>
        </div>
      </div>

      <!-- Récapitulatif du devis -->
      <div class="pay-summary">
        <div class="pay-summary-row">
          <span class="pay-summary-label">Devis</span>
          <span class="pay-summary-value">{{ quote.quote_number || '—' }}</span>
        </div>
        <div class="pay-summary-row">
          <span class="pay-summary-label">Projet</span>
          <span class="pay-summary-value">{{ quote.project_name || '—' }}</span>
        </div>
        <div class="pay-summary-divider" />
        <div class="pay-summary-row pay-summary-row--total">
          <span class="pay-summary-label">Total TTC</span>
          <span class="pay-summary-value pay-summary-total">{{ fmtEur(quote.total_cost) }}</span>
        </div>
      </div>

      <!-- Stripe Payment Element -->
      <div class="pay-elements-wrap">
        <div id="payment-element" class="pay-element" />
      </div>

      <!-- Message d'erreur Stripe inline -->
      <p v-if="payError" class="pay-inline-error">{{ payError }}</p>

      <!-- Bouton de paiement -->
      <button
        class="btn-pay"
        :disabled="state === 'paying'"
        @click="submitPayment"
      >
        <span v-if="state === 'paying'" class="pay-spinner pay-spinner--sm" />
        <span v-else>
          <Lock class="btn-pay-icon" />
          Payer {{ fmtEur(quote.total_cost) }}
        </span>
      </button>

      <!-- Note de sécurité -->
      <p class="pay-security-note">
        <Shield class="pay-security-icon" />
        Paiement chiffré · Données jamais stockées sur nos serveurs
      </p>

      <router-link to="/dashboard" class="pay-back-link pay-back-link--center">
        ← Annuler et retourner au tableau de bord
      </router-link>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ShieldOff, AlertCircle, CheckCircle, CreditCard, Lock, Shield } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import { loadStripeConditionally, hasStripeConsent } from '@/utils/stripe'

const route  = useRoute()
const router = useRouter()

// ── State machine ─────────────────────────────────────────────────────────────
// 'loading' | 'no-consent' | 'ready' | 'paying' | 'success' | 'error'
const state        = ref('loading')
const quote        = ref(null)
const errorMessage = ref('')
const payError     = ref('')

// Stripe internals — non-reactive intentionally (DOM refs managed by Stripe SDK)
let stripeInstance = null
let elements       = null
let paymentElement = null

// ── Formatage ─────────────────────────────────────────────────────────────────
function fmtEur(n) {
  if (n == null) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

// ── Récupère le JWT de la session active ──────────────────────────────────────
async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Session expirée — reconnectez-vous.')
  return session.access_token
}

// ── Flux d'initialisation ─────────────────────────────────────────────────────
async function init() {
  state.value        = 'loading'
  errorMessage.value = ''
  payError.value     = ''

  // Détruire l'ancienne instance Stripe si on réessaie
  paymentElement?.destroy()
  paymentElement = null
  elements       = null

  // 1. Vérifier le consentement AVANT de charger quoi que ce soit Stripe
  if (!hasStripeConsent()) {
    state.value = 'no-consent'
    return
  }

  try {
    // 2. Charger les données du devis depuis Supabase (affichage uniquement)
    //    Le montant réel sera lu côté serveur dans la Edge Function
    const quoteId = route.params.quoteId
    if (!quoteId) throw new Error('Identifiant de devis manquant.')

    const { data: quoteData, error: quoteError } = await supabase
      .from('quotes')
      .select('id, quote_number, project_name, total_cost, payment_status')
      .eq('id', quoteId)
      .single()

    if (quoteError || !quoteData) throw new Error('Devis introuvable ou accès refusé.')

    // Devis déjà payé — pas besoin d'afficher le formulaire
    if (quoteData.payment_status === 'paid') {
      state.value = 'success'
      return
    }

    quote.value = quoteData

    // 3. Charger Stripe.js (import dynamique conditionnel, singleton)
    stripeInstance = await loadStripeConditionally()
    if (!stripeInstance) {
      // Le consentement a peut-être été révoqué entre la vérification et ici
      state.value = 'no-consent'
      return
    }

    // 4. Créer le PaymentIntent via Edge Function
    //    SÉCURITÉ : le montant est lu depuis la BDD côté serveur, jamais du frontend
    const token = await getAccessToken()
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
      {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey':        import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ quoteId }),
      }
    )

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `Erreur serveur (HTTP ${res.status})`)
    }

    const { clientSecret } = await res.json()

    // 5. Monter Stripe Elements avec le clientSecret reçu du serveur
    elements = stripeInstance.elements({
      clientSecret,
      locale: 'fr',
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary:       '#7c3aed',
          colorBackground:    '#ffffff',
          colorText:          '#1a202c',
          colorDanger:        '#e53e3e',
          fontFamily:         'Inter, system-ui, sans-serif',
          borderRadius:       '10px',
          fontSizeBase:       '14px',
        },
      },
    })

    paymentElement = elements.create('payment', {
      layout: 'tabs',
    })

    // Rendre le DOM disponible avant de monter l'élément
    state.value = 'ready'
    await nextTick()
    paymentElement.mount('#payment-element')

  } catch (err) {
    console.error('[PaymentView] Erreur d\'initialisation :', err)
    errorMessage.value = err.message || 'Erreur inattendue. Veuillez réessayer.'
    state.value = 'error'
  }
}

// ── Soumission du paiement ────────────────────────────────────────────────────
async function submitPayment() {
  if (state.value === 'paying' || !stripeInstance || !elements) return
  state.value    = 'paying'
  payError.value = ''

  const { error } = await stripeInstance.confirmPayment({
    elements,
    confirmParams: {
      // URL de retour après redirect 3DS (si nécessaire)
      return_url: `${window.location.origin}/dashboard`,
    },
    // 'if_required' : pas de redirect pour les paiements carte sans 3DS
    redirect: 'if_required',
  })

  if (error) {
    // Erreur de validation Stripe (carte invalide, fonds insuffisants, etc.)
    payError.value = error.message
    state.value    = 'ready'
    return
  }

  // Paiement réussi sans redirect (ex: carte sans 3DS)
  // Le webhook Stripe mettra à jour payment_status côté BDD de façon asynchrone
  state.value = 'success'
}

// ── Gestion du consentement ───────────────────────────────────────────────────
function requestConsent() {
  // Demande au CookieBanner de se ré-afficher
  // CookieBanner.vue écoute cet événement (voir ce composant)
  window.dispatchEvent(new CustomEvent('show-cookie-banner'))
}

function onConsentUpdated({ detail }) {
  if (detail.level === 'all' && state.value === 'no-consent') {
    init()
  }
}

// ── Cycle de vie ──────────────────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener('cookie-consent', onConsentUpdated)
  init()
})

onBeforeUnmount(() => {
  window.removeEventListener('cookie-consent', onConsentUpdated)
  paymentElement?.destroy()
})
</script>

<style scoped>
/* ── Page wrapper ─────────────────────────────────────────────────────────── */
.pay-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  padding: 2rem 1rem;
}

/* ── Carte principale ─────────────────────────────────────────────────────── */
.pay-card {
  background: #fff;
  border: 1px solid #e8edf3;
  border-radius: 20px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.pay-card--error  { border-color: #fed7d7; }
.pay-card--success { border-color: #c6f6d5; }

/* ── En-tête formulaire ──────────────────────────────────────────────────── */
.pay-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  margin-bottom: 0.25rem;
}

.pay-header-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #9f7aea, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pay-header-icon {
  width: 22px;
  height: 22px;
  color: #fff;
}

/* ── Titres ──────────────────────────────────────────────────────────────── */
.pay-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1a202c;
  text-align: center;
  margin: 0;
  line-height: 1.3;
}

.pay-title--inline { text-align: left; }

.pay-subtitle {
  font-size: 0.875rem;
  color: #718096;
  text-align: center;
  line-height: 1.6;
  margin: 0;
  max-width: 380px;
}

.pay-subtitle--sm { font-size: 0.8rem; }

/* ── Spinner ─────────────────────────────────────────────────────────────── */
.pay-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.pay-spinner--sm {
  width: 18px;
  height: 18px;
  border-width: 2px;
  display: inline-block;
  margin: 0;
}

.pay-loading-text {
  font-size: 0.9rem;
  color: #718096;
  margin: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Icônes état ─────────────────────────────────────────────────────────── */
.pay-consent-icon-wrap,
.pay-error-icon-wrap,
.pay-success-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pay-consent-icon-wrap { background: #faf5ff; }
.pay-error-icon-wrap   { background: #fff5f5; }
.pay-success-icon-wrap { background: #f0fff4; }

.pay-consent-icon { width: 32px; height: 32px; color: #7c3aed; }
.pay-error-icon   { width: 32px; height: 32px; color: #e53e3e; }
.pay-success-icon { width: 32px; height: 32px; color: #38a169; }

/* ── Récapitulatif devis ─────────────────────────────────────────────────── */
.pay-summary {
  width: 100%;
  background: #f7f9fc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.pay-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.pay-summary-row--total { margin-top: 0.2rem; }

.pay-summary-label { color: #718096; }

.pay-summary-value { color: #1a202c; font-weight: 600; }

.pay-summary-total {
  font-size: 1.1rem;
  font-weight: 800;
  color: #7c3aed;
}

.pay-summary-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0.25rem 0;
}

/* ── Stripe Elements container ───────────────────────────────────────────── */
.pay-elements-wrap {
  width: 100%;
}

.pay-element {
  width: 100%;
  min-height: 100px;
}

/* ── Erreur inline Stripe ────────────────────────────────────────────────── */
.pay-inline-error {
  font-size: 0.82rem;
  color: #e53e3e;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
  width: 100%;
  text-align: center;
  margin: 0;
}

.pay-error-msg {
  font-size: 0.875rem;
  color: #c53030;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  width: 100%;
  text-align: center;
  margin: 0;
}

/* ── Boutons ─────────────────────────────────────────────────────────────── */
.btn-pay {
  width: 100%;
  padding: 0.9rem 1.5rem;
  background: linear-gradient(135deg, #9f7aea 0%, #7c3aed 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
  transition: filter 0.15s ease, transform 0.1s ease;
  font-family: inherit;
}

.btn-pay:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
.btn-pay:active:not(:disabled) { transform: translateY(0); }
.btn-pay:disabled { opacity: 0.65; cursor: not-allowed; }

.btn-pay--success {
  background: linear-gradient(135deg, #68d391 0%, #38a169 100%);
  box-shadow: 0 4px 16px rgba(56, 161, 105, 0.3);
  text-decoration: none;
}

.btn-pay-icon { width: 18px; height: 18px; flex-shrink: 0; }

.btn-consent {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #9f7aea 0%, #7c3aed 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 3px 12px rgba(124, 58, 237, 0.28);
  transition: filter 0.15s ease;
}

.btn-consent:hover { filter: brightness(1.08); }

.btn-retry {
  padding: 0.65rem 1.5rem;
  background: #fff;
  color: #e53e3e;
  border: 1.5px solid #e53e3e;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s ease;
}

.btn-retry:hover { background: #fff5f5; }

/* ── Liens retour ────────────────────────────────────────────────────────── */
.pay-back-link {
  font-size: 0.82rem;
  color: #718096;
  text-decoration: none;
  transition: color 0.15s ease;
}

.pay-back-link:hover { color: #4a5568; text-decoration: underline; }

.pay-back-link--center { text-align: center; }

.pay-error-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

/* ── Note de sécurité ────────────────────────────────────────────────────── */
.pay-security-note {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: #a0aec0;
  text-align: center;
}

.pay-security-icon { width: 13px; height: 13px; flex-shrink: 0; }

/* ── Mobile ──────────────────────────────────────────────────────────────── */
@media (max-width: 540px) {
  .pay-page { min-height: 100dvh; padding-bottom: 5rem; }
  .pay-card { padding: 2rem 1.25rem; border-radius: 16px; }
  .pay-title { font-size: 1.1rem; }
}
</style>
