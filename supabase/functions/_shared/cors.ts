/**
 * _shared/cors.ts — Module CORS centralisé pour toutes les Edge Functions
 *
 * Usage dans une Edge Function :
 *   import { handlePreflight, jsonResponse, errorResponse } from '../_shared/cors.ts'
 *
 *   serve(async (req) => {
 *     if (req.method === 'OPTIONS') return handlePreflight()
 *     // ...
 *     return jsonResponse({ data })
 *   })
 */

/** Domaine autorisé à appeler nos Edge Functions */
const ALLOWED_ORIGIN = '*'

/**
 * Headers CORS à inclure dans TOUTES les réponses (200 et 4xx).
 * Sans ces headers sur les réponses d'erreur, le navigateur masque
 * le vrai code d'erreur HTTP et affiche uniquement "Network Error".
 */
export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin':  ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age':       '86400', // Cache le preflight 24h côté navigateur
}

/**
 * Réponse au preflight OPTIONS.
 * Le navigateur envoie cette requête avant chaque POST cross-origin.
 * On répond 204 (No Content) avec les headers CORS — pas de body.
 */
export function handlePreflight(): Response {
  return new Response(null, { status: 204, headers: corsHeaders })
}

/**
 * Sérialise data en JSON et ajoute les headers CORS + Content-Type.
 * À utiliser pour TOUTES les réponses de succès.
 */
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

/**
 * Réponse d'erreur JSON avec CORS.
 * IMPORTANT : les headers CORS sont obligatoires même sur les erreurs,
 * sinon le front Vue reçoit une opaque network error au lieu du vrai message.
 */
export function errorResponse(message: string, status = 400): Response {
  console.error(`[CORS errorResponse] ${status} — ${message}`)
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}
