// @ts-nocheck
import { serve }     from 'https://deno.land/std@0.224.0/http/server.ts'
import { handlePreflight, jsonResponse, errorResponse } from '../_shared/cors.ts'
import webpush from 'npm:web-push'

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')  ?? ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
const VAPID_SUBJECT     = 'mailto:fannysaez.pro@gmail.com'
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')      ?? ''
const SERVICE_KEY       = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

serve(async (req) => {
  if (req.method === 'OPTIONS') return handlePreflight(req)

  // ── Authentification obligatoire ─────────────────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) {
    return errorResponse('Token d\'authentification requis', 401)
  }
  const userToken = authHeader.replace('Bearer ', '')
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${userToken}` },
  })
  if (!userRes.ok) {
    return errorResponse('Token invalide ou session expirée', 401)
  }
  // ─────────────────────────────────────────────────────────────────────────

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return errorResponse('VAPID keys non configurées — ajoutez-les dans Supabase Secrets', 500)
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

  try {
    const body = await req.json()
    const { title = 'BambuCalc', message = '', url = '/admin', userId } = body

    // Récupère les souscriptions (filtrées par userId si fourni, sinon toutes)
    const filter   = userId ? `user_id=eq.${userId}` : 'select=*'
    const endpoint = userId
      ? `${SUPABASE_URL}/rest/v1/push_subscriptions?${filter}`
      : `${SUPABASE_URL}/rest/v1/push_subscriptions`

    const res  = await fetch(endpoint, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    })
    const subs = await res.json()

    if (!Array.isArray(subs) || subs.length === 0) {
      return jsonResponse({ ok: true, sent: 0, reason: 'no subscriptions' })
    }

    const payload = JSON.stringify({ title, body: message, url })
    let sent = 0

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
          payload,
        )
        sent++
      } catch (err) {
        console.error('[Push] sendNotification:', String(err))
        // Souscription expirée → on la supprime
        if (err?.statusCode === 410) {
          await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?id=eq.${sub.id}`, {
            method:  'DELETE',
            headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
          })
        }
      }
    }

    return jsonResponse({ ok: true, sent })
  } catch (err) {
    return errorResponse(String(err), 500)
  }
})
