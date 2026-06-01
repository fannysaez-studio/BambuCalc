<template>
  <div class="notif-wrap" ref="bellWrap">
    <!-- Bouton cloche -->
    <button
      class="notif-btn"
      :class="{ 'notif-btn--active': open, 'notif-btn--compact': compact, 'notif-btn--tab': tab }"
      @click="open = !open"
      :title="unreadCount > 0 ? `${unreadCount} notification(s)` : 'Notifications'"
    >
      <Bell :size="tab ? 21 : 18" />
      <span v-if="unreadCount > 0" class="notif-badge" :class="{ 'notif-badge--dot': tab }">{{ tab ? '' : (unreadCount > 9 ? '9+' : unreadCount) }}</span>
      <span v-if="tab" class="notif-tab-label">Alertes</span>
    </button>

    <!-- Panel dropdown -->
    <Teleport to="body">
    <Transition name="notif-drop">
      <div v-if="open" class="notif-panel" :class="{ 'notif-panel--top': topPanel }">
        <div class="notif-panel-header">
          <span class="notif-panel-title">Notifications</span>
          <div class="notif-panel-actions">
            <button
              v-if="notifications.some(n => !n.read)"
              class="notif-action"
              @click="markAllRead"
            >✓ Tout lire</button>
            <button
              v-if="notifications.length > 0"
              class="notif-action notif-action--danger"
              @click="removeAll"
            >Tout supprimer</button>
          </div>
        </div>

        <div v-if="loading" class="notif-empty">
          <div class="notif-spinner" />
        </div>

        <div v-else-if="notifications.length === 0" class="notif-empty">
          <BellOff :size="22" class="notif-empty-icon" />
          <p>Aucune notification</p>
        </div>

        <div v-else class="notif-list">
          <div
            v-for="n in notifications"
            :key="n.id"
            class="notif-item"
            :class="{ 'notif-item--unread': !n.read }"
            @click="markRead(n)"
          >
            <div class="notif-icon-wrap">
              <FileText v-if="n.type === 'new_quote'" :size="14" />
              <CheckCircle v-else-if="n.type === 'status_changed'" :size="14" />
              <Pencil v-else :size="14" />
            </div>
            <div class="notif-content">
              <p class="notif-title">{{ n.title }}</p>
              <p v-if="n.message" class="notif-message">{{ n.message }}</p>
              <p class="notif-time">{{ timeAgo(n.created_at) }}</p>
            </div>
            <button class="notif-close" @click.stop="remove(n.id)" title="Supprimer">✕</button>
          </div>
        </div>
      </div>
    </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Bell, BellOff, FileText, CheckCircle, Pencil } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'

const props = defineProps({
  up:       { type: Boolean, default: false },
  compact:  { type: Boolean, default: false },
  tab:      { type: Boolean, default: false },
  topPanel: { type: Boolean, default: false },
})

const notifications = ref([])
const open = ref(false)
const loading = ref(false)
const bellWrap = ref(null)
let realtimeChannel = null
let authSubscription = null

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "À l'instant"
  if (min < 60) return `Il y a ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `Il y a ${h}h`
  return `Il y a ${Math.floor(h / 24)}j`
}

async function loadNotifications() {
  loading.value = true
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) console.error('[NotificationBell] load error:', error)
  notifications.value = data ?? []
  loading.value = false
}

async function setupRealtime() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  if (realtimeChannel) { await supabase.removeChannel(realtimeChannel); realtimeChannel = null }
  const userId = user.id
  realtimeChannel = supabase
    .channel(`notif-bell-${userId}-${Date.now()}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      (payload) => {
        notifications.value = [payload.new, ...notifications.value]
      }
    )
    .subscribe(status => {
      if (status === 'CHANNEL_ERROR') console.warn('[NotificationBell] realtime indisponible')
    })
}

async function markRead(n) {
  if (n.read) return
  notifications.value = notifications.value.map(item =>
    item.id === n.id ? { ...item, read: true } : item
  )
  await supabase.from('notifications').update({ read: true }).eq('id', n.id)
}

async function markAllRead() {
  notifications.value.forEach(n => { n.read = true })
  await supabase.from('notifications').update({ read: true }).eq('read', false)
}

async function remove(id) {
  notifications.value = notifications.value.filter(n => n.id !== id)
  await supabase.from('notifications').delete().eq('id', id)
}

async function removeAll() {
  const ids = notifications.value.map(n => n.id)
  notifications.value = []
  open.value = false
  if (ids.length) await supabase.from('notifications').delete().in('id', ids)
}

function handleClickOutside(e) {
  if (bellWrap.value && !bellWrap.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => {
  // Attendre que la session soit restaurée avant de charger
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN')) {
      await loadNotifications()
      await setupRealtime()
    }
  })
  authSubscription = subscription
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
  if (authSubscription) authSubscription.unsubscribe()
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.notif-wrap {
  position: relative;
}

/* ── Bouton cloche ── */
.notif-btn {
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
.notif-btn:hover, .notif-btn--active {
  border-color: #2e9cab;
  color: #2e9cab;
  background: rgba(255,255,255,0.9);
}

.notif-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #dc2626;
  color: #fff;
  font-size: 0.58rem;
  font-weight: 800;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  pointer-events: none;
}

/* ── Variante compact (pill desktop) ── */
.notif-btn--compact {
  border-color: transparent;
  background: transparent;
  width: 36px;
  height: 36px;
  color: #94a3b8;
}
.notif-btn--compact:hover,
.notif-btn--compact.notif-btn--active {
  border-color: transparent;
  color: #2e9cab;
  background: rgba(46, 156, 171, 0.10);
}

/* ── Variante tab (mobile bottom bar) ── */
.notif-btn--tab {
  flex-direction: column;
  gap: 3px;
  height: 100%;
  width: 100%;
  border: none;
  background: transparent;
  border-radius: 0;
  padding: 0 0.25rem;
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
  color: #94a3b8;
}
.notif-btn--tab:hover,
.notif-btn--tab.notif-btn--active { color: #2e9cab; background: transparent; border-color: transparent; }

.notif-tab-label { font-size: 0.56rem; font-weight: 700; letter-spacing: 0.03em; line-height: 1; white-space: nowrap; }

/* Badge dot (mode tab) */
.notif-badge--dot {
  min-width: 8px;
  height: 8px;
  padding: 0;
  font-size: 0;
  top: 0px;
  right: 0px;
}

</style>

<style>
/* ── Panel téléporté (hors scoped) ── */
.notif-panel {
  position: fixed;
  bottom: 21px;
  right: 16px;
  width: 320px;
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
.notif-panel-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.5rem; padding: 0.75rem 1rem; background: #1b2f39; flex-shrink: 0;
}
.notif-panel-title { font-size: 0.82rem; font-weight: 800; color: #fff; }
.notif-panel-actions { display: flex; gap: 0.5rem; }
.notif-action {
  font-size: 0.68rem; font-weight: 600; color: rgba(255,255,255,0.65);
  background: none; border: none; cursor: pointer; padding: 0;
  font-family: inherit; transition: color 0.15s;
}
.notif-action:hover { color: #fff; }
.notif-action--danger:hover { color: #fca5a5; }
.notif-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 0.5rem; padding: 2rem 1rem;
  color: #a0aec0; font-size: 0.8rem;
}
.notif-empty-icon { color: #cbd5e0; }
.notif-spinner {
  width: 1.5rem; height: 1.5rem;
  border: 2px solid #e2e8f0; border-top-color: #2e9cab;
  border-radius: 50%; animation: notif-spin 0.7s linear infinite;
}
@keyframes notif-spin { to { transform: rotate(360deg); } }
.notif-list { overflow-y: auto; flex: 1; scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
.notif-item {
  display: flex; align-items: flex-start; gap: 0.65rem;
  padding: 0.75rem 1rem; border-bottom: 1px solid #f0f4f8;
  cursor: pointer; transition: background 0.15s;
}
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background: #f7f9fc; }
.notif-item--unread { background: rgba(46,156,171,0.06); }
.notif-item--unread:hover { background: rgba(46,156,171,0.10); }
.notif-icon-wrap {
  position: relative; width: 28px; height: 28px; border-radius: 50%;
  background: rgba(46,156,171,0.12); color: #2e9cab;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
}
.notif-item--unread .notif-icon-wrap::after {
  content: ''; position: absolute; top: -2px; right: -2px;
  width: 8px; height: 8px; border-radius: 50%;
  background: #dc2626; border: 1.5px solid #fff;
}
.notif-content { flex: 1; min-width: 0; }
.notif-title { font-size: 0.78rem; font-weight: 700; color: #1b2f39; margin: 0 0 0.15rem; line-height: 1.35; }
.notif-message { font-size: 0.72rem; color: #718096; margin: 0 0 0.2rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.notif-time { font-size: 0.65rem; color: #a0aec0; margin: 0; }
.notif-close {
  font-size: 0.7rem; color: #cbd5e0; background: none; border: none;
  cursor: pointer; padding: 0.1rem 0.2rem; border-radius: 4px; line-height: 1;
  flex-shrink: 0; transition: color 0.15s, background 0.15s; font-family: inherit;
}
.notif-close:hover { color: #e53e3e; background: rgba(229,62,62,0.08); }
.notif-drop-enter-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.notif-drop-leave-active { transition: opacity 0.13s ease, transform 0.13s ease; }
.notif-drop-enter-from, .notif-drop-leave-to { opacity: 0; transform: translateY(8px); }
@media (max-width: 640px) {
  .notif-panel { right: 8px; left: 8px; width: auto; bottom: 72px; }
  .notif-panel--top { top: 74px; bottom: auto; left: auto; right: 8px; width: 300px; }
}
</style>
