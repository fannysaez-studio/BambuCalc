<template>
  <div class="auth-page" :class="isLogin ? 'mode-login' : 'mode-signup'">

    <!-- ── CONTRÔLES FIXES (home + switcher) ── -->
    <router-link to="/" class="ctrl-home" aria-label="Accueil" title="Accueil">
      <Home class="ctrl-icon" aria-hidden="true" />
    </router-link>

    <div class="ctrl-switcher" aria-label="Basculer connexion / inscription">
      <button
        :class="['ctrl-tab', { active: isLogin }]"
        aria-label="Se connecter"
        title="Se connecter"
        @click="setMode('login')"
      >
        <Lock class="ctrl-tab-icon" aria-hidden="true" />
      </button>
      <button
        :class="['ctrl-tab', { active: !isLogin }]"
        aria-label="S'inscrire"
        title="S'inscrire"
        @click="setMode('signup')"
      >
        <UserPlus class="ctrl-tab-icon" aria-hidden="true" />
      </button>
    </div>

    <!-- ── PANEL CONNEXION (gauche) ── -->
    <div class="auth-panel panel-login">
      <div class="form-card">
        <div class="form-header">
          <h2>Connexion</h2>
          <p>Accédez à vos devis et à vos projets.</p>
        </div>

        <form @submit.prevent="onLogin" class="auth-form">
          <div class="field">
            <label for="l-email">Email</label>
            <input
              id="l-email"
              v-model="loginData.email"
              type="email"
              placeholder="vous@exemple.com"
              required
            />
          </div>
          <div class="field">
            <label for="l-pwd">Mot de passe</label>
            <input
              id="l-pwd"
              v-model="loginData.password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" class="primary-btn">Se connecter</button>
        </form>

        <div class="auth-divider"><span>ou</span></div>

        <div class="social-grid">
          <button type="button" class="social-btn social-facebook">
            <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Se connecter avec Facebook
          </button>
          <button type="button" class="social-btn social-google">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Se connecter avec Google
          </button>
        </div>
      </div>
    </div>

    <!-- ── PANEL INSCRIPTION (droite) ── -->
    <div class="auth-panel panel-signup">
      <div class="form-card">
        <div class="form-header">
          <h2>Inscription</h2>
          <p>Rejoignez BambuCalc et gérez vos projets 3D.</p>
        </div>

        <form @submit.prevent="onSignup" class="auth-form">
          <div class="field-grid">
            <div class="field">
              <label for="s-fn">Prénom</label>
              <input id="s-fn" v-model="signupData.firstName" type="text" placeholder="Jean" required />
            </div>
            <div class="field">
              <label for="s-ln">Nom</label>
              <input id="s-ln" v-model="signupData.lastName" type="text" placeholder="Dupont" required />
            </div>
          </div>
          <div class="field">
            <label for="s-email">E-mail</label>
            <input id="s-email" v-model="signupData.email" type="email" placeholder="vous@exemple.com" required />
          </div>
          <div class="field">
            <label for="s-pwd">Mot de passe</label>
            <input id="s-pwd" v-model="signupData.password" type="password" placeholder="••••••••" required />
          </div>
          <button type="submit" class="primary-btn">Créer un compte</button>
        </form>

        <div class="auth-divider"><span>ou</span></div>

        <div class="social-grid">
          <button type="button" class="social-btn social-facebook">
            <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            S'inscrire avec Facebook
          </button>
          <button type="button" class="social-btn social-google">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            S'inscrire avec Google
          </button>
        </div>
      </div>
    </div>

    <!-- ── PANNEAU VISUEL GLISSANT ── -->
    <div class="auth-visual">
      <div class="visual-badge">
        <span class="badge-mark"></span>
        <span>BambuCalc</span>
      </div>

      <Transition name="vcontent" mode="out-in">
        <div v-if="isLogin" key="lc" class="visual-body">
          <h1>Imaginez vos impressions en 3D</h1>
          <p>Un espace clair, rapide et premium pour piloter vos devis.</p>
          <div class="visual-illustration">
            <img src="/signUp-hero.svg" alt="" />
          </div>
        </div>
        <div v-else key="sc" class="visual-body">
          <h1>S'inscrire en quelques secondes</h1>
          <p>Une interface élégante pour suivre vos devis et vos séries.</p>
          <div class="visual-illustration">
            <img src="/login-hero.svg" alt="" />
          </div>
        </div>
      </Transition>
    </div>

  </div>
</template>

<script>
import { Home, Lock, UserPlus } from 'lucide-vue-next'
import { login, signup } from '../utils/auth'

export default {
  name: 'AuthPage',
  components: { Home, Lock, UserPlus },
  data() {
    return {
      isLogin: this.$route.name === 'login',
      loginData: { email: '', password: '' },
      signupData: { firstName: '', lastName: '', email: '', password: '' },
    }
  },
  watch: {
    $route(to) {
      this.isLogin = to.name === 'login'
    },
  },
  methods: {
    setMode(mode) {
      if ((mode === 'login') === this.isLogin) return
      this.isLogin = mode === 'login'
      this.$router.push({ name: mode })
    },
    onLogin() {
      const res = login({ email: this.loginData.email, password: this.loginData.password })
      if (res) {
        this.$router.push('/calculator')
      } else {
        alert('Utilisateur non trouvé. Créez un compte.')
      }
    },
    onSignup() {
      const res = signup({
        name: `${this.signupData.firstName} ${this.signupData.lastName}`.trim(),
        email: this.signupData.email,
        password: this.signupData.password,
      })
      if (res) {
        this.$router.push('/calculator')
      }
    },
  },
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

/* ════════════════════════════════
   CONTENEUR PRINCIPAL
════════════════════════════════ */
.auth-page {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.auth-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.14) 0%, rgba(0, 0, 0, 0.1) 100%);
  pointer-events: none;
  z-index: 0;
}

/* ════════════════════════════════
   CONTRÔLES FIXES : HOME + SWITCHER
   Toujours visibles, au-dessus de tout
════════════════════════════════ */
.ctrl-home {
  position: absolute;
  top: 2rem;
  left: 2rem;
  z-index: 30;
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #1f7f97;
  box-shadow: 0 8px 20px rgba(29, 18, 43, 0.1);
  text-decoration: none;
  transition: transform 0.2s ease, background 0.2s ease;
}

.ctrl-home:hover {
  transform: translateY(-1px);
  background: #fff;
}

.ctrl-icon {
  width: 1.05rem;
  height: 1.05rem;
  flex-shrink: 0;
}

.ctrl-switcher {
  position: absolute;
  top: 2rem;
  right: 2rem;
  z-index: 30;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem;
  padding: 0.25rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 8px 20px rgba(29, 18, 43, 0.1);
}

.ctrl-tab {
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: #1f7f97;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.ctrl-tab:hover {
  transform: translateY(-1px);
}

.ctrl-tab.active {
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  box-shadow: 0 8px 18px rgba(25, 108, 133, 0.28);
}

.ctrl-tab-icon {
  width: 1.05rem;
  height: 1.05rem;
  flex-shrink: 0;
}

/* ════════════════════════════════
   PANELS FORMULAIRES
════════════════════════════════ */
.auth-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
  z-index: 1;
}

.form-card {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 2.5rem 2rem 2rem;
}

.form-header {
  text-align: center;
  margin-bottom: 1.6rem;
}

.form-header h2 {
  margin: 0;
  font-size: clamp(1.6rem, 2.2vw, 2.1rem);
  font-weight: 800;
  color: #1b2f39;
  letter-spacing: -0.03em;
  line-height: 1.08;
}

.form-header p {
  margin: 0.7rem 0 0;
  color: #4f6570;
  font-size: 0.95rem;
  line-height: 1.4;
}

/* ════════════════════════════════
   CHAMPS
════════════════════════════════ */
.auth-form {
  display: grid;
  gap: 0.85rem;
}

.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.field {
  display: grid;
  gap: 0.3rem;
}

.field label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #5b5a61;
}

.field input {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid #c8c5c9;
  border-radius: 0.55rem;
  background: #fff;
  font: inherit;
  color: #1f1e23;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field input::placeholder {
  color: #9b98a1;
}

.field input:focus {
  border-color: #2e9cab;
  box-shadow: 0 0 0 3px rgba(46, 154, 171, 0.16);
}

.primary-btn {
  margin-top: 0.2rem;
  width: 100%;
  min-height: 2.85rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(180deg, #3fb2bf 0%, #2e9cab 100%);
  color: #fff;
  font: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(25, 108, 133, 0.22);
  transition: filter 0.2s ease, transform 0.2s ease;
}

.primary-btn:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin: 1.1rem 0 0.9rem;
  color: #58555f;
  font-size: 0.88rem;
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
  grid-template-columns: 1fr 1fr;
  gap: 0.7rem;
}

.social-btn {
  min-height: 2.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.45rem;
  border: 1px solid #c8c5c9;
  background: #fff;
  color: #2c2b31;
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.social-btn:hover {
  border-color: #2e9cab;
  box-shadow: 0 2px 8px rgba(46, 154, 171, 0.15);
}

.social-icon {
  width: 1.15rem;
  height: 1.15rem;
  flex-shrink: 0;
}

/* ════════════════════════════════
   PANNEAU VISUEL GLISSANT
════════════════════════════════ */
.auth-visual {
  position: absolute;
  top: 1rem;
  bottom: 1rem;
  left: 1rem;
  width: calc(50% - 1.5rem);
  background: rgba(177, 229, 226, 0.78);
  border-radius: 24px;
  z-index: 10;
  padding: 2rem 2rem 1.75rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;
  box-shadow: 0 8px 40px rgba(29, 18, 43, 0.18);
  isolation: isolate;
  overflow: hidden;

  /* ← animation de glissement */
  transition: left 0.65s cubic-bezier(0.77, 0, 0.175, 1);
}

.auth-visual::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.18), transparent 30%),
    radial-gradient(circle at 75% 65%, rgba(46, 154, 171, 0.12), transparent 35%);
  pointer-events: none;
}

.auth-visual::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 24px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3);
  pointer-events: none;
  z-index: 2;
}

/* Signup (défaut) : visuel à GAUCHE */
.mode-signup .auth-visual {
  left: 1rem;
}

/* Login : visuel glisse à DROITE */
.mode-login .auth-visual {
  left: calc(50% + 0.5rem);
}

/* ── Badge ── */
.visual-badge {
  position: relative;
  z-index: 1;
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

/* ── Corps ── */
.visual-body {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1rem 0;
}

.visual-body h1 {
  margin: 0;
  font-size: clamp(1.5rem, 2.3vw, 2.1rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.03em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.28);
}

.visual-body p {
  margin: 0.85rem 0 0;
  font-size: 0.95rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.visual-illustration {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.visual-illustration img {
  width: min(100%, 230px);
  height: auto;
  filter: drop-shadow(0 18px 30px rgba(8, 59, 82, 0.28));
}

/* ════════════════════════════════
   TRANSITION CONTENU VISUEL
════════════════════════════════ */
.vcontent-enter-active,
.vcontent-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.vcontent-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.vcontent-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ════════════════════════════════
   RESPONSIVE — TABLETTE ≤ 900px
════════════════════════════════ */
@media (max-width: 900px) {
  .auth-page {
    grid-template-columns: 1fr;
    padding: 0.85rem;
    gap: 0.75rem;
  }

  .ctrl-home {
    top: 1.5rem;
    left: 1.5rem;
  }

  .ctrl-switcher {
    top: 1.5rem;
    right: 1.5rem;
  }

  .auth-visual {
    position: relative;
    top: auto;
    bottom: auto;
    left: auto !important;
    width: 100%;
    min-height: 22rem;
    border-radius: 20px;
    order: -1;
    transition: none;
  }

  .auth-panel {
    order: 0;
    padding: 0;
  }

  .mode-login .panel-signup,
  .mode-signup .panel-login {
    display: none;
  }

  .form-card {
    max-width: 100%;
    border-radius: 20px;
    padding: 2rem 1.5rem 1.75rem;
  }
}

/* ════════════════════════════════
   RESPONSIVE — MOBILE ≤ 480px
════════════════════════════════ */
@media (max-width: 480px) {
  .auth-page {
    padding: 0.65rem;
    gap: 0.6rem;
  }

  .form-card {
    padding: 1.75rem 1rem 1.5rem;
  }

  .field-grid,
  .social-grid {
    grid-template-columns: 1fr;
  }

  .auth-visual {
    min-height: 18rem;
  }
}
</style>
