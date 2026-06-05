<template>
  <div class="rdv-page">

    <!-- ── Bloc teal gauche ── -->
    <section class="rdv-visual" aria-hidden="true">
      <div class="visual-badge">
        <span class="badge-mark"></span>
        <span>BambuCalc</span>
      </div>

      <div class="visual-copy">
        <h1>
          Prendre<br class="title-br" />
          rendez-vous.
        </h1>
        <p>Choisissez un créneau, on s'occupe du reste.</p>
      </div>

      <div class="visual-illustration">
        <div class="visual-illustration-glow"></div>
        <img src="/prendre-rdv.svg" alt="Réservez votre rendez-vous de devis d'impression 3D" width="500" height="500" fetchpriority="high" />
      </div>

      <div class="rdv-info-list">
        <div class="rdv-info-item">
          <MapPin class="ri-icon" />
          <div>
            <strong>Lieu</strong>
            <span>Clermont-Fd</span>
          </div>
        </div>
        <div class="rdv-info-item">
          <Globe class="ri-icon" />
          <div>
            <strong>Accès</strong>
            <span>Distanciel</span>
          </div>
        </div>
        <div class="rdv-info-item">
          <Gift class="ri-icon" />
          <div>
            <strong>1er RDV</strong>
            <span>Offert</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Panneau droit ── -->
    <section class="rdv-panel">
      <div class="rdv-card">

        <router-link to="/" class="rdv-home-link" aria-label="Page d'accueil">
          <Home class="rdv-home-icon" />
        </router-link>

        <router-link to="/contact" class="rdv-back-link" title="Retour contact">
          <ArrowLeft class="rdv-back-icon" />
        </router-link>

        <div class="rdv-card-header">
          <h2>Réserver un créneau</h2>
          <p>Sélectionnez une date et une heure disponible.</p>
        </div>

        <!-- Étapes style cercles connectés -->
        <div class="rdv-steps">
          <div class="step-item step-active">
            <div class="step-circle">1</div>
            <div class="step-lbl">Votre créneau</div>
          </div>
          <div class="step-connector"></div>
          <div class="step-item">
            <div class="step-circle">2</div>
            <div class="step-lbl">Vos infos</div>
          </div>
          <div class="step-connector"></div>
          <div class="step-item">
            <div class="step-circle">3</div>
            <div class="step-lbl">Confirmation</div>
          </div>
        </div>

        <!-- Aperçu event + CTA -->
        <div class="rdv-preview">
          <div class="rdv-preview-card">
            <div class="preview-ribbon">Offert</div>
            <div class="rdv-preview-identity">
              <div class="rdv-preview-avatar">FS</div>
              <div class="rdv-preview-name">Fanny Saez</div>
            </div>
            <div class="rdv-preview-event">Découverte de l'impression 3D</div>
            <div class="rdv-preview-meta">
              <span class="rdv-meta-item">
                <Clock class="pm-icon" />
                <span>30 min</span>
              </span>
              <span class="rdv-meta-item">
                <Video class="pm-icon" />
                <span>Visioconférence</span>
              </span>
            </div>
            <p class="rdv-preview-desc">
              Un échange de 30 min pour poser tes questions et avancer sur ton projet d'impression 3D.
            </p>
            <button class="rdv-cta-btn" @click="bookingOpen = true">
              Voir les disponibilités
            </button>
          </div>
        </div>

      </div>
    </section>

    <!-- ── Modale Calendly (toujours dans le DOM, opacity-based) ── -->
    <div
      class="booking-backdrop"
      :class="{ 'is-open': bookingOpen }"
      role="dialog"
      :aria-hidden="!bookingOpen"
      @click.self="bookingOpen = false"
    >
      <div class="booking-modal">
        <!-- Croix à l'intérieur de la modale, au-dessus du widget -->
        <button class="booking-close-btn" aria-label="Fermer" @click="bookingOpen = false">
          <X class="booking-close-icon" />
        </button>
        <div class="booking-cal-wrap">
          <div
            class="calendly-inline-widget"
            data-url="https://calendly.com/fannysaez-pro/30min?hide_gdpr_banner=1&primary_color=1a6b7a&locale=fr"
          ></div>
        </div>
      </div>
    </div>

    <!-- ── Modale de confirmation ── -->
    <Transition name="modal">
      <div v-if="confirmed" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-accent"></div>
          <button class="modal-close" aria-label="Fermer" @click="closeModal">✕</button>
          <div class="modal-body">
            <div class="modal-icon-wrap">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M8 19l8 8 13-16" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2 id="modal-title">Rendez-vous confirmé !</h2>
            <p>Un email de confirmation vient de vous être envoyé avec tous les détails de votre séance.</p>
            <router-link to="/" class="modal-btn">
              Réserver mon accompagnement
            </router-link>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Home, ArrowLeft, Clock, Video, MapPin, Globe, X, Gift } from 'lucide-vue-next'
import { useHead } from '@vueuse/head'

useHead({
  title: 'Prendre rendez-vous — BambuCalc',
  meta: [
    { name: 'description', content: 'Prenez rendez-vous avec Fanny Saez pour discuter de votre projet d\'impression 3D. Disponible en visio ou en extérieur.' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: 'Prendre rendez-vous — BambuCalc' },
    { property: 'og:description', content: 'Prenez rendez-vous pour discuter de votre projet d\'impression 3D.' },
    { property: 'og:url', content: 'https://bambucalc.netlify.app/rdv' },
  ],
  link: [{ rel: 'canonical', href: 'https://bambucalc.netlify.app/rdv' }],
})

const router = useRouter()
let calScript = null
const confirmed = ref(false)
const bookingOpen = ref(false)

watch(bookingOpen, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

function closeModal() {
  document.body.style.overflow = ''
  router.push('/')
}

function handleCalendlyEvent(e) {
  if (e.data?.event === 'calendly.event_scheduled') {
    bookingOpen.value = false
    confirmed.value = true
  }
}

onMounted(() => {
  calScript = document.createElement('script')
  calScript.src = 'https://assets.calendly.com/assets/external/widget.js'
  calScript.async = true
  document.head.appendChild(calScript)
  window.addEventListener('message', handleCalendlyEvent)
})

onUnmounted(() => {
  document.body.style.overflow = ''
  if (calScript && document.head.contains(calScript)) document.head.removeChild(calScript)
  window.removeEventListener('message', handleCalendlyEvent)
})
</script>

<style scoped>
* { box-sizing: border-box; }

.rdv-page {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(420px, 0.94fr);
  padding: 1rem;
  gap: 0;
  background-image: url('/hero-vagues.svg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
  position: relative;
  overflow-x: hidden;
}
.rdv-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.1) 100%);
  pointer-events: none;
  z-index: 0;
}

/* ── Bloc teal ── */
.rdv-visual {
  position: relative;
  border-radius: 28px 0 0 28px;
  padding: 2.5rem 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
  background: rgba(177, 229, 226, 0.62);
  isolation: isolate;
  z-index: 2;
}
.rdv-visual::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 18%, rgba(255,255,255,0.16), transparent 24%),
    radial-gradient(circle at 75% 70%, rgba(46,154,171,0.1), transparent 28%);
  border-radius: 28px 0 0 28px;
  pointer-events: none;
}
.rdv-visual::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 28px 0 0 28px;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.28);
  pointer-events: none;
  z-index: 2;
}
.visual-badge, .visual-copy, .visual-illustration, .rdv-info-list {
  position: relative;
  z-index: 1;
}

.visual-badge {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.badge-mark {
  width: 1.9rem; height: 1.9rem;
  border-radius: 0.65rem;
  background: linear-gradient(145deg, rgba(255,255,255,0.96), rgba(255,255,255,0.62));
  position: relative;
  box-shadow: 0 8px 18px rgba(29,10,50,0.18);
}
.badge-mark::before, .badge-mark::after {
  content: '';
  position: absolute;
  inset: 0.25rem 0.45rem auto auto;
  width: 0.55rem; height: 0.55rem;
  border-radius: 999px;
  background: #ef7fa8;
  transform: rotate(35deg);
  box-shadow: -0.45rem 0.5rem 0 0 #f4c1cc;
}
.badge-mark::after {
  inset: auto auto 0.2rem 0.25rem;
  width: 0.9rem; height: 0.42rem;
  background: linear-gradient(90deg, #fff, rgba(255,255,255,0.2));
  border-radius: 999px;
  box-shadow: 0 -0.38rem 0 0 #fff;
  transform: rotate(-32deg);
}

.visual-copy { margin-top: 2rem; text-align: center; }
.visual-copy h1 {
  margin: 0;
  font-size: clamp(1.2rem, 1.9vw, 2rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0,0,0,0.24);
}
.visual-copy p {
  margin: 0.85rem 0 0;
  font-size: 1rem;
  line-height: 1.45;
  color: rgba(255,255,255,0.9);
  text-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.visual-illustration {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  z-index: 1;
}
.visual-illustration-glow {
  position: absolute;
  inset: 12% 18% 5%;
  background: radial-gradient(circle, rgba(255,255,255,0.48) 0%, rgba(46,154,171,0.18) 34%, transparent 74%);
  filter: blur(30px);
  pointer-events: none;
}
.visual-illustration img {
  width: min(100%, 270px);
  max-width: 270px;
  height: auto;
  display: block;
  filter: drop-shadow(0 24px 36px rgba(22,10,45,0.28));
  position: relative;
  z-index: 1;
}

.rdv-info-list {
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.2);
}
.rdv-info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  background: rgba(255,255,255,0.92);
  border-radius: 14px;
  padding: 0.75rem 0.5rem;
  box-shadow: 0 6px 18px rgba(29,18,43,0.12);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.rdv-info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(29,18,43,0.18);
}
.rdv-info-item:hover .ri-icon {
  color: #1f7f97;
}
.ri-icon { width: 1.15rem; height: 1.15rem; color: #2e9cab; flex-shrink: 0; }
.rdv-info-item strong {
  display: block;
  font-size: 0.67rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #a0aec0;
}
.rdv-info-item span {
  font-size: 0.76rem;
  font-weight: 600;
  color: #1b2f39;
  line-height: 1.3;
}

/* ── Panneau droit ── */
.rdv-panel {
  display: flex;
  align-items: stretch;
  position: relative;
  z-index: 1;
}
.rdv-card {
  width: 100%;
  position: relative;
  background: rgba(255,255,255,0.62);
  backdrop-filter: blur(16px);
  border-radius: 0 28px 28px 0;
  padding: 1rem 2.5rem 1.5rem;
  box-shadow: -8px 0 20px rgba(29,18,43,0.08);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.rdv-home-link, .rdv-back-link {
  position: absolute;
  top: 1.05rem;
  width: 2.5rem; height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255,255,255,0.72);
  border: 1.5px solid rgba(200,197,201,0.5);
  color: #1f7f97;
  box-shadow: 0 4px 12px rgba(29,18,43,0.08);
  text-decoration: none;
  transition: all 0.2s ease;
  z-index: 2;
}
.rdv-home-link { right: 1.05rem; }
.rdv-back-link { left: 1.05rem; }
.rdv-home-link:hover, .rdv-back-link:hover {
  background: rgba(46,154,171,0.12);
  color: #2e9cab;
  border-color: #2e9cab;
  transform: translateY(-1px);
}
.rdv-home-icon, .rdv-back-icon { width: 1.05rem; height: 1.05rem; flex-shrink: 0; }

.rdv-card-header {
  text-align: center;
  margin-bottom: 0;
  padding: 0 3.5rem;
  min-height: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.rdv-card-header h2 {
  margin: 0;
  font-size: clamp(1.5rem, 2vw, 2rem);
  font-weight: 800;
  color: #1b2f39;
  letter-spacing: -0.03em;
}
.rdv-card-header p {
  margin: 0.6rem 0 0;
  color: #4f6570;
  font-size: 0.92rem;
}

/* ── Étapes cercles connectés ── */
.rdv-steps {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin: 1.75rem 0 1.5rem;
  padding: 0 0.25rem;
}
.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}
.step-circle {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid rgba(46,154,171,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(46,154,171,0.65);
  background: transparent;
  transition: all 0.2s;
}
.step-active .step-circle {
  background: #2e9cab;
  border-color: #2e9cab;
  color: #fff;
  box-shadow: 0 4px 10px rgba(46,154,171,0.3);
}
.step-lbl {
  font-size: 0.71rem;
  color: #7a9aaa;
  white-space: nowrap;
  font-weight: 500;
}
.step-active .step-lbl {
  color: #2e9cab;
  font-weight: 600;
}
.step-connector {
  flex: 1;
  height: 2px;
  background: rgba(46,154,171,0.3);
  margin-top: 1rem;
  border-radius: 999px;
}

/* ── Aperçu event ── */
.rdv-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0 1rem;
}
.rdv-preview-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  text-align: center;
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(46,154,171,0.15);
  border-radius: 20px;
  padding: 2.25rem 2.25rem 2rem;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 8px 24px rgba(29,18,43,0.07);
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
  animation: cardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.preview-ribbon {
  position: absolute;
  top: 18px;
  right: -26px;
  background: linear-gradient(135deg, #2e9cab, #5bc4d4);
  color: #fff;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 5px 38px;
  transform: rotate(45deg);
  box-shadow: 0 2px 8px rgba(46,154,171,0.35);
}
.rdv-preview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 48px rgba(29,18,43,0.12);
  border-width: 2px;
  border-color: #2e9cab;
}
.rdv-preview-card:hover .rdv-preview-avatar {
  transform: scale(1.06);
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.rdv-preview-avatar {
  width: 2.8rem; height: 2.8rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #2e9cab, #5bc4d4);
  color: #fff;
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(46,154,171,0.32);
  flex-shrink: 0;
  transition: transform 0.25s;
}
.rdv-preview-identity {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.rdv-preview-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4f6570;
}
.rdv-preview-event {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1b2f39;
  letter-spacing: -0.02em;
  line-height: 1.25;
  margin-top: 1.1rem;
}
.rdv-preview-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}
.rdv-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.82rem;
  color: #4f6570;
}
.pm-icon { width: 0.85rem; height: 0.85rem; color: #2e9cab; flex-shrink: 0; }
.rdv-preview-desc {
  font-size: 0.84rem;
  color: #4f6570;
  line-height: 1.6;
  margin: 0;
  padding: 0.5rem 0 0;
  border-top: 1px solid rgba(46,154,171,0.12);
  width: 100%;
}
.rdv-cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.35rem;
  padding: 0.85rem 2.25rem;
  background: #2e9cab;
  color: #fff;
  border: none;
  border-radius: 999px;
  font-size: 0.96rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 16px rgba(46,154,171,0.32);
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  width: 100%;
}
.rdv-cta-btn:hover {
  background: #1f7f97;
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(46,154,171,0.4);
}

/* ── Modale Calendly ── */
.booking-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(18, 85, 98, 0.72);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
.booking-backdrop.is-open {
  opacity: 1;
  pointer-events: auto;
}

.booking-modal {
  position: relative;
  background: #fff;
  border-radius: 20px;
  width: min(1100px, 98vw);
  height: min(760px, 96vh);
  overflow: hidden;
  box-shadow: 0 32px 64px rgba(15,25,35,0.3);
  display: flex;
  flex-direction: column;
}

/* Croix à l'intérieur de la modale, z-index au-dessus du widget */
.booking-close-btn {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  z-index: 10;
  width: 2.5rem; height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255,255,255,0.92);
  border: 1.5px solid rgba(200,197,201,0.5);
  color: #1f7f97;
  box-shadow: 0 4px 12px rgba(29,18,43,0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}
.booking-close-btn:hover {
  background: rgba(46,154,171,0.15);
  color: #2e9cab;
  border-color: #2e9cab;
  transform: translateY(-1px);
}
.booking-close-icon { width: 1.05rem; height: 1.05rem; flex-shrink: 0; }

.booking-cal-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.booking-cal-wrap .calendly-inline-widget {
  display: block;
  width: 100%;
  min-width: 900px;
  height: 720px;
  min-height: 720px;
}

/* ── Desktop fixe ── */
@media (min-width: 1101px) {
  .rdv-page { width: 100%; height: 100dvh; min-height: unset; overflow: hidden; }
  .rdv-visual, .rdv-panel { min-height: 0; }
  .rdv-card { justify-content: flex-start; }
  br.title-br { display: none; }
  .visual-copy h1 { font-size: clamp(1.9rem, 2.5vw, 2.6rem); }
  .rdv-info-item { flex: 0 1 200px; }
}

/* ── Tablette ── */
@media (max-width: 1100px) and (min-width: 769px) {
  .rdv-page {
    grid-template-columns: 1fr;
    grid-template-rows: 44fr 56fr;
    height: 100dvh;
    min-height: unset;
    overflow: hidden;
    padding: 0.75rem;
    gap: 0.75rem;
  }
  .rdv-visual, .rdv-card { border-radius: 20px; }
  .rdv-visual::before, .rdv-visual::after { border-radius: 20px; }
  .rdv-visual, .rdv-panel { min-height: 0; }
  .rdv-visual { flex-direction: column; justify-content: space-between; padding: 1.75rem 2rem 1.25rem; }
  .visual-copy { margin-top: 0; }
  .visual-copy h1 { font-size: clamp(1.5rem, 2.8vw, 2rem); }
  .visual-copy p { margin-top: 0.4rem; font-size: 0.88rem; }
  .visual-illustration { flex: 1; min-height: 0; }
  .visual-illustration img { width: min(100%, 160px); max-width: 160px; }
  .rdv-info-list { gap: 1rem; margin-top: 0; padding-top: 0.85rem; }
  .rdv-card { padding: 3rem 2.5rem 1.5rem; overflow-y: auto; }
  .booking-modal { width: min(960px, 98vw); }
  .booking-cal-wrap .calendly-inline-widget { min-width: 860px; }
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .rdv-page { grid-template-columns: 1fr; padding: 0.5rem; gap: 0.5rem; height: auto; overflow-x: hidden; }
  .rdv-visual, .rdv-card { border-radius: 18px; }
  .rdv-visual::before, .rdv-visual::after { border-radius: 18px; }
  .rdv-visual { min-height: calc(100dvh - 1.5rem); padding: 1.5rem 1.25rem 4rem; justify-content: space-between; }
  br.title-br { display: none; }
  .visual-copy { margin-top: 2.5rem; }
  .visual-copy h1 { font-size: clamp(1.5rem, 6.5vw, 2rem); }
  .visual-copy p { font-size: 0.84rem; margin-top: 0.5rem; }
  .visual-illustration { flex: 1; min-height: 0; align-items: center; }
  .visual-illustration img { width: min(100%, 280px); max-width: 280px; }
  .rdv-info-list { gap: 0.75rem; justify-content: center; margin-top: 0; padding-top: 0.75rem; }
  .rdv-info-item { flex: 0 1 140px; padding: 0.6rem 0.4rem; }
  .ri-icon { width: 0.85rem; height: 0.85rem; }
  .rdv-info-item strong { font-size: 0.5rem; }
  .rdv-info-item span { font-size: 0.65rem; }
  .rdv-panel { min-height: calc(100dvh - 1.5rem); display: flex; flex-direction: column; }
  .rdv-card { flex: 1; padding: 4rem 1.5rem 2rem; overflow-y: auto; }
  .rdv-preview-card { padding: 1.5rem 1.25rem; }
  .rdv-steps { margin: 1.25rem 0 1.25rem; }
  .step-lbl { font-size: 0.65rem; }
  .booking-modal { width: 100%; height: 92vh; border-radius: 16px; }
  .booking-cal-wrap .calendly-inline-widget { min-width: unset; width: 100%; height: 580px; min-height: 580px; }
}

/* ── Modale confirmation ── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 25, 35, 0.12);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}
.modal-card {
  position: relative;
  background: #fff;
  border-radius: 20px;
  max-width: 360px;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 32px 64px rgba(15,25,35,0.16), 0 4px 16px rgba(15,25,35,0.06);
}
.modal-accent { height: 5px; background: linear-gradient(90deg, #2e9cab, #5bc4d4); }
.modal-close {
  position: absolute;
  top: 0.75rem; right: 0.75rem;
  width: 1.8rem; height: 1.8rem;
  border: none;
  background: #f1f5f9;
  color: #94a3b8;
  border-radius: 50%;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
  line-height: 1;
}
.modal-close:hover { background: #e2e8f0; color: #475569; }
.modal-body {
  padding: 1.75rem 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
}
.modal-icon-wrap {
  width: 2.8rem; height: 2.8rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #2e9cab, #5bc4d4);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(46,154,171,0.35);
  flex-shrink: 0;
}
.modal-icon-wrap svg { width: 1.3rem; height: 1.3rem; }
.modal-card h2 { margin: 0; font-size: 1.3rem; font-weight: 800; color: #1b2f39; letter-spacing: -0.02em; }
.modal-card p { margin: 0; color: #4f6570; font-size: 0.88rem; line-height: 1.6; }
.modal-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.25rem;
  padding: 0.75rem 1.5rem;
  background: #2e9cab;
  color: #fff;
  border-radius: 999px;
  font-size: 0.92rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(46,154,171,0.3);
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
}
.modal-btn:hover { background: #1f7f97; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(46,154,171,0.38); }

.modal-enter-active { animation: modalIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-leave-active { animation: modalOut 0.2s ease; }
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.88) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes modalOut {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.94); }
}
</style>
