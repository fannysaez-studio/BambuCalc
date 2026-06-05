<template>
  <div class="panel-card">
    <div class="panel-header">
      <h2 class="panel-title"><Users2 class="ptitle-icon" /> Clients</h2>
      <div class="user-filters">
        <button v-for="f in userFilters" :key="f.id"
          :class="['uf-btn', userFilter === f.id && 'uf-btn--active']"
          @click="userFilter = f.id">
          {{ f.label }}<span class="uf-count">{{ f.count }}</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="empty-state"><div class="spinner" /><p>Chargement…</p></div>
    <div v-else-if="filteredProfiles.length === 0" class="empty-state">
      <Users class="empty-icon" />
      <p class="empty-title">Aucun client</p>
    </div>
    <div v-else class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Nb devis</th>
            <th>Inscription</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filteredProfiles" :key="p.id">
            <td class="td-name">
              <span v-if="p.full_name">{{ p.full_name }}</span>
              <span v-else-if="quoteInfoByUser[p.id]?.name" class="anon-info">
                {{ quoteInfoByUser[p.id].name }}
                <span class="badge-anon">Invité</span>
              </span>
              <span v-else class="text-muted">—</span>
            </td>
            <td class="td-email">
              <span v-if="p.email">{{ p.email }}</span>
              <span v-else-if="quoteInfoByUser[p.id]?.email">{{ quoteInfoByUser[p.id].email }}</span>
              <span v-else class="text-muted">—</span>
            </td>
            <td class="td-center">
              <button class="badge badge--link" @click="goToClientQuotes(p.id)"
                :title="quoteCountFor(p.id) > 0 ? 'Voir les devis' : ''">
                {{ quoteCountFor(p.id) }}
                <span v-if="quoteCountFor(p.id) > 0" class="badge-arrow">→</span>
              </button>
            </td>
            <td class="td-date">{{ fmtDate(p.created_at) }}</td>
            <td class="td-actions">
              <button class="btn-del"
                :disabled="p.id === props.currentUserId"
                :title="p.id === props.currentUserId ? 'Impossible de supprimer votre propre compte' : 'Supprimer'"
                @click="p.id !== props.currentUserId && emit('delete-user', p)">
                <Trash2 class="del-icon" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Users, Users2, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  quotes:        { type: Array,   default: () => [] },
  profiles:      { type: Array,   default: () => [] },
  loading:       { type: Boolean, default: false },
  currentUserId: { type: String,  default: null },
  search:        { type: String,  default: '' },
})
const emit = defineEmits(['delete-user', 'go-to-quotes'])

const userFilter = ref('all')

const quoteInfoByUser = computed(() => {
  const map = {}
  for (const q of props.quotes) {
    if (!map[q.user_id] && (q.client_name || q.client_email))
      map[q.user_id] = { name: q.client_name || '', email: q.client_email || '' }
  }
  return map
})
const visibleProfiles = computed(() =>
  props.profiles.filter(p => {
    const isAnon = !p.full_name && !p.email
    return isAnon ? props.quotes.some(q => q.user_id === p.id) : true
  })
)
const clientProfiles = computed(() =>
  visibleProfiles.value.filter(p => p.id !== props.currentUserId && !!(p.full_name || p.email))
)
const guestProfiles = computed(() =>
  visibleProfiles.value.filter(p => !p.full_name && !p.email)
)
const filteredProfiles = computed(() => {
  let list
  if (userFilter.value === 'clients') list = clientProfiles.value
  else if (userFilter.value === 'guests') list = guestProfiles.value
  else list = visibleProfiles.value.filter(p => p.id !== props.currentUserId)
  if (!props.search) return list
  const q = props.search.toLowerCase()
  return list.filter(p =>
    (p.full_name || '').toLowerCase().includes(q) ||
    (p.email     || '').toLowerCase().includes(q)
  )
})
const userFilters = computed(() => {
  const total = visibleProfiles.value.filter(p => p.id !== props.currentUserId).length
  return [
    { id: 'all',     label: 'Tous',    count: total },
    { id: 'clients', label: 'Clients', count: clientProfiles.value.length },
    { id: 'guests',  label: 'Invités', count: guestProfiles.value.length },
  ]
})

function quoteCountFor(userId) {
  return props.quotes.filter(q => q.user_id === userId).length
}
function goToClientQuotes(userId) {
  if (!quoteCountFor(userId)) return
  emit('go-to-quotes', userId)
}
function fmtDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}
</script>

<style scoped>
.panel-card {
  background: #fff; border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  display: flex; flex-direction: column;
  flex: 1; min-height: 0; overflow: hidden;
}
.panel-header {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #f0f4f8;
  flex-shrink: 0; flex-wrap: wrap;
}
.panel-title { font-size: 0.95rem; font-weight: 800; color: #1b2f39; margin: 0; display: flex; align-items: center; gap: 0.4rem; }
.ptitle-icon { width: 0.78rem; height: 0.78rem; color: #667eea; flex-shrink: 0; }

.user-filters { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-left: auto; }
.uf-btn {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.3rem 0.75rem; border: 1.5px solid #e2e8f0; border-radius: 999px;
  background: #fff; color: #718096; font-size: 0.75rem; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: all 0.15s ease;
}
.uf-btn:hover { border-color: #5a67d8; color: #5a67d8; }
.uf-btn--active { border-color: #5a67d8; background: #ebf0ff; color: #5a67d8; }
.uf-count {
  font-size: 0.65rem; font-weight: 700;
  background: #edf2f7; color: #718096;
  padding: 0.05rem 0.4rem; border-radius: 999px;
}
.uf-btn--active .uf-count { background: #c3d0ff; color: #5a67d8; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.5rem; padding: 3rem 1.5rem; color: #a0aec0; text-align: center; flex: 1;
}
.empty-icon  { width: 2.5rem; height: 2.5rem; color: #cbd5e0; }
.empty-title { font-size: 0.95rem; font-weight: 700; color: #4a5568; margin: 0; }
.spinner {
  width: 2rem; height: 2rem;
  border: 3px solid #e2e8f0; border-top-color: #7c3aed;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.table-wrap { flex: 1; min-height: 0; overflow-y: auto; overflow-x: auto; }
.data-table { width: 100%; min-width: 480px; border-collapse: collapse; font-size: 0.82rem; }
.data-table thead th {
  padding: 0.6rem 0.85rem; text-align: left;
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.06em; color: #a0aec0;
  background: #f7f9fc; border-bottom: 1px solid #e2e8f0;
}
.data-table tbody tr { border-bottom: 1px solid #f0f4f8; transition: background 0.15s ease; }
.data-table tbody tr:last-child { border-bottom: none; }
.data-table tbody tr:hover { background: #f8f7ff; }
.data-table td { padding: 0.75rem 0.85rem; color: #2d3748; font-weight: 600; vertical-align: middle; }

.td-name   { font-weight: 700; color: #1b2f39; }
.td-email  { color: #718096; font-size: 0.8rem; }
.td-center { text-align: center; }
.td-date   { color: #a0aec0; font-size: 0.78rem; white-space: nowrap; }
.td-actions { text-align: right; display: flex; justify-content: flex-end; align-items: center; gap: 0.2rem; }

.badge {
  display: inline-block; padding: 0.15rem 0.55rem;
  background: #f0f4f8; color: #718096;
  border-radius: 999px; font-size: 0.72rem; font-weight: 700;
}
.badge--link { border: none; cursor: pointer; font-family: inherit; transition: background 0.15s, color 0.15s; }
.badge--link:hover { background: #e8f7f9; color: #2e9cab; }
.badge-arrow { font-size: 0.65rem; margin-left: 0.15rem; }
.badge-anon {
  display: inline-block; padding: 0.1rem 0.4rem;
  background: #f0f4f8; color: #a0aec0;
  border-radius: 999px; font-size: 0.6rem; font-weight: 700;
  letter-spacing: 0.04em; text-transform: uppercase;
  margin-left: 0.35rem; vertical-align: middle;
}
.anon-info { color: #4a5568; }
.text-muted { color: #cbd5e0; }

.btn-del {
  width: 1.9rem; height: 1.9rem; border: none; background: none; border-radius: 8px;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  color: #cbd5e0; transition: background 0.15s ease, color 0.15s ease; font-family: inherit;
}
.btn-del:disabled { opacity: 0.25; cursor: not-allowed; }
.btn-del:hover:not(:disabled) { background: #fff5f5; color: #e53e3e; }
.del-icon { width: 0.9rem; height: 0.9rem; }

@media (max-width: 1023px) {
  .panel-card { flex: none; overflow: visible; }
  .table-wrap { flex: none; min-height: auto; overflow-y: visible; }
}
@media (min-width: 761px) and (max-width: 1023px) {
  .panel-card { flex: 1; min-height: 0; overflow: visible; display: flex; flex-direction: column; }
  .table-wrap { flex: 1; min-height: 0; overflow-y: auto; overflow-x: auto; }
}
@media (max-width: 540px) {
  .panel-header { flex-direction: column; align-items: flex-start; }
  .user-filters { width: 100%; margin-left: 0; }
}
</style>
