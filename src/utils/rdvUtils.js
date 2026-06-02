export const ONLINE_TYPES = [
  'google_conference', 'zoom', 'teams', 'gotomeeting',
  'webex', 'microsoft_teams', 'google_meet',
]

export function deriveFormat(a) {
  const loc = a.raw?.payload?.scheduled_event?.location?.type ?? ''
  return ONLINE_TYPES.some(t => loc.includes(t)) ? 'online' : 'inperson'
}

export function ledPresence(a) {
  if (a.presence === 'present') return 'present'
  if (a.presence === 'absent')  return 'absent'
  return 'unknown'
}

export function getObjectRdv(a) {
  try {
    const qa = a.raw?.payload?.questions_and_answers
    if (Array.isArray(qa) && qa.length > 0 && qa[0].answer?.trim()) return qa[0].answer.trim()
  } catch { /* */ }
  return '—'
}

export function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function fmtTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function duration(start, end) {
  if (!start || !end) return '—'
  const min = Math.round((new Date(end) - new Date(start)) / 60000)
  return `${min} min`
}
