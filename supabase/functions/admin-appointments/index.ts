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

const SUPABASE_URL  = Deno.env.get('SUPABASE_URL')              ?? ''
const SERVICE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const svcHeaders = {
  'Content-Type': 'application/json',
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

async function isAdmin(userJwt: string): Promise<boolean> {
  // Récupère l'UID depuis le JWT via l'API Supabase Auth
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${userJwt}` },
  })
  if (!res.ok) return false
  const { id: uid } = await res.json()
  if (!uid) return false

  // Vérifie que l'UID est dans la table admins
  const check = await fetch(
    `${SUPABASE_URL}/rest/v1/admins?user_id=eq.${uid}&select=user_id&limit=1`,
    { headers: svcHeaders }
  )
  const rows = await check.json()
  return Array.isArray(rows) && rows.length > 0
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const userJwt = req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
  if (!userJwt) return new Response('Unauthorized', { status: 401, headers: cors })

  const admin = await isAdmin(userJwt)
  if (!admin) return new Response('Forbidden', { status: 403, headers: cors })

  const { action, id } = await req.json()
  if (!id || !['delete', 'cancel'].includes(action)) {
    return new Response('Bad request', { status: 400, headers: cors })
  }

  if (action === 'delete') {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/appointments?id=eq.${id}`,
      { method: 'DELETE', headers: svcHeaders }
    )
    if (!r.ok) {
      const err = await r.text()
      return new Response(err, { status: r.status, headers: cors })
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
      return new Response(err, { status: r.status, headers: cors })
    }
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
})
