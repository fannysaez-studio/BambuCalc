/**
 * src/utils/stripe.js — Utilitaire de chargement conditionnel Stripe
 *
 * RÈGLE DE SÉCURITÉ :
 *   Stripe.js ne doit être chargé QUE si l'utilisateur a explicitement accepté
 *   les cookies tiers (cookie_consent === 'all').
 *   Sans consentement, cette fonction retourne null et ne charge rien.
 *
 * Stripe.js est chargé via un import() dynamique asynchrone (code splitting)
 * ce qui évite que le script ne soit inclus dans le bundle principal.
 *
 * Usage :
 *   import { loadStripeConditionally } from '@/utils/stripe'
 *
 *   const stripe = await loadStripeConditionally()
 *   if (!stripe) {
 *     // Afficher un message demandant à l'utilisateur d'accepter les cookies
 *     return
 *   }
 *   // Utiliser stripe normalement…
 */

const STORAGE_KEY = 'cookie_consent'

/** Instance singleton — on ne crée qu'une seule instance Stripe par session */
let stripeInstance = null

/**
 * Charge et retourne l'instance Stripe SI et SEULEMENT SI
 * l'utilisateur a consenti aux cookies tiers (valeur 'all').
 *
 * @returns {Promise<import('@stripe/stripe-js').Stripe | null>}
 */
export async function loadStripeConditionally() {
  const consent = localStorage.getItem(STORAGE_KEY)

  if (consent !== 'all') {
    return null
  }

  if (stripeInstance) return stripeInstance

  const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY

  if (!publicKey) {
    if (import.meta.env.DEV) {
      console.error('[Stripe] VITE_STRIPE_PUBLIC_KEY manquante — ajoutez-la dans .env.local')
    }
    return null
  }

  try {
    const { loadStripe } = await import('@stripe/stripe-js')
    stripeInstance = await loadStripe(publicKey)
    return stripeInstance ?? null
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[Stripe] Erreur de chargement :', err)
    }
    return null
  }
}

/**
 * Réinitialise l'instance Stripe.
 * À appeler si l'utilisateur retire son consentement en cours de session.
 */
export function unloadStripe() {
  stripeInstance = null
  console.log('[Stripe] Instance déchargée — consentement retiré')
}

/**
 * Vérifie si l'utilisateur a donné son consentement pour Stripe.
 * Utile pour afficher conditionnellement le bouton "Payer".
 *
 * @returns {boolean}
 */
export function hasStripeConsent() {
  return localStorage.getItem(STORAGE_KEY) === 'all'
}
