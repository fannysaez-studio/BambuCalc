<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Home, LogIn, MessageSquare, CheckCircle } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'
import PasswordField from '@/components/ui/PasswordField.vue'
import { useHead } from '@vueuse/head'

useHead({
  title: 'Nouveau mot de passe — BambuCalc',
  meta: [
    { name: 'description', content: 'Réinitialisez votre mot de passe BambuCalc.' },
    { name: 'robots', content: 'index, follow' },
  ],
  link: [{ rel: 'canonical', href: 'https://bambucalc.netlify.app/reset-password' }],
})

const router = useRouter()

const password     = ref('')
const confirm      = ref('')
const error        = ref(null)
const loading      = ref(false)
const success      = ref(false)
const sessionReady = ref(false)

let subscription = null

onMounted(async () => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
      sessionReady.value = true
    }
  })
  subscription = data.subscription
  const { data: { session } } = await supabase.auth.getSession()
  if (session) sessionReady.value = true
  document.body.classList.add('page-reset')
})

onUnmounted(() => {
  subscription?.unsubscribe()
  document.body.classList.remove('page-reset')
})

async function onSubmit() {
  error.value = null
  if (!password.value || password.value.length < 8) {
    error.value = 'Le mot de passe doit contenir au moins 8 caractères.'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'Les mots de passe ne correspondent pas.'
    return
  }
  loading.value = true
  try {
    const { error: err } = await supabase.auth.updateUser({ password: password.value })
    if (err) throw err
    success.value = true
    setTimeout(() => router.push('/login'), 2500)
  } catch (e) {
    error.value = e?.message?.includes('session')
      ? 'Le lien a expiré. Recommence depuis la page de connexion.'
      : (e?.message || 'Erreur lors de la mise à jour.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="rp-page">

    <!-- ── Panneau gauche : formulaire ── -->
    <section class="rp-content">
      <div class="rp-card">

        <!-- Icône maison — top-left -->
        <router-link to="/" class="rp-icon-btn rp-icon-tl" aria-label="Page d'accueil" title="Page d'accueil">
          <Home class="rp-icon" aria-hidden="true" />
        </router-link>


        <!-- ── État : succès ── -->
        <div v-if="success" class="rp-state">
          <div class="rp-state-icon">
            <CheckCircle class="rp-state-svg" />
          </div>
          <h2 class="rp-state-title">Mot de passe mis à jour !</h2>
          <p class="rp-state-sub">Redirection vers la connexion…</p>
        </div>

        <!-- ── État : vérification du lien ── -->
        <div v-else-if="!sessionReady" class="rp-state">
          <div class="rp-spinner"></div>
          <p class="rp-state-sub">Vérification du lien…</p>
        </div>

        <!-- ── État : formulaire ── -->
        <div v-else class="rp-main">
          <div class="rp-header">
            <h2 class="rp-title">Nouveau mot de passe</h2>
            <p class="rp-sub">Choisis un mot de passe sécurisé.</p>
          </div>
          <form @submit.prevent="onSubmit" class="rp-form">
            <PasswordField id="new-password" label="Nouveau mot de passe" :show-strength="true" v-model="password" />
            <PasswordField id="confirm-password" label="Confirmer" v-model="confirm" />
            <p v-if="error" class="rp-error">{{ error }}</p>
            <button type="submit" class="rp-btn" :disabled="loading">
              {{ loading ? 'Enregistrement…' : 'Enregistrer le mot de passe' }}
            </button>
          </form>
        </div>

        <img src="/new-password-hero.svg" class="rp-mobile-illus" alt="" aria-hidden="true" />

        <p class="rp-brand">BambuCalc</p>
      </div>
    </section>

    <!-- ── Panneau droit : illustration ── -->
    <section class="rp-visual">
      <router-link to="/contact" class="rp-icon-btn rp-icon-tl" aria-label="Contact" title="Contact">
        <MessageSquare class="rp-icon" aria-hidden="true" />
      </router-link>
      <div class="rp-icon-tr">
        <router-link to="/login" class="rp-icon-btn" aria-label="Se connecter" title="Se connecter">
          <LogIn class="rp-icon" aria-hidden="true" />
        </router-link>
      </div>
      <img src="/new-password-hero.svg" class="rp-illustration" alt="Réinitialisation du mot de passe" aria-hidden="true" />
    </section>

  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.rp-page {
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

.rp-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.07) 100%);
  pointer-events: none;
  z-index: 0;
}

/* ── Panneau gauche blanc ── */
.rp-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: stretch;
}

.rp-card {
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
  animation: cardIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ── Panneau gauche teal ── */
.rp-visual {
  position: relative;
  z-index: 1;
  order: -1;
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

.rp-visual::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 30%),
    radial-gradient(circle at 75% 75%, rgba(46,154,171,0.12), transparent 30%);
  border-radius: 28px 0 0 28px;
  pointer-events: none;
}

.rp-illustration {
  width: min(92%, 420px);
  height: auto;
  display: block;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 18px 36px rgba(29,18,43,0.16));
  animation: illustIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}

@keyframes illustIn {
  from { opacity: 0; transform: translateY(22px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Icônes nav ── */
.rp-icon-btn {
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
.rp-icon-btn:hover { transform: translateY(-1px); background: #fff; }

.rp-icon-tr {
  position: absolute;
  top: 1.05rem;
  right: 1.05rem;
  display: flex;
  padding: 0.25rem;
  border-radius: 999px;
  background: rgba(255,255,255,0.75);
  box-shadow: 0 4px 14px rgba(29,18,43,0.1);
  z-index: 3;
}
.rp-icon-tr .rp-icon-btn {
  position: static;
  box-shadow: none;
  background: transparent;
}
.rp-icon-tr .rp-icon-btn:hover { background: rgba(46,156,171,0.1); }

.rp-icon { width: 1.05rem; height: 1.05rem; flex-shrink: 0; }

/* ── Contenu principal ── */
.rp-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.rp-header { margin-bottom: 2rem; }

.rp-title {
  font-size: clamp(1.6rem, 2.5vw, 2.1rem);
  font-weight: 800;
  color: #1b2f39;
  margin: 0 0 0.6rem;
  letter-spacing: -0.03em;
}

.rp-sub {
  font-size: 0.92rem;
  color: #718096;
  margin: 0;
  line-height: 1.5;
}

.rp-form {
  display: grid;
  gap: 1.25rem;
  width: 100%;
  max-width: 360px;
}

.rp-error {
  margin: 0;
  padding: 0.6rem 0.85rem;
  border-radius: 0.4rem;
  background: rgba(220,53,69,0.08);
  border: 1px solid rgba(220,53,69,0.25);
  color: #c0392b;
  font-size: 0.85rem;
  text-align: left;
}

.rp-btn {
  width: 100%;
  min-height: 2.95rem;
  border: 0;
  border-radius: 0.55rem;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  font-size: 0.98rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 8px 22px rgba(46,156,171,0.3);
  transition: filter 0.2s, transform 0.2s;
  margin-top: 0.5rem;
}
.rp-btn:disabled { opacity: 0.65; cursor: not-allowed; }
.rp-btn:hover:not(:disabled) { filter: brightness(1.06); transform: translateY(-1px); }

/* ── États ── */
.rp-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem 0;
}

.rp-state-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 1.2rem;
  background: linear-gradient(135deg, #3fb2bf, #2e9cab);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(46,154,171,0.28);
}
.rp-state-svg  { width: 2rem; height: 2rem; color: #fff; }
.rp-state-title { font-size: 1.3rem; font-weight: 800; color: #1b2f39; margin: 0; }
.rp-state-sub   { font-size: 0.9rem; color: #718096; margin: 0; }

.rp-spinner {
  width: 2.4rem;
  height: 2.4rem;
  border: 3px solid #e2e8f0;
  border-top-color: #2e9cab;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.rp-mobile-illus { display: none; }

/* ── Brand ── */
.rp-brand {
  margin-top: auto;
  padding-top: 1.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #2e9cab;
  opacity: 0.45;
}

/* ── Desktop ≥ 769px : aération + labels gauche ── */
@media (min-width: 769px) {
  .rp-main {
    width: 100%;
    max-width: 380px;
    align-items: stretch;
    justify-content: flex-start;
  }
  .rp-header {
    text-align: center;
    margin-top: 2rem;
    margin-bottom: 0;
  }
  .rp-form {
    text-align: left;
    gap: 2rem;
    margin-top: auto;
    margin-bottom: auto;
  }
  .rp-btn {
    margin-top: 1.5rem;
  }
  .rp-card .rp-icon-tl {
    left: auto;
    right: 1.05rem;
  }
}

/* ── Desktop ≥ 1101px ── */
@media (min-width: 1101px) {
  .rp-page { height: 100%; min-height: 100dvh; overflow: hidden; }
  .rp-content, .rp-visual { min-height: 0; }
}

/* ── Tablette 769px – 1100px ── */
@media (max-width: 1100px) and (min-width: 769px) {
  .rp-page {
    width: 100%;
    grid-template-columns: 1fr;
    grid-template-rows: 44fr 56fr;
    height: 100dvh;
    min-height: unset;
    overflow: hidden;
    padding: 0.75rem;
    gap: 0.75rem;
  }
  .rp-content, .rp-visual { min-height: 0; }
  .rp-card { border-radius: 20px; padding: 3rem 2.5rem 2rem; }
  .rp-visual { order: -1; border-radius: 20px; padding: 1.5rem 2rem; }
  .rp-visual::before { border-radius: 20px; }
  .rp-illustration { width: min(100%, 220px); }
  .rp-title { font-size: 1.6rem; }
}

/* ── Mobile ≤ 768px ── */
@media (max-width: 768px) {
  .rp-page {
    width: 100%;
    grid-template-columns: 1fr;
    padding: 0.5rem;
    gap: 0.5rem;
    min-height: 100dvh;
    height: auto;
  }
  .rp-content { align-items: stretch; }
  .rp-card {
    border-radius: 18px;
    padding: 4.5rem 1.5rem 2rem;
    min-height: calc(100dvh - 1.5rem);
    justify-content: flex-start;
  }
  .rp-main {
    justify-content: flex-start;
  }
  .rp-header {
    margin-top: 1rem;
    margin-bottom: 0;
  }
  .rp-form {
    margin-top: 5rem;
    gap: 1.5rem;
  }
  .rp-mobile-illus {
    display: block;
    width: min(100%, 220px);
    margin: auto auto 0;
  }
  .rp-visual {
    border-radius: 18px;
    padding: 1.25rem 1rem;
    min-height: calc(100dvh - 1.5rem);
  }
  .rp-visual::before { border-radius: 18px; }
  .rp-illustration { width: min(100%, 240px); }
  .rp-title { font-size: 1.5rem; }
  .rp-sub { font-size: 0.88rem; }
  .rp-form { max-width: 100%; }
}
</style>

<style>
.page-reset .nav-island,
.page-reset .nav-bar { display: none !important; }
</style>
