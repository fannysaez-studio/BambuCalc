// @ts-nocheck
/**
 * Edge Function : stripe-webhook
 *
 * Rôle : Recevoir et traiter les événements asynchrones de Stripe.
 *
 * Points de sécurité CRITIQUES :
 *   1. Le body brut doit être lu comme TEXT avant tout parsing JSON
 *      (la signature Stripe est calculée sur le raw body, pas le JSON parsé)
 *   2. La signature est TOUJOURS vérifiée via STRIPE_WEBHOOK_SECRET
 *      (sans ça, n'importe qui pourrait envoyer de faux événements)
 *   3. Pas de CORS sur ce endpoint — il est appelé par Stripe, pas par un navigateur
 *   4. On retourne toujours HTTP 200 à Stripe, même en cas d'erreur interne,
 *      pour éviter que Stripe ne re-tente indéfiniment (les erreurs sont loggées)
 *
 * Événements gérés :
 *   - payment_intent.succeeded   → Marquer le devis comme 'paid'
 *   - payment_intent.payment_failed → Marquer le devis comme 'failed'
 *   - charge.refunded            → Marquer le devis comme 'refunded'
 */
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import Stripe     from 'https://esm.sh/stripe@14.25.0?target=deno'

// ── Initialisation ───────────────────────────────────────────────────────────
const STRIPE_SECRET_KEY   = Deno.env.get('STRIPE_SECRET_KEY')         ?? ''
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')   ?? ''
const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')            ?? ''
const SERVICE_KEY           = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

if (!STRIPE_SECRET_KEY)     console.error('[INIT] ⚠️  STRIPE_SECRET_KEY absente')
if (!STRIPE_WEBHOOK_SECRET) console.error('[INIT] ⚠️  STRIPE_WEBHOOK_SECRET absente')
if (!SUPABASE_URL)          console.error('[INIT] ⚠️  SUPABASE_URL absente')
if (!SERVICE_KEY)           console.error('[INIT] ⚠️  SUPABASE_SERVICE_ROLE_KEY absente')

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

// ── Helpers BDD ──────────────────────────────────────────────────────────────

/**
 * Met à jour payment_status dans la table quotes en recherchant
 * par stripe_payment_intent_id. Utilise la SERVICE_ROLE_KEY (bypass RLS).
 */
async function updateQuotePaymentStatus(
  intentId:      string,
  paymentStatus: 'paid' | 'failed' | 'refunded',
): Promise<void> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/quotes?stripe_payment_intent_id=eq.${intentId}`,
    {
      method: 'PATCH',
      headers: {
        apikey:         SERVICE_KEY,
        Authorization:  `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer:         'return=minimal',
      },
      body: JSON.stringify({
        payment_status: paymentStatus,
        updated_at:     new Date().toISOString(),
      }),
    }
  )

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`BDD PATCH échoué (HTTP ${res.status}): ${errBody}`)
  }

  console.log(`[DB] ✓ Devis mis à jour — intent: ${intentId} → status: ${paymentStatus}`)
}

// ── Handler principal ────────────────────────────────────────────────────────
serve(async (req: Request) => {
  // Webhooks Stripe = POST uniquement, pas de CORS nécessaire
  if (req.method !== 'POST') {
    return new Response('Méthode non autorisée', { status: 405 })
  }

  // ── CRITIQUE : lire le body BRUT avant tout parsing ─────────────────────
  // La vérification de signature Stripe opère sur les octets bruts du body.
  // Un await req.json() ici invaliderait la signature.
  const rawBody  = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    console.error('[WEBHOOK] Header stripe-signature absent — requête rejetée')
    return new Response('Header stripe-signature manquant', { status: 400 })
  }

  // ── Vérification cryptographique de la signature ─────────────────────────
  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[WEBHOOK] Signature invalide — rejet:', msg)
    return new Response(`Signature invalide: ${msg}`, { status: 400 })
  }

  console.log('══════════════════════════════════════════')
  console.log('[WEBHOOK] Événement reçu —', event.type)
  console.log('[WEBHOOK] Event ID       —', event.id)

  // ── Traitement des événements ─────────────────────────────────────────────
  // On wrappe dans un try/catch global et on retourne TOUJOURS 200 à Stripe.
  // Si on retourne un 5xx, Stripe va re-tenter l'envoi pendant 72h.
  // Les erreurs internes sont loggées et rejouables via le dashboard Stripe.
  try {
    switch (event.type) {

      // ── Paiement réussi ────────────────────────────────────────────────────
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent
        const quoteId = intent.metadata?.quoteId

        console.log('[WEBHOOK] payment_intent.succeeded')
        console.log('[WEBHOOK]   intent.id  :', intent.id)
        console.log('[WEBHOOK]   quoteId    :', quoteId ?? 'ABSENT ⚠️')
        console.log('[WEBHOOK]   amount     :', intent.amount, intent.currency)

        if (!quoteId) {
          console.error('[WEBHOOK] metadata.quoteId absent — impossible de mettre à jour la BDD')
          break
        }

        await updateQuotePaymentStatus(intent.id, 'paid')
        console.log('[WEBHOOK] ✓ Devis', quoteId, 'marqué PAYÉ')
        break
      }

      // ── Paiement échoué ────────────────────────────────────────────────────
      case 'payment_intent.payment_failed': {
        const intent  = event.data.object as Stripe.PaymentIntent
        const errCode = intent.last_payment_error?.code ?? 'inconnu'
        const errMsg  = intent.last_payment_error?.message ?? ''

        console.log('[WEBHOOK] payment_intent.payment_failed')
        console.log('[WEBHOOK]   intent.id   :', intent.id)
        console.log('[WEBHOOK]   error_code  :', errCode)
        console.log('[WEBHOOK]   error_msg   :', errMsg)

        await updateQuotePaymentStatus(intent.id, 'failed')
        break
      }

      // ── Remboursement ──────────────────────────────────────────────────────
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge

        console.log('[WEBHOOK] charge.refunded')
        console.log('[WEBHOOK]   charge.id          :', charge.id)
        console.log('[WEBHOOK]   payment_intent     :', charge.payment_intent)
        console.log('[WEBHOOK]   amount_refunded    :', charge.amount_refunded)

        if (!charge.payment_intent) {
          console.error('[WEBHOOK] payment_intent absent sur le charge object')
          break
        }

        await updateQuotePaymentStatus(charge.payment_intent as string, 'refunded')
        break
      }

      // ── Événements non traités (logged pour audit) ─────────────────────────
      default:
        console.log('[WEBHOOK] Événement ignoré (non géré) :', event.type)
    }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[WEBHOOK] ⚠️  Erreur lors du traitement de', event.type, ':', message)
    // On retourne quand même 200 pour stopper les re-tentatives Stripe.
    // L'événement peut être rejoué manuellement depuis Stripe Dashboard → Webhooks.
  }

  // Stripe exige une réponse 200 pour confirmer la réception
  return new Response(JSON.stringify({ received: true, eventType: event.type }), {
    status:  200,
    headers: { 'Content-Type': 'application/json' },
  })
})
