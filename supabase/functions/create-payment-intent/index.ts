// @ts-nocheck
/**
 * Edge Function : create-payment-intent
 *
 * Rôle : Crée un PaymentIntent Stripe sécurisé côté serveur.
 *
 * Flux :
 *   1. Valide le JWT Supabase de l'utilisateur connecté
 *   2. Vérifie que le devis demandé lui appartient
 *   3. Crée le PaymentIntent chez Stripe avec la clé SECRÈTE (jamais exposée au client)
 *   4. Enregistre l'intent_id + status 'processing' dans la BDD
 *   5. Retourne uniquement le client_secret au front
 *
 * Sécurité :
 *   - STRIPE_SECRET_KEY n'est jamais transmise au navigateur
 *   - Le montant est recalculé depuis la BDD, pas depuis le front (anti-manipulation)
 *   - Le JWT est vérifié avant toute opération Stripe
 */
import { serve }  from 'https://deno.land/std@0.224.0/http/server.ts'
import Stripe      from 'https://esm.sh/stripe@14.25.0?target=deno'
import {
  handlePreflight,
  jsonResponse,
  errorResponse,
} from '../_shared/cors.ts'

// ── Initialisation Stripe ────────────────────────────────────────────────────
const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')      ?? ''
const SERVICE_KEY       = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

if (!STRIPE_SECRET_KEY) console.error('[INIT] ⚠️  STRIPE_SECRET_KEY absente')
if (!SUPABASE_URL)      console.error('[INIT] ⚠️  SUPABASE_URL absente')
if (!SERVICE_KEY)       console.error('[INIT] ⚠️  SUPABASE_SERVICE_ROLE_KEY absente')

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion:  '2024-06-20',
  httpClient:  Stripe.createFetchHttpClient(), // Obligatoire dans l'environnement Deno
})

// ── Handler principal ────────────────────────────────────────────────────────
serve(async (req: Request) => {
  // Répondre au preflight CORS envoyé par le navigateur avant chaque POST
  if (req.method === 'OPTIONS') return handlePreflight()

  if (req.method !== 'POST') {
    return errorResponse('Méthode non autorisée — seul POST est accepté', 405)
  }

  try {
    // ── Étape 1 : Vérifier l'authentification ────────────────────────────────
    const authHeader = req.headers.get('Authorization') ?? ''

    if (!authHeader.startsWith('Bearer ')) {
      console.error('[AUTH] Header Authorization absent ou mal formé')
      return errorResponse('Token d\'authentification requis', 401)
    }

    const userToken = authHeader.replace('Bearer ', '')

    // Appel à l'API Supabase Auth pour valider le token et récupérer l'utilisateur
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey:        SERVICE_KEY,
        Authorization: `Bearer ${userToken}`,
      },
    })

    if (!userRes.ok) {
      console.error('[AUTH] Token rejeté par Supabase — HTTP:', userRes.status)
      return errorResponse('Token invalide ou session expirée', 401)
    }

    const user = await userRes.json()
    console.log('[AUTH] ✓ Utilisateur authentifié — id:', user.id)

    // ── Étape 2 : Parser et valider le body ──────────────────────────────────
    let body: { quoteId?: string; currency?: string }

    try {
      body = await req.json()
    } catch {
      return errorResponse('Body JSON invalide')
    }

    const { quoteId, currency = 'eur' } = body

    if (!quoteId) {
      return errorResponse('Paramètre requis manquant : quoteId')
    }

    // ── Étape 3 : Récupérer le devis depuis la BDD ───────────────────────────
    // Le montant provient de la BDD — jamais du front (sécurité anti-manipulation)
    const quoteRes = await fetch(
      `${SUPABASE_URL}/rest/v1/quotes?id=eq.${quoteId}&user_id=eq.${user.id}&select=id,total_cost,project_name,payment_status`,
      {
        headers: {
          apikey:        SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
      }
    )

    const quotes: Array<{ id: string; total_cost: number; project_name: string; payment_status: string }> =
      await quoteRes.json()

    if (!Array.isArray(quotes) || quotes.length === 0) {
      console.error('[SECURITY] Devis introuvable ou accès refusé — quoteId:', quoteId, '— userId:', user.id)
      return errorResponse('Devis introuvable ou accès non autorisé', 403)
    }

    const quote = quotes[0]
    console.log('[QUOTE] ✓ Devis validé — id:', quote.id, '— total_cost:', quote.total_cost)

    // Bloquer si le devis est déjà payé
    if (quote.payment_status === 'paid') {
      return errorResponse('Ce devis a déjà été réglé', 409)
    }

    // ── Étape 4 : Créer le PaymentIntent chez Stripe ─────────────────────────
    // Stripe travaille en centimes (integer) — on arrondit pour éviter les erreurs de flottants
    const amountInCents = Math.round((quote.total_cost ?? 0) * 100)

    if (amountInCents <= 0) {
      return errorResponse('Le montant du devis est invalide (doit être > 0)', 422)
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        // Ces métadonnées sont reçues dans le webhook pour identifier le devis
        quoteId:     quote.id,
        userId:      user.id,
        projectName: quote.project_name ?? '',
      },
      // Laisse Stripe afficher les méthodes de paiement adaptées à la région
      automatic_payment_methods: { enabled: true },
    })

    console.log('[STRIPE] ✓ PaymentIntent créé — id:', paymentIntent.id, '— amount:', amountInCents, currency)

    // ── Étape 5 : Enregistrer l'intent_id en BDD ─────────────────────────────
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/quotes?id=eq.${quote.id}`,
      {
        method: 'PATCH',
        headers: {
          apikey:         SERVICE_KEY,
          Authorization:  `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer:         'return=minimal',
        },
        body: JSON.stringify({
          stripe_payment_intent_id: paymentIntent.id,
          payment_status:           'processing',
          updated_at:               new Date().toISOString(),
        }),
      }
    )

    if (!updateRes.ok) {
      const errBody = await updateRes.text()
      console.error('[DB] Échec mise à jour BDD — HTTP:', updateRes.status, '—', errBody)
      // On ne bloque pas — le webhook mettra à jour le statut de toute façon
    } else {
      console.log('[DB] ✓ Devis mis à jour — statut: processing')
    }

    // ── Étape 6 : Retourner UNIQUEMENT le client_secret au front ─────────────
    // Le client_secret permet au front de confirmer le paiement via Stripe.js
    // Il n'expose pas la clé secrète et ne donne accès à rien d'autre
    return jsonResponse({
      clientSecret: paymentIntent.client_secret,
      intentId:     paymentIntent.id,
    })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[ERROR] create-payment-intent — exception non catchée:', message)
    return errorResponse('Erreur interne du serveur', 500)
  }
})
