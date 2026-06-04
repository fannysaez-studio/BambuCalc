<template>
  <!-- Desktop / tablette : sidebar verticale collapsible -->
  <nav v-if="showNav" :class="['nav-sidebar', sidebarOpen && 'nav-sidebar--open']">

    <!-- ── En-tête fixe : logo BambuCalc ── -->
    <div class="sidebar-logo">
      <img src="/icons/icon.svg" class="sidebar-logo-img" alt="BambuCalc" />
      <span class="sidebar-label sidebar-logo-name">BambuCalc</span>
    </div>
    <div class="sidebar-logo-sep" />

    <!-- ── Barre de recherche ── -->
    <div class="sidebar-search" @click="!sidebarOpen && toggleSidebar()">
      <Search :size="16" class="sidebar-search-icon" />
      <input
        v-if="sidebarOpen"
        v-model="searchQuery"
        class="sidebar-search-input"
        placeholder="Rechercher…"
        @input="navStore.setSearch(searchQuery)"
      />
    </div>

    <!-- ── Nav principale fixe (ne défile jamais) ── -->
    <div class="sidebar-main-nav">
      <router-link to="/" class="sidebar-item" :class="{ 'sidebar-item--on': route.path === '/' }">
        <span class="sidebar-icon-wrap"><Home :size="16" /></span>
        <span class="sidebar-label">Accueil</span>
      </router-link>

      <router-link to="/contact" class="sidebar-item" :class="{ 'sidebar-item--on': isActive(['/contact']) }">
        <span class="sidebar-icon-wrap"><Mail :size="16" /></span>
        <span class="sidebar-label">Contact</span>
      </router-link>

      <router-link v-if="isAdminUser" to="/admin" class="sidebar-item sidebar-item--admin" :class="{ 'sidebar-item--on': isActive(['/admin']) }">
        <span class="sidebar-icon-wrap"><ShieldCheck :size="16" /></span>
        <span class="sidebar-label">Admin</span>
      </router-link>

      <router-link v-if="isAuth" to="/dashboard" class="sidebar-item" :class="{ 'sidebar-item--on': isActive(['/dashboard', '/profile']) }">
        <span class="sidebar-icon-wrap"><LayoutGrid :size="16" /></span>
        <span class="sidebar-label">{{ displayName || 'Dashboard' }}</span>
      </router-link>

      <router-link v-if="!isAuth" to="/login" class="sidebar-item">
        <span class="sidebar-icon-wrap"><LogIn :size="16" /></span>
        <span class="sidebar-label">Connexion</span>
      </router-link>
    </div>

    <!-- ── Onglets contextuels scrollables (admin / client) ── -->
    <div v-if="navStore.contextTabs.length" class="sidebar-ctx-scroll">
      <div class="sidebar-ctx-sep" />
      <template v-for="(tab, i) in navStore.contextTabs" :key="tab.id ?? ('sep-' + i)">

        <div v-if="tab.separator" class="sidebar-ctx-line" />

        <template v-else-if="tab.group">
          <button
            class="sidebar-item sidebar-item--ctx sidebar-item--group"
            :class="{ 'sidebar-item--group-active': isGroupActive(tab) }"
            @click="toggleGroup(tab.id)"
          >
            <span class="sidebar-icon-wrap"><component :is="tab.icon" :size="15" /></span>
            <span class="sidebar-label">{{ tab.label }}</span>
            <span v-if="tab.count > 0" class="sidebar-ctx-count">{{ tab.count }}</span>
            <ChevronRight :size="10" :class="['sidebar-group-chevron', expandedGroups.has(tab.id) && 'sidebar-group-chevron--open']" />
          </button>
          <template v-if="sidebarOpen && expandedGroups.has(tab.id)">
            <button
              v-for="child in tab.children" :key="child.id"
              class="sidebar-item sidebar-item--ctx sidebar-item--child"
              :class="{ 'sidebar-item--on': navStore.activeContextTab === child.id }"
              @click="navStore.setActiveTab(child.id)"
            >
              <span class="sidebar-icon-wrap"><component :is="child.icon" :size="13" /></span>
              <span class="sidebar-label">{{ child.label }}</span>
              <span v-if="child.count > 0" class="sidebar-ctx-count">{{ child.count }}</span>
            </button>
          </template>
        </template>

        <button
          v-else
          class="sidebar-item sidebar-item--ctx"
          :class="{ 'sidebar-item--on': navStore.activeContextTab === tab.id }"
          @click="navStore.setActiveTab(tab.id)"
        >
          <span class="sidebar-icon-wrap"><component :is="tab.icon" :size="15" /></span>
          <span class="sidebar-label">{{ tab.label }}</span>
          <span v-if="tab.count > 0" class="sidebar-ctx-count">{{ tab.count }}</span>
        </button>

      </template>
    </div>

    <!-- ── Pied fixe : actions + toggle ── -->
    <div class="sidebar-bottom">
      <div class="sidebar-sep" />

      <div v-if="isAuth" class="sidebar-item sidebar-item--action">
        <CalendarPanel class="sidebar-cal" />
        <span class="sidebar-label">Calendrier</span>
      </div>

      <div v-if="isAuth" class="sidebar-item sidebar-item--action">
        <NotificationBell :compact="true" class="sidebar-bell" />
        <span class="sidebar-label">Notifications</span>
      </div>

      <button v-if="isAuth" class="sidebar-item sidebar-item--logout" @click="handleLogout">
        <span class="sidebar-icon-wrap"><LogOut :size="16" /></span>
        <span class="sidebar-label">Déconnexion</span>
      </button>

      <div class="sidebar-sep" />

      <button class="sidebar-toggle" @click="toggleSidebar" :title="sidebarOpen ? 'Réduire' : 'Développer'">
        <ChevronRight :size="13" :class="['sidebar-toggle-chevron', sidebarOpen && 'sidebar-toggle-chevron--open']" />
      </button>
    </div>

  </nav>

  <!-- Mobile : bottom tab bar (inchangée) -->
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
      <LayoutGrid :size="21" />
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

    <!-- RDV : admin uniquement dans la nav mobile -->
    <CalendarPanel v-if="isAdminUser" :tab="true" />

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
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Home, ShieldCheck, User, LogIn, LogOut, Mail, LayoutGrid, ChevronRight, Search } from 'lucide-vue-next'
import NotificationBell from '@/components/ui/NotificationBell.vue'
import CalendarPanel from '@/components/ui/CalendarPanel.vue'
import { useNavigationStore } from '@/stores/navigation'

const navStore = useNavigationStore()

defineProps({
  isAuth:       { type: Boolean, default: false },
  isAdminUser:  { type: Boolean, default: false },
  displayName:  { type: String,  default: '' },
  userInitials: { type: String,  default: '' },
  userAvatar:   { type: String,  default: '' },
})

const emit = defineEmits(['logout'])
const route = useRoute()

const sidebarOpen = ref(localStorage.getItem('bambu_sidebar_open') === 'true')

// CSS variable partagée avec App.vue pour le padding dynamique
function applySidebarWidth(open) {
  document.documentElement.style.setProperty('--sidebar-w', open ? '220px' : '60px')
}
applySidebarWidth(sidebarOpen.value) // init au montage

watch(sidebarOpen, (val) => {
  localStorage.setItem('bambu_sidebar_open', String(val))
  applySidebarWidth(val)
})

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

const searchQuery = ref('')

// ── Groupes collapsibles ──
const expandedGroups = ref(new Set())

function toggleGroup(id) {
  if (!sidebarOpen.value) {
    // En mode réduit : ouvre la sidebar ET le groupe
    sidebarOpen.value = true
    expandedGroups.value = new Set([...expandedGroups.value, id])
    return
  }
  const next = new Set(expandedGroups.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expandedGroups.value = next
}

function isGroupActive(tab) {
  return tab.children?.some(c => c.id === navStore.activeContextTab)
}

// Auto-expand le groupe qui contient l'onglet actif
watch(() => navStore.activeContextTab, (activeId) => {
  for (const tab of navStore.contextTabs) {
    if (tab.group && tab.children?.some(c => c.id === activeId)) {
      expandedGroups.value = new Set([...expandedGroups.value, tab.id])
    }
  }
}, { immediate: true })

const showNav = computed(() =>
  !['landing', 'login', 'signup', 'privacy', 'mentions-legales', 'contact', 'rdv', 'forbidden', 'maintenance', 'calculator-step'].includes(route.name)
)

function handleLogout() { emit('logout') }
function isActive(paths) { return paths.some(p => route.path.startsWith(p)) }
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   DESKTOP / TABLETTE — sidebar verticale collapsible
═══════════════════════════════════════════════════════════════ */

.nav-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100dvh;
  width: 60px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px) saturate(1.6);
  -webkit-backdrop-filter: blur(20px) saturate(1.6);
  border-right: 1px solid rgba(255, 255, 255, 0.70);
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.08), inset -1px 0 0 rgba(0, 0, 0, 0.04);
  border-radius: 0 16px 16px 0;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
  overflow: hidden;
}

.nav-sidebar--open {
  width: 220px;
}

/* ── Logo ── */
.sidebar-logo {
  display: flex;
  align-items: center;
  /* (60px sidebar - 30px mark) / 2 = 15px pour centrer la marque */
  padding: 1.2rem 0 0.9rem calc((60px - 1.9rem) / 2);
  gap: 0;
  flex-shrink: 0;
  transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), gap 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-sidebar--open .sidebar-logo {
  padding-left: 1rem;
  gap: 0.65rem;
}

.sidebar-logo-img {
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.65rem;
  box-shadow: 0 4px 10px rgba(46, 156, 171, 0.28);
  flex-shrink: 0;
  display: block;
  object-fit: cover;
}

/* ── Barre de recherche ── */
.sidebar-search {
  display: flex;
  align-items: center;
  gap: 0;
  margin: 0 0.5rem 0.4rem;
  /* (44px item - 16px icône) / 2 ≈ 14px, mais on veut centrer dans 60px: (60-16)/2 - 8px margin = 14px */
  padding: 0.52rem 0 0.52rem 14px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition:
    background 0.18s ease,
    gap 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  width: calc(100% - 1rem);
  box-sizing: border-box;
}

.nav-sidebar--open .sidebar-search {
  gap: 0.5rem;
  padding-left: 0.75rem;
  cursor: text;
}

.sidebar-search:hover {
  background: rgba(46, 156, 171, 0.07);
  border-color: rgba(46, 156, 171, 0.2);
}

.sidebar-search-icon {
  flex-shrink: 0;
  color: #a0aec0;
}

.sidebar-search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.78rem;
  font-family: inherit;
  color: #4a5568;
  min-width: 0;
}

.sidebar-search-input::placeholder {
  color: #a0aec0;
}

.sidebar-logo-name {
  font-size: 0.9rem !important;
  font-weight: 800 !important;
  color: #1b2f39 !important;
  letter-spacing: -0.02em;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  white-space: nowrap;
  transition: max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease;
}

.nav-sidebar--open .sidebar-logo-name {
  max-width: 120px;
  opacity: 1;
  transition: max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease 0.12s;
}

.sidebar-logo-sep {
  height: 1px;
  background: rgba(0, 0, 0, 0.06);
  margin: 0 0.6rem 0.4rem;
  flex-shrink: 0;
}

/* ── Items ──
   Centrage : padding-left = (60px sidebar - 16px icône) / 2 = 22px
*/
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 0;
  text-decoration: none;
  color: #718096;
  padding: 0.52rem 0 0.52rem 22px;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  position: relative;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  transition:
    color 0.18s ease,
    background 0.18s ease,
    padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    gap 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
}

.nav-sidebar--open .sidebar-item {
  padding-left: 1rem;
  gap: 0.7rem;
}

.sidebar-item:hover {
  color: #2e9cab;
  background: rgba(46, 156, 171, 0.08);
}

.sidebar-item--on {
  color: #2e9cab !important;
  background: rgba(46, 156, 171, 0.10);
}

/* Indicateur actif — barre gauche */
.sidebar-item--on::after {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: #2e9cab;
}

.sidebar-item--logout:hover {
  color: #dc2626 !important;
  background: rgba(220, 38, 38, 0.08);
}

/* Admin — accent violet pour correspondre au thème admin */
.sidebar-item--admin.sidebar-item--on {
  color: #7c3aed !important;
  background: rgba(124, 58, 237, 0.10);
}
.sidebar-item--admin.sidebar-item--on::after {
  background: #7c3aed;
}
.sidebar-item--admin.sidebar-item--on .sidebar-label {
  color: #7c3aed;
}

.sidebar-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
}

/* ── Labels ── */
.sidebar-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  max-width: 0;
  opacity: 0;
  transition:
    max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.15s ease;
}

.nav-sidebar--open .sidebar-label {
  max-width: 160px;
  opacity: 1;
  transition:
    max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s ease 0.12s;
}

/* ── Nav principale fixe ── */
.sidebar-main-nav {
  flex-shrink: 0;
}

/* ── Onglets contextuels scrollables ── */
.sidebar-ctx-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  padding-bottom: 0.25rem;
}
.sidebar-ctx-scroll::-webkit-scrollbar { display: none; }

/* ── Pied fixe ── */
.sidebar-bottom {
  flex-shrink: 0;
}

/* ── CalendarPanel & NotificationBell dans la sidebar ── */
.sidebar-item--action {
  cursor: default;
}
.sidebar-item--action:hover {
  color: #2e9cab;
  background: rgba(46, 156, 171, 0.08);
}

.sidebar-cal :deep(.cal-btn),
.sidebar-bell :deep(.notif-btn--compact) {
  width: 19px !important;
  height: 19px !important;
  min-width: unset !important;
  border: none !important;
  background: transparent !important;
  color: inherit !important;
  padding: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0;
  cursor: pointer;
}

.sidebar-cal :deep(.cal-btn):hover,
.sidebar-bell :deep(.notif-btn--compact):hover {
  background: transparent !important;
  transform: none !important;
}

/* Popups des composants : positionnement à droite de la sidebar */
.sidebar-cal :deep(.cal-panel),
.sidebar-bell :deep(.notif-panel) {
  left: 100% !important;
  right: auto !important;
  top: 0 !important;
  bottom: auto !important;
}

/* ── Onglets contextuels ── */
.sidebar-ctx-sep {
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
  margin: 0.75rem 0.75rem 0.5rem;
  flex-shrink: 0;
}

.sidebar-ctx-line {
  height: 1px;
  background: rgba(0, 0, 0, 0.04);
  margin: 0.2rem 1.2rem;
  flex-shrink: 0;
}

.sidebar-item--ctx {
  padding-top: 0.35rem;
  padding-bottom: 0.35rem;
}

/* Groupe header */
.sidebar-item--group {
  cursor: pointer;
}

.sidebar-item--group-active {
  color: #2e9cab;
}

.sidebar-group-chevron {
  flex-shrink: 0;
  margin-left: auto;
  opacity: 0;
  max-width: 0;
  overflow: hidden;
  transition: opacity 0.15s ease, max-width 0.25s ease, transform 0.25s ease;
}

.nav-sidebar--open .sidebar-group-chevron {
  opacity: 0.55;
  max-width: 16px;
}

.sidebar-group-chevron--open {
  transform: rotate(90deg);
}

/* Items enfants (sous un groupe) */
.sidebar-item--child {
  font-size: 0.76rem;
  padding-top: 0.28rem;
  padding-bottom: 0.28rem;
}

.nav-sidebar--open .sidebar-item--child {
  padding-left: 1.75rem;
}

.sidebar-item--child .sidebar-icon-wrap {
  width: 13px;
  height: 13px;
}

.sidebar-ctx-count {
  font-size: 0.6rem;
  font-weight: 800;
  background: rgba(46, 156, 171, 0.12);
  color: #2e9cab;
  padding: 0.05rem 0.35rem;
  border-radius: 999px;
  line-height: 1.6;
  flex-shrink: 0;
  margin-left: auto;
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease;
}

.nav-sidebar--open .sidebar-ctx-count {
  max-width: 40px;
  opacity: 1;
  transition: max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease 0.12s;
}

.sidebar-item--on .sidebar-ctx-count {
  background: rgba(255, 255, 255, 0.28);
  color: #fff;
}

/* ── Séparateur ── */
.sidebar-sep {
  height: 1px;
  background: rgba(0, 0, 0, 0.06);
  margin: 0.4rem 0.6rem;
  flex-shrink: 0;
}

/* ── Bouton toggle ── */
.sidebar-toggle {
  display: flex;
  align-items: center;
  /* (60px - 13px chevron) / 2 = 23.5px */
  padding: 0.52rem 0 0.52rem 23.5px;
  margin-bottom: 0.9rem;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #a0aec0;
  font-family: inherit;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  transition:
    color 0.18s ease,
    background 0.18s ease,
    padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-sidebar--open .sidebar-toggle {
  padding-left: 1rem;
}

.sidebar-toggle:hover {
  color: #2e9cab;
  background: rgba(46, 156, 171, 0.08);
}

.sidebar-toggle-chevron {
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-toggle-chevron--open {
  transform: rotate(180deg);
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE — bottom tab bar (style iOS, inchangée)
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
  justify-content: space-between;
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

/* ── CalendarPanel dans la nav bar mobile ── */
.nav-bar :deep(.cal-wrap) {
  flex: 1;
  display: flex;
  align-items: stretch;
}
.nav-bar :deep(.cal-btn--tab) {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: #94a3b8;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0 0.25rem;
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  white-space: nowrap;
  transition: color 0.18s ease;
  position: relative;
  -webkit-tap-highlight-color: transparent;
}
.nav-bar :deep(.cal-btn--tab):hover { color: #2e9cab; }
.nav-bar :deep(.cal-badge--dot) {
  position: absolute;
  top: 6px;
  right: calc(50% - 14px);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2e9cab;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .nav-sidebar { display: none !important; }
  .nav-bar     { display: flex; }
}

@media (max-width: 380px) {
  .nav-bar-item span { font-size: 0.5rem; }
}
</style>
