import { createRouter, createWebHistory } from 'vue-router'
import Landing from '@/views/Landing.vue'
import CalculatorStep from '@/views/calculator/CalculatorStep.vue'
import Dashboard from '@/views/dashboard/Dashboard.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import Login from '@/views/auth/Login.vue'
import Signup from '@/views/auth/Signup.vue'
import ResetPassword from '@/views/auth/ResetPassword.vue'
import PrivacyPolicy from '@/views/PrivacyPolicy.vue'
import NotFound from '@/views/NotFound.vue'
import UserProfile from '@/views/dashboard/UserProfile.vue'
import { supabase } from '@/lib/supabase'

const routes = [
  { path: '/', name: 'landing', component: Landing, meta: { layout: 'landing' } },
  { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/admin', name: 'admin', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/calculator', redirect: '/calculator/1' },
  { path: '/calculator/:step', name: 'calculator-step', component: CalculatorStep },
  { path: '/login', name: 'login', component: Login },
  { path: '/signup', name: 'signup', component: Signup },
  { path: '/reset-password', name: 'reset-password', component: ResetPassword },
  { path: '/privacy', name: 'privacy', component: PrivacyPolicy },
  { path: '/profile', name: 'profile', component: UserProfile, meta: { requiresAuth: true } },
  {
    path: '/pay/:quoteId',
    name: 'payment',
    component: () => import('@/views/PaymentView.vue'),
    meta: { requiresAuth: true },
  },
  { path: '/guest', redirect: '/calculator/1' },
  { path: '/guest/calculator/:step', redirect: to => `/calculator/${to.params.step}` },
  { path: '/guest/dashboard', redirect: '/dashboard' },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, _from, next) => {
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
    if (!isAdmin) return next({ name: 'dashboard' })
  }

  return next()
})

export default router
