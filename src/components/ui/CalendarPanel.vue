<template>
  <div class="cal-wrap" ref="calWrap">
    <!-- Bouton calendrier -->
    <button
      class="cal-btn"
      :class="{ 'cal-btn--active': open, 'cal-btn--tab': tab }"
      @click="open = !open"
      title="Rendez-vous"
    >
      <CalendarDays :size="tab ? 21 : 18" />
      <span v-if="newCount > 0" class="cal-badge" :class="{ 'cal-badge--dot': tab }" />
      <span v-if="tab" class="cal-tab-label">RDV</span>
    </button>

    <!-- Panel -->
    <Teleport to="body">
    <Transition name="cal-drop">
      <div v-if="open" class="cal-panel">
        <div class="cal-panel-header">
          <span class="cal-panel-title">Prochains rendez-vous</span>
          <button v-if="newCount > 0" class="cal-action" @click="markSeen">✓ Tout vu</button>
        </div>

        <div v-if="loading" class="cal-empty">
          <div class="cal-spinner" />
        </div>

        <div v-else-if="appointments.length === 0" class="cal-empty">
          <CalendarOff :size="22" class="cal-empty-icon" />
          <p>Aucun RDV à venir</p>
        </div>

        <div v-else class="cal-list">
          <div
            v-for="a in appointments"
            :key="a.id"
            class="cal-item"
            :class="{ 'cal-item--new': isNew(a) }"
          >
            <div class="cal-item-icon">
              <CalendarDays :size="14" />
              <span v-if="isNew(a)" class="cal-item-dot" />
            </div>
            <div class="cal-item-body">
              <p class="cal-item-title">{{ a.event_name || 'Rendez-vous' }}</p>
              <p v-if="a.start_at" class="cal-item-date">{{ fmtDate(a.start_at) }}</p>
              <p v-if="a.invitee_name" class="cal-item-who">{{ a.invitee_name }}</p>
              <p v-if="a.invitee_email" class="cal-item-email">{{ a.invitee_email }}</p>
            </div>
            <span v-if="a.status === 'canceled'" class="cal-item-canceled">Annulé</span>
          </div>
        </div>
      </div>
    </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { CalendarDays, CalendarOff } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'

defineProps({
  tab: { type: Boolean, default: false },
})

const appointments = ref([])
const open = ref(false)
const loading = ref(false)
const calWrap = ref(null)
const SEEN_KEY = 'cal_last_seen'

const lastSeen = ref(localStorage.getItem(SEEN_KEY) || null)

const newCount = computed(() =>
  appointments.value.filter(a => !lastSeen.value || new Date(a.created_at) > new Date(lastSeen.value)).length
)

function isNew(a) {
  return !lastSeen.value || new Date(a.created_at) > new Date(lastSeen.value)
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  })
}

async function load() {
  loading.value = true
  const now = new Date().toISOString()
  const { data } = await supabase
    .from('appointments')
    .select('id, event_name, invitee_name, invitee_email, start_at, status, created_at')
    .or(`start_at.gte.${now},start_at.is.null`)
    .eq('status', 'active')
    .order('start_at', { ascending: true, nullsFirst: false })
    .limit(15)
  appointments.value = data ?? []
  loading.value = false
}

function markSeen() {
  const now = new Date().toISOString()
  localStorage.setItem(SEEN_KEY, now)
  lastSeen.value = now
}

function handleOutside(e) {
  if (calWrap.value && !calWrap.value.contains(e.target)) open.value = false
}

onMounted(async () => {
  await load()
  document.addEventListener('click', handleOutside)
})
onUnmounted(() => document.removeEventListener('click', handleOutside))
</script>

<style scoped>
.cal-wrap { position: relative; }

/* ── Bouton ── */
.cal-btn {
  position: relative;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
  border: 1.5px solid #e2e8f0;
  background: rgba(255,255,255,0.9);
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}
.cal-btn:hover, .cal-btn--active {
  border-color: #2e9cab;
  color: #2e9cab;
}

/* Compact (pill desktop — injecté via GlobalNav) */
.cal-btn.compact {
  border-color: transparent;
  background: transparent;
  width: 36px;
  height: 36px;
  color: #94a3b8;
}
.cal-btn.compact:hover, .cal-btn.compact.cal-btn--active {
  border-color: transparent;
  color: #2e9cab;
  background: rgba(46,156,171,0.10);
}

/* Tab (mobile bottom bar) */
.cal-btn--tab {
  flex-direction: column;
  gap: 3px;
  height: 100%;
  width: 100%;
  border: none;
  background: transparent;
  border-radius: 0;
  padding: 0 0.25rem;
  color: #94a3b8;
  font-size: 0.56rem;
}
.cal-btn--tab:hover, .cal-btn--tab.cal-btn--active { color: #2e9cab; border-color: transparent; background: transparent; }
.cal-tab-label { font-size: 0.56rem; font-weight: 700; letter-spacing: 0.03em; line-height: 1; white-space: nowrap; }

/* Badge */
.cal-badge {
  position: absolute;
  top: 2px; right: 2px;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #dc2626;
  border: 1.5px solid #fff;
  pointer-events: none;
}
.cal-badge--dot { top: 0px; right: 0px; }

</style>

<style>
/* ── Panel téléporté (hors scoped) ── */
.cal-panel {
  position: fixed;
  bottom: 88px;
  right: 16px;
  width: 300px;
  max-height: 420px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.14);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 10000;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
}
.cal-panel-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.5rem; padding: 0.75rem 1rem; background: #1b2f39; flex-shrink: 0;
}
.cal-panel-title { font-size: 0.82rem; font-weight: 800; color: #fff; }
.cal-action {
  font-size: 0.68rem; font-weight: 600; color: rgba(255,255,255,0.65);
  background: none; border: none; cursor: pointer; padding: 0;
  font-family: inherit; transition: color 0.15s;
}
.cal-action:hover { color: #fff; }
.cal-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 0.5rem; padding: 2rem 1rem;
  color: #a0aec0; font-size: 0.8rem;
}
.cal-empty-icon { color: #cbd5e0; }
.cal-spinner {
  width: 1.5rem; height: 1.5rem;
  border: 2px solid #e2e8f0; border-top-color: #2e9cab;
  border-radius: 50%; animation: cal-spin 0.7s linear infinite;
}
@keyframes cal-spin { to { transform: rotate(360deg); } }
.cal-list { overflow-y: auto; flex: 1; scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
.cal-item {
  display: flex; align-items: flex-start; gap: 0.65rem;
  padding: 0.75rem 1rem; border-bottom: 1px solid #f0f4f8; transition: background 0.15s;
}
.cal-item:last-child { border-bottom: none; }
.cal-item:hover { background: #f7f9fc; }
.cal-item--new { background: rgba(46,156,171,0.06); }
.cal-item--new:hover { background: rgba(46,156,171,0.10); }
.cal-item-icon {
  position: relative; width: 28px; height: 28px; border-radius: 50%;
  background: rgba(46,156,171,0.12); color: #2e9cab;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
}
.cal-item-dot {
  position: absolute; top: -2px; right: -2px;
  width: 8px; height: 8px; border-radius: 50%;
  background: #dc2626; border: 1.5px solid #fff;
}
.cal-item-body { flex: 1; min-width: 0; }
.cal-item-title { font-size: 0.78rem; font-weight: 700; color: #1b2f39; margin: 0 0 0.15rem; line-height: 1.35; }
.cal-item-date  { font-size: 0.72rem; color: #2e9cab; margin: 0 0 0.1rem; font-weight: 600; }
.cal-item-who   { font-size: 0.72rem; color: #4a5568; margin: 0 0 0.05rem; }
.cal-item-email { font-size: 0.65rem; color: #a0aec0; margin: 0; }
.cal-item-canceled {
  font-size: 0.62rem; font-weight: 700; color: #e53e3e;
  background: rgba(229,62,62,0.08); border-radius: 999px;
  padding: 0.15rem 0.5rem; flex-shrink: 0; align-self: flex-start; margin-top: 2px;
}
.cal-drop-enter-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.cal-drop-leave-active { transition: opacity 0.13s ease, transform 0.13s ease; }
.cal-drop-enter-from, .cal-drop-leave-to { opacity: 0; transform: translateY(8px); }
@media (max-width: 640px) {
  .cal-panel { right: 8px; left: 8px; width: auto; bottom: 72px; }
}
</style>
