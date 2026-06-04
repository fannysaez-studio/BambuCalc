// @ts-nocheck
/**
 * Edge Function : notify-quote-update
 *
 * Déclenchée par un Database Webhook Supabase à chaque UPDATE sur `quotes`.
 * Envoie une notification push au client propriétaire du devis.
 *
 * Config : Supabase Dashboard → Database → Webhooks → quotes → UPDATE
 *   URL    : {SUPABASE_URL}/functions/v1/notify-quote-update
 *   Header : x-webhook-secret: {NOTIFY_WEBHOOK_SECRET}
 */
import { serve }    from 'https://deno.land/std@0.224.0/http/server.ts'
import webpush      from 'npm:web-push'
import { getClientSubsByUserId, sendPushToSubs } from '../_shared/push-helpers.ts'

const WEBHOOK_SECRET    = Deno.env.get('NOTIFY_WEBHOOK_SECRET')     ?? ''
const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')          ?? ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')         ?? ''
const VAPID_SUBJECT     = 'mailto:fannysaez.pro@gmail.com'
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')              ?? ''
const SERVICE_KEY       = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const STATUS_MESSAGES: Record<string, { title: string; body: (num: string) => string }> = {
  pending:  { title: "⏳ Devis en cours d'examen", body: (n) => `Votre devis #${n} est en cours d'examen` },
  sent:     { title: '📄 Devis disponible',         body: (n) => `Votre devis #${n} est prêt à consulter` },
  accepted: { title: '✅ Devis accepté',             body: (n) => `Votre devis #${n} a été accepté` },
  refused:  { title: '❌ Devis refusé',              body: (n) => `Votre devis #${n} a été refusé` },
}

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

  // ── Parsing du payload ────────────────────────────────────────────────────
  let payload: { type: string; record: Record<string, unknown> }
  try {
    payload = await req.json()
  } catch {
    return new Response('Payload invalide', { status: 400 })
  }

  if (payload.type !== 'UPDATE' || !payload.record) {
    return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 })
  }

  const record   = payload.record
  const status   = String(record.status ?? '')
  const userId   = record.user_id as string | null
  const quoteNum = String(record.quote_number ?? record.id ?? '—')

  // Skip devis anonymes ou statuts inconnus
  if (!userId || !STATUS_MESSAGES[status]) {
    console.log('[SKIP] user_id null ou statut inconnu:', status)
    return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 })
  }

  const msg = STATUS_MESSAGES[status]

  // ── Envoi push au client ──────────────────────────────────────────────────
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

  const subs = await getClientSubsByUserId(userId, SUPABASE_URL, SERVICE_KEY)
  if (subs.length === 0) {
    console.log('[PUSH] Aucune souscription pour user:', userId)
    return new Response(JSON.stringify({ ok: true, sent: 0 }), { status: 200 })
  }

  const notifPayload = JSON.stringify({ title: msg.title, body: msg.body(quoteNum), url: '/dashboard' })
  const sent = await sendPushToSubs(subs, notifPayload, webpush, SUPABASE_URL, SERVICE_KEY)

  console.log(`[PUSH] Devis ${quoteNum} (${status}) → ${sent} push envoyé(s)`)
  return new Response(JSON.stringify({ ok: true, sent }), { status: 200 })
})
