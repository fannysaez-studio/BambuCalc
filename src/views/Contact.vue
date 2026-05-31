<template>
  <div class="contact-page">
    <!-- Bloc teal gauche -->
    <section class="contact-visual" aria-hidden="true">
      <div class="visual-badge">
        <span class="badge-mark"></span>
        <span>BambuCalc</span>
      </div>

      <div class="visual-copy">
        <h1>
          Une question ?<br class="title-br" />
          On est là.
        </h1>
        <p>Réponse garantie sous 24h en jours ouvrés.</p>
      </div>

      <div class="visual-illustration">
        <div class="visual-illustration-glow"></div>
        <img src="/contact-hero.svg" alt="Illustration contact" />
      </div>

      <div class="contact-info-list">
        <router-link to="/rdv" class="contact-info-item" title="Prendre un rendez-vous">
          <Calendar class="ci-icon" />
          <div>
            <strong>Rendez-vous</strong>
            <span>Prendre un appel</span>
          </div>
        </router-link>
        <div class="contact-info-item">
          <MapPin class="ci-icon" />
          <div>
            <strong>Localisation</strong>
            <span>Clermont-Ferrand</span>
          </div>
        </div>
        <div class="contact-info-item">
          <Clock class="ci-icon" />
          <div>
            <strong>Réponse</strong>
            <span>Sous 24h</span>
          </div>
        </div>
        <a
          class="contact-info-item"
          href="https://www.linkedin.com/in/fannysaez/"
          target="_blank"
          rel="noopener"
          title="LinkedIn"
        >
          <Linkedin class="ci-icon" />
          <div>
            <strong>LinkedIn</strong>
            <span>Mon profil</span>
          </div>
        </a>
      </div>
    </section>

    <!-- Bloc formulaire + FAQ droite -->
    <section class="contact-form-panel">
      <div class="contact-card" :class="{ 'contact-card--success': success }">
        <router-link to="/" class="contact-home-link" aria-label="Page d'accueil">
          <Home class="contact-home-icon" aria-hidden="true" />
        </router-link>

        <!-- Navigation tabs — icônes rondes top-right (style signup) -->
        <div class="contact-tab-icons">
          <button
            class="contact-tab-icon"
            :class="{ 'contact-tab-icon--active': tab === 'form' }"
            @click="tab = 'form'"
            type="button"
            title="Message"
          ><MessageSquare class="ctab-icon" /></button>
          <button
            class="contact-tab-icon"
            :class="{ 'contact-tab-icon--active': tab === 'faq' }"
            @click="tab = 'faq'"
            type="button"
            title="FAQ"
          ><HelpCircle class="ctab-icon" /></button>
          <router-link
            v-if="isAuth"
            to="/dashboard"
            class="contact-tab-icon"
            title="Tableau de bord"
          ><LayoutDashboard class="ctab-icon" /></router-link>
        </div>

        <!-- Onglet Formulaire -->
        <template v-if="tab === 'form'">
          <div class="contact-header">
            <h2>Nous écrire</h2>
            <p>Remplissez le formulaire, on vous répond rapidement.</p>
          </div>

          <div v-if="success" class="form-success">
            <div class="success-top">
              <span class="success-icon"><Check class="success-check-icon" /></span>
              <div>
                <strong>Message envoyé !</strong>
                <p>On revient vers vous très vite.</p>
              </div>
            </div>
            <div class="success-countdown">
              <div class="countdown-bar">
                <div class="countdown-fill" :style="{ width: (successCountdown / 5 * 100) + '%' }"></div>
              </div>
              <p class="countdown-text">Nouveau formulaire dans {{ successCountdown }}s</p>
            </div>
          </div>

          <form v-else @submit.prevent="onSubmit" class="contact-form">
            <!-- Nom + Email côte à côte -->
            <div class="fields-row">
              <div class="field">
                <label for="c-name">Nom</label>
                <input
                  id="c-name"
                  v-model="form.name"
                  type="text"
                  placeholder="Jean Dupont"
                  required
                />
              </div>
              <div class="field">
                <label for="c-email">E-mail</label>
                <input
                  id="c-email"
                  v-model="form.email"
                  type="email"
                  placeholder="vous@exemple.com"
                  required
                />
              </div>
            </div>
            <div class="field">
              <label for="c-message">Message</label>
              <textarea
                id="c-message"
                v-model="form.message"
                placeholder="Votre message…"
                rows="4"
                required
              ></textarea>
            </div>
            <div class="field captcha-field">
              <label>Vérification anti-robot</label>
              <div class="captcha-row">
                <span class="captcha-equation">{{ captchaA }} + {{ captchaB }} =</span>
                <input
                  v-model="captchaInput"
                  type="number"
                  inputmode="numeric"
                  placeholder="?"
                  class="captcha-input"
                  autocomplete="off"
                  required
                />
              </div>
            </div>
            <p v-if="error" class="form-error">{{ error }}</p>
            <button type="submit" class="primary-btn" :disabled="loading">
              {{ loading ? 'Envoi…' : 'Envoyer le message' }}
            </button>
          </form>
        </template>

        <!-- Onglet FAQ -->
        <template v-else>
          <div class="contact-header">
            <h2>Questions fréquentes</h2>
            <p>Les réponses aux questions les plus courantes.</p>
          </div>
          <div class="faq-list">
            <details v-for="item in faqs" :key="item.q" class="faq-item">
              <summary>{{ item.q }}</summary>
              <p>{{ item.a }}</p>
            </details>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { Home, MessageSquare, HelpCircle, Calendar, MapPin, Clock, Check, Linkedin, LayoutDashboard } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'

export default defineComponent({
  name: 'Contact',
  components: { Home, MessageSquare, HelpCircle, Calendar, MapPin, Clock, Check, Linkedin, LayoutDashboard },
  data() {
    return {
      tab: 'form',
      isAuth: false,
      form: { name: '', email: '', message: '' },
      loading: false,
      success: false,
      error: null,
      successCountdown: 5,
      successTimer: null,
      captchaA: 0,
      captchaB: 0,
      captchaInput: '',
      faqs: [
        {
          q: 'BambuCalc est-il gratuit ?',
          a: "Oui, BambuCalc est gratuit. Créez un compte pour accéder à toutes les fonctionnalités : calcul de coûts, gestion de devis et suivi de vos séries d'impression.",
        },
        {
          q: "Comment calculer le coût d'une impression 3D ?",
          a: "Renseignez le poids de filament, la durée d'impression et vos paramètres de coût. BambuCalc calcule automatiquement le prix de revient et le prix de vente suggéré.",
        },
        {
          q: 'Comment créer et envoyer un devis ?',
          a: 'Depuis le dashboard, cliquez sur "Nouveau devis", ajoutez vos pièces et coûts, puis envoyez-le au client par email. Un PDF est généré automatiquement.',
        },
        {
          q: 'Mes données sont-elles sécurisées ?',
          a: 'Oui. Vos données sont hébergées sur Supabase (région Europe – Frankfurt) et ne sont jamais partagées avec des tiers.',
        },
        {
          q: "Je n'arrive pas à me connecter, que faire ?",
          a: 'Utilisez "Mot de passe oublié ?" sur la page de connexion pour recevoir un lien de réinitialisation. Si le problème persiste, contactez-nous via ce formulaire.',
        },
      ],
    }
  },
  created() {
    this.generateCaptcha()
  },
  async mounted() {
    const { data: { session } } = await supabase.auth.getSession()
    this.isAuth = !!session?.user
  },
  beforeUnmount() {
    if (this.successTimer) clearInterval(this.successTimer)
  },
  methods: {
    startSuccessCountdown() {
      this.successCountdown = 5
      this.successTimer = setInterval(() => {
        this.successCountdown -= 1
        if (this.successCountdown <= 0) {
          clearInterval(this.successTimer)
          this.successTimer = null
          this.success = false
          this.form = { name: '', email: '', message: '' }
          this.generateCaptcha()
        }
      }, 1000)
    },
    generateCaptcha() {
      this.captchaA = Math.floor(Math.random() * 9) + 1
      this.captchaB = Math.floor(Math.random() * 9) + 1
      this.captchaInput = ''
    },
    async onSubmit() {
      this.error = null
      if (parseInt(this.captchaInput) !== this.captchaA + this.captchaB) {
        this.error = 'Code de vérification incorrect. Réessayez.'
        this.generateCaptcha()
        return
      }
      this.loading = true
      try {
        const { data, error } = await supabase.functions.invoke('send-contact-email', {
          body: { name: this.form.name, email: this.form.email, message: this.form.message },
        })
        if (error) {
          console.error('[Contact] invoke error:', error)
          throw error
        }
        if (data && !data.ok) {
          console.error('[Contact] function error:', data)
          throw new Error(data.error || 'Erreur inconnue')
        }
        this.success = true
        this.startSuccessCountdown()
      } catch (err) {
        console.error('[Contact] catch:', err)
        this.error = `Envoi impossible pour le moment. Contactez-nous directement par email. (${err?.message || err})`
      } finally {
        this.loading = false
      }
    },
  },
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.contact-page {
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

.contact-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.14) 0%, rgba(0, 0, 0, 0.1) 100%);
  pointer-events: none;
  z-index: 0;
}

/* ── Bloc teal ── */
.contact-visual {
  position: relative;
  border-radius: 28px 0 0 28px;
  padding: 2.5rem 0.25rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
  background: rgba(177, 229, 226, 0.62);
  isolation: isolate;
  z-index: 2;
}

.contact-visual::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.16), transparent 24%),
    radial-gradient(circle at 75% 70%, rgba(46, 154, 171, 0.1), transparent 28%);
  border-radius: 28px 0 0 28px;
  pointer-events: none;
}

.contact-visual::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 28px 0 0 28px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.28);
  pointer-events: none;
  z-index: 2;
}

.visual-badge,
.visual-copy,
.visual-illustration,
.contact-info-list {
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
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.badge-mark {
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.65rem;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.62));
  position: relative;
  box-shadow: 0 8px 18px rgba(29, 10, 50, 0.18);
}
.badge-mark::before,
.badge-mark::after {
  content: '';
  position: absolute;
  inset: 0.25rem 0.45rem auto auto;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: #ef7fa8;
  transform: rotate(35deg);
  box-shadow: -0.45rem 0.5rem 0 0 #f4c1cc;
}
.badge-mark::after {
  inset: auto auto 0.2rem 0.25rem;
  width: 0.9rem;
  height: 0.42rem;
  background: linear-gradient(90deg, #fff, rgba(255, 255, 255, 0.2));
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
  white-space: nowrap;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.24);
}
.visual-copy p {
  margin: 0.85rem 0 0;
  font-size: 1rem;
  line-height: 1.45;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

/* Illustration */
.visual-illustration {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: visible;
  z-index: 1;
}
.visual-illustration-glow {
  position: absolute;
  inset: 12% 18% 5%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.48) 0%,
    rgba(46, 154, 171, 0.18) 34%,
    transparent 74%
  );
  filter: blur(30px);
  pointer-events: none;
}
.visual-illustration img {
  width: min(100%, 340px);
  max-width: 340px;
  height: auto;
  display: block;
  filter: drop-shadow(0 24px 36px rgba(22, 10, 45, 0.28));
  position: relative;
  z-index: 1;
}

/* Infos dans le bloc teal — barre horizontale */
.contact-info-list {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}
.contact-info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 14px;
  padding: 0.75rem 0.5rem;
  box-shadow: 0 6px 18px rgba(29, 18, 43, 0.12);
  text-align: center;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}
.contact-info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(29, 18, 43, 0.16);
}
.ci-icon {
  width: 1.15rem;
  height: 1.15rem;
  color: #2e9cab;
  flex-shrink: 0;
}
.contact-info-item strong {
  display: block;
  font-size: 0.67rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #a0aec0;
}
.contact-info-item a,
.contact-info-item span {
  font-size: 0.76rem;
  font-weight: 600;
  color: #1b2f39;
  text-decoration: none;
  line-height: 1.3;
}
a.contact-info-item {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}
a.contact-info-item strong {
  text-decoration: none;
  color: #a0aec0;
}
a.contact-info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(29, 18, 43, 0.16);
}
a.contact-info-item:hover .ci-icon {
  color: #1f7f97;
}

/* ── Panneau formulaire ── */
.contact-form-panel {
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  position: relative;
  z-index: 1;
}

.contact-card {
  width: 100%;
  position: relative;
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(16px);
  border-radius: 0 28px 28px 0;
  padding: 3rem 3rem 2rem;
  box-shadow: -8px 0 20px rgba(29, 18, 43, 0.08);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* ── Navigation tabs — icônes rondes top-right ── */
.contact-tab-icons {
  position: absolute;
  top: 1.05rem;
  right: 1.05rem;
  display: flex;
  gap: 0.4rem;
  z-index: 3;
}
.contact-tab-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1.5px solid rgba(200, 197, 201, 0.5);
  color: #4f6570;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 12px rgba(29, 18, 43, 0.08);
  transition: all 0.2s ease;
  appearance: none;
  -webkit-appearance: none;
  text-decoration: none;
}
.contact-tab-icon:hover {
  background: rgba(46, 154, 171, 0.12);
  color: #2e9cab;
  border-color: #2e9cab;
  transform: translateY(-1px);
}
.contact-tab-icon--active {
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 6px 16px rgba(25, 108, 133, 0.3);
}
.contact-tab-icon--active:hover {
  filter: brightness(1.05);
  color: #fff;
  border-color: transparent;
}
.ctab-icon {
  width: 1.05rem;
  height: 1.05rem;
  flex-shrink: 0;
}

/* Divider — supprimé car onglets */
.section-divider {
  display: none;
}

.contact-home-link {
  position: absolute;
  top: 1.05rem;
  left: 1.05rem;
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #1f7f97;
  box-shadow: 0 10px 24px rgba(29, 18, 43, 0.08);
  z-index: 2;
  text-decoration: none;
  transition: transform 0.2s ease;
}
.contact-home-link:hover {
  transform: translateY(-1px);
  background: rgba(46, 154, 171, 0.12);
  color: #2e9cab;
}
.contact-home-icon {
  width: 1.05rem;
  height: 1.05rem;
  flex-shrink: 0;
}

.contact-header {
  text-align: center;
  margin-bottom: 1.5rem;
  margin-top: 1rem;
}
.contact-header h2 {
  margin: 0;
  font-size: clamp(1.75rem, 2.2vw, 2.2rem);
  font-weight: 800;
  color: #1b2f39;
  letter-spacing: -0.03em;
}
.contact-header p {
  margin: 0.75rem 0 0;
  color: #4f6570;
  font-size: 0.95rem;
}

/* Formulaire */
.contact-form {
  display: grid;
  gap: 1.1rem;
}

/* Nom + Email côte à côte */
.fields-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.field {
  display: grid;
  gap: 0.42rem;
}
.field label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #5b5a61;
}
.field input,
.field textarea {
  width: 100%;
  border: 1px solid #c8c5c9;
  border-radius: 0.55rem;
  background: #fff;
  min-height: 2.9rem;
  padding: 0.72rem 0.95rem;
  font: inherit;
  font-size: 0.95rem;
  color: #1f1e23;
  outline: none;
  resize: vertical;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.field input:focus,
.field textarea:focus {
  border-color: #2e9cab;
  box-shadow: 0 0 0 3px rgba(46, 154, 171, 0.16);
}
.field input::placeholder,
.field textarea::placeholder {
  color: #9b98a1;
}

.primary-btn {
  width: 100%;
  min-height: 2.95rem;
  border: 0;
  border-radius: 0.55rem;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  font: inherit;
  font-size: 0.98rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(25, 108, 133, 0.2);
  transition:
    filter 0.2s,
    opacity 0.2s;
  margin-top: 0.25rem;
}
.primary-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.primary-btn:hover:not(:disabled) {
  filter: brightness(1.05);
}

.form-error {
  padding: 0.6rem 0.85rem;
  border-radius: 0.4rem;
  background: rgba(220, 53, 69, 0.08);
  border: 1px solid rgba(220, 53, 69, 0.25);
  color: #c0392b;
  font-size: 0.85rem;
  margin: 0;
}

.contact-card--success {
  justify-content: center;
}

.form-success {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.75rem;
  border-radius: 1rem;
  background: rgba(46, 154, 171, 0.08);
  border: 1px solid rgba(46, 154, 171, 0.25);
  color: #1f7f97;
  animation: successFadeIn 0.4s ease both;
}

@keyframes successFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.success-top {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.success-icon {
  flex-shrink: 0;
  width: 2.8rem;
  height: 2.8rem;
  background: linear-gradient(135deg, #3fb2bf, #2e9cab);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(46, 154, 171, 0.3);
}
.success-check-icon {
  width: 1.4rem;
  height: 1.4rem;
  color: #fff;
}

.form-success strong {
  display: block;
  font-size: 1.05rem;
  font-weight: 700;
}

.form-success p {
  margin: 0.2rem 0 0;
  font-size: 0.88rem;
  opacity: 0.85;
}

.success-countdown {
  padding-top: 0.25rem;
}

.countdown-bar {
  height: 5px;
  background: rgba(46, 154, 171, 0.15);
  border-radius: 999px;
  overflow: hidden;
}

.countdown-fill {
  height: 100%;
  background: linear-gradient(90deg, #3fb2bf, #2e9cab);
  border-radius: 999px;
  transition: width 1s linear;
}

.countdown-text {
  margin: 0.6rem 0 0;
  font-size: 0.78rem;
  color: #2e9cab;
  opacity: 0.7;
  text-align: center;
  font-weight: 500;
}

/* Divider */
.section-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 1.75rem 0;
}

/* FAQ */
.faq-block h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #1b2f39;
  margin: 0 0 1rem;
  text-align: center;
}
.faq-list {
  display: grid;
  gap: 0.6rem;
  margin-top: 4.5rem;
}
.faq-item {
  border: 1px solid #e2e8f0;
  border-radius: 0.65rem;
  overflow: hidden;
  transition: border-color 0.2s;
}
.faq-item[open] {
  border-color: #b1e5e2;
}
.faq-item summary {
  padding: 0.85rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1b2f39;
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
}
.faq-item summary::-webkit-details-marker {
  display: none;
}
.faq-item summary::after {
  content: '+';
  font-size: 1.1rem;
  font-weight: 400;
  color: #2e9cab;
  transition: transform 0.2s;
  flex-shrink: 0;
  margin-left: 0.5rem;
}
.faq-item[open] summary::after {
  transform: rotate(45deg);
}
.faq-item p {
  margin: 0;
  padding: 0 1rem 0.85rem;
  font-size: 0.86rem;
  color: #4f6570;
  line-height: 1.6;
}

/* ===== Desktop : height fixe ===== */
@media (min-width: 1101px) {
  .contact-page {
    width: 100%;
    height: 100dvh;
    min-height: unset;
    overflow: hidden;
  }
  .contact-visual,
  .contact-form-panel {
    min-height: 0;
  }
  .contact-info-list {
    margin-top: auto;
  }
  /* Titre en haut, formulaire centré verticalement */
  .contact-card { justify-content: flex-start; }
  .contact-header { margin-top: 2rem; margin-bottom: 0; }
  .contact-form { gap: 1.4rem; margin-top: auto; margin-bottom: auto; }

  /* Textarea compact pour tenir sans scroll */
  .field textarea {
    height: 5rem;
    max-height: 12rem;
    resize: vertical;
  }
  /* CTA : plus de respiration au-dessus du bouton */
  .primary-btn { margin-top: 1.25rem; }

  /* ── Corrections visuelles desktop ── */

  /* Badge (orange) : décalé de la bordure gauche */
  .contact-visual { padding: 2.5rem 1.5rem 2rem; }

  /* Titre (bleu clair) : sur une seule ligne + plus grand */
  br.title-br { display: none; }
  .visual-copy h1 { font-size: clamp(1.9rem, 2.5vw, 2.6rem); }

  /* Cards info : toutes égales, remplissent toute la largeur */
  .contact-info-list { gap: 0.7rem; }
  .contact-info-item { flex: 1 1 0; }   /* base 0 → largeur identique pour toutes */
}

/* ===== Tablette : 769px – 1100px ===== */
@media (max-width: 1100px) and (min-width: 769px) {
  .contact-page {
    width: 100%;
    grid-template-columns: 1fr;
    grid-template-rows: 44fr 56fr;
    height: 100dvh;
    min-height: unset;
    overflow: hidden;
    padding: 0.75rem;
    gap: 0.75rem;
  }
  .contact-visual,
  .contact-card {
    border-radius: 20px;
  }
  .contact-visual::before,
  .contact-visual::after {
    border-radius: 20px;
  }
  .contact-visual,
  .contact-form-panel {
    min-height: 0;
  }
  .contact-visual {
    flex-direction: column;
    justify-content: space-between;
    padding: 1.75rem 2rem 1.25rem;
  }
  .visual-copy {
    margin-top: 0;
    text-align: center;
  }
  .visual-copy h1 {
    font-size: clamp(1.5rem, 2.8vw, 2rem);
    white-space: normal;
  }
  .visual-copy p {
    margin-top: 0.4rem;
    font-size: 0.88rem;
  }
  .visual-illustration {
    flex: 1;
    min-height: 0;
  }
  .visual-illustration img {
    width: min(100%, 180px);
    max-width: 180px;
  }
  .contact-info-list {
    flex-direction: row;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: 0;
    padding-top: 0.85rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }
  .contact-card {
    padding: 3rem 2.5rem 1.5rem;
    overflow-y: auto;
  }
  .field textarea {
    height: 5rem;
    max-height: 10rem;
    resize: vertical;
  }
  .contact-form { gap: 1rem; }
  .contact-header { margin-bottom: 1rem; margin-top: 0; }
}

/* ===== Mobile : ≤ 768px ===== */
@media (max-width: 768px) {
  .contact-page {
    width: 100%;
    grid-template-columns: 1fr;
    padding: 0.5rem;
    gap: 0.5rem;
    height: auto;
    overflow-x: hidden;
  }
  .contact-visual,
  .contact-card {
    border-radius: 18px;
  }
  .contact-visual::before,
  .contact-visual::after {
    border-radius: 18px;
  }

  /* ── Bloc teal ── */
  .contact-visual {
    min-height: calc(100dvh - 1.5rem);
    padding: 1.5rem 1.25rem 4rem;
    justify-content: space-between;
  }
  /* Titre sur une ligne, plus grand, descendu */
  br.title-br {
    display: none;
  }
  .visual-copy {
    margin-top: 2.5rem;
    text-align: center;
  }
  .visual-copy h1 {
    font-size: clamp(1.5rem, 6.5vw, 2rem);
    white-space: normal;
  }
  .visual-copy p {
    font-size: 0.84rem;
    margin-top: 0.5rem;
  }
  /* Illustration centrée, légèrement agrandie */
  .visual-illustration {
    flex: 1;
    min-height: 0;
    align-items: center;
  }
  .visual-illustration img {
    width: min(100%, 280px);
    max-width: 280px;
  }
  /* Cards remontées via padding-bottom plus grand */
  .contact-info-list {
    flex-direction: row;
    justify-content: space-between;
    gap: 0.35rem;
    margin-top: 0;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.25);
  }
  .contact-info-item {
    padding: 0.45rem 0.15rem; /* 4 cards sur mobile → padding réduit */
    gap: 0.25rem;
    border-radius: 10px;
  }
  .ci-icon {
    width: 0.9rem;
    height: 0.9rem;
  }
  .contact-info-item strong {
    font-size: 0.54rem;
  }
  .contact-info-item span {
    font-size: 0.7rem;
  }

  /* Nom + Email côte à côte sur mobile */
  .fields-row {
    grid-template-columns: 1fr 1fr;
    gap: 0.65rem;
  }

  /* ── Panneau formulaire — scroll natif, pas de scroll interne ── */
  .contact-form-panel {
    min-height: calc(100dvh - 1.5rem);
    display: flex;
    flex-direction: column;
  }
  .contact-card {
    flex: 1;
    padding: 4rem 1.5rem 3rem;
    justify-content: flex-start;
    overflow-y: visible;
  }
  .contact-header {
    margin-bottom: 2.5rem;
    margin-top: 2rem;
  }
  .contact-header h2 {
    font-size: clamp(1.4rem, 5vw, 1.8rem);
  }
  .contact-header p {
    font-size: 0.78rem;
    margin-top: 0.6rem;
    white-space: nowrap;
  }
  .contact-form {
    gap: 1.35rem;
  }
  .captcha-field {
    margin-top: 1rem;
  }
  .primary-btn {
    margin-top: 2rem;
  }
  .faq-list {
    margin-top: 1rem;
  }
  /* Textarea réduit sur mobile pour dégager le bouton de la barre nav */
  .field textarea {
    height: 4.5rem;
    min-height: 4rem;
    max-height: 8rem;
    resize: vertical;
  }
}

/* ===== Captcha ===== */
.captcha-field label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #5b5a61;
}
.captcha-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.38rem;
}
.captcha-equation {
  font-size: 1rem;
  font-weight: 700;
  color: #1b2f39;
  white-space: nowrap;
  letter-spacing: 0.02em;
}
.captcha-input {
  width: 5rem;
  border: 1px solid #c8c5c9;
  border-radius: 0.55rem;
  background: #fff;
  height: 2.9rem;
  padding: 0.72rem 0.95rem;
  font: inherit;
  font-size: 1rem;
  font-weight: 700;
  color: #1f1e23;
  text-align: center;
  outline: none;
  -moz-appearance: textfield;
}
.captcha-input::-webkit-outer-spin-button,
.captcha-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.captcha-input:focus {
  border-color: #2e9cab;
  box-shadow: 0 0 0 3px rgba(46, 154, 171, 0.16);
}
</style>

