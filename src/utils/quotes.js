import { supabase } from '../lib/supabase'

// Reconstruit le tableau pieces[] depuis un devis DB (new items[] ou legacy flat fields)
export function buildPiecesFromQuote(q) {
  if (q.items?.length) {
    return q.items.map((item, i) => ({
      id:               item.id || `piece-${i + 1}`,
      name:             item.name || '',
      quantity:         item.quantity ?? 1,
      weight:           item.weight ?? 0,
      lossPercent:      item.lossPercent ?? 5,
      colorCount:       item.colorCount ?? 1,
      purgeWaste:       item.purgeWaste ?? 0,
      materialId:       item.materialId || null,
      material:         item.material || '',
      costPerKg:        item.costPerKg ?? 0,
      referenceImage:   null,
      referenceImageUrl: item.referenceImageUrl || '',
    }))
  }
  return [{
    id:               'piece-1',
    name:             q.project_name || '',
    quantity:         q.quantity ?? 1,
    weight:           q.weight ?? 0,
    lossPercent:      q.loss_percent ?? 5,
    colorCount:       q.color_count ?? 1,
    purgeWaste:       q.purge_waste ?? 0,
    materialId:       null,
    material:         q.material || '',
    costPerKg:        q.cost_per_kg ?? 0,
    referenceImage:   null,
    referenceImageUrl: (q.reference_image_url || '').startsWith('blob:') ? '' : (q.reference_image_url || ''),
  }]
}

// ── Opérations utilisateur ────────────────────────────────────────────────────

export async function saveQuote(quote) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('quotes')
    .insert({ ...quote, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateQuote(id, quote) {
  const { data, error } = await supabase
    .from('quotes')
    .update(quote)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getQuotes() {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .or('archived.is.null,archived.eq.false')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getArchivedQuotes() {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('archived', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function archiveQuote(id) {
  const { error } = await supabase
    .from('quotes')
    .update({ archived: true })
    .eq('id', id)
  if (error) throw error
}

// ── Opérations admin ──────────────────────────────────────────────────────────

export async function getAllQuotesAdmin() {
  const { data, error } = await supabase.rpc('admin_get_all_quotes')
  if (error) throw error
  return data ?? []
}

export async function getAllProfilesAdmin() {
  const { data, error } = await supabase.rpc('admin_get_all_profiles')
  if (error) throw error
  return data ?? []
}

export async function getAllQuotesAdminPaginated({ page = 1, perPage = 10 } = {}) {
  const from = (page - 1) * perPage
  const to   = from + perPage - 1
  const { data, count, error } = await supabase
    .from('quotes')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)
  if (error) throw error
  return { quotes: data ?? [], total: count ?? 0 }
}

export async function adminDeleteQuote(id) {
  const { error } = await supabase.from('quotes').delete().eq('id', id)
  if (error) throw error
}

export async function adminUnarchiveQuote(id) {
  const { error } = await supabase.from('quotes').update({ archived: false }).eq('id', id)
  if (error) throw error
}

export async function adminDeleteUser(userId) {
  const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId })
  if (error) throw error
}
