/**
 * Génère les clés VAPID pour les Web Push Notifications.
 * Usage : node scripts/generate-vapid.mjs
 */

import { generateKeyPairSync } from 'crypto'

const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' })

// JWK donne des valeurs base64url propres sans manipulation DER
const pubJwk  = publicKey.export({ format: 'jwk' })
const privJwk = privateKey.export({ format: 'jwk' })

// Clé publique VAPID = point non-compressé 04 || X || Y (65 octets)
function b64urlToBuffer(s) {
  const padding = '='.repeat((4 - s.length % 4) % 4)
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + padding, 'base64')
}
const uncompressed = Buffer.concat([
  Buffer.from([0x04]),
  b64urlToBuffer(pubJwk.x),
  b64urlToBuffer(pubJwk.y),
])
const VAPID_PUBLIC_KEY  = uncompressed.toString('base64url')
const VAPID_PRIVATE_KEY = privJwk.d   // déjà en base64url dans le JWK

console.log('\n╔══════════════════════════════════════════════════════════════╗')
console.log('║               VAPID Keys — BambuCalc Push                   ║')
console.log('╚══════════════════════════════════════════════════════════════╝\n')
console.log('VAPID_PUBLIC_KEY=' + VAPID_PUBLIC_KEY)
console.log('VAPID_PRIVATE_KEY=' + VAPID_PRIVATE_KEY)
console.log('\n1. Supabase Dashboard → Settings → Edge Functions → Secrets')
console.log('   Ajouter VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY\n')
console.log('2. Dans .env.local :')
console.log('   VITE_VAPID_PUBLIC_KEY=' + VAPID_PUBLIC_KEY)
console.log('\n── Clés générées avec succès ──\n')
