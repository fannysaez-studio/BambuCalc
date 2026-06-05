# RDV Tab Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un onglet "RDV" dans l'AdminDashboard avec liste des rendez-vous, présence/absence, note admin, réponse Calendly, et lien vers le client.

**Architecture:** Nouvelle colonne `attended` (bool) et `admin_note` (text) sur la table `appointments` via migration SQL. Composant `RdvTab.vue` autonome qui lit/écrit `appointments` directement. Intégré dans AdminDashboard.vue comme tous les autres onglets.

**Tech Stack:** Vue 3 script-setup, Supabase JS client, Lucide Vue icons, CSS scoped cohérent avec les autres tabs admin.

---

### Task 1 : Migration SQL — colonnes attended + admin_note

**Files:**
- Create: `supabase/migrations/20260601000001_appointments_tracking.sql`

- [ ] **Step 1 : Créer le fichier de migration**

```sql
-- Suivi présence et note admin sur les rendez-vous
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS attended boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS admin_note text;
```

- [ ] **Step 2 : Appliquer en prod via Supabase Dashboard → SQL Editor**

Copier-coller le contenu du fichier et exécuter. Vérifier : `SELECT attended, admin_note FROM appointments LIMIT 1;` — doit retourner les colonnes.

- [ ] **Step 3 : Commit**

```bash
git add supabase/migrations/20260601000001_appointments_tracking.sql
git commit -m "feat(rdv): migration SQL attended + admin_note sur appointments"
```

---

### Task 2 : RdvTab.vue — composant principal

**Files:**
- Create: `src/components/admin/RdvTab.vue`

- [ ] **Step 1 : Créer RdvTab.vue**

```vue
<template>
  <div class="panel-card">
    <div class="panel-header">
      <h2 class="panel-title">Rendez-vous</h2>
      <div class="rdv-filters">
        <button
          v-for="f in filters"
          :key="f.id"
          :class="['uf-btn', filter === f.id && 'uf-btn--active']"
          @click="filter = f.id"
        >
          {{ f.label }}<span class="uf-count">{{ f.count }}</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="empty-state"><div class="spinner" /><p>Chargement…</p></div>

    <div v-else-if="filtered.length === 0" class="empty-state">
      <CalendarOff class="empty-icon" />
      <p class="empty-title">Aucun rendez-vous</p>
    </div>

    <div v-else class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Client</th>
            <th>Sujet</th>
            <th>Réponse Calendly</th>
            <th>Présent</th>
            <th>Note admin</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="a in filtered"
            :key="a.id"
            :class="{ 'tr--canceled': a.status === 'canceled', 'tr--past': isPast(a) }"
          >
            <td class="td-date">
              <span v-if="a.start_at">{{ fmtDate(a.start_at) }}</span>
              <span v-else class="text-muted">—</span>
              <span v-if="a.end_at && a.start_at" class="td-duration">
                {{ duration(a.start_at, a.end_at) }}
              </span>
            </td>
            <td class="td-client">
              <span class="td-name">{{ a.invitee_name || '—' }}</span>
              <a
                v-if="clientByEmail[a.invitee_email]"
                class="td-client-link"
                href="#"
                @click.prevent="$emit('go-to-client', clientByEmail[a.invitee_email])"
              >{{ a.invitee_email }}</a>
              <span v-else class="td-email-plain">{{ a.invitee_email || '—' }}</span>
            </td>
            <td class="td-subject">{{ a.event_name || '—' }}</td>
            <td class="td-answer">
              <span v-if="getAnswer(a)">{{ getAnswer(a) }}</span>
              <span v-else class="text-muted">—</span>
            </td>
            <td class="td-attended">
              <input
                type="checkbox"
                :checked="a.attended"
                :disabled="a.status === 'canceled'"
                class="rdv-check"
                @change="toggleAttended(a)"
              />
            </td>
            <td class="td-note">
              <input
                type="text"
                :value="a.admin_note || ''"
                class="rdv-note-input"
                placeholder="Note…"
                :disabled="a.status === 'canceled'"
                @blur="saveNote(a, $event.target.value)"
              />
            </td>
            <td class="td-status">
              <span :class="['badge-status', `badge-status--${a.status}`]">
                {{ a.status === 'canceled' ? 'Annulé' : isPast(a) ? 'Passé' : 'À venir' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { CalendarOff } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'

const props = defineProps({
  profiles: { type: Array, default: () => [] },
})

defineEmits(['go-to-client', 'count-change'])

const appointments = ref([])
const loading = ref(false)
const filter = ref('all')

const clientByEmail = computed(() => {
  const map = {}
  props.profiles.forEach(p => { if (p.email) map[p.email] = p.id })
  return map
})

const now = new Date()

function isPast(a) {
  return a.start_at && new Date(a.start_at) < now
}

function getAnswer(a) {
  try {
    const qa = a.raw?.payload?.questions_and_answers
    return Array.isArray(qa) && qa.length > 0 ? qa[0].answer : null
  } catch { return null }
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit',
  })
}

function duration(start, end) {
  const min = Math.round((new Date(end) - new Date(start)) / 60000)
  return `${min} min`
}

const filters = computed(() => [
  { id: 'all',     label: 'Tous',       count: appointments.value.length },
  { id: 'upcoming',label: 'À venir',    count: appointments.value.filter(a => !isPast(a) && a.status === 'active').length },
  { id: 'past',    label: 'Passés',     count: appointments.value.filter(a => isPast(a)).length },
  { id: 'canceled',label: 'Annulés',    count: appointments.value.filter(a => a.status === 'canceled').length },
])

const filtered = computed(() => {
  if (filter.value === 'upcoming') return appointments.value.filter(a => !isPast(a) && a.status === 'active')
  if (filter.value === 'past')     return appointments.value.filter(a => isPast(a))
  if (filter.value === 'canceled') return appointments.value.filter(a => a.status === 'canceled')
  return appointments.value
})

async function load() {
  loading.value = true
  const { data } = await supabase
    .from('appointments')
    .select('id, event_name, invitee_name, invitee_email, start_at, end_at, status, attended, admin_note, raw, created_at')
    .order('start_at', { ascending: false, nullsFirst: false })
  appointments.value = data ?? []
  loading.value = false
}

async function toggleAttended(a) {
  const val = !a.attended
  a.attended = val
  await supabase.from('appointments').update({ attended: val }).eq('id', a.id)
}

async function saveNote(a, val) {
  const note = val.trim() || null
  if (note === a.admin_note) return
  a.admin_note = note
  await supabase.from('appointments').update({ admin_note: note }).eq('id', a.id)
}

onMounted(load)
</script>

<style scoped>
.td-date    { white-space: nowrap; font-size: 0.78rem; }
.td-duration { display: block; font-size: 0.68rem; color: #a0aec0; margin-top: 2px; }
.td-name    { display: block; font-weight: 600; font-size: 0.82rem; color: #1b2f39; }
.td-client-link { display: block; font-size: 0.72rem; color: #2e9cab; text-decoration: none; }
.td-client-link:hover { text-decoration: underline; }
.td-email-plain { display: block; font-size: 0.72rem; color: #718096; }
.td-subject { font-size: 0.78rem; color: #4a5568; max-width: 120px; }
.td-answer  { font-size: 0.75rem; color: #4a5568; max-width: 180px; white-space: pre-wrap; }
.td-attended { text-align: center; }
.rdv-check  { width: 1rem; height: 1rem; accent-color: #2e9cab; cursor: pointer; }
.rdv-note-input {
  width: 100%; min-width: 100px; max-width: 160px;
  border: 1px solid #e2e8f0; border-radius: 6px;
  padding: 0.25rem 0.5rem; font-size: 0.75rem;
  font-family: inherit; color: #1b2f39;
  transition: border-color 0.15s;
}
.rdv-note-input:focus { outline: none; border-color: #2e9cab; }
.rdv-note-input:disabled { background: #f7f9fc; color: #a0aec0; cursor: not-allowed; }
.badge-status {
  display: inline-block; padding: 0.15rem 0.6rem;
  border-radius: 999px; font-size: 0.68rem; font-weight: 700;
}
.badge-status--active  { background: rgba(46,156,171,0.12); color: #2e9cab; }
.badge-status--canceled { background: rgba(229,62,62,0.08); color: #e53e3e; }
.tr--canceled td { opacity: 0.55; }
.tr--past .badge-status--active { background: #f0f4f8; color: #718096; }
.rdv-filters { display: flex; gap: 0.4rem; flex-wrap: wrap; }
</style>
```

- [ ] **Step 2 : Commit**

```bash
git add src/components/admin/RdvTab.vue
git commit -m "feat(rdv): composant RdvTab — liste, présence, note admin, réponse Calendly"
```

---

### Task 3 : Intégration dans AdminDashboard.vue

**Files:**
- Modify: `src/views/admin/AdminDashboard.vue`

- [ ] **Step 1 : Ajouter l'import de RdvTab et CalendarDays**

Dans la section imports du script setup, après les autres imports de composants admin :

```js
import RdvTab from '@/components/admin/RdvTab.vue'
```

Et dans les imports Lucide (ligne `import { ... } from 'lucide-vue-next'`), ajouter `CalendarDays`.

- [ ] **Step 2 : Ajouter rdvCount et l'onglet dans tabs computed**

Après `const catalogueCount = ref(0)` :

```js
const rdvCount = ref(0)
```

Dans le computed `tabs`, ajouter avant `settings` :

```js
{ id: 'rdv', label: 'RDV', icon: CalendarDays, count: rdvCount.value || 0 },
```

- [ ] **Step 3 : Ajouter le rendu du composant après SettingsTab**

Après `<SettingsTab v-if="activeTab === 'settings'" ... />` :

```html
<!-- ── Onglet RDV ── -->
<RdvTab
  v-if="activeTab === 'rdv'"
  :profiles="profiles"
  @go-to-client="quotesFilterUserId = $event; activeTab = 'clients'"
  @count-change="rdvCount = $event"
/>
```

- [ ] **Step 4 : Commit**

```bash
git add src/views/admin/AdminDashboard.vue
git commit -m "feat(rdv): onglet RDV dans AdminDashboard"
```

---

### Task 4 : GRANT UPDATE sur appointments pour authenticated

**Files:** Aucun fichier — SQL uniquement en prod.

- [ ] **Step 1 : Exécuter dans Supabase Dashboard → SQL Editor**

```sql
GRANT UPDATE ON public.appointments TO authenticated;
```

Sans ce grant, les cases à cocher et les notes ne pourront pas être sauvegardées.

- [ ] **Step 2 : Vérifier**

Cocher une case "Présent" dans l'onglet RDV et vérifier en SQL :

```sql
SELECT id, attended, admin_note FROM appointments LIMIT 3;
```

---

### Task 5 : Push et vérification

- [ ] **Step 1 : Push**

```bash
git push
```

- [ ] **Step 2 : Vérifier sur bambucalc.netlify.app/admin**

- L'onglet "RDV" apparaît dans la barre des onglets
- Les RDV s'affichent avec date, nom, réponse Calendly
- La case "Présent" se coche et persiste après rechargement
- La note s'enregistre au blur
- Le lien vers le client fonctionne si l'email correspond à un profil
- Le filtre Tous / À venir / Passés / Annulés fonctionne
