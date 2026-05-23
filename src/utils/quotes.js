import { supabase } from '../lib/supabase'

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
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
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

export async function adminDeleteUser(userId) {
  const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId })
  if (error) throw error
}
