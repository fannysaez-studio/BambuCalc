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
