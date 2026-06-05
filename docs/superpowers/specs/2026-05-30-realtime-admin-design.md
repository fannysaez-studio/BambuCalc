# Spec — Realtime Admin Dashboard

**Date :** 2026-05-30
**Scope :** Mise à jour en temps réel des devis et profils dans AdminDashboard.vue via Supabase Realtime

---

## Objectif

Aujourd'hui l'admin doit rafraîchir la page pour voir les nouveaux devis. Avec cette feature, la liste se tient à jour automatiquement : nouveaux devis, changements de statut, suppressions, nouvelles inscriptions — tout apparaît en live sans aucune action.

---

## Architecture

### Nouveau composable : `src/composables/useAdminRealtime.js`

Responsabilités :
1. Chargement initial des données (`getAllQuotesAdmin` + `getAllProfilesAdmin`)
2. Ouverture de deux canaux Supabase Realtime (`admin-quotes`, `admin-profiles`)
3. Exposition de refs réactives consommées par AdminDashboard
4. Désabonnement automatique à la destruction du composant (`onUnmounted`)

Interface retournée :
```js
const { quotes, profiles, loading, highlightedQuoteId } = useAdminRealtime(toast)
```

### Modification AdminDashboard.vue

Remplacement des 3 refs manuelles + `loadData()` par l'appel au composable.
Le reste du composant (modales, onglets, push, hero) ne change pas.

---

## Événements Realtime

| Événement | Table | Action locale |
|---|---|---|
| INSERT | `quotes` | Ajout en tête de `quotes.value` + toast + `highlightedQuoteId` = id pendant 3s |
| UPDATE | `quotes` | Remplacement de l'entrée correspondante (`id` match) |
| DELETE | `quotes` | Suppression de l'entrée par `id` |
| INSERT | `profiles` | Ajout en tête de `profiles.value` |
| UPDATE | `profiles` | Remplacement de l'entrée correspondante |
| DELETE | `profiles` | Suppression de l'entrée par `id` |

---

## Feedback visuel

### Toast (nouveaux devis uniquement)
- Composant : `ToastMessage` déjà en place dans AdminDashboard
- Message : `"🖨️ Nouveau devis — [project_name] · [total_cost]€"`
- Type : `success`
- Durée : 4000ms

### Surbrillance de ligne
- `highlightedQuoteId` (ref, initialement `null`) est passé en prop à `QuotesTab`
- La ligne dont l'`id` correspond reçoit une class CSS `.quote-row--highlight`
- Après 3000ms : `highlightedQuoteId` repasse à `null`, la surbrillance disparaît
- Animation : fond teal transparent → transparent (transition CSS 0.5s)

---

## Composable — détail d'implémentation

```js
// src/composables/useAdminRealtime.js
import { ref, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { getAllQuotesAdmin, getAllProfilesAdmin } from '@/utils/quotes'
import { fmtEur } from '@/utils/formatters'

export function useAdminRealtime(toast) {
  const quotes            = ref([])
  const profiles          = ref([])
  const loading           = ref(true)
  const highlightedQuoteId = ref(null)

  // Chargement initial
  async function loadData() { ... }

  // Canal quotes
  const quotesChannel = supabase.channel('admin-quotes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, handler)
    .subscribe()

  // Canal profiles
  const profilesChannel = supabase.channel('admin-profiles')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, handler)
    .subscribe()

  onUnmounted(() => {
    supabase.removeChannel(quotesChannel)
    supabase.removeChannel(profilesChannel)
  })

  return { quotes, profiles, loading, highlightedQuoteId }
}
```

---

## Prérequis Supabase (manuel, avant déploiement)

Activer Realtime sur les deux tables dans :
**Supabase Dashboard → Database → Replication → Supabase Realtime**

- [x] `quotes`
- [x] `profiles`

---

## Fichiers modifiés

| Fichier | Action |
|---|---|
| `src/composables/useAdminRealtime.js` | Créer |
| `src/views/admin/AdminDashboard.vue` | Modifier — remplacer refs + loadData par composable |
| `src/components/admin/QuotesTab.vue` | Modifier — accepter prop `highlightedQuoteId`, appliquer class CSS |

---

## Ce qui ne change pas

- Tous les composants enfants (tabs) restent identiques sauf QuotesTab
- Les modales de suppression/envoi restent dans AdminDashboard
- Le push notifications (`usePushNotifications`) est inchangé
- Aucune migration SQL nécessaire
