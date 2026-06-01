import { createRouter, createWebHistory } from 'vue-router'
import Landing from '@/views/Landing.vue'
import { supabase } from '@/lib/supabase'

const routes = [
  { path: '/', name: 'landing', component: Landing, meta: { layout: 'landing' } },
  { path: '/calculator', redirect: '/calculator/1' },
  { path: '/calculator/:step', name: 'calculator-step', component: () => import('@/views/calculator/CalculatorStep.vue') },
  { path: '/login',  name: 'login',  component: () => import('@/views/auth/Login.vue') },
  { path: '/signup', name: 'signup', component: () => import('@/views/auth/Signup.vue') },
  { path: '/reset-password',   name: 'reset-password',   component: () => import('@/views/auth/ResetPassword.vue') },
  { path: '/dashboard',        name: 'dashboard',        component: () => import('@/views/dashboard/Dashboard.vue'),      meta: { requiresAuth: true } },
  { path: '/admin',            name: 'admin',            component: () => import('@/views/admin/AdminDashboard.vue'),     meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/profile',          name: 'profile',          component: () => import('@/views/dashboard/UserProfile.vue'),   meta: { requiresAuth: true } },
  { path: '/contact',          name: 'contact',          component: () => import('@/views/Contact.vue') },
  { path: '/rdv',             name: 'rdv',              component: () => import('@/views/BookingPage.vue') },
  { path: '/privacy',          name: 'privacy',          component: () => import('@/views/PrivacyPolicy.vue') },
  { path: '/mentions-legales', name: 'mentions-legales', component: () => import('@/views/MentionsLegales.vue') },
  {
    path: '/pay/:quoteId',
    name: 'payment',
    component: () => import('@/views/PaymentView.vue'),
    meta: { requiresAuth: true },
  },
  { path: '/guest', redirect: '/calculator/1' },
  { path: '/guest/calculator/:step', redirect: to => `/calculator/${to.params.step}` },
  { path: '/guest/dashboard', redirect: '/dashboard' },
  { path: '/403', name: 'forbidden', component: () => import('@/views/Forbidden.vue') },
  { path: '/maintenance', name: 'maintenance', component: () => import('@/views/Maintenance.vue') },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFound.vue') },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, _from, next) => {
  if (import.meta.env.VITE_MAINTENANCE_MODE === 'true' && to.name !== 'maintenance') {
    const previewSecret = import.meta.env.VITE_PREVIEW_SECRET
    if (to.query.preview && previewSecret && to.query.preview === previewSecret) {
      localStorage.setItem('preview_bypass', previewSecret)
    }
    const bypass = localStorage.getItem('preview_bypass')
    if (!bypass || bypass !== previewSecret) {
      return next({ name: 'maintenance' })
    }
  }

  const { data } = await supabase.auth.getSession()
  const isAuth = !!data.session

  if (isAuth && (to.name === 'login' || to.name === 'signup')) {
    const { data: isAdmin } = await supabase.rpc('is_admin')
    return next({ path: isAdmin ? '/admin' : '/dashboard' })
  }

  if (to.meta?.requiresAuth && !isAuth) {
    return next({ name: 'login' })
  }

  if (to.meta?.requiresAdmin) {
    const { data: isAdmin } = await supabase.rpc('is_admin')
    if (!isAdmin) return next({ name: 'forbidden' })
  }

  return next()
})

export default router
