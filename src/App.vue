<template>
  <div class="app">
    <GlobalNav
      :isAuth="isAuth"
      :isAdminUser="isAdminUser"
      :displayName="displayName"
      :userInitials="userInitials"
      :userAvatar="userAvatar"
      @logout="logout"
    />
    <main class="page-wrap" :class="{ 'page-wrap--fullscreen': isFullscreenRoute, 'page-wrap--with-sidebar': showSidebar }">
      <router-view />
    </main>
    <CookieBanner />
  </div>
</template>

<script>
import GlobalNav from '@/components/ui/GlobalNav.vue'
import CookieBanner from '@/components/ui/CookieBanner.vue'
import { supabase } from './lib/supabase'
import { logout as authLogout } from './utils/auth'

export default {
  name: 'App',
  components: { GlobalNav, CookieBanner },
  data() {
    return { isAuth: false, displayName: '', isAdminUser: false, userInitials: '', userAvatar: '' }
  },
  computed: {
    isFullscreenRoute() {
      return !this.$route?.name || ['landing', 'login', 'signup', 'reset-password', 'contact', 'rdv', 'not-found', 'forbidden', 'maintenance', 'privacy', 'mentions-legales', 'dashboard', 'profile', 'admin', 'payment'].includes(this.$route?.name)
    },
    showSidebar() {
      return !!this.$route?.name && !['landing', 'login', 'signup', 'reset-password', 'privacy', 'mentions-legales', 'contact', 'rdv', 'not-found', 'forbidden', 'maintenance', 'calculator-step'].includes(this.$route?.name)
    },
  },
  async created() {
    await this.checkAuth()
    supabase.auth.onAuthStateChange(async (_event, session) => {
      this.isAuth = !!session
      if (session) {
        this.displayName  = this.extractName(session.user)
        this.userInitials = this.extractInitials(session.user)
        this.userAvatar   = session.user.user_metadata?.avatar_url || ''
        this.isAdminUser  = await this.checkAdmin()
      } else {
        this.displayName = ''
        this.userInitials = ''
        this.userAvatar = ''
        this.isAdminUser = false
      }
    })
  },
  methods: {
    async checkAuth() {
      const { data } = await supabase.auth.getSession()
      this.isAuth = !!data.session
      if (data.session) {
        this.displayName  = this.extractName(data.session.user)
        this.userInitials = this.extractInitials(data.session.user)
        this.userAvatar   = data.session.user.user_metadata?.avatar_url || ''
        this.isAdminUser  = await this.checkAdmin()
      } else {
        this.displayName = ''
        this.userInitials = ''
        this.userAvatar = ''
        this.isAdminUser = false
      }
    },
    async checkAdmin() {
      const { data, error } = await supabase.rpc('is_admin')
      if (error) return false
      return !!data
    },
    extractName(user) {
      if (!user) return ''
      const meta = user.user_metadata || {}
      const full = meta.full_name || meta.name || ''
      return full.split(' ')[0] || user.email?.split('@')[0] || ''
    },
    extractInitials(user) {
      if (!user) return ''
      const meta = user.user_metadata || {}
      const full = (meta.full_name || meta.name || '').trim()
      if (full) {
        const parts = full.split(' ').filter(Boolean)
        return parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : parts[0][0].toUpperCase()
      }
      const email = user.email || ''
      return email ? email[0].toUpperCase() : '?'
    },
    async logout() {
      await authLogout()
      this.isAuth = false
      this.displayName = ''
      this.userInitials = ''
      this.userAvatar = ''
      this.isAdminUser = false
      this.$router.push({ name: 'landing' })
    },
  },
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app {
  min-height: 100vh;
  background: #f0f4f8;
}

@media (max-width: 768px) {
  .app {
    background: #ffffff;
  }
}

.page-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
}

/* Desktop / tablette : décale le contenu selon la largeur courante de la sidebar */
:root { --sidebar-w: 60px; }

@media (min-width: 769px) {
  .page-wrap--with-sidebar {
    padding-left: calc(var(--sidebar-w) + 8px);
    transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  /* Dashboard & admin : sidebar active → on surcharge le padding: 0 !important de fullscreen */
  .page-wrap--fullscreen.page-wrap--with-sidebar {
    padding-left: calc(var(--sidebar-w) + 8px) !important;
    padding-top: 3rem !important;
    transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

/* Tablette — aligne en haut comme mobile */
@media (max-width: 900px) {
  .page-wrap {
    justify-content: flex-start;
    padding-bottom: 72px;
  }
}

/* Mobile */
@media (max-width: 640px) {
  .page-wrap {
    padding-top: 1.25rem;
    padding-bottom: 88px;
  }
}

/* Pages plein-écran (Landing, Login, Signup) — supprime le padding de la nav flottante */
.page-wrap--fullscreen {
  padding: 0 !important;
  justify-content: flex-start;
}
</style>
