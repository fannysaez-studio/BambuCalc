// @ts-nocheck
/**
 * Edge Function : admin-appointments
 * Actions admin sur les RDV (delete / cancel) via service_role (bypass RLS).
 * Vérifie que l'appelant est bien un admin avant d'agir.
 *
 * POST { action: 'delete' | 'cancel', id: string }
 * Header Authorization: Bearer <user_jwt>
 */
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { handlePreflight, jsonResponse, errorResponse } from '../_shared/cors.ts'

const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')              ?? ''
const SERVICE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const svcHeaders = {
  'Content-Type': 'application/json',
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
}

async function isAdmin(userJwt: string): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${userJwt}` },
  })
  if (!res.ok) return false
  const { id: uid } = await res.json()
  if (!uid) return false

  const check = await fetch(
    `${SUPABASE_URL}/rest/v1/admins?user_id=eq.${uid}&select=user_id&limit=1`,
    { headers: svcHeaders }
  )
  const rows = await check.json()
  return Array.isArray(rows) && rows.length > 0
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return handlePreflight(req)

  const userJwt = req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
  if (!userJwt) return errorResponse('Unauthorized', 401, req)

  const admin = await isAdmin(userJwt)
  if (!admin) return errorResponse('Forbidden', 403, req)

  const { action, id } = await req.json()
  if (!id || !['delete', 'cancel'].includes(action)) {
    return errorResponse('Bad request', 400, req)
  }

  if (action === 'delete') {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/appointments?id=eq.${id}`,
      { method: 'DELETE', headers: svcHeaders }
    )
    if (!r.ok) {
      const err = await r.text()
      return errorResponse(err, r.status, req)
    }
  }

  if (action === 'cancel') {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/appointments?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: { ...svcHeaders, Prefer: 'return=minimal' },
        body: JSON.stringify({ status: 'canceled' }),
      }
    )
    if (!r.ok) {
      const err = await r.text()
      return errorResponse(err, r.status, req)
    }
  }

  return jsonResponse({ ok: true }, 200, req)
})
