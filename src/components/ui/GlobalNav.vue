<template>
  <!-- Desktop / tablette : floating pill -->
  <Transition name="nav-slide">
    <nav v-if="showNav" class="nav-island">

      <router-link
        to="/"
        class="nav-item"
        :class="{ 'nav-item--on': route.path === '/' }"
        data-tip="Accueil"
      >
        <Home :size="18" />
      </router-link>

      <router-link
        to="/contact"
        class="nav-item"
        :class="{ 'nav-item--on': isActive(['/contact']) }"
        data-tip="Contact"
      >
        <Mail :size="17" />
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

      <CalendarPanel v-if="isAuth" class="nav-cal" />
      <NotificationBell v-if="isAuth" :compact="true" :up="true" class="nav-bell" />

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

  <!-- Mobile : bottom tab bar -->
  <nav v-if="showNav" class="nav-bar">

    <router-link
      to="/"
      class="nav-bar-item"
      :class="{ 'nav-bar-item--on': route.path === '/' }"
    >
      <Home :size="21" />
      <span>Accueil</span>
    </router-link>

    <router-link
      to="/contact"
      class="nav-bar-item"
      :class="{ 'nav-bar-item--on': isActive(['/contact']) }"
    >
      <Mail :size="21" />
      <span>Contact</span>
    </router-link>

    <router-link
      v-if="isAdminUser"
      to="/admin"
      class="nav-bar-item"
      :class="{ 'nav-bar-item--on': isActive(['/admin']) }"
    >
      <ShieldCheck :size="21" />
      <span>Admin</span>
    </router-link>

    <router-link
      v-if="isAuth"
      to="/dashboard"
      class="nav-bar-item"
      :class="{ 'nav-bar-item--on': isActive(['/dashboard', '/profile']) }"
    >
      <User :size="21" />
      <span>Dashboard</span>
    </router-link>

    <router-link
      v-if="!isAuth"
      to="/login"
      class="nav-bar-item"
    >
      <LogIn :size="21" />
      <span>Connexion</span>
    </router-link>

    <button
      v-if="isAuth"
      class="nav-bar-item nav-bar-item--logout"
      @click="handleLogout"
    >
      <LogOut :size="21" />
      <span>Déco.</span>
    </button>

  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, ShieldCheck, User, LogIn, LogOut, Mail } from 'lucide-vue-next'
import NotificationBell from '@/components/ui/NotificationBell.vue'
import CalendarPanel from '@/components/ui/CalendarPanel.vue'

defineProps({
  isAuth:      { type: Boolean, default: false },
  isAdminUser: { type: Boolean, default: false },
  displayName: { type: String,  default: '' },
})

const emit = defineEmits(['logout'])
const route = useRoute()

const showNav = computed(() =>
  !['landing', 'login', 'signup', 'privacy', 'mentions-legales', 'contact', 'rdv', 'forbidden', 'maintenance', 'calculator-step'].includes(route.name)
)

function handleLogout() { emit('logout') }
function isActive(paths) { return paths.some(p => route.path.startsWith(p)) }
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   DESKTOP / TABLETTE — pill flottante centree en bas
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

/* ─── Item pill ─── */
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

.nav-item--on {
  color: #2e9cab;
}

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

.nav-sep {
  width: 1px;
  height: 16px;
  background: rgba(94, 114, 142, 0.16);
  margin: 0 3px;
  flex-shrink: 0;
}


/* ═══════════════════════════════════════════════════════════════
   MOBILE — bottom tab bar (style iOS)
═══════════════════════════════════════════════════════════════ */

.nav-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  height: 62px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-sizing: content-box;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(20px) saturate(1.5);
  -webkit-backdrop-filter: blur(20px) saturate(1.5);
  border-top: 1px solid rgba(0, 0, 0, 0.07);
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.07);
  align-items: stretch;
}

.nav-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: #94a3b8;
  text-decoration: none;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
  padding: 0 0.25rem;
  transition: color 0.18s ease, background 0.18s ease;
  -webkit-tap-highlight-color: transparent;
  position: relative;
}

.nav-bar-item span {
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  white-space: nowrap;
  line-height: 1;
}

.nav-bar-item:hover { color: #2e9cab; }
.nav-bar-item--on   { color: #2e9cab; }

/* Barre active sous l'icône */
.nav-bar-item--on::before {
  content: '';
  position: absolute;
  top: 0;
  left: 25%;
  right: 25%;
  height: 2.5px;
  border-radius: 0 0 3px 3px;
  background: #2e9cab;
}

.nav-bar-item--logout:hover { color: #dc2626; }

/* ── Bell & Calendar dans la pill ── */
.nav-bell :deep(.notif-btn--compact),
.nav-cal  :deep(.cal-btn) {
  border-color: transparent;
  background: transparent;
  width: 36px;
  height: 36px;
  color: #94a3b8;
  border-radius: 50%;
  transition: color 0.2s ease, background 0.2s ease, transform 0.22s cubic-bezier(0.34,1.3,0.64,1);
}
.nav-bell :deep(.notif-btn--compact):hover,
.nav-bell :deep(.notif-btn--compact.notif-btn--active),
.nav-cal  :deep(.cal-btn):hover,
.nav-cal  :deep(.cal-btn.cal-btn--active) {
  color: #2e9cab;
  background: rgba(46, 156, 171, 0.10);
  transform: translateY(-2px);
}

/* ── Notif dans la mobile bottom bar ── */
.nav-bar-notif {
  flex: 1;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 0;
}
.nav-bar-notif :deep(.notif-wrap),
.nav-bar-notif :deep(.notif-btn--tab) {
  width: 100%;
  height: 100%;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  /* Cache la pill, affiche la barre */
  .nav-island { display: none !important; }
  .nav-bar    { display: flex; }
}

@media (max-width: 380px) {
  .nav-bar-item span { font-size: 0.5rem; }
}
</style>
