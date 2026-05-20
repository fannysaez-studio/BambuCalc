<template>
  <Transition name="nav-slide">
    <nav v-if="showNav" class="nav-island">

      <router-link
        to="/calculator/1"
        class="nav-item"
        :class="{ 'nav-item--on': isActive(['/calculator']) }"
        data-tip="Accueil"
      >
        <Home :size="18" />
      </router-link>

      <router-link
        v-if="isAdminUser"
        to="/admin"
        class="nav-item"
        :class="{ 'nav-item--on': isActive(['/admin']) }"
        data-tip="Admin"
      >
        <ShieldCheck :size="18" />
      </router-link>

      <router-link
        v-if="isAuth"
        to="/dashboard"
        class="nav-item"
        :class="{ 'nav-item--on': isActive(['/dashboard', '/profile']) }"
        :data-tip="displayName || 'Profil'"
      >
        <User :size="18" />
      </router-link>

      <router-link
        v-if="!isAuth"
        to="/login"
        class="nav-item"
        data-tip="Connexion"
      >
        <LogIn :size="18" />
      </router-link>

      <span class="nav-sep" />

      <button
        v-if="isAuth"
        class="nav-item nav-item--danger"
        data-tip="Déconnexion"
        @click="handleLogout"
      >
        <LogOut :size="17" />
      </button>

    </nav>
  </Transition>
</template>

<script>
import { Home, ShieldCheck, User, LogIn, LogOut } from 'lucide-vue-next'

export default {
  name: 'GlobalNav',
  components: { Home, ShieldCheck, User, LogIn, LogOut },
  props: {
    isAuth:      { type: Boolean, default: false },
    isAdminUser: { type: Boolean, default: false },
    displayName: { type: String,  default: '' },
  },
  emits: ['logout'],
  computed: {
    showNav() {
      return !['landing', 'login', 'signup'].includes(this.$route.name)
    },
  },
  methods: {
    handleLogout() { this.$emit('logout') },
    isActive(paths) { return paths.some(p => this.$route.path.startsWith(p)) },
  },
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   NAV — pill ultra-minimal centré en bas
   Icônes seules, pas de labels. Active = teal + dot.
═══════════════════════════════════════════════════════════════ */

.nav-island {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.60);
  backdrop-filter: blur(20px) saturate(1.6);
  -webkit-backdrop-filter: blur(20px) saturate(1.6);
  border: 1px solid rgba(255, 255, 255, 0.80);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.09),
    0 1px 6px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

/* Transition entrée */
.nav-slide-enter-active { transition: transform 0.45s cubic-bezier(0.34,1.2,0.64,1), opacity 0.28s ease; }
.nav-slide-leave-active { transition: transform 0.22s ease, opacity 0.18s ease; }
.nav-slide-enter-from, .nav-slide-leave-to {
  transform: translateX(-50%) translateY(60px); opacity: 0;
}

/* ─── Item ─── */
.nav-item {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  border: none;
  background: transparent;
  cursor: pointer;
  text-decoration: none;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.2s ease, background 0.2s ease, transform 0.22s cubic-bezier(0.34,1.3,0.64,1);
}

/* Tooltip */
.nav-item[data-tip]::before {
  content: attr(data-tip);
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 8px;
  border-radius: 7px;
  background: rgba(15, 23, 42, 0.85);
  color: #f0f6ff;
  font-size: 0.63rem;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.13s ease;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
}
.nav-item:hover[data-tip]::before { opacity: 1; }

/* Hover inactif */
.nav-item:not(.nav-item--on):hover {
  color: #2e9cab;
  background: rgba(46, 156, 171, 0.10);
  transform: translateY(-2px);
}

.nav-item--danger:not(.nav-item--on):hover {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.10);
  transform: translateY(-2px);
}

/* ─── Actif ─── */
.nav-item--on {
  color: #2e9cab;
}

/* Dot sous l'item actif */
.nav-item--on::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #2e9cab;
}

/* Séparateur */
.nav-sep {
  width: 1px;
  height: 16px;
  background: rgba(94, 114, 142, 0.16);
  margin: 0 3px;
  flex-shrink: 0;
}

/* Mobile */
@media (max-width: 640px) {
  .nav-island { bottom: 16px; padding: 7px 9px; gap: 3px; }
  .nav-item   { width: 40px; height: 40px; }
}

@media (max-width: 380px) {
  .nav-island { bottom: 14px; padding: 6px 8px; }
  .nav-item   { width: 38px; height: 38px; }
}
</style>
