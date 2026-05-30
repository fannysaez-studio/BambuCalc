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

  // ── Récupération des souscriptions push admin ─────────────────────────────
  const res  = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  })
  const subs = await res.json()

  if (!Array.isArray(subs) || subs.length === 0) {
    console.log('[PUSH] Aucune souscription active')
    return new Response(JSON.stringify({ ok: true, sent: 0 }), { status: 200 })
  }

  // ── Envoi des notifications push ──────────────────────────────────────────
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

  const notifPayload = JSON.stringify({
    title: '🖨️ Nouveau devis reçu',
    body:  `${name} — ${client} · ${total}`,
    url:   '/admin',
  })

  let sent = 0
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
        notifPayload,
      )
      sent++
    } catch (err) {
      console.error('[PUSH] sendNotification:', String(err))
      if (err?.statusCode === 410) {
        await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?id=eq.${sub.id}`, {
          method:  'DELETE',
          headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
        })
      }
    }
  }

  console.log('[PUSH] Notifications envoyées:', sent)
  return new Response(JSON.stringify({ ok: true, sent }), { status: 200 })
})
