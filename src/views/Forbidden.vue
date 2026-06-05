<template>
  <div class="fb-page">

    <!-- ── Panneau gauche : illustration ── -->
    <section class="fb-visual">
      <router-link to="/" class="fb-icon-btn fb-icon-tl" aria-label="Page d'accueil" title="Page d'accueil">
        <Home class="fb-icon" aria-hidden="true" />
      </router-link>
      <img src="/assets/svg/errors/403.svg" class="fb-illustration" alt="Accès interdit" aria-hidden="true" width="750" height="500" fetchpriority="high" />
    </section>

    <!-- ── Panneau droit : contenu ── -->
    <section class="fb-content">
      <div class="fb-card">
        <div class="fb-icon-tr">
          <router-link to="/dashboard" class="fb-icon-btn" aria-label="Mon tableau de bord" title="Mon tableau de bord">
            <LayoutDashboard class="fb-icon" aria-hidden="true" />
          </router-link>
          <router-link to="/contact" class="fb-icon-btn" aria-label="Contact" title="Contact">
            <MessageSquare class="fb-icon" aria-hidden="true" />
          </router-link>
        </div>

        <div class="fb-badge">403</div>

        <div class="fb-main">
          <h1 class="fb-title">Accès restreint</h1>
          <p class="fb-error">Accès non autorisé.</p>
          <div class="fb-lines">
            <p class="fb-line">Réservé aux administrateurs.</p>
            <p class="fb-line">Vous n'avez pas les droits requis.</p>
          </div>
        </div>

        <p class="fb-brand">BambuCalc</p>
      </div>
    </section>

  </div>
</template>

<script>
import { Home, LayoutDashboard, MessageSquare } from 'lucide-vue-next'
import { useHead } from '@vueuse/head'

export default {
  name: 'Forbidden',
  components: { Home, LayoutDashboard, MessageSquare },
  setup() {
    useHead({
      title: 'Accès restreint — BambuCalc',
      meta: [
        { name: 'description', content: 'Vous n\'avez pas les droits pour accéder à cette page.' },
        { name: 'robots', content: 'index, follow' },
      ],
      link: [{ rel: 'canonical', href: 'https://bambucalc.netlify.app/403' }],
    })
  },
  mounted()   { document.body.classList.add('page-403') },
  unmounted() { document.body.classList.remove('page-403') },
}
</script>

<style scoped>
* { box-sizing: border-box; }

.fb-page {
  width: 100%;
  align-self: stretch;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(420px, 0.9fr);
  padding: 1rem;
  gap: 0;
  background-image: url('/assets/svg/shared/hero-vagues.svg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
  position: relative;
  overflow-x: hidden;
}

.fb-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.07) 100%);
  pointer-events: none;
  z-index: 0;
}

/* ── Panneau gauche teal ── */
.fb-visual {
  position: relative;
  z-index: 1;
  border-radius: 28px 0 0 28px;
  background: rgba(177, 229, 226, 0.58);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 2rem;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.24);
  overflow: hidden;
}

.fb-visual::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 30%),
    radial-gradient(circle at 75% 75%, rgba(46,154,171,0.12), transparent 30%);
  border-radius: 28px 0 0 28px;
  pointer-events: none;
}

.fb-illustration {
  width: min(92%, 440px);
  height: auto;
  display: block;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 20px 40px rgba(29,18,43,0.18));
  animation: illustIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes illustIn {
  from { opacity: 0; transform: translateY(24px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Panneau droit ── */
.fb-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: stretch;
}

.fb-card {
  position: relative;
  width: 100%;
  background: rgba(255,255,255,0.64);
  backdrop-filter: blur(16px);
  border-radius: 0 28px 28px 0;
  padding: 3rem 3rem 2rem;
  box-shadow: -8px 0 24px rgba(29,18,43,0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
  animation: cardIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}

.fb-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding-top: 3rem;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ── Icônes nav ── */
.fb-icon-btn {
  position: absolute;
  top: 1.05rem;
  left: 1.05rem;
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255,255,255,0.75);
  color: #1f7f97;
  box-shadow: 0 4px 14px rgba(29,18,43,0.1);
  text-decoration: none;
  transition: transform 0.2s, background 0.2s;
  z-index: 3;
  appearance: none;
  -webkit-appearance: none;
  border: none;
}
.fb-icon-btn:hover { transform: translateY(-1px); background: #fff; }

.fb-icon-tr {
  position: absolute;
  top: 1.05rem;
  right: 1.05rem;
  display: flex;
  gap: 0.3rem;
  padding: 0.25rem;
  border-radius: 999px;
  background: rgba(255,255,255,0.75);
  box-shadow: 0 4px 14px rgba(29,18,43,0.1);
  z-index: 3;
}
.fb-icon-tr .fb-icon-btn {
  position: static;
  box-shadow: none;
  background: transparent;
}
.fb-icon-tr .fb-icon-btn:hover { background: rgba(220,53,69,0.08); color: #c0392b; }

.fb-icon { width: 1.05rem; height: 1.05rem; flex-shrink: 0; }

/* ── Badge rouge ── */
.fb-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 1.1rem;
  border-radius: 999px;
  background: rgba(220, 53, 69, 0.1);
  border: 1.5px solid rgba(220, 53, 69, 0.35);
  color: #c0392b;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 2.5rem;
}

/* ── Texte ── */
.fb-title {
  font-size: clamp(1.8rem, 2.8vw, 2.4rem);
  font-weight: 800;
  color: #1b2f39;
  margin: 0 0 0.75rem;
  letter-spacing: -0.03em;
  line-height: 1.08;
}

.fb-error {
  font-size: 1rem;
  font-weight: 700;
  color: #c0392b;
  margin: 0 0 2rem;
  padding: 0.5rem 1.25rem;
  background: rgba(220, 53, 69, 0.08);
  border: 1px solid rgba(220, 53, 69, 0.2);
  border-radius: 0.5rem;
  width: fit-content;
}

.fb-lines {
  margin: auto 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
}

.fb-line {
  font-size: 0.88rem;
  color: #4f6570;
  margin: 0;
  white-space: normal;
}

/* ── Brand ── */
.fb-brand {
  padding-top: 1.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #2e9cab;
  opacity: 0.5;
}

/* ── Desktop ≥ 1101px ── */
@media (min-width: 1101px) {
  .fb-page { height: 100%; min-height: 100dvh; overflow: hidden; }
  .fb-visual, .fb-content { min-height: 0; }
}

/* ── Tablette 769px – 1100px ── */
@media (max-width: 1100px) and (min-width: 769px) {
  .fb-page {
    width: 100%;
    grid-template-columns: 1fr;
    grid-template-rows: 44fr 56fr;
    height: 100dvh;
    min-height: unset;
    overflow: hidden;
    padding: 0.75rem;
    gap: 0.75rem;
  }
  .fb-visual, .fb-content { min-height: 0; }
  .fb-visual { border-radius: 20px; padding: 1.5rem 2rem; }
  .fb-visual::before { border-radius: 20px; }
  .fb-illustration { width: min(100%, 240px); }
  .fb-card { border-radius: 20px; padding: 3rem 2.5rem 2rem; justify-content: flex-start; }
  .fb-main { flex: 0 0 auto; margin-top: auto; margin-bottom: auto; justify-content: flex-start; }
  .fb-badge { margin-bottom: 1.25rem; }
  .fb-title { font-size: clamp(1.5rem, 3vw, 1.9rem); }
  .fb-sub { margin-bottom: 2rem; font-size: 0.9rem; }
}

/* ── Mobile ≤ 768px ── */
@media (max-width: 768px) {
  .fb-page {
    width: 100%;
    grid-template-columns: 1fr;
    padding: 0.5rem;
    gap: 0.5rem;
    min-height: 100dvh;
    height: auto;
  }
  .fb-visual {
    border-radius: 18px;
    padding: 1.25rem 1rem;
    min-height: calc(100dvh - 1.5rem);
  }
  .fb-visual::before { border-radius: 18px; }
  .fb-illustration { width: min(100%, 220px); }
  .fb-content { align-items: stretch; }
  .fb-card {
    border-radius: 18px;
    padding: 4rem 1.5rem 3rem;
    height: calc(100dvh - 1.5rem);
    justify-content: flex-start;
  }
  .fb-main { padding-top: 0; flex: 0 0 auto; margin-top: auto; margin-bottom: auto; justify-content: flex-start; }
  .fb-badge { margin-top: 1.5rem; margin-bottom: 1.25rem; font-size: 1.05rem; padding: 0.45rem 1.5rem; }
  .fb-title { font-size: 2rem; }
  .fb-error { font-size: 1rem; margin-bottom: 1.5rem; }
  .fb-lines { width: 100%; margin-top: 1.5rem; }
  .fb-line { font-size: 1rem; white-space: normal; text-align: center; }
  .fb-brand { position: absolute; bottom: 1.5rem; left: 50%; transform: translateX(-50%); padding-top: 0; white-space: nowrap; }
}
</style>

<style>
.page-403 .nav-island,
.page-403 .nav-bar { display: none !important; }
</style>
