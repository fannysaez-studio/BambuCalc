# Dashboard.vue — Migration `<script setup>` + Realtime client

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrer Dashboard.vue d'Options API vers `<script setup>` et ajouter le Realtime côté client (mise à jour live du statut des devis quand l'admin les modifie).

**Architecture:** Un seul fichier modifié (`src/views/dashboard/Dashboard.vue`). Le bloc `<script>` est entièrement remplacé par `<script setup>`. Le Realtime est intégré directement (pas de composable séparé — Dashboard est plus simple qu'AdminDashboard). Template et CSS restent identiques.

**Tech Stack:** Vue 3 `<script setup>`, `ref`, `computed`, `onUnmounted` — Supabase Realtime (`postgres_changes`) — `src/utils/formatters.js` pour `fmtEur`.

---

## Fichiers concernés

| Fichier | Action |
|---|---|
| `src/views/dashboard/Dashboard.vue` | Modifier — remplacer bloc `<script>` |

---

### Task 1 : Remplacer le bloc `<script>` par `<script setup>` + Realtime

**Fichiers :**
- Modifier : `src/views/dashboard/Dashboard.vue` (lignes 322–479)

- [ ] **Step 1 : Ouvrir le fichier et localiser le bloc `<script>`**

Le bloc à remplacer commence ligne 322 (`<script>`) et finit ligne 480 (`</script>`).
Le template (lignes 1–321) et le CSS (lignes 481–1219) ne bougent pas.

- [ ] **Step 2 : Remplacer tout le bloc `<script>...</script>` par ce contenu**

```vue
<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { getQuotes, getArchivedQuotes, archiveQuote } from '@/utils/quotes'
import { generateQuotePDF } from '@/utils/generateQuotePDF'
import { fmtEur } from '@/utils/formatters'
import ToastMessage from '@/components/ui/ToastMessage.vue'
import QuotePreviewModal from '@/components/ui/QuotePreviewModal.vue'
import { User, Plus, FileText, TrendingUp, Package, Wallet, Archive, ChevronDown, Download, UserX, CreditCard, Eye } from 'lucide-vue-next'

// ── State ──
const displayName = ref('')
const isAnonymous = ref(false)
const quotes = ref([])
const loading = ref(true)
const archiveTarget = ref(null)
const archiving = ref(false)
const archivedQuotes = ref([])
const archivedCount = ref(0)
const showArchives = ref(false)
const loadingArchives = ref(false)
const previewingQuote = ref(null)
const zoomedImageUrl = ref(null)
const showLinkForm = ref(false)
const linkEmail = ref('')
const linkPassword = ref('')
const linking = ref(false)
const linkSuccess = ref(false)
const linkError = ref(null)
const toast = ref(null)

// ── Computed ──
const avgCost = computed(() => {
  if (!quotes.value.length) return 0
  const sum = quotes.value.reduce((a, q) => a + (q.total_cost || 0), 0)
  return sum / quotes.value.length
})

const totalRevenue = computed(() =>
  quotes.value.reduce((a, q) => a + (q.total_cost || 0), 0)
)

const topMaterial = computed(() => {
  if (!quotes.value.length) return ''
  const counts = {}
  quotes.value.forEach(q => { if (q.material) counts[q.material] = (counts[q.material] || 0) + 1 })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
})

const archivedByYear = computed(() => {
  const grouped = {}
  for (const q of archivedQuotes.value) {
    const year = new Date(q.created_at).getFullYear()
    if (!grouped[year]) grouped[year] = []
    grouped[year].push(q)
  }
  return Object.fromEntries(Object.entries(grouped).sort((a, b) => b[0] - a[0]))
})

// ── Formatters ──
function fmtDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}

function wasEdited(q) {
  if (!q.updated_at || !q.created_at) return false
  return Math.abs(new Date(q.updated_at) - new Date(q.created_at)) > 60_000
}

function statusLabel(status) {
  return { pending: 'En attente', accepted: 'Accepté', refused: 'Refusé', sent: 'Envoyé' }[status] || 'En attente'
}

// ── Data loading ──
async function loadQuotes() {
  loading.value = true
  try {
    const [result, { count }] = await Promise.all([
      getQuotes(),
      supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('archived', true),
    ])
    quotes.value = result ?? []
    archivedCount.value = count ?? 0
  } catch (e) {
    console.error('[Dashboard] loadQuotes error:', e)
    toast.value?.show(`Erreur : ${e?.message || JSON.stringify(e)}`, 'error')
  } finally {
    loading.value = false
  }
}

// ── Realtime ──
let realtimeChannel = null

function setupRealtime(userId) {
  realtimeChannel = supabase
    .channel('dashboard-quotes')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'quotes', filter: `user_id=eq.${userId}` },
      (payload) => {
        const idx = quotes.value.findIndex(q => q.id === payload.new.id)
        if (idx !== -1) quotes.value[idx] = { ...quotes.value[idx], ...payload.new }
      }
    )
    .subscribe()
}

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})

// ── Init (équivalent de created()) ──
;(async () => {
  const { data } = await supabase.auth.getUser()
  const user = data.user
  if (user) {
    isAnonymous.value = user.is_anonymous ?? false
    if (isAnonymous.value) {
      displayName.value = 'Invité'
    } else {
      const meta = user.user_metadata || {}
      const full = meta.full_name || meta.name || ''
      displayName.value = full.split(' ')[0] || user.email?.split('@')[0] || ''
    }
  }
  await loadQuotes()
  if (user) setupRealtime(user.id)  // après loadQuotes — on subscribe depuis un état connu
})()

// ── Actions ──
async function downloadPDF(q) {
  await generateQuotePDF(q)
}

function confirmArchive(q) {
  archiveTarget.value = q
}

async function doArchive() {
  archiving.value = true
  try {
    await archiveQuote(archiveTarget.value.id)
    quotes.value = quotes.value.filter(q => q.id !== archiveTarget.value.id)
    archivedCount.value++
    if (showArchives.value) archivedQuotes.value = await getArchivedQuotes()
    toast.value.show('Devis archivé.', 'success', 2500)
    archiveTarget.value = null
  } catch {
    toast.value.show("Erreur lors de l'archivage.", 'error')
  } finally {
    archiving.value = false
  }
}

async function toggleArchives() {
  showArchives.value = !showArchives.value
  if (showArchives.value && archivedQuotes.value.length === 0) {
    loadingArchives.value = true
    try {
      archivedQuotes.value = await getArchivedQuotes()
    } catch {
      toast.value.show('Erreur chargement archives.', 'error')
    } finally {
      loadingArchives.value = false
    }
  }
}

async function linkAccount() {
  linking.value = true
  linkError.value = null
  linkSuccess.value = false
  try {
    const { error } = await supabase.auth.updateUser({
      email: linkEmail.value,
      password: linkPassword.value,
    })
    if (error) throw error
    linkSuccess.value = true
    isAnonymous.value = false
  } catch (e) {
    linkError.value = e.message || 'Une erreur est survenue.'
  } finally {
    linking.value = false
  }
}
</script>
```

- [ ] **Step 3 : Vérifier que le template n'a pas changé**

Le template utilise les refs et fonctions directement par leur nom (Vue 3 auto-unwrap dans le template). Aucune référence à `this.` dans le template — tout est déjà compatible. Confirmer visuellement que les lignes 1–321 sont intactes.

- [ ] **Step 4 : Lancer le serveur dev et vérifier le dashboard**

```bash
npm run dev
```

Ouvrir http://localhost:5173 → se connecter → aller sur le dashboard.
Vérifier :
- Les devis s'affichent
- Les stats (4 cards) sont correctes
- Les dates s'affichent au format "30 mai 2026" (month: short)
- Le bouton PDF fonctionne
- L'archivage fonctionne (clic Archive → modal → confirmer → devis disparaît)
- La section Archives s'ouvre/ferme

---

### Task 2 : Vérifier le Realtime en conditions réelles

- [ ] **Step 1 : S'assurer que Realtime est activé sur la table `quotes` dans Supabase**

Dans Supabase Dashboard → Database → Replication → vérifier que `quotes` est cochée (déjà fait lors de la session du 2026-05-30 pour l'admin — normalement déjà actif).

- [ ] **Step 2 : Tester le Realtime en deux onglets**

- Onglet A : ouvrir le dashboard client (connecté ou invité)
- Onglet B : ouvrir l'admin → onglet "Devis" → changer le statut d'un devis existant
- Vérifier dans l'onglet A : le badge de statut se met à jour sans recharger la page

---

### Task 3 : Commit

- [ ] **Step 1 : Vérifier le diff**

```bash
git diff src/views/dashboard/Dashboard.vue
```

Seul le bloc `<script>` doit avoir changé. Template et CSS : aucune ligne modifiée.

- [ ] **Step 2 : Commiter**

```bash
git add src/views/dashboard/Dashboard.vue
git commit -m "feat(dashboard): migration script-setup + realtime statut devis client"
```
