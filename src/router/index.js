import { createRouter, createWebHistory } from 'vue-router'
import Landing from '@/views/Landing.vue'
import CalculatorStep from '@/views/calculator/CalculatorStep.vue'
import { supabase } from '@/lib/supabase'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: Landing,
    meta: {
      layout: 'landing',
      title: 'Accueil - BambuCalc',
      description:
        "Découvrez BambuCalc, l'outil idéal pour calculer et optimiser vos projets en un clin d'œil.",
    },
  },
  { path: '/calculator', redirect: '/calculator/1' },
  {
    path: '/calculator/:step',
    name: 'calculator-step',
    component: CalculatorStep,
    meta: {
      title: 'Calculateur - Étape par Étape',
      description: 'Configurez votre projet étape par étape avec notre simulateur en ligne.',
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/Login.vue'),
    meta: {
      title: 'Connexion - BambuCalc',
      description:
        'Connectez-vous à votre espace BambuCalc pour retrouver vos simulations et projets enregistrés.',
    },
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../views/auth/Signup.vue'),
    meta: {
      title: 'Inscription - BambuCalc',
      description:
        'Créez un compte gratuit sur BambuCalc et commencez à chiffrer vos structures facilement.',
    },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/views/auth/ResetPassword.vue'),
    meta: { title: 'Réinitialisation du mot de passe - BambuCalc' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/Dashboard.vue'),
    meta: { requiresAuth: true, title: 'Tableau de bord - BambuCalc' },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Administration - BambuCalc' },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/dashboard/UserProfile.vue'),
    meta: { requiresAuth: true, title: 'Mon Profil - BambuCalc' },
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/views/Contact.vue'),
    meta: {
      title: 'Contactez-nous - BambuCalc',
      description: "Une question ou un besoin spécifique ? Contactez l'équipe de BambuCalc.",
    },
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/views/PrivacyPolicy.vue'),
    meta: { title: 'Politique de Confidentialité - BambuCalc' },
  },
  {
    path: '/mentions-legales',
    name: 'mentions-legales',
    component: () => import('@/views/MentionsLegales.vue'),
    meta: { title: 'Mentions Légales - BambuCalc' },
  },
  {
    path: '/pay/:quoteId',
    name: 'payment',
    component: () => import('@/views/PaymentView.vue'),
    meta: { requiresAuth: true, title: 'Paiement Sécurisé - BambuCalc' },
  },
  { path: '/guest', redirect: '/calculator/1' },
  { path: '/guest/calculator/:step', redirect: (to) => `/calculator/${to.params.step}` },
  { path: '/guest/dashboard', redirect: '/dashboard' },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: 'Page Introuvable - BambuCalc' },
  },
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
