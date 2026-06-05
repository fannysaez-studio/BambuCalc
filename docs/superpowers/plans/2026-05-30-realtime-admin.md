# Realtime Admin Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mettre à jour quotes et profiles en temps réel dans AdminDashboard sans refresh, avec toast + surbrillance 3s sur les nouveaux devis.

**Architecture:** Composable `useAdminRealtime(toast)` qui gère le chargement initial + deux canaux Supabase Realtime (quotes/profiles). AdminDashboard remplace ses 3 refs manuelles + loadData par ce composable. QuotesTab reçoit `highlightedQuoteId` en prop et applique une class CSS.

**Tech Stack:** Vue 3 Composition API, Supabase Realtime (`postgres_changes`), CSS transition

---

## Fichiers

| Fichier | Action |
|---|---|
| `src/composables/useAdminRealtime.js` | Créer |
| `src/views/admin/AdminDashboard.vue` | Modifier |
| `src/components/admin/QuotesTab.vue` | Modifier |

---

### Task 1 : Prérequis Supabase — activer Realtime

**Files:**
- Aucun fichier code — configuration Dashboard uniquement

- [ ] **Step 1 : Activer Realtime sur `quotes`**

  Supabase Dashboard → **Database** → **Replication** → section "Supabase Realtime" → activer le toggle pour la table `quotes`.

- [ ] **Step 2 : Activer Realtime sur `profiles`**

  Même page → activer le toggle pour la table `profiles`.

- [ ] **Step 3 : Vérifier**

  Les deux tables ont le toggle actif (vert). Sans ça, les canaux Realtime ne reçoivent aucun événement.

---

### Task 2 : Créer `useAdminRealtime.js`

**Files:**
- Create: `src/composables/useAdminRealtime.js`

- [ ] **Step 1 : Créer le fichier**

```js
import { ref, onUnmounted } from 'vue'
import { supabase }         from '@/lib/supabase'
import { getAllQuotesAdmin, getAllProfilesAdmin } from '@/utils/quotes'

export function useAdminRealtime(toast) {
  const quotes             = ref([])
  const profiles           = ref([])
  const loading            = ref(true)
  const highlightedQuoteId = ref(null)

  // ── Chargement initial ────────────────────────────────────────────────────
  async function loadData() {
    loading.value = true
    try {
      const [q, p] = await Promise.all([getAllQuotesAdmin(), getAllProfilesAdmin()])
      quotes.value   = q
      profiles.value = p
    } catch {
      toast.value?.show('Impossible de charger les données.', 'error')
    } finally {
      loading.value = false
    }
  }

  function highlight(id) {
    highlightedQuoteId.value = id
    setTimeout(() => { highlightedQuoteId.value = null }, 3000)
  }

  // ── Canal quotes ──────────────────────────────────────────────────────────
  const quotesChannel = supabase
    .channel('admin-quotes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'quotes' }, ({ new: q }) => {
      quotes.value = [q, ...quotes.value]
      const total = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
        .format(q.total_cost || 0)
      toast.value?.show(`🖨️ Nouveau devis — ${q.project_name || 'Sans nom'} · ${total}`, 'success', 4000)
      highlight(q.id)
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'quotes' }, ({ new: q }) => {
      const idx = quotes.value.findIndex(x => x.id === q.id)
      if (idx !== -1) quotes.value[idx] = { ...quotes.value[idx], ...q }
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'quotes' }, ({ old: q }) => {
      quotes.value = quotes.value.filter(x => x.id !== q.id)
    })
    .subscribe()

  // ── Canal profiles ────────────────────────────────────────────────────────
  const profilesChannel = supabase
    .channel('admin-profiles')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, ({ new: p }) => {
      profiles.value = [p, ...profiles.value]
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, ({ new: p }) => {
      const idx = profiles.value.findIndex(x => x.id === p.id)
      if (idx !== -1) profiles.value[idx] = { ...profiles.value[idx], ...p }
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'profiles' }, ({ old: p }) => {
      profiles.value = profiles.value.filter(x => x.id !== p.id)
    })
    .subscribe()

  // ── Nettoyage ─────────────────────────────────────────────────────────────
  onUnmounted(() => {
    supabase.removeChannel(quotesChannel)
    supabase.removeChannel(profilesChannel)
  })

  loadData()

  return { quotes, profiles, loading, highlightedQuoteId, loadData }
}
```

- [ ] **Step 2 : Commit**

```
git add src/composables/useAdminRealtime.js
git commit -m "feat(realtime): composable useAdminRealtime — quotes + profiles live"
```

---

### Task 3 : Mettre à jour AdminDashboard.vue

**Files:**
- Modify: `src/views/admin/AdminDashboard.vue`

- [ ] **Step 1 : Ajouter l'import du composable**

  Dans la section `<script setup>`, ajouter après les imports existants :

```js
import { useAdminRealtime } from '@/composables/useAdminRealtime'
```

- [ ] **Step 2 : Remplacer les 3 refs + loadData par le composable**

  Supprimer ces lignes :
```js
const quotes   = ref([])
const profiles = ref([])
const loading  = ref(true)
```
  Et la fonction `loadData` complète (lignes ~476-487).

  Les remplacer par :
```js
const { quotes, profiles, loading, highlightedQuoteId, loadData } = useAdminRealtime(toast)
```

- [ ] **Step 3 : Supprimer l'appel `await loadData()` dans l'IIFE**

  L'IIFE (`(async () => { ... })()`) contient `await loadData()` à la fin — le supprimer car le composable appelle `loadData()` automatiquement à l'initialisation.

  L'IIFE doit se terminer ainsi :
```js
;(async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    router.replace({ name: 'login' })
    return
  }
  currentUserId.value = data.user.id
  const meta = data.user.user_metadata || {}
  const full = meta.full_name || meta.name || ''
  displayName.value = full.split(' ')[0] || data.user.email?.split('@')[0] || ''
})()
```

- [ ] **Step 4 : Passer `highlightedQuoteId` à QuotesTab**

  Trouver le composant `<QuotesTab` dans le template et ajouter la prop :
```html
<QuotesTab
  v-if="activeTab === 'quotes'"
  :quotes="quotes"
  :profiles="profiles"
  :loading="loading"
  :initial-filter-user-id="quotesFilterUserId"
  :highlighted-quote-id="highlightedQuoteId"
  @delete-quote="confirmDeleteQuote($event)"
  @open-send-modal="sendTarget = $event"
  @reload="loadData"
/>
```

- [ ] **Step 5 : Vérifier que le build passe**

```
npm run build
```

  Expected : aucune erreur. Si erreur `loadData is not defined` → vérifier Step 2.

- [ ] **Step 6 : Commit**

```
git add src/views/admin/AdminDashboard.vue
git commit -m "feat(realtime): brancher useAdminRealtime dans AdminDashboard"
```

---

### Task 4 : Mettre à jour QuotesTab.vue — surbrillance

**Files:**
- Modify: `src/components/admin/QuotesTab.vue`

- [ ] **Step 1 : Ajouter la prop `highlightedQuoteId`**

  Dans `defineProps`, ajouter :
```js
const props = defineProps({
  quotes:              { type: Array,   default: () => [] },
  profiles:            { type: Array,   default: () => [] },
  loading:             { type: Boolean, default: false },
  initialFilterUserId: { type: String,  default: '' },
  highlightedQuoteId:  { type: String,  default: null },
})
```

- [ ] **Step 2 : Appliquer la class sur la ligne tableau (desktop)**

  Trouver `<tr v-for="q in paginatedQuotes" :key="q.id">` et remplacer par :
```html
<tr v-for="q in paginatedQuotes" :key="q.id"
    :class="{ 'quote-row--highlight': q.id === props.highlightedQuoteId }">
```

- [ ] **Step 3 : Appliquer la class sur la carte (mobile)**

  Trouver `<div v-for="q in paginatedQuotes" :key="q.id" class="qcard">` et remplacer par :
```html
<div v-for="q in paginatedQuotes" :key="q.id"
     :class="['qcard', { 'qcard--highlight': q.id === props.highlightedQuoteId }]">
```

- [ ] **Step 4 : Ajouter le CSS de surbrillance**

  À la fin du bloc `<style>` (ou dans le fichier CSS associé si QuotesTab utilise un fichier externe), ajouter :
```css
.quote-row--highlight {
  animation: rowPulse 3s ease forwards;
}
.qcard--highlight {
  animation: rowPulse 3s ease forwards;
}
@keyframes rowPulse {
  0%   { background-color: rgba(46, 156, 171, 0.18); }
  70%  { background-color: rgba(46, 156, 171, 0.10); }
  100% { background-color: transparent; }
}
```

- [ ] **Step 5 : Vérifier que le build passe**

```
npm run build
```

  Expected : aucune erreur.

- [ ] **Step 6 : Commit**

```
git add src/components/admin/QuotesTab.vue
git commit -m "feat(realtime): surbrillance teal 3s sur nouveau devis dans QuotesTab"
```

---

### Task 5 : Test manuel

- [ ] **Step 1 : Lancer le serveur de dev**

```
npm run dev
```

- [ ] **Step 2 : Ouvrir l'admin dans un onglet**

  Aller sur `http://localhost:5173/admin` → onglet "Tous les devis"

- [ ] **Step 3 : Soumettre un devis dans un second onglet**

  Ouvrir `http://localhost:5173/calculator/1` dans un second onglet → remplir et soumettre un devis.

- [ ] **Step 4 : Observer dans l'onglet admin**

  Sans refresh :
  - ✅ Le devis apparaît en tête de liste
  - ✅ Un toast "🖨️ Nouveau devis — [nom] · [total]" s'affiche
  - ✅ La ligne est surlignée en teal pendant ~3 secondes puis redevient normale

- [ ] **Step 5 : Tester UPDATE**

  Changer le statut d'un devis depuis l'onglet "Tous les devis" → vérifier que le changement persiste (la liste locale est mise à jour par Realtime).

- [ ] **Step 6 : Tester DELETE**

  Supprimer un devis → vérifier qu'il disparaît immédiatement sans refresh.

- [ ] **Step 7 : Push final**

```
git push
```
