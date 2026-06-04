// @ts-nocheck
/**
 * Edge Function : handle-calendly-webhook
 *
 * Reçoit les webhooks Calendly (invitee.created / invitee.canceled).
 * - Insère ou annule le RDV dans la table `appointments`
 * - Crée une notification pour tous les admins
 *
 * Secrets requis :
 *   CALENDLY_WEBHOOK_SECRET — token secret dans l'URL du webhook (?secret=...)
 *   SUPABASE_SERVICE_ROLE_KEY — déjà dispo dans Supabase
 *
 * Optionnel (pour récupérer l'heure du RDV) :
 *   CALENDLY_API_TOKEN    — Calendly Dashboard → API & Webhooks → Personal Access Token
 */
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import webpush from 'npm:web-push'
import { getAdminSubs, getClientSubsByEmail, sendPushToSubs, formatRdvDate } from '../_shared/push-helpers.ts'

const WEBHOOK_SECRET    = Deno.env.get('CALENDLY_WEBHOOK_SECRET')      ?? ''
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')                 ?? ''
const SERVICE_KEY       = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')    ?? ''
const CAL_TOKEN         = Deno.env.get('CALENDLY_API_TOKEN')           ?? ''
const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')             ?? ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')            ?? ''
const VAPID_SUBJECT     = 'mailto:fannysaez.pro@gmail.com'

const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  ...extra,
})

// ── Récupère les détails du scheduled_event via l'API Calendly ──────────────
async function fetchEventDetails(eventUri: string) {
  if (!CAL_TOKEN || !eventUri) return null
  try {
    const res = await fetch(eventUri, {
      headers: { Authorization: `Bearer ${CAL_TOKEN}`, 'Content-Type': 'application/json' },
    })
    if (!res.ok) return null
    const { resource } = await res.json()
    return resource ?? null
  } catch {
    return null
  }
}

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  // Vérification du token secret dans l'URL (?secret=...)
  const url = new URL(req.url)
  const providedSecret = url.searchParams.get('secret') ?? ''
  if (!WEBHOOK_SECRET || providedSecret !== WEBHOOK_SECRET) {
    console.error('[CALENDLY] Token secret invalide')
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await req.text()

  let payload: Record<string, unknown>
  try { payload = JSON.parse(body) } catch {
    return new Response('Payload invalide', { status: 400 })
  }

  const eventType = String(payload.event ?? '')
  const data      = (payload.payload ?? {}) as Record<string, unknown>

  if (!['invitee.created', 'invitee.canceled'].includes(eventType)) {
    return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 })
  }

  const inviteeUri  = String(data.uri ?? '')
  const inviteeName = String(data.name ?? '')
  const inviteeEmail = String(data.email ?? '')
  const eventUri    = String(data.event ?? '')
  const isCanceled  = eventType === 'invitee.canceled'

  // Extraire un ID stable (dernier segment de l'URI invité)
  const calendlyEventId = inviteeUri.split('/').filter(Boolean).pop() ?? inviteeUri

  // Récupérer détails de l'événement (start_at, event_name)
  const eventDetails = await fetchEventDetails(eventUri)
  const startAt      = eventDetails?.start_time ?? null
  const endAt        = eventDetails?.end_time   ?? null
  const eventName    = eventDetails?.name
    ?? String((data.event_type as Record<string, unknown>)?.name ?? 'Rendez-vous')

  // ── Upsert dans appointments ───────────────────────────────────────────────
  const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/appointments?on_conflict=calendly_event_id`, {
    method: 'POST',
    headers: headers({ Prefer: 'resolution=merge-duplicates,return=representation' }),
    body: JSON.stringify({
      calendly_event_id: calendlyEventId,
      event_name:        eventName,
      invitee_name:      inviteeName,
      invitee_email:     inviteeEmail,
      start_at:          startAt,
      end_at:            endAt,
      status:            isCanceled ? 'canceled' : 'active',
      raw:               payload,
    }),
  })

  if (!upsertRes.ok) {
    const err = await upsertRes.text()
    console.error('[APPOINTMENTS] Upsert failed:', err)
    return new Response(err, { status: 500 })
  }

  // ── Push notifications ────────────────────────────────────────────────────
  if (!isCanceled && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    try {
      webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
      const dateStr = formatRdvDate(startAt)

      const adminSubs = await getAdminSubs(SUPABASE_URL, SERVICE_KEY)
      if (adminSubs.length > 0) {
        await sendPushToSubs(
          adminSubs,
          JSON.stringify({ title: '📅 Nouveau rendez-vous', body: `${inviteeName} — ${dateStr}`, url: '/admin' }),
          webpush, SUPABASE_URL, SERVICE_KEY
        )
      }

      const clientSubs = await getClientSubsByEmail(inviteeEmail, SUPABASE_URL, SERVICE_KEY)
      if (clientSubs.length > 0) {
        await sendPushToSubs(
          clientSubs,
          JSON.stringify({ title: '✅ RDV confirmé', body: `Votre rendez-vous du ${dateStr} est enregistré`, url: '/dashboard' }),
          webpush, SUPABASE_URL, SERVICE_KEY
        )
      }
    } catch (pushErr) {
      console.error('[PUSH] Erreur envoi RDV:', String(pushErr))
    }
  }

  console.log(`[CALENDLY] ${eventType} — ${inviteeName} (${inviteeEmail})`)
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
})
