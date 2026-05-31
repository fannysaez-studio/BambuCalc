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
        <img src="/prendre-rdv.svg" alt="Illustration rendez-vous" />
      </div>

      <div class="rdv-info-list">
        <div class="rdv-info-item">
          <Clock class="ri-icon" />
          <div>
            <strong>Durée</strong>
            <span>30 minutes</span>
          </div>
        </div>
        <div class="rdv-info-item">
          <Video class="ri-icon" />
          <div>
            <strong>Format</strong>
            <span>Visioconférence</span>
          </div>
        </div>
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

        <div class="rdv-body">
          <div class="rdv-steps">
            <div class="rdv-step">
              <div class="step-num">1</div>
              <div class="step-text">
                <strong>Choisissez un créneau</strong>
                <span>Consultez mes disponibilités et réservez en quelques clics.</span>
              </div>
            </div>
            <div class="rdv-step">
              <div class="step-num">2</div>
              <div class="step-text">
                <strong>Renseignez vos infos</strong>
                <span>Nom, e-mail et un mot sur votre projet.</span>
              </div>
            </div>
            <div class="rdv-step">
              <div class="step-num">3</div>
              <div class="step-text">
                <strong>Confirmation par e-mail</strong>
                <span>Vous recevez un lien de visioconférence automatiquement.</span>
              </div>
            </div>
          </div>

          <button class="rdv-cta-btn" @click="openCalendly">
            <CalendarCheck class="cta-icon" />
            Ouvrir le calendrier
            <ArrowRight class="cta-arrow" />
          </button>

          <p class="rdv-note">Gratuit · Sans engagement · Annulation libre</p>
        </div>

      </div>
    </section>

  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { Home, ArrowLeft, Clock, Video, MapPin, Globe, CalendarCheck, ArrowRight } from 'lucide-vue-next'

const CALENDLY_URL = 'https://calendly.com/fannysaez-pro/30min?locale=fr&primary_color=2e9cab&hide_landing_page_details=1&hide_gdpr_banner=1'

let script = null
let link = null

onMounted(() => {
  link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://assets.calendly.com/assets/external/widget.css'
  document.head.appendChild(link)

  script = document.createElement('script')
  script.src = 'https://assets.calendly.com/assets/external/widget.js'
  script.async = true
  document.head.appendChild(script)
})

onUnmounted(() => {
  if (script && document.head.contains(script)) document.head.removeChild(script)
  if (link && document.head.contains(link)) document.head.removeChild(link)
})

function openCalendly() {
  window.Calendly?.initPopupWidget({ url: CALENDLY_URL })
}
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

.visual-badge,
.visual-copy,
.visual-illustration,
.rdv-info-list { position: relative; z-index: 1; }

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

.visual-copy {
  margin-top: 2rem;
  text-align: center;
}
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
  text-align: center;
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
  gap: 0.5rem;
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
  justify-content: stretch;
  position: relative;
  z-index: 1;
}

.rdv-card {
  width: 100%;
  position: relative;
  background: rgba(255,255,255,0.62);
  backdrop-filter: blur(16px);
  border-radius: 0 28px 28px 0;
  padding: 1rem 2.5rem 2rem;
  box-shadow: -8px 0 20px rgba(29,18,43,0.08);
  display: flex;
  flex-direction: column;
}

/* Boutons top */
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

/* Header */
.rdv-card-header {
  text-align: center;
  margin-bottom: 2rem;
  margin-top: 0;
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

/* Body */
.rdv-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2rem;
}

/* Steps */
.rdv-steps {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.rdv-step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.step-num {
  flex-shrink: 0;
  width: 2rem; height: 2rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #2e9cab, #1f7f97);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(46,154,171,0.35);
}

.step-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding-top: 0.1rem;
}
.step-text strong {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1b2f39;
}
.step-text span {
  font-size: 0.84rem;
  color: #4f6570;
  line-height: 1.4;
}

/* CTA */
.rdv-cta-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #2e9cab 0%, #1f7f97 100%);
  color: #fff;
  font-size: 1.05rem;
  font-weight: 700;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(46,154,171,0.4);
  transition: all 0.2s ease;
  letter-spacing: 0.01em;
}
.rdv-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(46,154,171,0.5);
}
.rdv-cta-btn:active { transform: translateY(0); }
.cta-icon { width: 1.2rem; height: 1.2rem; flex-shrink: 0; }
.cta-arrow { width: 1rem; height: 1rem; flex-shrink: 0; margin-left: auto; }

.rdv-note {
  text-align: center;
  font-size: 0.78rem;
  color: #a0aec0;
  margin: 0;
  letter-spacing: 0.02em;
}

/* ── Desktop fixe ── */
@media (min-width: 1101px) {
  .rdv-page {
    width: 100%;
    height: 100dvh;
    min-height: unset;
    overflow: hidden;
  }
  .rdv-visual, .rdv-panel { min-height: 0; }
  .rdv-card { justify-content: flex-start; }
  .rdv-card-header { margin-top: 0; }
  br.title-br { display: none; }
  .visual-copy h1 { font-size: clamp(1.9rem, 2.5vw, 2.6rem); }
  .rdv-info-list { gap: 0.7rem; }
  .rdv-info-item { flex: 1 1 0; }
}

/* ── Tablette : 769px – 1100px ── */
@media (max-width: 1100px) and (min-width: 769px) {
  .rdv-page {
    width: 100%;
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
  .rdv-visual {
    flex-direction: column;
    justify-content: space-between;
    padding: 1.75rem 2rem 1.25rem;
  }
  .visual-copy { margin-top: 0; text-align: center; }
  .visual-copy h1 { font-size: clamp(1.5rem, 2.8vw, 2rem); white-space: normal; }
  .visual-copy p { margin-top: 0.4rem; font-size: 0.88rem; }
  .visual-illustration { flex: 1; min-height: 0; }
  .visual-illustration img { width: min(100%, 160px); max-width: 160px; }
  .rdv-info-list { flex-direction: row; justify-content: space-between; gap: 0.5rem; margin-top: 0; padding-top: 0.85rem; }
  .rdv-info-item { flex: 1 1 0; }
  .rdv-card { padding: 1rem 2.5rem 2rem; overflow-y: auto; }
  .rdv-body { gap: 1.5rem; }
}

/* ── Mobile : ≤ 768px ── */
@media (max-width: 768px) {
  .rdv-page {
    width: 100%;
    grid-template-columns: 1fr;
    padding: 0.5rem;
    gap: 0.5rem;
    height: auto;
    overflow-x: hidden;
  }
  .rdv-visual, .rdv-card { border-radius: 18px; }
  .rdv-visual::before, .rdv-visual::after { border-radius: 18px; }
  .rdv-visual {
    min-height: calc(100dvh - 1.5rem);
    padding: 1.5rem 1.25rem 4rem;
    justify-content: space-between;
  }
  br.title-br { display: none; }
  .visual-copy { margin-top: 2.5rem; text-align: center; }
  .visual-copy h1 { font-size: clamp(1.5rem, 6.5vw, 2rem); white-space: normal; }
  .visual-copy p { font-size: 0.84rem; margin-top: 0.5rem; }
  .visual-illustration { flex: 1; min-height: 0; align-items: center; }
  .visual-illustration img { width: min(100%, 280px); max-width: 280px; }
  .rdv-info-list {
    flex-direction: row;
    justify-content: space-between;
    gap: 0.3rem;
    margin-top: 0;
    padding-top: 0.75rem;
  }
  .rdv-info-item { padding: 0.45rem 0.15rem; gap: 0.25rem; border-radius: 10px; }
  .ri-icon { width: 0.85rem; height: 0.85rem; }
  .rdv-info-item strong { font-size: 0.5rem; }
  .rdv-info-item span { font-size: 0.65rem; }
  .rdv-panel { min-height: calc(100dvh - 1.5rem); display: flex; flex-direction: column; }
  .rdv-card { flex: 1; padding: 4rem 1.5rem 2.5rem; }
  .rdv-body { gap: 1.75rem; }
}
</style>
