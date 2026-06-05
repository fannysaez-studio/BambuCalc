# Dashboard.vue — Migration `<script setup>` + Realtime client

**Date :** 2026-05-31
**Statut :** Approuvé

---

## Objectif

Moderniser Dashboard.vue (Options API → Composition API `<script setup>`) et ajouter le Realtime côté client : quand l'admin change le statut d'un devis, le client ou l'invité le voit changer en live dans son dashboard sans recharger la page.

---

## Contexte

- AdminDashboard.vue est déjà en `<script setup>` + Realtime via `useAdminRealtime.js`
- Dashboard.vue est encore en Options API (`export default { data(), computed, methods, created() }`)
- Les invités ont un `user_id` Supabase anonyme — le filtre Realtime fonctionne de façon identique pour eux

---

## Ce qui change

### 1. Migration Options API → `<script setup>`

| Avant | Après |
|---|---|
| `data()` | `ref()` par variable réactive |
| `computed` | `computed()` |
| `methods` | Fonctions déclarées dans le setup |
| `created()` | Code exécuté directement dans le setup |
| `this.$refs.toast` | `const toast = ref(null)` + `toast.value?.show(...)` |
| `fmtEur` (méthode locale) | Import depuis `src/utils/formatters.js` |
| `fmtDate` (méthode locale, `month: 'short'`) | Conservée locale — format court voulu ("30 janv. 2026") |

Le template HTML et le CSS restent **identiques** — aucun changement visuel.

### 2. Realtime client

Après `loadQuotes()`, on ouvre un channel Supabase sur la table `quotes` :

```js
const channel = supabase
  .channel('dashboard-quotes')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'quotes', filter: `user_id=eq.${userId}` },
    (payload) => {
      const idx = quotes.value.findIndex(q => q.id === payload.new.id)
      if (idx !== -1) quotes.value[idx] = { ...quotes.value[idx], ...payload.new }
    }
  )
  .subscribe()
```

Nettoyage dans `onUnmounted` : `supabase.removeChannel(channel)`.

**Événements écoutés :** `UPDATE` uniquement (changements de statut par l'admin).
**Pas de toast côté client** — le badge qui se met à jour visuellement suffit.

---

## Ce qui ne change pas

- Template HTML : identique
- CSS / styles : identiques
- Comportement fonctionnel (archivage, PDF, preview, liaison compte invité) : identique
- Aucun nouveau composant créé
- Aucun nouveau fichier créé (Realtime inline dans Dashboard.vue)

---

## Architecture

```
src/
  views/
    dashboard/
      Dashboard.vue        ← modifié (migration + realtime)
  utils/
    formatters.js          ← déjà existant, importé (fmtEur, fmtDate)
```

---

## Tests

- Les tests Vitest existants ne couvrent pas Dashboard.vue (vue complète) — pas de tests à modifier.
- Vérification manuelle : ouvrir le dashboard client dans un onglet, changer le statut d'un devis depuis l'admin dans un autre onglet → le badge se met à jour sans recharger.
