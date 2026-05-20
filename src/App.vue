<template>
  <div class="app">
    <GlobalNav
      :isAuth="isAuth"
      :isAdminUser="isAdminUser"
      :displayName="displayName"
      @logout="logout"
    />
    <main class="page-wrap">
      <router-view />
    </main>
    <CookieBanner />
  </div>
</template>

<script>
import GlobalNav from './components/GlobalNav.vue'
import CookieBanner from './components/CookieBanner.vue'
import { supabase } from './lib/supabase'
import { logout as authLogout } from './utils/auth'

export default {
  name: 'App',
  components: { GlobalNav, CookieBanner },
  data() {
    return { isAuth: false, displayName: '', isAdminUser: false }
  },
  async created() {
    await this.checkAuth()
    supabase.auth.onAuthStateChange(async (_event, session) => {
      this.isAuth = !!session
      this.displayName = session ? this.extractName(session.user) : ''
      this.isAdminUser = session ? await this.checkAdmin() : false
    })
  },
  methods: {
    async checkAuth() {
      const { data } = await supabase.auth.getSession()
      this.isAuth = !!data.session
      this.displayName = data.session ? this.extractName(data.session.user) : ''
      this.isAdminUser = data.session ? await this.checkAdmin() : false
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
    async logout() {
      await authLogout()
      this.isAuth = false
      this.displayName = ''
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

/* Nav island = 20px bottom + ~56px pill + 16px marge = 92px à réserver */
.page-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  /* padding: 2rem 1rem 92px; */
}

/* Tablette — aligne en haut comme mobile */
@media (max-width: 900px) {
  .page-wrap {
    justify-content: flex-start;
    padding-bottom: 88px;
  }
}

/* Mobile */
@media (max-width: 640px) {
  .page-wrap {
    padding-top: 1.25rem;
    padding-bottom: 88px;
  }
}
</style>
