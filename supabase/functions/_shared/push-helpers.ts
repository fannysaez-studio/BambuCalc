// @ts-nocheck

/** Retourne les push_subscriptions des admins uniquement */
export async function getAdminSubs(supabaseUrl: string, serviceKey: string) {
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }

  const adminsRes = await fetch(`${supabaseUrl}/rest/v1/admins?select=user_id`, { headers })
  const admins = await adminsRes.json()
  if (!Array.isArray(admins) || admins.length === 0) return []

  const ids = admins.map((a: { user_id: string }) => a.user_id).join(',')
  const subsRes = await fetch(
    `${supabaseUrl}/rest/v1/push_subscriptions?user_id=in.(${ids})`,
    { headers }
  )
  const subs = await subsRes.json()
  return Array.isArray(subs) ? subs : []
}

/** Retourne les push_subscriptions d'un client via son email (lookup profiles) */
export async function getClientSubsByEmail(email: string, supabaseUrl: string, serviceKey: string) {
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }

  const profileRes = await fetch(
    `${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id&limit=1`,
    { headers }
  )
  const profiles = await profileRes.json()
  if (!Array.isArray(profiles) || profiles.length === 0) return []

  const userId = profiles[0].id
  const subsRes = await fetch(
    `${supabaseUrl}/rest/v1/push_subscriptions?user_id=eq.${userId}`,
    { headers }
  )
  const subs = await subsRes.json()
  return Array.isArray(subs) ? subs : []
}

/** Retourne les push_subscriptions d'un client via son user_id */
export async function getClientSubsByUserId(userId: string, supabaseUrl: string, serviceKey: string) {
  const subsRes = await fetch(
    `${supabaseUrl}/rest/v1/push_subscriptions?user_id=eq.${userId}`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  )
  const subs = await subsRes.json()
  return Array.isArray(subs) ? subs : []
}

/** Envoie un push à une liste de souscriptions, supprime les expirées (410) */
export async function sendPushToSubs(
  subs: Array<{ id: string; endpoint: string; p256dh: string; auth_key: string }>,
  payload: string,
  webpush: any,
  supabaseUrl: string,
  serviceKey: string
): Promise<number> {
  let sent = 0
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
        payload
      )
      sent++
    } catch (err: any) {
      console.error('[Push] sendNotification:', String(err))
      if (err?.statusCode === 410) {
        await fetch(`${supabaseUrl}/rest/v1/push_subscriptions?id=eq.${sub.id}`, {
          method: 'DELETE',
          headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
        })
      }
    }
  }
  return sent
}

/** Formate une date ISO en français : "10 juin à 14h30" */
export function formatRdvDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  })
}
