<template>
  <div class="nf-page">

    <!-- ── Panneau gauche : illustration ── -->
    <section class="nf-visual">
      <router-link to="/" class="nf-icon-btn nf-icon-tl" aria-label="Page d'accueil" title="Page d'accueil">
        <Home class="nf-icon" aria-hidden="true" />
      </router-link>
      <img src="/404.svg" class="nf-illustration" alt="Illustration 404" aria-hidden="true" />
    </section>

    <!-- ── Panneau droit : contenu ── -->
    <section class="nf-content">
      <div class="nf-card">
        <router-link to="/contact" class="nf-icon-btn nf-icon-tl" aria-label="Contact" title="Contact">
          <MessageSquare class="nf-icon" aria-hidden="true" />
        </router-link>
        <div class="nf-icon-tr">
          <router-link to="/login" class="nf-icon-btn" aria-label="Se connecter" title="Se connecter">
            <LogIn class="nf-icon" aria-hidden="true" />
          </router-link>
        </div>

        <div class="nf-badge">404</div>

        <div class="nf-main">
          <h1 class="nf-title">Page introuvable</h1>
          <p class="nf-sub">
            Oups ! Cette page n'existe pas ou a été déplacée.<br />
            Revenez à l'accueil pour continuer.
          </p>
          <div class="nf-actions">
            <router-link to="/" class="btn-home">← Accueil</router-link>
            <router-link v-if="isAuth" to="/dashboard" class="btn-dash">Mon tableau de bord</router-link>
          </div>
        </div>

        <p class="nf-brand">BambuCalc</p>
      </div>
    </section>

  </div>
</template>

<script>
import { Home, LogIn, MessageSquare } from 'lucide-vue-next'
import { supabase } from '../lib/supabase'
import { useHead } from '@vueuse/head'

export default {
  name: 'NotFound',
  components: { Home, LogIn, MessageSquare },
  setup() {
    useHead({
      title: 'Page introuvable — BambuCalc',
      meta: [
        { name: 'description', content: 'Cette page n\'existe pas ou a été déplacée.' },
        { name: 'robots', content: 'index, follow' },
      ],
      link: [{ rel: 'canonical', href: 'https://bambucalc.netlify.app/404' }],
    })
  },
  data() { return { isAuth: false } },
  async created() {
    const { data } = await supabase.auth.getSession()
    this.isAuth = !!data.session
  },
  mounted()   { document.body.classList.add('page-404') },
  unmounted() { document.body.classList.remove('page-404') },
}
</script>

<style scoped>
* { box-sizing: border-box; }

.nf-page {
  width: 100%;
  align-self: stretch;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(420px, 0.9fr);
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

.nf-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.07) 100%);
  pointer-events: none;
  z-index: 0;
}

/* ── Panneau gauche teal ── */
.nf-visual {
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

.nf-visual::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 30%),
    radial-gradient(circle at 75% 75%, rgba(46,154,171,0.12), transparent 30%);
  border-radius: 28px 0 0 28px;
  pointer-events: none;
}

.nf-illustration {
  width: min(92%, 480px);
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
.nf-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: stretch;
}

.nf-card {
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

.nf-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ── Icônes nav ── */
.nf-icon-btn {
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
}
.nf-icon-btn:hover { transform: translateY(-1px); background: #fff; }

.nf-icon-tr {
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
.nf-icon-tr .nf-icon-btn {
  position: static;
  box-shadow: none;
  background: transparent;
}
.nf-icon-tr .nf-icon-btn:hover { background: rgba(46,156,171,0.1); }

.nf-icon {
  width: 1.05rem;
  height: 1.05rem;
  flex-shrink: 0;
}

/* ── Badge ── */
.nf-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 1.1rem;
  border-radius: 999px;
  background: rgba(63,178,191,0.1);
  border: 1.5px solid rgba(46,156,171,0.28);
  color: #2e9cab;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 2rem;
}

/* ── Texte ── */
.nf-title {
  font-size: clamp(1.8rem, 2.8vw, 2.4rem);
  font-weight: 800;
  color: #1b2f39;
  margin: 0 0 1.25rem;
  letter-spacing: -0.03em;
  line-height: 1.08;
}

.nf-sub {
  font-size: 0.97rem;
  color: #4f6570;
  line-height: 1.85;
  margin: 0 0 2.75rem;
  max-width: 340px;
}

/* ── Boutons ── */
.nf-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 340px;
}

.btn-home {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.82rem 1.8rem;
  border-radius: 999px;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 8px 24px rgba(46,156,171,0.32);
  transition: filter 0.2s, transform 0.2s;
  width: 100%;
}
.btn-home:hover { filter: brightness(1.08); transform: translateY(-2px); }

.btn-dash {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.82rem 1.8rem;
  border-radius: 999px;
  border: 1.5px solid rgba(46,156,171,0.3);
  color: #2e9cab;
  background: rgba(177,229,226,0.15);
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, transform 0.2s;
  width: 100%;
}
.btn-dash:hover { background: rgba(177,229,226,0.3); transform: translateY(-2px); }

/* ── Brand ── */
.nf-brand {
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
  .nf-page { height: 100%; min-height: 100dvh; overflow: hidden; }
  .nf-visual, .nf-content { min-height: 0; }
}

/* ── Tablette 769px – 1100px ── */
@media (max-width: 1100px) and (min-width: 769px) {
  .nf-page {
    width: 100%;
    grid-template-columns: 1fr;
    grid-template-rows: 44fr 56fr;
    height: 100dvh;
    min-height: unset;
    overflow: hidden;
    padding: 0.75rem;
    gap: 0.75rem;
  }
  .nf-visual, .nf-content { min-height: 0; }
  .nf-visual {
    border-radius: 20px;
    padding: 1.5rem 2rem;
    justify-content: center;
  }
  .nf-visual::before { border-radius: 20px; }
  .nf-illustration { width: min(100%, 240px); }
  .nf-card {
    border-radius: 20px;
    padding: 3rem 2.5rem 2rem;
    justify-content: flex-start;
  }
  .nf-main { flex: 0 0 auto; margin-top: auto; margin-bottom: auto; justify-content: flex-start; }
  .nf-badge { margin-bottom: 1.25rem; }
  .nf-title { font-size: clamp(1.5rem, 3vw, 1.9rem); }
  .nf-sub { margin-bottom: 2rem; font-size: 0.9rem; }
}

/* ── Mobile ≤ 768px ── */
@media (max-width: 768px) {
  .nf-page {
    width: 100%;
    grid-template-columns: 1fr;
    padding: 0.5rem;
    gap: 0.5rem;
    min-height: 100dvh;
    height: auto;
  }
  .nf-visual {
    border-radius: 18px;
    padding: 1.25rem 1rem;
    min-height: calc(100dvh - 1.5rem);
  }
  .nf-visual::before { border-radius: 18px; }
  .nf-illustration { width: min(100%, 260px); }
  .nf-content { align-items: stretch; }
  .nf-card {
    border-radius: 18px;
    padding: 4rem 1.5rem 2rem;
    height: calc(100dvh - 1.5rem);
    justify-content: flex-start;
  }
  .nf-main { flex: 0 0 auto; margin-top: auto; margin-bottom: auto; justify-content: flex-start; }
  .nf-badge { margin-top: 1.5rem; margin-bottom: 1.25rem; font-size: 1.05rem; padding: 0.45rem 1.5rem; }
  .nf-title { font-size: 2rem; }
  .nf-sub { font-size: 0.9rem; margin-bottom: 2rem; }
  .nf-actions { max-width: 100%; }
  .nf-brand { padding-top: 1rem; }
}
</style>

<style>
.page-404 .nav-island,
.page-404 .nav-bar { display: none !important; }
</style>
