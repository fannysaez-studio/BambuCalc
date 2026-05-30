<template>
  <div class="mt-page">

    <!-- Brand haut gauche (quand maintenance active, home masqué) -->
    <p class="mt-brand" :class="{ 'mt-brand--topleft': !showHomeBtn }">BambuCalc</p>

    <!-- Bouton home haut gauche (hors maintenance) -->
    <router-link
      v-if="showHomeBtn"
      to="/"
      class="mt-home-btn"
      aria-label="Page d'accueil"
      title="Page d'accueil"
    >
      <Home class="mt-icon" aria-hidden="true" />
    </router-link>

    <!-- Badge LED haut droite -->
    <div class="mt-led-badge">
      <span class="mt-led-dot" aria-hidden="true"></span>
      En maintenance
    </div>

    <!-- Contenu centré -->
    <div class="mt-content">
      <img src="/app-preview.png" class="mt-illustration" alt="" aria-hidden="true" />
      <h1 class="mt-title">Bientôt disponible</h1>
      <p class="mt-sub">Nous travaillons à vous offrir une expérience optimale. Revenez très vite !</p>
    </div>

    <!-- Bandeau défilant bas gauche -->
    <div class="mt-ticker" aria-hidden="true">
      <div class="mt-ticker-track">
        <span>BambuCalc — Application en cours de développement&nbsp;&nbsp;•&nbsp;&nbsp;Nous revenons très vite&nbsp;&nbsp;•&nbsp;&nbsp;Expérience optimale en préparation&nbsp;&nbsp;•&nbsp;&nbsp;Merci pour votre patience&nbsp;&nbsp;•&nbsp;&nbsp;BambuCalc — Application en cours de développement&nbsp;&nbsp;•&nbsp;&nbsp;Nous revenons très vite&nbsp;&nbsp;•&nbsp;&nbsp;Expérience optimale en préparation&nbsp;&nbsp;•&nbsp;&nbsp;Merci pour votre patience&nbsp;&nbsp;•&nbsp;&nbsp;</span>
      </div>
    </div>

    <!-- Icônes sociales bas droite -->
    <div class="mt-socials">
      <a href="https://github.com/fannysaez" target="_blank" rel="noopener noreferrer" class="mt-social-btn" aria-label="GitHub">
        <Github class="mt-icon" aria-hidden="true" />
      </a>
      <a href="https://www.linkedin.com/in/fannysaez/" target="_blank" rel="noopener noreferrer" class="mt-social-btn" aria-label="LinkedIn">
        <Linkedin class="mt-icon" aria-hidden="true" />
      </a>
      <a href="mailto:fannysaez.pro@gmail.com" class="mt-social-btn" aria-label="Envoyer un email">
        <Mail class="mt-icon" aria-hidden="true" />
      </a>
    </div>

  </div>
</template>

<script>
import { Home, Github, Linkedin, Mail } from 'lucide-vue-next'

export default {
  name: 'Maintenance',
  components: { Home, Github, Linkedin, Mail },
  computed: {
    showHomeBtn() {
      return import.meta.env.VITE_MAINTENANCE_MODE !== 'true'
    },
  },
  mounted()   { document.body.classList.add('page-maintenance') },
  unmounted() { document.body.classList.remove('page-maintenance') },
}
</script>

<style scoped>
* { box-sizing: border-box; }

.mt-page {
  width: 100%;
  align-self: stretch;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2.5rem 2rem;
  position: relative;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
  background-color: #ffffff;
  background-image:
    linear-gradient(rgba(255,255,255,0.78), rgba(255,255,255,0.78)),
    url('/hero-vagues.svg');
  background-repeat: no-repeat;
  background-size: 100% auto;
  background-position: center top;
}

/* ── Brand ── */
.mt-brand {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #2e9cab;
  opacity: 0.5;
  white-space: nowrap;
  z-index: 3;
}
.mt-brand--topleft {
  top: 1.15rem;
  left: 1.25rem;
  bottom: auto;
  transform: none;
  font-size: 0.78rem;
  opacity: 0.75;
}

/* ── Bouton home ── */
.mt-home-btn {
  position: absolute;
  top: 1.1rem;
  left: 1.1rem;
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255,255,255,0.9);
  color: #1f7f97;
  box-shadow: 0 4px 14px rgba(29,18,43,0.1);
  text-decoration: none;
  transition: transform 0.2s, background 0.2s;
  z-index: 3;
  appearance: none;
  -webkit-appearance: none;
  border: none;
}
.mt-home-btn:hover { transform: translateY(-1px); background: #fff; }
.mt-icon { width: 1.1rem; height: 1.1rem; flex-shrink: 0; }

/* ── Badge LED teal ── */
.mt-led-badge {
  position: absolute;
  top: 1.1rem;
  right: 1.1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(46,156,171,0.1);
  border: 1.5px solid rgba(46,156,171,0.35);
  border-radius: 999px;
  padding: 0.38rem 1.1rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #1f7f97;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  z-index: 3;
}

.mt-led-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2e9cab;
  flex-shrink: 0;
  animation: ledPulse 2s infinite;
}

@keyframes ledPulse {
  0%   { box-shadow: 0 0 0 0 rgba(46,156,171,0.7); }
  70%  { box-shadow: 0 0 0 8px rgba(46,156,171,0); }
  100% { box-shadow: 0 0 0 0 rgba(46,156,171,0); }
}

/* ── Contenu centré ── */
.mt-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mt-illustration {
  width: min(92%, 620px);
  height: auto;
  display: block;
  margin-bottom: 2rem;
  border-radius: 16px;
  animation: floatIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  filter: drop-shadow(0 14px 32px rgba(29,18,43,0.13));
}

@keyframes floatIn {
  from { opacity: 0; transform: translateY(24px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.mt-title {
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 800;
  color: #1b2f39;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin-bottom: 0.85rem;
  white-space: nowrap;
}

.mt-sub {
  font-size: clamp(0.82rem, 1.4vw, 0.92rem);
  color: #1f7f97;
  font-weight: 600;
  line-height: 1.6;
  padding: 0.55rem 1.4rem;
  background: rgba(46,156,171,0.08);
  border: 1.5px solid rgba(46,156,171,0.25);
  border-radius: 999px;
  max-width: 640px;
  margin-top: 0.5rem;
}

/* ── Icônes sociales ── */
.mt-socials {
  position: absolute;
  bottom: 1.1rem;
  right: 1.1rem;
  display: flex;
  gap: 0.4rem;
  z-index: 3;
}

.mt-social-btn {
  width: 2.2rem;
  height: 2.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255,255,255,0.85);
  color: #1f7f97;
  box-shadow: 0 3px 10px rgba(29,18,43,0.1);
  text-decoration: none;
  transition: transform 0.2s, background 0.2s;
  border: none;
}
.mt-social-btn:hover { transform: translateY(-2px); background: #fff; }

/* ── Ticker défilant ── */
.mt-ticker {
  position: absolute;
  bottom: 1.1rem;
  left: 0;
  right: 8rem;
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent 0%, black 5%, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5%, black 90%, transparent 100%);
}

.mt-ticker-track {
  display: inline-flex;
  white-space: nowrap;
  animation: ticker 22s linear infinite;
}

.mt-ticker-track span {
  font-size: 0.72rem;
  font-weight: 600;
  color: #2e9cab;
  opacity: 0.55;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

@keyframes ticker {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .mt-title { white-space: normal; }
  .mt-sub   { white-space: normal; text-align: center; }
  .mt-illustration { width: min(95%, 340px); }
}
</style>

<style>
.page-maintenance .nav-island,
.page-maintenance .nav-bar { display: none !important; }
</style>
