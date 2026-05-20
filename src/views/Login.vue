<template>
  <div class="auth-page">
    <section class="auth-form-panel">
      <div class="auth-card">
        <router-link
          to="/"
          class="auth-home-link"
          aria-label="Page d'accueil"
          title="Page d'accueil"
        >
          <Home class="auth-home-icon" aria-hidden="true" />
        </router-link>
        <div class="auth-switcher" aria-label="Basculer entre connexion et inscription">
          <router-link
            to="/login"
            class="auth-tab active"
            aria-label="Se connecter"
            title="Se connecter"
          >
            <Lock class="auth-tab-icon" aria-hidden="true" />
          </router-link>
          <router-link to="/signup" class="auth-tab" aria-label="S'inscrire" title="S'inscrire">
            <UserPlus class="auth-tab-icon" aria-hidden="true" />
          </router-link>
          <button type="button" class="auth-tab auth-tab-guest" aria-label="Mode invité" title="Continuer sans compte" @click="onGuest">
            <UserX class="auth-tab-icon" aria-hidden="true" />
          </button>
        </div>

        <div class="auth-header">
          <h2>Connexion</h2>
          <p>Accédez à vos devis et à vos projets.</p>
        </div>

        <!-- ── Mode connexion normal ── -->
        <template v-if="!forgotMode">
          <form @submit.prevent="onSubmit" class="auth-form">
            <div class="field">
              <label for="login-email">Email</label>
              <input
                id="login-email"
                v-model="email"
                type="email"
                placeholder="vous@exemple.com"
                required
              />
            </div>

            <div class="field">
              <div class="field-label-row">
                <label for="login-password">Mot de passe</label>
                <button type="button" class="forgot-link" @click="forgotMode = true">
                  Mot de passe oublié ?
                </button>
              </div>
              <input
                id="login-password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            <p v-if="error" class="auth-error">{{ error }}</p>

            <button type="submit" class="primary-btn" :disabled="loading">
              {{ loading ? 'Connexion…' : 'Se connecter' }}
            </button>
          </form>

          <div class="auth-divider"><span>ou</span></div>

          <div class="social-grid">
            <button type="button" class="social-btn social-google" @click="onGoogle">
              <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Se connecter avec Google
            </button>
          </div>
        </template>

        <!-- ── Mode mot de passe oublié ── -->
        <template v-else>
          <div class="forgot-wrap">
            <!-- Succès -->
            <div v-if="forgotSent" class="forgot-success">
              <div class="forgot-success-icon">✉</div>
              <h3>Email envoyé !</h3>
              <p>Vérifie ta boîte mail — le lien est valable <strong>1 heure</strong>.</p>
              <button class="back-link" @click="backToLogin">← Retour à la connexion</button>
            </div>

            <!-- Formulaire -->
            <form v-else @submit.prevent="onForgot" class="auth-form">
              <div class="forgot-header">
                <h3 class="forgot-title">Mot de passe oublié</h3>
                <p class="forgot-sub">Saisis ton email pour recevoir un lien de réinitialisation.</p>
              </div>
              <div class="field">
                <label for="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  v-model="forgotEmail"
                  type="email"
                  placeholder="vous@exemple.com"
                  required
                />
              </div>
              <p v-if="forgotError" class="auth-error">{{ forgotError }}</p>
              <button type="submit" class="primary-btn" :disabled="forgotLoading">
                {{ forgotLoading ? 'Envoi…' : 'Envoyer le lien' }}
              </button>
              <button type="button" class="back-link" @click="backToLogin">← Retour à la connexion</button>
            </form>
          </div>
        </template>
      </div>
    </section>

    <section class="auth-visual" aria-hidden="true">
      <div class="visual-badge">
        <span class="badge-mark"></span>
        <span>BambuCalc</span>
      </div>

      <div class="visual-copy">
        <h1>Imaginez vos impressions en 3D</h1>
        <p>Un espace clair, rapide et premium pour piloter vos devis.</p>
      </div>

      <div class="visual-illustration">
        <img src="/login-hero.svg" alt="Clé de connexion" />
      </div>
    </section>
  </div>
</template>

<script>
import comp from './Login.js'
export default comp
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.auth-page {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: minmax(420px, 0.94fr) minmax(0, 1fr);
  padding: 1rem;
  background-image: url('/hero-vagues.svg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
  position: relative;
  overflow-x: hidden;
}

.auth-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.14) 0%, rgba(0, 0, 0, 0.1) 100%);
  pointer-events: none;
  z-index: 0;
}

.auth-visual {
  position: relative;
  overflow: visible;
  border-radius: 0 28px 28px 0;
  padding: 2rem 2rem 1.75rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
  background: rgba(177, 229, 226, 0.62);
  isolation: isolate;
  z-index: 2;
}

.auth-visual::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.16), transparent 24%),
    radial-gradient(circle at 75% 70%, rgba(46, 154, 171, 0.1), transparent 28%);
  border-radius: 0 28px 28px 0;
  pointer-events: none;
}

.auth-visual::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 0 28px 28px 0;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.28);
  pointer-events: none;
  z-index: 2;
}

.visual-badge,
.visual-copy,
.visual-illustration {
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
  margin-top: 2.8rem;
  max-width: 100%;
  text-align: center;
}

.visual-copy h1 {
  margin: 0;
  font-size: clamp(2rem, 2.9vw, 3rem);
  line-height: 1.03;
  letter-spacing: -0.03em;
  font-weight: 800;
  white-space: normal;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.24);
}

.visual-copy p {
  margin: 1rem 0 0;
  max-width: 100%;
  font-size: 1rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.94);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}

.visual-illustration {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: visible;
  min-height: 21rem;
}

.visual-illustration::before {
  content: '';
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
  z-index: 0;
}

.visual-illustration img {
  width: min(100%, 390px);
  max-width: 390px;
  height: auto;
  display: block;
  filter: drop-shadow(0 28px 40px rgba(22, 10, 45, 0.32));
  position: relative;
  z-index: 1;
}

.auth-form-panel {
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  position: relative;
  z-index: 1;
}

.auth-card {
  width: 100%;
  position: relative;
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(16px);
  border-radius: 28px 0 0 28px;
  padding: 3.25rem 3rem 2rem;
  box-shadow: 8px 0 20px rgba(29, 18, 43, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-home-link {
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
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.auth-home-link:hover {
  transform: translateY(-1px);
}

.auth-home-icon {
  width: 1.05rem;
  height: 1.05rem;
  flex-shrink: 0;
}

.auth-switcher {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.3rem;
  padding: 0.25rem;
  margin: 0;
  position: absolute;
  top: 1.05rem;
  right: 1.05rem;
  width: fit-content;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 10px 24px rgba(29, 18, 43, 0.08);
  z-index: 2;
}

.auth-tab-guest {
  color: #718096;
}
.auth-tab-guest:hover {
  color: #2e9cab;
}

.auth-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  text-decoration: none;
  color: #1f7f97;
  font-weight: 700;
  font-size: 0.95rem;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.auth-tab.active {
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  box-shadow: 0 10px 22px rgba(25, 108, 133, 0.24);
}

.auth-tab:hover {
  transform: translateY(-1px);
}

.auth-tab-icon {
  width: 1.05rem;
  height: 1.05rem;
  flex-shrink: 0;
}

.auth-header,
.auth-switch {
  text-align: center;
}

.auth-header h2 {
  margin: 0;
  font-size: clamp(2rem, 2.4vw, 2.35rem);
  line-height: 1.08;
  color: #1b2f39;
  letter-spacing: -0.03em;
  font-weight: 800;
}

.auth-header p {
  margin: 0.9rem 0 0;
  color: #4f6570;
  font-size: 0.98rem;
}

.auth-form {
  margin-top: 2rem;
  display: grid;
  gap: 1rem;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field {
  display: grid;
  gap: 0.38rem;
}

.field label {
  font-size: 0.72rem;
  line-height: 1;
  color: #5b5a61;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.field input {
  width: 100%;
  border: 1px solid #c8c5c9;
  border-radius: 0.55rem;
  background: #fff;
  min-height: 2.9rem;
  padding: 0.72rem 0.95rem;
  font: inherit;
  color: #1f1e23;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.field input::placeholder {
  color: #9b98a1;
}

.field input:focus {
  border-color: #2e9cab;
  box-shadow: 0 0 0 3px rgba(46, 154, 171, 0.16);
}

.auth-error {
  margin: 0;
  padding: 0.6rem 0.85rem;
  border-radius: 0.4rem;
  background: rgba(220, 53, 69, 0.08);
  border: 1px solid rgba(220, 53, 69, 0.25);
  color: #c0392b;
  font-size: 0.85rem;
}

.primary-btn {
  margin-top: 0.4rem;
  width: 100%;
  min-height: 2.95rem;
  border: 0;
  border-radius: 0.35rem;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  font-size: 0.98rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(25, 108, 133, 0.2);
  transition: filter 0.2s ease, opacity 0.2s ease;
}

.primary-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.3rem 0 1rem;
  color: #58555f;
  font-size: 0.95rem;
}

.auth-divider span {
  text-transform: lowercase;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #d6d2d8;
}

.social-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.social-btn {
  min-height: 2.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  border-radius: 0.35rem;
  border: 1px solid #9f9ba6;
  background: #fff;
  color: #2c2b31;
  font: inherit;
  font-size: 0.78rem;
  cursor: pointer;
}

.social-google .social-icon {
  background: transparent;
}

.social-icon {
  width: 1.25rem;
  height: 1.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: #fff;
  font-weight: 700;
  font-size: 0.74rem;
  flex-shrink: 0;
}

.social-icon svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.social-facebook .social-icon {
  background: #3d6edb;
}

.social-x .social-icon {
  background: #222;
}

/* ── Mot de passe oublié ── */
.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.forgot-link {
  background: none;
  border: none;
  color: #2e9cab;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  transition: color 0.2s ease;
}
.forgot-link:hover { color: #1f7f97; text-decoration: underline; }

.forgot-wrap { margin-top: 2rem; }

.forgot-header { text-align: center; margin-bottom: 1.25rem; }
.forgot-title { font-size: 1.5rem; font-weight: 800; color: #1b2f39; margin: 0 0 0.4rem; letter-spacing: -0.02em; }
.forgot-sub   { font-size: 0.92rem; color: #4f6570; margin: 0; }

.back-link {
  background: none;
  border: none;
  color: #718096;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0;
  font-family: inherit;
  text-align: center;
  width: 100%;
  display: block;
  transition: color 0.2s ease;
  margin-top: 0.25rem;
}
.back-link:hover { color: #2e9cab; }

.forgot-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  padding: 1.5rem 0;
}
.forgot-success-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}
.forgot-success h3 { font-size: 1.3rem; font-weight: 800; color: #1b2f39; margin: 0; }
.forgot-success p  { font-size: 0.9rem; color: #4f6570; margin: 0; line-height: 1.5; }

/* ===== Desktop only: hero 100dvh sans scroll ===== */
@media (min-width: 1101px) {
  /* 1. Fixer la hauteur exacte du viewport
     - width: 100% force l'étirement dans le flex container (page-wrap a align-items: center)
       → sans ça, le grid avec fr units se réduit à son min-content et l'app background #f0f4f8
         apparaît sur les côtés (contour gris). Le padding: 1rem de base RESTE pour conserver
         la respiration visible autour de la carte (comme Landing et Signup).
     - height: 100dvh bloque la page au viewport, min-height: unset annule l'ancienne valeur
     - overflow: hidden coupe tout débordement interne */
  .auth-page {
    width: 100%;
    height: 100dvh;
    min-height: unset;
    overflow: hidden;
  }

  /* 2. Permettre aux colonnes du grid de se comprimer (min-height: auto → 0) */
  .auth-form-panel,
  .auth-visual {
    min-height: 0;
  }

  /* 3. L'illustration prend l'espace restant au lieu de tenir min-height: 21rem figé */
  .visual-illustration {
    flex: 1;
    min-height: 0;
  }

  /* 4. Réduire le margin du titre côté visuel */
  .visual-copy {
    margin-top: 1.5rem;
  }

  /* 5. Réduire le padding de la carte formulaire */
  .auth-card {
    padding: 2rem 2.5rem 1.5rem;
  }

  /* 6. Réduire l'espacement interne du formulaire */
  .auth-form {
    margin-top: 1.5rem;
    gap: 0.75rem;
  }

  /* 7. Sous-titre du header moins espacé */
  .auth-header p {
    margin-top: 0.5rem;
  }

  /* 8. Inputs légèrement moins hauts */
  .field input {
    min-height: 2.6rem;
    padding: 0.6rem 0.95rem;
  }

  /* 9. Bouton principal légèrement moins haut */
  .primary-btn {
    min-height: 2.6rem;
  }

  /* 10. Séparateur "ou" plus compact */
  .auth-divider {
    margin: 0.7rem 0;
  }
}

/* ===== Tablette : 769px – 1100px ===== */
@media (max-width: 1100px) and (min-width: 769px) {
  .auth-page {
    grid-template-columns: 1fr;
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .auth-visual,
  .auth-card {
    border-radius: 20px;
  }

  .auth-visual {
    padding: 1.5rem 1.5rem 1rem;
  }

  .visual-copy {
    margin-top: 1.5rem;
    max-width: 26rem;
    margin-left: auto;
    margin-right: auto;
  }

  .visual-copy h1 {
    font-size: clamp(1.7rem, 3.5vw, 2.4rem);
  }

  /* Illustration présente mais compacte */
  .visual-illustration {
    min-height: 12rem;
    flex: unset;
  }

  .visual-illustration img {
    width: min(100%, 260px);
    max-width: 260px;
  }

  .auth-card {
    padding: 2.25rem 2rem 1.75rem;
  }

  .auth-form {
    margin-top: 1.75rem;
    gap: 0.9rem;
  }
}

/* ===== Mobile : ≤ 768px ===== */
@media (max-width: 768px) {
  .auth-page {
    grid-template-columns: 1fr;
    padding: 0.5rem;
    gap: 0.6rem;
  }

  .auth-visual,
  .auth-card {
    border-radius: 18px;
  }

  .auth-visual {
    padding: 1.1rem 1rem 0.75rem;
  }

  .visual-copy {
    margin-top: 1rem;
  }

  .visual-copy h1 {
    font-size: clamp(1.5rem, 6vw, 2rem);
  }

  .visual-copy p {
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }

  /* Illustration très compacte (formulaire est en haut via DOM order) */
  .visual-illustration {
    min-height: 9rem;
    flex: unset;
  }

  .visual-illustration img {
    width: min(100%, 200px);
    max-width: 200px;
  }

  .auth-card {
    padding: 1.75rem 1.25rem 1.5rem;
  }

  .auth-form {
    margin-top: 1.5rem;
    gap: 0.85rem;
  }

  .field input {
    min-height: 2.9rem;
    padding: 0.72rem 0.95rem;
  }

  .primary-btn {
    min-height: 2.9rem;
  }

  .auth-divider {
    margin: 1rem 0 0.85rem;
  }
}

/* ===== Mini-mobile : ≤ 420px ===== */
@media (max-width: 420px) {
  .auth-page {
    padding: 0.25rem;
    gap: 0.4rem;
  }

  /* Le formulaire est en haut (DOM order Login) → masquer l'illustration en bas */
  .visual-illustration {
    display: none;
  }

  .auth-visual {
    padding: 0.9rem 0.85rem 0.65rem;
  }

  .auth-card {
    padding: 1.5rem 1rem 1.25rem;
  }
}
</style>
