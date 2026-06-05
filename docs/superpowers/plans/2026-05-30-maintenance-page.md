# Page Maintenance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer la page `/maintenance` plein écran avec badge LED teal et activer un mode maintenance global via `VITE_MAINTENANCE_MODE`.

**Architecture:** Page Vue autonome (`Maintenance.vue`) avec layout plein écran centré — aucun panneau latéral. Le router guard intercepte toutes les routes en amont des vérifications auth quand `VITE_MAINTENANCE_MODE === 'true'`.

**Tech Stack:** Vue 3 Options API, Vue Router 4, Lucide Vue Next, CSS scoped, Vite env vars

---

## Fichiers

| Fichier | Action |
|---|---|
| `src/views/Maintenance.vue` | Créer — composant page complet |
| `src/router/index.js` | Modifier — ajouter route `/maintenance` + guard |
| `src/App.vue` | Modifier — ajouter `'maintenance'` à `isFullscreenRoute` |
| `.env.example` | Modifier — documenter `VITE_MAINTENANCE_MODE` |

---

### Task 1 : Créer `src/views/Maintenance.vue`

**Files:**
- Create: `src/views/Maintenance.vue`

- [ ] **Step 1 : Créer le fichier avec le template, le script et les styles**

```vue
<template>
  <div class="mt-page">

    <router-link to="/" class="mt-home-btn" aria-label="Page d'accueil" title="Page d'accueil">
      <Home class="mt-icon" aria-hidden="true" />
    </router-link>

    <div class="mt-led-badge">
      <span class="mt-led-dot" aria-hidden="true"></span>
      En maintenance
    </div>

    <div class="mt-content">
      <img src="/maintenance.svg" class="mt-illustration" alt="Maintenance en cours" aria-hidden="true" />
      <h1 class="mt-title">Maintenance en cours</h1>
      <p class="mt-sub">BambuCalc est temporairement indisponible pour une mise à jour. Nous revenons très vite !</p>
    </div>

    <p class="mt-brand">BambuCalc</p>
  </div>
</template>

<script>
import { Home } from 'lucide-vue-next'

export default {
  name: 'Maintenance',
  components: { Home },
  mounted()   { document.body.classList.add('page-maintenance') },
  unmounted() { document.body.classList.remove('page-maintenance') },
}
</script>

<style scoped>
* { box-sizing: border-box; }

.mt-page {
  width: 100%;
  align-self: stretch;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2.5rem 2rem;
  position: relative;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
  background:
    radial-gradient(ellipse 130% 55% at 50% -5%, rgba(177,229,226,0.58) 0%, transparent 65%),
    linear-gradient(180deg, #eef9f8 0%, #f7fcfc 50%, #ffffff 100%);
}

/* ── Bouton home ── */
.mt-home-btn {
  position: absolute;
  top: 1.1rem;
  left: 1.1rem;
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(255,255,255,0.9);
  color: #1f7f97;
  box-shadow: 0 4px 14px rgba(29,18,43,0.1);
  text-decoration: none;
  transition: transform 0.2s, background 0.2s;
  z-index: 3;
}
.mt-home-btn:hover { transform: translateY(-1px); background: #fff; }
.mt-icon { width: 1.1rem; height: 1.1rem; flex-shrink: 0; }

/* ── Badge LED teal ── */
.mt-led-badge {
  position: absolute;
  top: 1.1rem;
  right: 1.1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(46,156,171,0.1);
  border: 1.5px solid rgba(46,156,171,0.35);
  border-radius: 999px;
  padding: 0.38rem 1.1rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #1f7f97;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  z-index: 3;
}

.mt-led-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2e9cab;
  flex-shrink: 0;
  animation: ledPulse 2s infinite;
}

@keyframes ledPulse {
  0%   { box-shadow: 0 0 0 0 rgba(46,156,171,0.7); }
  70%  { box-shadow: 0 0 0 8px rgba(46,156,171,0); }
  100% { box-shadow: 0 0 0 0 rgba(46,156,171,0); }
}

/* ── Contenu centré ── */
.mt-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mt-illustration {
  width: min(92%, 420px);
  height: auto;
  display: block;
  margin-bottom: 2rem;
  animation: floatIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  filter: drop-shadow(0 14px 32px rgba(29,18,43,0.13));
}

@keyframes floatIn {
  from { opacity: 0; transform: translateY(24px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.mt-title {
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 800;
  color: #1b2f39;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin-bottom: 0.85rem;
  white-space: nowrap;
}

.mt-sub {
  font-size: clamp(0.85rem, 1.5vw, 0.97rem);
  color: #4f6570;
  line-height: 1.6;
  white-space: nowrap;
}

/* ── Brand ── */
.mt-brand {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #2e9cab;
  opacity: 0.45;
  white-space: nowrap;
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .mt-title { white-space: normal; }
  .mt-sub   { white-space: normal; text-align: center; }
  .mt-illustration { width: min(92%, 280px); }
}
</style>

<style>
.page-maintenance .nav-island,
.page-maintenance .nav-bar { display: none !important; }
</style>
```

- [ ] **Step 2 : Vérifier dans le navigateur sur `/maintenance`**

Ouvrir `http://localhost:5173/maintenance` et vérifier :
- Fond dégradé teal → blanc visible
- Badge "EN MAINTENANCE" teal avec LED pulsante en haut à droite
- Icône Home en haut à gauche
- Illustration `maintenance.svg` centrée avec animation floatIn
- Titre "Maintenance en cours" sur une ligne
- Sous-titre sur une ligne
- "BAMBUCALC" en bas centré
- Nav masquée

- [ ] **Step 3 : Commit**

```bash
git add src/views/Maintenance.vue
git commit -m "feat(maintenance): nouvelle page /maintenance plein écran avec badge LED teal"
```

---

### Task 2 : Ajouter la route et le guard dans le router

**Files:**
- Modify: `src/router/index.js`

- [ ] **Step 1 : Ajouter la route `/maintenance` dans le tableau `routes`**

Dans `src/router/index.js`, ajouter avant la route `not-found` :

```js
{ path: '/maintenance', name: 'maintenance', component: () => import('@/views/Maintenance.vue') },
```

Le tableau `routes` doit terminer ainsi :
```js
  { path: '/403', name: 'forbidden', component: () => import('@/views/Forbidden.vue') },
  { path: '/maintenance', name: 'maintenance', component: () => import('@/views/Maintenance.vue') },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFound.vue') },
```

- [ ] **Step 2 : Ajouter le guard maintenance au début de `beforeEach`**

Dans `router.beforeEach`, ajouter **avant** toute logique auth :

```js
router.beforeEach(async (to, _from, next) => {
  // Guard maintenance — doit être AVANT les vérifications auth
  if (import.meta.env.VITE_MAINTENANCE_MODE === 'true' && to.name !== 'maintenance') {
    return next({ name: 'maintenance' })
  }

  const { data } = await supabase.auth.getSession()
  // ... reste du guard inchangé
```

Le fichier complet `src/router/index.js` après modification :

```js
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
    return next({ name: 'maintenance' })
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
```

- [ ] **Step 3 : Tester le guard en local**

Dans `.env.local`, ajouter temporairement :
```
VITE_MAINTENANCE_MODE=true
```
Relancer `npm run dev`. Naviguer vers `/`, `/dashboard`, `/login` — toutes doivent rediriger vers `/maintenance`. Naviguer directement vers `/maintenance` — doit fonctionner.

Supprimer la ligne dans `.env.local` et vérifier que l'app redevient normale (sans relancer le serveur, Vite rechargera automatiquement).

- [ ] **Step 4 : Commit**

```bash
git add src/router/index.js
git commit -m "feat(maintenance): route /maintenance + guard VITE_MAINTENANCE_MODE dans router"
```

---

### Task 3 : Mettre à jour `App.vue` et `.env.example`

**Files:**
- Modify: `src/App.vue`
- Modify: `.env.example`

- [ ] **Step 1 : Ajouter `'maintenance'` à `isFullscreenRoute` dans `App.vue`**

Remplacer la ligne `isFullscreenRoute` dans le computed :

```js
return ['landing', 'login', 'signup', 'reset-password', 'contact', 'not-found', 'forbidden', 'maintenance', 'privacy', 'mentions-legales', 'dashboard', 'profile', 'admin', 'payment'].includes(this.$route?.name)
```

Cela supprime le padding de `.page-wrap` sur la page maintenance (même pattern que 403/404).

- [ ] **Step 2 : Documenter `VITE_MAINTENANCE_MODE` dans `.env.example`**

Ajouter à la fin de `.env.example` :

```
# Mode maintenance — mettre à true pour activer (Netlify dashboard ou .env.local)
VITE_MAINTENANCE_MODE=false
```

- [ ] **Step 3 : Vérifier le rendu final**

Ouvrir `http://localhost:5173/maintenance` et vérifier que la nav est bien masquée et qu'il n'y a plus de padding autour de la page.

- [ ] **Step 4 : Commit final**

```bash
git add src/App.vue .env.example
git commit -m "feat(maintenance): isFullscreenRoute + VITE_MAINTENANCE_MODE documenté dans .env.example"
```
