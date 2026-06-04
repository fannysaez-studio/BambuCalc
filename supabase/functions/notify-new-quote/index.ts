// @ts-nocheck
/**
 * Edge Function : notify-new-quote
 *
 * Déclenchée par un Database Webhook Supabase à chaque INSERT sur la table `quotes`.
 * Envoie une notification push à l'admin — couvre les invités ET les utilisateurs connectés.
 *
 * Sécurité : vérification du secret webhook (x-webhook-secret header)
 * Config   : Supabase Dashboard → Database → Webhooks → quotes → INSERT
 */
import { serve }  from 'https://deno.land/std@0.224.0/http/server.ts'
import webpush    from 'npm:web-push'
import { getAdminSubs, sendPushToSubs } from '../_shared/push-helpers.ts'

const WEBHOOK_SECRET    = Deno.env.get('NOTIFY_WEBHOOK_SECRET')    ?? ''
const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')         ?? ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')        ?? ''
const VAPID_SUBJECT     = 'mailto:fannysaez.pro@gmail.com'
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')             ?? ''
const SERVICE_KEY       = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

serve(async (req) => {
  // ── Vérification du secret webhook ───────────────────────────────────────
  const secret = req.headers.get('x-webhook-secret')
  if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
    console.error('[AUTH] Secret webhook invalide ou absent')
    return new Response('Unauthorized', { status: 401 })
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('[INIT] VAPID keys absentes')
    return new Response('VAPID keys manquantes', { status: 500 })
  }

  // ── Parsing du payload Supabase Webhook ───────────────────────────────────
  let payload: { type: string; record: Record<string, unknown> }
  try {
    payload = await req.json()
  } catch {
    return new Response('Payload invalide', { status: 400 })
  }

  if (payload.type !== 'INSERT' || !payload.record) {
    return new Response('OK', { status: 200 })
  }

  const quote = payload.record
  const name  = String(quote.project_name || 'Nouvelle pièce')
  const client = String(quote.client_name || 'Client')
  const total  = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
    .format(Number(quote.total_cost) || 0)

  console.log('[WEBHOOK] Nouveau devis reçu — id:', quote.id, '—', name, '—', total)

  // ── Envoi push aux admins uniquement ──────────────────────────────────────
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

  const adminSubs = await getAdminSubs(SUPABASE_URL, SERVICE_KEY)
  if (adminSubs.length === 0) {
    console.log('[PUSH] Aucune souscription admin active')
    return new Response(JSON.stringify({ ok: true, sent: 0 }), { status: 200 })
  }

  const notifPayload = JSON.stringify({
    title: '🖨️ Nouveau devis reçu',
    body:  `${name} — ${client} · ${total}`,
    url:   '/admin',
  })

  const sent = await sendPushToSubs(adminSubs, notifPayload, webpush, SUPABASE_URL, SERVICE_KEY)
  console.log('[PUSH] Notifications envoyées:', sent)
  return new Response(JSON.stringify({ ok: true, sent }), { status: 200 })
})
