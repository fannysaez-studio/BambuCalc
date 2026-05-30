/**
 * _shared/cors.ts — Module CORS centralisé pour toutes les Edge Functions
 *
 * Usage dans une Edge Function :
 *   import { handlePreflight, jsonResponse, errorResponse } from '../_shared/cors.ts'
 *
 *   serve(async (req) => {
 *     if (req.method === 'OPTIONS') return handlePreflight(req)
 *     // ...
 *     return jsonResponse({ data }, 200, req)
 *   })
 */

const ALLOWED_ORIGINS = [
  'https://bambucalc.netlify.app',
  'http://localhost:5173',
  'http://localhost:4173',
]

function resolveOrigin(req?: Request): string {
  const origin = req?.headers.get('Origin') ?? ''
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
}

function buildCorsHeaders(req?: Request): Record<string, string> {
  return {
    'Access-Control-Allow-Origin':  resolveOrigin(req),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age':       '86400',
    'Vary':                         'Origin',
  }
}

/** Rétrocompatibilité — préférer getCorsHeaders(req) dans les nouveaux appels */
export const corsHeaders = buildCorsHeaders()

export function handlePreflight(req?: Request): Response {
  return new Response(null, { status: 204, headers: buildCorsHeaders(req) })
}

export function jsonResponse(data: unknown, status = 200, req?: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...buildCorsHeaders(req),
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}

export function errorResponse(message: string, status = 400, req?: Request): Response {
  console.error(`[CORS errorResponse] ${status} — ${message}`)
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...buildCorsHeaders(req),
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}
