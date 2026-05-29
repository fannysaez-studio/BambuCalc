<template>
  <!-- Overlay semi-transparent — mobile uniquement, derrière le sheet -->
  <Transition name="overlay-fade">
    <div v-if="visible" class="cookie-overlay" aria-hidden="true" />
  </Transition>

  <!-- Bottom Sheet -->
  <Transition name="sheet-spring">
    <div
      v-if="visible"
      class="cookie-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Gestion des cookies"
    >
      <!-- Drag handle décoratif -->
      <div class="sheet-handle" aria-hidden="true" />

      <!-- Header : icône + titre + texte -->
      <div class="sheet-header">
        <div class="sheet-icon-wrap" aria-hidden="true">
          <ShieldCheck class="sheet-icon" />
        </div>
        <div class="sheet-body">
          <p class="sheet-title">Votre vie privée</p>
          <p class="sheet-text">
            BambuCalc utilise des cookies essentiels et
            <strong>Stripe</strong> pour sécuriser vos paiements.
            <router-link to="/privacy" class="sheet-link" target="_blank">
              Politique de confidentialité →
            </router-link>
          </p>
        </div>
      </div>

      <!-- Accordion Personnaliser -->
      <div class="sheet-accordion">
        <button
          class="accordion-trigger"
          :aria-expanded="String(expanded)"
          @click="expanded = !expanded"
        >
          <span>Personnaliser</span>
          <ChevronDown
            :class="['accordion-chevron', { 'accordion-chevron--open': expanded }]"
            :size="14"
            aria-hidden="true"
          />
        </button>

        <div class="accordion-content" :class="{ 'accordion-content--open': expanded }">
          <div class="cookie-row">
            <div class="cookie-row-info">
              <span class="cookie-badge cookie-badge--lock" aria-hidden="true">🔒</span>
              <div>
                <p class="cookie-row-name">Essentiels</p>
                <p class="cookie-row-desc">Navigation, authentification, sécurité</p>
              </div>
            </div>
            <span class="cookie-row-tag">Toujours actifs</span>
          </div>

          <div class="cookie-row">
            <div class="cookie-row-info">
              <span class="cookie-badge cookie-badge--stripe" aria-hidden="true">💳</span>
              <div>
                <p class="cookie-row-name">Stripe / Paiement</p>
                <p class="cookie-row-desc">Traitement sécurisé si vous payez en ligne</p>
              </div>
            </div>
            <span class="cookie-row-tag cookie-row-tag--optional">Si accepté</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="sheet-actions">
        <button class="btn-decline" @click="decline">Essentiel uniquement</button>
        <button class="btn-accept" @click="accept">Tout accepter</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ShieldCheck, ChevronDown } from 'lucide-vue-next'

const STORAGE_KEY = 'cookie_consent'

const visible  = ref(false)
const expanded = ref(false)

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

function emitConsentEvent(level) {
  window.dispatchEvent(new CustomEvent('cookie-consent', { detail: { level } }))
}

function accept() {
  localStorage.setItem(STORAGE_KEY, 'all')
  visible.value = false
  emitConsentEvent('all')
}

function decline() {
  localStorage.setItem(STORAGE_KEY, 'essential')
  visible.value = false
  emitConsentEvent('essential')
}
</script>

<style scoped>
/* ── Overlay mobile ─────────────────────────────────────────────────────────── */
.cookie-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.3);
  z-index: 9998;
}

@media (max-width: 600px) {
  .cookie-overlay { display: block; }
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

/* ── Bottom Sheet — Desktop ─────────────────────────────────────────────────── */
.cookie-sheet {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: min(560px, calc(100vw - 2rem));
  z-index: 9999;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.14), 0 4px 16px rgba(0, 0, 0, 0.07);
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

/* ── Animation spring — Desktop ─────────────────────────────────────────────── */
.sheet-spring-enter-active {
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
}
.sheet-spring-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
}
.sheet-spring-enter-from {
  transform: translateX(-50%) translateY(28px);
  opacity: 0;
}
.sheet-spring-leave-to {
  transform: translateX(-50%) translateY(18px);
  opacity: 0;
}

/* ── Drag handle ────────────────────────────────────────────────────────────── */
.sheet-handle {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: #e2e8f0;
  align-self: center;
  flex-shrink: 0;
}

/* ── Header ─────────────────────────────────────────────────────────────────── */
.sheet-header {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
}

.sheet-icon-wrap {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #e8f7f9, #c6eef3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sheet-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #2e9cab;
}

.sheet-body {
  flex: 1;
  min-width: 0;
}

.sheet-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #1a202c;
  margin: 0 0 0.3rem;
  letter-spacing: -0.01em;
}

.sheet-text {
  font-size: 0.81rem;
  color: #718096;
  line-height: 1.6;
  margin: 0;
}

.sheet-link {
  color: #2e9cab;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
}
.sheet-link:hover { text-decoration: underline; }

/* ── Accordion ──────────────────────────────────────────────────────────────── */
.sheet-accordion {
  border: 1px solid #e8edf3;
  border-radius: 12px;
  overflow: hidden;
}

.accordion-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.6rem 0.9rem;
  background: #f7f9fc;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  color: #4a5568;
  letter-spacing: 0.01em;
  transition: background 0.15s ease, color 0.15s ease;
}
.accordion-trigger:hover {
  background: #edf2f7;
  color: #2d3748;
}

.accordion-chevron {
  color: #a0aec0;
  transition: transform 0.3s ease, color 0.15s ease;
  flex-shrink: 0;
}
.accordion-chevron--open {
  transform: rotate(180deg);
  color: #2e9cab;
}

.accordion-content {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition:
    max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.25s ease;
}
.accordion-content--open {
  max-height: 200px;
  opacity: 1;
}

/* ── Cookie rows ────────────────────────────────────────────────────────────── */
.cookie-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem;
  border-top: 1px solid #f0f4f8;
}

.cookie-row-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

.cookie-badge {
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
}
.cookie-badge--lock   { background: #f0f4f8; }
.cookie-badge--stripe { background: #e8f7f9; }

.cookie-row-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.1rem;
}
.cookie-row-desc {
  font-size: 0.7rem;
  color: #a0aec0;
  margin: 0;
  line-height: 1.4;
}

.cookie-row-tag {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
  background: #f0f4f8;
  color: #718096;
}
.cookie-row-tag--optional {
  background: #e8f7f9;
  color: #1f7f97;
}

/* ── Actions ────────────────────────────────────────────────────────────────── */
.sheet-actions {
  display: flex;
  gap: 0.6rem;
}

.btn-decline {
  flex: 1;
  padding: 0.65rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: #f7f9fc;
  color: #4a5568;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
}
.btn-decline:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
  color: #2d3748;
}

/* ── Bouton Accepter avec shimmer ───────────────────────────────────────────── */
.btn-accept {
  flex: 1;
  position: relative;
  overflow: hidden;
  padding: 0.65rem 1rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(46, 156, 171, 0.35);
  transition: filter 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.btn-accept:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(46, 156, 171, 0.42);
}

.btn-accept::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent);
  transition: left 0.55s ease;
  pointer-events: none;
}
.btn-accept:hover::after {
  left: 160%;
}

/* ── Mobile — Bottom sheet full width ───────────────────────────────────────── */
@media (max-width: 600px) {
  .cookie-sheet {
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    transform: none;
    border-radius: 20px 20px 0 0;
    padding: 0.875rem 1.25rem 1.75rem;
    gap: 0.75rem;
  }

  /* Animation slide depuis le bas (remplace translateX) */
  .sheet-spring-enter-active {
    transition: transform 0.45s cubic-bezier(0.34, 1.3, 0.64, 1) !important;
  }
  .sheet-spring-leave-active {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .sheet-spring-enter-from {
    transform: translateY(100%) !important;
    opacity: 1 !important;
  }
  .sheet-spring-leave-to {
    transform: translateY(100%) !important;
    opacity: 1 !important;
  }

  .sheet-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-decline,
  .btn-accept {
    flex: unset;
    width: 100%;
    padding: 0.8rem;
    font-size: 0.85rem;
  }
}
</style>
