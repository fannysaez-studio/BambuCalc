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
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="a in filtered"
            :key="a.id"
            :class="{ 'tr--canceled': a.status === 'canceled', 'tr--past': isPast(a) && a.status !== 'canceled' }"
          >
            <td class="td-date">
              <span v-if="a.start_at">{{ fmtDate(a.start_at) }}</span>
              <span v-else class="text-muted">—</span>
              <span v-if="a.end_at && a.start_at" class="td-duration">{{ duration(a.start_at, a.end_at) }}</span>
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
              <span :class="['badge-status', `badge-status--${a.status === 'canceled' ? 'canceled' : isPast(a) ? 'past' : 'upcoming'}`]">
                {{ a.status === 'canceled' ? 'Annulé' : isPast(a) ? 'Passé' : 'À venir' }}
              </span>
            </td>
            <td class="td-actions">
              <button
                v-if="a.status === 'active'"
                class="rdv-action-btn rdv-action-btn--cancel"
                title="Annuler le RDV"
                @click="cancelAppointment(a)"
              ><XCircle :size="15" /></button>
              <button
                class="rdv-action-btn rdv-action-btn--delete"
                title="Supprimer définitivement"
                @click="deleteAppointment(a)"
              ><Trash2 :size="15" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { CalendarOff, XCircle, Trash2 } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'

const props = defineProps({
  profiles: { type: Array, default: () => [] },
})

const emit = defineEmits(['go-to-client', 'count-change'])

const appointments = ref([])
const loading = ref(false)
const filter = ref('upcoming')

const clientByEmail = computed(() => {
  const map = {}
  props.profiles.forEach(p => { if (p.email) map[p.email] = p.id })
  return map
})

function isPast(a) {
  return a.start_at && new Date(a.start_at) < new Date()
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
  { id: 'upcoming', label: 'À venir',  count: appointments.value.filter(a => !isPast(a) && a.status === 'active').length },
  { id: 'past',     label: 'Passés',   count: appointments.value.filter(a => isPast(a) && a.status === 'active').length },
  { id: 'canceled', label: 'Annulés',  count: appointments.value.filter(a => a.status === 'canceled').length },
  { id: 'all',      label: 'Tous',     count: appointments.value.length },
])

const filtered = computed(() => {
  if (filter.value === 'upcoming') return appointments.value.filter(a => !isPast(a) && a.status === 'active')
  if (filter.value === 'past')     return appointments.value.filter(a => isPast(a) && a.status === 'active')
  if (filter.value === 'canceled') return appointments.value.filter(a => a.status === 'canceled')
  return appointments.value
})

async function load() {
  loading.value = true
  const { data } = await supabase
    .from('appointments')
    .select('id, event_name, invitee_name, invitee_email, start_at, end_at, status, attended, admin_note, raw, created_at')
    .order('start_at', { ascending: false, nullsFirst: true })
  appointments.value = data ?? []
  const upcoming = appointments.value.filter(a => !isPast(a) && a.status === 'active').length
  emit('count-change', upcoming)
  loading.value = false
}

async function toggleAttended(a) {
  const val = !a.attended
  a.attended = val
  await supabase.from('appointments').update({ attended: val }).eq('id', a.id)
}

async function cancelAppointment(a) {
  if (!confirm(`Annuler le RDV de ${a.invitee_name || a.invitee_email} ?`)) return
  a.status = 'canceled'
  await supabase.from('appointments').update({ status: 'canceled' }).eq('id', a.id)
  const upcoming = appointments.value.filter(x => !isPast(x) && x.status === 'active').length
  emit('count-change', upcoming)
}

async function deleteAppointment(a) {
  if (!confirm(`Supprimer définitivement ce RDV ?`)) return
  appointments.value = appointments.value.filter(x => x.id !== a.id)
  await supabase.from('appointments').delete().eq('id', a.id)
  const upcoming = appointments.value.filter(x => !isPast(x) && x.status === 'active').length
  emit('count-change', upcoming)
}

async function saveNote(a, val) {
  const note = val.trim() || null
  if (note === (a.admin_note || null)) return
  a.admin_note = note
  await supabase.from('appointments').update({ admin_note: note }).eq('id', a.id)
}

onMounted(load)
</script>

<style scoped>
.rdv-filters { display: flex; gap: 0.4rem; flex-wrap: wrap; }

.td-date { white-space: nowrap; font-size: 0.78rem; min-width: 130px; }
.td-duration { display: block; font-size: 0.68rem; color: #a0aec0; margin-top: 2px; }
.td-name { display: block; font-weight: 600; font-size: 0.82rem; color: #1b2f39; }
.td-client-link { display: block; font-size: 0.72rem; color: #2e9cab; text-decoration: none; }
.td-client-link:hover { text-decoration: underline; }
.td-email-plain { display: block; font-size: 0.72rem; color: #718096; }
.td-subject { font-size: 0.78rem; color: #4a5568; max-width: 110px; }
.td-answer { font-size: 0.75rem; color: #4a5568; max-width: 180px; white-space: pre-wrap; word-break: break-word; }
.td-attended { text-align: center; }
.rdv-check { width: 1rem; height: 1rem; accent-color: #2e9cab; cursor: pointer; }

.rdv-note-input {
  width: 100%; min-width: 90px; max-width: 150px;
  border: 1px solid #e2e8f0; border-radius: 6px;
  padding: 0.25rem 0.5rem; font-size: 0.75rem;
  font-family: inherit; color: #1b2f39;
  transition: border-color 0.15s;
}
.rdv-note-input:focus { outline: none; border-color: #2e9cab; }
.rdv-note-input:disabled { background: #f7f9fc; color: #a0aec0; cursor: not-allowed; }

.badge-status {
  display: inline-block; padding: 0.15rem 0.6rem;
  border-radius: 999px; font-size: 0.68rem; font-weight: 700; white-space: nowrap;
}
.badge-status--upcoming { background: rgba(46,156,171,0.12); color: #2e9cab; }
.badge-status--past     { background: #f0f4f8; color: #718096; }
.badge-status--canceled { background: rgba(229,62,62,0.08); color: #e53e3e; }

.tr--canceled td { opacity: 0.55; }
.tr--past .td-name { color: #718096; }

.td-actions { white-space: nowrap; text-align: right; }
.rdv-action-btn {
  border: none; border-radius: 6px; cursor: pointer;
  padding: 0.25rem; display: inline-flex; align-items: center;
  transition: all 0.15s;
}
.rdv-action-btn--cancel {
  background: rgba(234,179,8,0.1); color: #b45309;
  margin-right: 0.3rem;
}
.rdv-action-btn--cancel:hover { background: rgba(234,179,8,0.2); }
.rdv-action-btn--delete {
  background: rgba(229,62,62,0.08); color: #e53e3e;
}
.rdv-action-btn--delete:hover { background: rgba(229,62,62,0.15); }
</style>
