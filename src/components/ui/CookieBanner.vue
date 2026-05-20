<template>
  <Transition name="cookie-slide">
    <div
      v-if="visible"
      class="cookie-banner"
      role="dialog"
      aria-live="polite"
      aria-label="Gestion des cookies"
    >
      <div class="cookie-inner">
        <!-- Icône -->
        <div class="cookie-icon" aria-hidden="true">🍪</div>

        <!-- Texte -->
        <div class="cookie-body">
          <p class="cookie-title">Votre vie privée nous importe</p>
          <p class="cookie-text">
            BambuCalc utilise des cookies essentiels au fonctionnement du site.
            Avec votre accord, nous chargeons également
            <strong>Stripe</strong> pour sécuriser vos paiements — ce service
            peut déposer des cookies tiers.
            <router-link to="/privacy" class="cookie-link" target="_blank">
              Politique de confidentialité →
            </router-link>
          </p>
        </div>

        <!-- Boutons -->
        <div class="cookie-actions">
          <button class="cookie-btn cookie-btn--decline" @click="decline">
            Essentiel uniquement
          </button>
          <button class="cookie-btn cookie-btn--accept" @click="accept">
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// ── Clé localStorage ─────────────────────────────────────────────────────────
const STORAGE_KEY = 'cookie_consent'

const visible = ref(false)

// Afficher le bandeau si aucun choix ou si une vue demande l'affichage explicite
function onShowRequest() {
  visible.value = true
}

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY)
  visible.value = !stored
  window.addEventListener('show-cookie-banner', onShowRequest)
})

onBeforeUnmount(() => {
  window.removeEventListener('show-cookie-banner', onShowRequest)
})

// ── Émission d'un événement global ──────────────────────────────────────────
// Les composants qui ont besoin de charger Stripe peuvent écouter cet événement
// via window.addEventListener('cookie-consent', handler)
function emitConsentEvent(level) {
  window.dispatchEvent(new CustomEvent('cookie-consent', { detail: { level } }))
}

// ── Actions utilisateur ──────────────────────────────────────────────────────

/** L'utilisateur accepte tous les cookies (y compris Stripe, analytics futurs) */
function accept() {
  localStorage.setItem(STORAGE_KEY, 'all')
  visible.value = false
  emitConsentEvent('all')
}

/** L'utilisateur refuse — seuls les cookies essentiels sont autorisés */
function decline() {
  localStorage.setItem(STORAGE_KEY, 'essential')
  visible.value = false
  emitConsentEvent('essential')
}
</script>

<style scoped>
/* ── Positionnement ── */
.cookie-banner {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: min(680px, calc(100vw - 2rem));
  z-index: 9999;
  background: #fff;
  border: 1px solid #e8edf3;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 1.25rem 1.5rem;
}

/* ── Mise en page interne ── */
.cookie-inner {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.cookie-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
  line-height: 1;
  margin-top: 2px;
}

.cookie-body {
  flex: 1;
  min-width: 0;
}

/* ── Texte ── */
.cookie-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.4rem;
}

.cookie-text {
  font-size: 0.82rem;
  color: #4a5568;
  line-height: 1.55;
  margin: 0;
}

.cookie-link {
  color: #7c3aed;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
}
.cookie-link:hover { text-decoration: underline; }

/* ── Boutons ── */
.cookie-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}

.cookie-btn {
  padding: 0.5rem 1.1rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.cookie-btn--accept {
  background: linear-gradient(135deg, #9f7aea 0%, #7c3aed 100%);
  color: #fff;
  border: none;
  box-shadow: 0 3px 10px rgba(124, 58, 237, 0.28);
}
.cookie-btn--accept:hover { filter: brightness(1.08); }

.cookie-btn--decline {
  background: #f7f9fc;
  color: #4a5568;
  border: 1.5px solid #e2e8f0;
}
.cookie-btn--decline:hover { background: #edf2f7; border-color: #cbd5e0; }

/* ── Animation d'entrée ── */
.cookie-slide-enter-active,
.cookie-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.cookie-slide-enter-from,
.cookie-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(1.5rem);
}

/* ── Mobile ── */
@media (max-width: 600px) {
  .cookie-banner { bottom: 0; border-radius: 16px 16px 0 0; width: 100%; }
  .cookie-inner  { flex-direction: column; }
  .cookie-actions { flex-direction: row; }
  .cookie-btn    { flex: 1; text-align: center; }
}
</style>
