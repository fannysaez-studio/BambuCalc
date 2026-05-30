<template>
  <div class="mt-page">

    <router-link
      v-if="showHomeBtn"
      to="/"
      class="mt-home-btn"
      aria-label="Page d'accueil"
      title="Page d'accueil"
    >
      <Home class="mt-icon" aria-hidden="true" />
    </router-link>

    <div class="mt-led-badge">
      <span class="mt-led-dot" aria-hidden="true"></span>
      En maintenance
    </div>

    <div class="mt-content">
      <img src="/maintenance.svg" class="mt-illustration" alt="Maintenance en cours" aria-hidden="true" />
      <h1 class="mt-title">Maintenance en cours</h1>
      <p class="mt-sub">BambuCalc est temporairement indisponible pour une mise à jour. Nous revenons très vite !</p>
    </div>

    <p class="mt-brand">BambuCalc</p>
  </div>
</template>

<script>
import { Home } from 'lucide-vue-next'

export default {
  name: 'Maintenance',
  components: { Home },
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
  background:
    radial-gradient(ellipse 130% 55% at 50% -5%, rgba(177,229,226,0.58) 0%, transparent 65%),
    linear-gradient(180deg, #eef9f8 0%, #f7fcfc 50%, #ffffff 100%);
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
  width: min(92%, 420px);
  height: auto;
  display: block;
  margin-bottom: 2rem;
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
  font-size: clamp(0.85rem, 1.5vw, 0.97rem);
  color: #4f6570;
  line-height: 1.6;
  max-width: 640px;
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
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .mt-title { white-space: normal; }
  .mt-sub   { white-space: normal; text-align: center; }
  .mt-illustration { width: min(92%, 280px); }
}
</style>

<style>
.page-maintenance .nav-island,
.page-maintenance .nav-bar { display: none !important; }
</style>
