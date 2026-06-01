<template>
  <div class="panel-card">
    <div class="panel-header">
      <h2 class="panel-title">Rendez-vous</h2>
      <div class="rdv-filters">
        <button
          v-for="f in filters"
          :key="f.id"
          :class="['uf-btn', filter === f.id && 'uf-btn--active']"
          @click="filter = f.id; selectedIds.clear()"
        >{{ f.label }}<span class="uf-count">{{ f.count }}</span></button>

        <Transition name="bulk-fade">
          <button v-if="selectedIds.size > 0" class="btn-bulk-del" @click="deleteSelected" title="Supprimer la sélection">
            <Trash2 class="bulk-icon" />
            <span>{{ selectedIds.size }}</span>
          </button>
        </Transition>
      </div>
    </div>

    <!-- Modale de confirmation custom -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="dialogVisible" class="rdv-confirm-backdrop" role="dialog" aria-modal="true">
          <div class="rdv-confirm-card">
            <div :class="['rdv-confirm-icon-wrap', `rdv-confirm-icon-wrap--${dialogType}`]">
              <component :is="dialogType === 'delete' ? Trash2 : XCircle" class="rdv-confirm-icon" />
            </div>
            <h3 class="rdv-confirm-title">{{ dialogTitle }}</h3>
            <p class="rdv-confirm-msg">{{ dialogMessage }}</p>
            <div class="rdv-confirm-actions">
              <button class="rdv-confirm-btn rdv-confirm-btn--neutral" @click="cancelDialog">Annuler</button>
              <button :class="['rdv-confirm-btn', `rdv-confirm-btn--${dialogType}`]" @click="confirmDialog">Confirmer</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <div v-if="loading" class="empty-state"><div class="spinner" /><p>Chargement…</p></div>

    <div v-else-if="filtered.length === 0" class="empty-state">
      <CalendarOff class="empty-icon" />
      <p class="empty-title">Aucun rendez-vous</p>
    </div>

    <div v-else class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th class="th-check">
              <input type="checkbox" class="rdv-checkbox" :checked="allSelected" @change="toggleAll" />
            </th>
            <th>Date &amp; Heure</th>
            <th>Client</th>
            <th>Email</th>
            <th>Objet</th>
            <th>Format</th>
            <th>Présence</th>
            <th>Note admin</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="a in filtered"
            :key="a.id"
            :class="{ 'tr--canceled': a.status === 'canceled', 'tr--past': isPast(a) && a.status !== 'canceled', 'tr--editing': editingId === a.id, 'tr--selected': selectedIds.has(a.id) }"
          >
            <td class="td-check">
              <input type="checkbox" class="rdv-checkbox" :checked="selectedIds.has(a.id)" @change="toggleOne(a.id)" />
            </td>

            <!-- Date & Heure fusionnés -->
            <td class="td-datetime">
              <span class="td-date">{{ fmtDate(a.start_at) }}</span>
              <span class="td-time">{{ fmtTime(a.start_at) }}</span>
            </td>

            <td class="td-client">
              <span class="td-name">{{ a.invitee_name || '—' }}</span>
              <span class="td-duration">{{ duration(a.start_at, a.end_at) }}</span>
            </td>

            <td class="td-email">
              <a v-if="clientByEmail[a.invitee_email]" class="td-client-link" href="#"
                @click.prevent="$emit('go-to-client', clientByEmail[a.invitee_email])">
                {{ a.invitee_email }}
              </a>
              <span v-else class="text-muted-sm">{{ a.invitee_email || '—' }}</span>
            </td>

            <td class="td-object">
              <span :title="getObjectRdv(a) !== '—' ? getObjectRdv(a) : ''">
                {{ getObjectRdv(a) }}
              </span>
            </td>

            <!-- Format : select badge LED -->
            <td class="td-format">
              <div class="rdv-select-wrap">
                <span :class="['led-glow', `led-glow--${a.format}`]" />
                <select
                  v-model="a.format"
                  :class="['rdv-select', `rdv-select--${a.format}`]"
                  :disabled="a.status === 'canceled'"
                  @change="saveFormat(a)"
                >
                  <option value="online">En ligne</option>
                  <option value="inperson">Extérieur</option>
                </select>
              </div>
            </td>

            <!-- Présence : select badge LED -->
            <td class="td-presence">
              <div class="rdv-select-wrap">
                <span :class="['led-glow', `led-glow--${ledPresence(a)}`]" />
                <select
                  :class="['rdv-select', `rdv-select--${ledPresence(a)}`]"
                  :value="a.presence ?? ''"
                  :disabled="a.status === 'canceled'"
                  @change="savePresence(a, $event.target.value)"
                >
                  <option value="">À confirmer</option>
                  <option value="present">Présent(e)</option>
                  <option value="absent">Absent(e)</option>
                </select>
              </div>
            </td>

            <td class="td-note">
              <input
                :ref="el => { if (el) noteRefs[a.id] = el }"
                type="text"
                :value="a.admin_note || ''"
                class="rdv-note-input"
                :class="{ 'rdv-note-input--focus': editingId === a.id }"
                placeholder="Note…"
                :disabled="a.status === 'canceled'"
                @blur="saveNote(a, $event.target.value); editingId = null"
              />
            </td>

            <td class="td-actions">
              <button class="btn-action btn-edit" title="Éditer la note" @click="startEdit(a)">
                <Pencil class="action-icon" />
              </button>
              <button v-if="a.status === 'active'" class="btn-action btn-cancel" title="Annuler le RDV" @click="cancelAppointment(a)">
                <XCircle class="action-icon" />
              </button>
              <button class="btn-action btn-del" title="Supprimer" @click="deleteAppointment(a)">
                <Trash2 class="action-icon" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, reactive } from 'vue'
import { CalendarOff, Pencil, XCircle, Trash2 } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'

const props = defineProps({ profiles: { type: Array, default: () => [] } })
const emit = defineEmits(['go-to-client', 'count-change'])

const appointments = ref([])
const loading = ref(false)
const filter = ref('upcoming')
const editingId = ref(null)
const noteRefs = ref({})

const selectedIds = reactive(new Set())
const allSelected = computed(() => filtered.value.length > 0 && filtered.value.every(a => selectedIds.has(a.id)))
function toggleAll() { allSelected.value ? filtered.value.forEach(a => selectedIds.delete(a.id)) : filtered.value.forEach(a => selectedIds.add(a.id)) }
function toggleOne(id) { selectedIds.has(id) ? selectedIds.delete(id) : selectedIds.add(id) }

async function deleteSelected() {
  const ids = [...selectedIds]
  const ok = await askConfirm(
    `Supprimer ${ids.length} rendez-vous ?`,
    'Cette action est irréversible. Les RDV sélectionnés seront définitivement supprimés.',
    'delete'
  )
  if (!ok) return
  await Promise.all(ids.map(id => adminAction('delete', id)))
  appointments.value = appointments.value.filter(a => !ids.includes(a.id))
  ids.forEach(id => selectedIds.delete(id))
  emit('count-change', appointments.value.filter(x => !isPast(x) && x.status === 'active').length)
}

const dialogVisible = ref(false)
const dialogTitle   = ref('')
const dialogMessage = ref('')
const dialogType    = ref('delete')
let dialogResolve   = null

function askConfirm(title, message, type = 'delete') {
  return new Promise(resolve => {
    dialogTitle.value   = title
    dialogMessage.value = message
    dialogType.value    = type
    dialogVisible.value = true
    dialogResolve       = resolve
  })
}
function confirmDialog() { dialogVisible.value = false; dialogResolve?.(true) }
function cancelDialog()  { dialogVisible.value = false; dialogResolve?.(false) }

const ONLINE_TYPES = ['google_conference', 'zoom', 'teams', 'gotomeeting', 'webex', 'microsoft_teams', 'google_meet']

const clientByEmail = computed(() => {
  const map = {}
  props.profiles.forEach(p => { if (p.email) map[p.email] = p.id })
  return map
})

function isPast(a) { return a.start_at && new Date(a.start_at) < new Date() }

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function fmtTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
function duration(start, end) {
  if (!start || !end) return '—'
  const min = Math.round((new Date(end) - new Date(start)) / 60000)
  return `${min} min`
}
function truncate(str, n) {
  if (!str || str === '—') return '—'
  return str.length > n ? str.slice(0, n) + '…' : str
}

function getObjectRdv(a) {
  try {
    const qa = a.raw?.payload?.questions_and_answers
    if (Array.isArray(qa) && qa.length > 0 && qa[0].answer?.trim()) return qa[0].answer.trim()
  } catch { /* */ }
  return '—'
}

function deriveFormat(a) {
  const loc = a.raw?.payload?.scheduled_event?.location?.type ?? ''
  return ONLINE_TYPES.some(t => loc.includes(t)) ? 'online' : 'inperson'
}

function ledPresence(a) {
  if (a.presence === 'present') return 'present'
  if (a.presence === 'absent')  return 'absent'
  return 'unknown'
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
    .select('id, event_name, invitee_name, invitee_email, start_at, end_at, status, presence, format, admin_note, raw, created_at')
    .order('start_at', { ascending: false, nullsFirst: true })
  appointments.value = (data ?? []).map(a => ({
    ...a,
    format:   a.format   ?? deriveFormat(a),
    presence: a.presence ?? null,
  }))
  emit('count-change', appointments.value.filter(a => !isPast(a) && a.status === 'active').length)
  loading.value = false
}

function startEdit(a) {
  editingId.value = a.id
  nextTick(() => { noteRefs.value[a.id]?.focus() })
}

async function saveFormat(a) {
  await supabase.from('appointments').update({ format: a.format }).eq('id', a.id)
}

async function savePresence(a, val) {
  const v = val === '' ? null : val
  a.presence = v
  await supabase.from('appointments').update({ presence: v }).eq('id', a.id)
}

async function adminAction(action, id) {
  const { data: { session } } = await supabase.auth.getSession()
  const jwt = session?.access_token
  if (!jwt) { console.error('Non authentifié'); return false }

  const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-appointments`
  const res = await fetch(fnUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ action, id }),
  })
  if (!res.ok) { console.error('admin-appointments error:', res.status, await res.text()); return false }
  return true
}

async function cancelAppointment(a) {
  const ok = await askConfirm(
    'Annuler ce rendez-vous ?',
    `Le RDV de ${a.invitee_name || a.invitee_email} sera marqué comme annulé.`,
    'cancel'
  )
  if (!ok) return
  const done = await adminAction('cancel', a.id)
  if (!done) return
  a.status = 'canceled'
  emit('count-change', appointments.value.filter(x => !isPast(x) && x.status === 'active').length)
}

async function deleteAppointment(a) {
  const ok = await askConfirm(
    'Supprimer ce rendez-vous ?',
    'Cette action est irréversible. Le RDV sera définitivement supprimé.',
    'delete'
  )
  if (!ok) return
  const done = await adminAction('delete', a.id)
  if (!done) return
  appointments.value = appointments.value.filter(x => x.id !== a.id)
  emit('count-change', appointments.value.filter(x => !isPast(x) && x.status === 'active').length)
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
/* styles déplacés vers le bloc global ci-dessous */

.rdv-filters { display: flex; gap: 0.4rem; flex-wrap: wrap; align-items: center; }

/* ── Sélection groupée ── */
.th-check, .td-check { width: 2rem; padding-right: 0; }
.rdv-checkbox {
  width: 1rem; height: 1rem; cursor: pointer;
  accent-color: #2e9cab; border-radius: 4px;
}
.tr--selected { background: rgba(46,156,171,0.07) !important; }

.btn-bulk-del {
  display: inline-flex; align-items: center; gap: 0.35rem;
  padding: 0.3rem 0.75rem; border: none; border-radius: 8px;
  background: #e53e3e; color: #fff;
  font-size: 0.78rem; font-weight: 700; cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  font-family: inherit;
}
.btn-bulk-del:hover { background: #c53030; transform: translateY(-1px); }
.bulk-icon { width: 0.85rem; height: 0.85rem; }

.bulk-fade-enter-active { animation: bulkIn 0.2s ease; }
.bulk-fade-leave-active { animation: bulkOut 0.15s ease; }
@keyframes bulkIn  { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
@keyframes bulkOut { from { opacity:1; } to { opacity:0; transform:scale(0.85); } }

/* ── Cellules ── */
.td-datetime { white-space: nowrap; }
.td-date { display: block; font-size: 0.78rem; font-weight: 600; color: #1b2f39; }
.td-time { display: block; font-size: 0.72rem; color: #2e9cab; font-weight: 600; }
.td-client   { white-space: nowrap; }
.td-name     { display: block; font-size: 0.8rem; font-weight: 600; color: #1b2f39; }
.td-duration { display: block; font-size: 0.7rem; color: #a0aec0; margin-top: 1px; }
.td-email    { font-size: 0.72rem; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.td-object   { font-size: 0.75rem; color: #4a5568; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.td-format, .td-presence { white-space: nowrap; }

.td-client-link { color: #2e9cab; text-decoration: none; }
.td-client-link:hover { text-decoration: underline; }
.text-muted-sm { color: #a0aec0; font-size: 0.72rem; }

/* ── LED lumineuse (même style que CatalogueSection) ── */
.rdv-select-wrap {
  display: inline-flex; align-items: center; gap: 0.35rem;
}
.led-glow {
  width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; display: inline-block;
}
.led-glow--online   { background: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.2),  0 0 7px 2px rgba(59,130,246,0.5); }
.led-glow--inperson { background: #22c55e; box-shadow: 0 0 0 2px rgba(34,197,94,0.2),   0 0 7px 2px rgba(34,197,94,0.5); }
.led-glow--unknown  { background: #a0aec0; box-shadow: 0 0 0 2px rgba(160,174,192,0.2), 0 0 5px 1px rgba(160,174,192,0.4); animation: led-blink 2s ease-in-out infinite; }
.led-glow--present  { background: #22c55e; box-shadow: 0 0 0 2px rgba(34,197,94,0.2),   0 0 7px 2px rgba(34,197,94,0.5); }
.led-glow--absent   { background: #ef4444; box-shadow: 0 0 0 2px rgba(239,68,68,0.2),   0 0 7px 2px rgba(239,68,68,0.5); }

@keyframes led-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* ── Select (style identique cat-select Catalogue) ── */
.rdv-select {
  padding: 0.26rem 0.32rem;
  border: 1px solid #e2e8f0; border-radius: 7px;
  font-size: 0.72rem; font-family: inherit; color: #2d3748;
  background: #fff; cursor: pointer;
  min-width: 90px;
}
.rdv-select:focus { outline: none; border-color: #a78bfa; }
.rdv-select:disabled { opacity: 0.45; cursor: not-allowed; }

/* ── Note ── */
.td-note { min-width: 100px; }
.rdv-note-input {
  width: 100%; max-width: 140px; border: 1px solid transparent;
  border-radius: 6px; padding: 0.25rem 0.5rem;
  font-size: 0.75rem; font-family: inherit; color: #1b2f39;
  background: transparent; transition: all 0.15s;
}
.rdv-note-input:focus, .rdv-note-input--focus {
  outline: none; border-color: #2e9cab; background: #fff;
}
.rdv-note-input:disabled { color: #a0aec0; cursor: not-allowed; }

/* ── Actions ── */
.td-actions { display: flex; justify-content: flex-end; align-items: center; gap: 0.2rem; white-space: nowrap; }
.btn-action {
  width: 1.9rem; height: 1.9rem; border: none; background: none; border-radius: 8px;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  color: #cbd5e0; transition: background 0.15s ease, color 0.15s ease;
}
.action-icon { width: 0.9rem; height: 0.9rem; }
.btn-edit:hover   { background: #ebf0ff; color: #5a67d8; }
.btn-cancel:hover { background: #fef3c7; color: #d97706; }
.btn-del:hover    { background: #fff5f5; color: #e53e3e; }

/* ── États lignes ── */
.tr--canceled td { opacity: 0.5; }
.tr--past .td-date, .tr--past .td-name { color: #a0aec0; }
.tr--editing { background: rgba(46,156,171,0.04); }
</style>

<style>
/* ── Modale confirmation (global — hors scoped pour Teleport) ── */
.rdv-confirm-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center; padding: 1rem;
  background: rgba(15,25,35,0.45);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
}
.rdv-confirm-card {
  background: #fff; border-radius: 20px;
  padding: 2rem 1.75rem 1.75rem; max-width: 380px; width: 100%;
  display: flex; flex-direction: column; align-items: center;
  gap: 0.75rem; text-align: center;
  box-shadow: 0 20px 50px rgba(15,25,35,0.22);
}
.rdv-confirm-icon-wrap {
  width: 3.2rem; height: 3.2rem; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.rdv-confirm-icon-wrap--delete { background: #fff5f5; }
.rdv-confirm-icon-wrap--cancel { background: #fffbeb; }
.rdv-confirm-icon { width: 1.4rem; height: 1.4rem; }
.rdv-confirm-icon-wrap--delete .rdv-confirm-icon { color: #e53e3e; }
.rdv-confirm-icon-wrap--cancel .rdv-confirm-icon { color: #d97706; }
.rdv-confirm-title { margin: 0; font-size: 1.1rem; font-weight: 700; color: #1b2f39; font-family: Inter, sans-serif; }
.rdv-confirm-msg   { margin: 0; font-size: 0.88rem; color: #4f6570; line-height: 1.55; font-family: Inter, sans-serif; }
.rdv-confirm-actions { display: flex; gap: 0.6rem; margin-top: 0.5rem; width: 100%; }
.rdv-confirm-btn {
  flex: 1; padding: 0.65rem 1rem; border: none; border-radius: 10px;
  font-size: 0.9rem; font-weight: 600; cursor: pointer;
  transition: background 0.15s; font-family: Inter, sans-serif;
}
.rdv-confirm-btn--neutral { background: #f1f5f9; color: #475569; }
.rdv-confirm-btn--neutral:hover { background: #e2e8f0; }
.rdv-confirm-btn--delete { background: #e53e3e; color: #fff; }
.rdv-confirm-btn--delete:hover { background: #c53030; }
.rdv-confirm-btn--cancel { background: #d97706; color: #fff; }
.rdv-confirm-btn--cancel:hover { background: #b45309; }
.modal-enter-active { animation: rdvModalIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.modal-leave-active { animation: rdvModalOut 0.18s ease; }
@keyframes rdvModalIn  { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
@keyframes rdvModalOut { from { opacity:1; } to { opacity:0; } }
</style>
