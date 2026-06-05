# Rappel RDV automatique 24h avant — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Envoyer automatiquement un push + email de rappel aux clients 24h avant leur RDV Calendly.

**Architecture:** Edge Function `remind-rdv` appelée toutes les heures par Supabase Scheduler. Elle cherche les appointments dans la fenêtre +23h/+25h avec `reminder_sent = false`, envoie push via web-push + email via Brevo, puis marque `reminder_sent = true`.

**Tech Stack:** Deno, `npm:web-push`, Brevo SMTP API, Supabase REST API, Supabase Scheduler (cron `0 * * * *`)

---

## Fichiers concernés

| Action | Fichier |
|--------|---------|
| Créer | `supabase/migrations/20260605000001_appointments_reminder_sent.sql` |
| Créer | `supabase/functions/remind-rdv/index.ts` |
| Modifier | `test-push.mjs` (ajout commande `remind-rdv` pour test manuel) |

---

### Task 1 : Migration — colonne `reminder_sent`

**Fichiers :**
- Créer : `supabase/migrations/20260605000001_appointments_reminder_sent.sql`

- [ ] **Étape 1 : Créer le fichier de migration**

```sql
-- Évite d'envoyer le rappel plusieurs fois pour le même RDV
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false;
```

- [ ] **Étape 2 : Appliquer dans Supabase SQL Editor**

Copier-coller le SQL ci-dessus dans Supabase → SQL Editor → Run.
Vérifier que la colonne apparaît dans Table Editor → `appointments`.

- [ ] **Étape 3 : Commit**

```bash
git add supabase/migrations/20260605000001_appointments_reminder_sent.sql
git commit -m "feat(migrations): colonne reminder_sent sur appointments"
```

---

### Task 2 : Edge Function `remind-rdv`

**Fichiers :**
- Créer : `supabase/functions/remind-rdv/index.ts`

- [ ] **Étape 1 : Créer le fichier**

```typescript
// @ts-nocheck
import { serve }  from 'https://deno.land/std@0.224.0/http/server.ts'
import webpush    from 'npm:web-push'
import { getClientSubsByEmail, sendPushToSubs, formatRdvDate } from '../_shared/push-helpers.ts'

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')          ?? ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')         ?? ''
const VAPID_SUBJECT     = 'mailto:fannysaez.pro@gmail.com'
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')              ?? ''
const SERVICE_KEY       = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const BREVO_API_KEY     = Deno.env.get('BREVO_API_KEY')             ?? ''
const BRAND_COLOR       = '#2e9cab'

const headers = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }

// ── Email Brevo ───────────────────────────────────────────────────────────────

async function sendReminderEmail(to: string, name: string, dateStr: string): Promise<void> {
  if (!BREVO_API_KEY || !to) return

  const firstName = name.split(' ')[0] || 'là'

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Rappel rendez-vous</title></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Inter,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr>
    <td style="background:linear-gradient(135deg,${BRAND_COLOR},#3fb2bf);padding:36px 40px 28px;text-align:center;">
      <div style="font-size:36px;margin-bottom:8px;">⏰</div>
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">Rappel rendez-vous</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Votre RDV BambuCalc est demain</p>
    </td>
  </tr>
  <tr>
    <td style="padding:32px 40px;">
      <p style="margin:0 0 16px;font-size:16px;color:#1b2f39;">Bonjour ${firstName},</p>
      <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">
        Nous vous rappelons que votre rendez-vous est prévu le <strong>${dateStr}</strong>.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:8px 0 24px;">
            <a href="https://bambucalc.fr/dashboard"
               style="display:inline-block;background:${BRAND_COLOR};color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
              Voir mon tableau de bord
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:13px;color:#a0aec0;text-align:center;">
        BambuCalc — Impression 3D sur mesure
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender:  { name: 'BambuCalc', email: 'noreply@bambucalc.fr' },
        to:      [{ email: to, name }],
        subject: '⏰ Rappel — Votre rendez-vous BambuCalc est demain',
        htmlContent: html,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('[Reminder] Brevo error:', err)
    } else {
      console.log('[Reminder] Email envoyé à', to)
    }
  } catch (e) {
    console.error('[Reminder] Email exception:', String(e))
  }
}

// ── Handler principal ─────────────────────────────────────────────────────────

serve(async (_req) => {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('[Reminder] VAPID keys manquantes')
    return new Response(JSON.stringify({ ok: false, error: 'VAPID keys manquantes' }), { status: 500 })
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

  // Fenêtre : RDV dans 23h à 25h, actifs, pas encore rappelés
  const windowStart = new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString()
  const windowEnd   = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString()

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/appointments?select=id,invitee_name,invitee_email,start_at&status=eq.active&reminder_sent=eq.false&start_at=gte.${windowStart}&start_at=lte.${windowEnd}`,
    { headers }
  )
  const appointments = await res.json()
  console.log('[Reminder] RDV dans la fenêtre:', Array.isArray(appointments) ? appointments.length : appointments)

  if (!Array.isArray(appointments) || appointments.length === 0) {
    return new Response(JSON.stringify({ ok: true, sent: 0 }), { status: 200 })
  }

  let sent = 0

  for (const appt of appointments) {
    const { id, invitee_name, invitee_email, start_at } = appt
    if (!invitee_email) {
      console.warn('[Reminder] Pas d\'email pour appointment', id)
    } else {
      const dateStr = formatRdvDate(start_at)

      // Push
      const subs = await getClientSubsByEmail(invitee_email, SUPABASE_URL, SERVICE_KEY)
      if (subs.length > 0) {
        await sendPushToSubs(
          subs,
          JSON.stringify({ title: '⏰ Rappel rendez-vous', body: `Votre RDV est ${dateStr}`, url: '/dashboard' }),
          webpush, SUPABASE_URL, SERVICE_KEY
        )
      }

      // Email
      await sendReminderEmail(invitee_email, invitee_name ?? '', dateStr)

      sent++
    }

    // Marquer comme rappelé (même si push/email partiel)
    await fetch(`${SUPABASE_URL}/rest/v1/appointments?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ reminder_sent: true }),
    })
  }

  console.log('[Reminder] Total rappels envoyés:', sent)
  return new Response(JSON.stringify({ ok: true, sent }), { status: 200 })
})
```

- [ ] **Étape 2 : Déployer la fonction**

```bash
npx supabase functions deploy remind-rdv --no-verify-jwt
```

Résultat attendu : `Deployed Functions on project upwzdctedpazranppskz: remind-rdv`

- [ ] **Étape 3 : Commit**

```bash
git add supabase/functions/remind-rdv/index.ts
git commit -m "feat(push): Edge Function remind-rdv — rappel RDV 24h avant (push + email)"
```

---

### Task 3 : Test manuel

**Fichiers :**
- Modifier : `test-push.mjs`

- [ ] **Étape 1 : Ajouter la commande `remind-rdv` dans le script de test**

Dans `test-push.mjs`, après le bloc `quote-update`, ajouter :

```js
} else if (fn === 'remind-rdv') {
  // Appel direct sans body — la fonction lit elle-même les appointments
  const res = await fetch(`${SUPABASE_URL}/functions/v1/remind-rdv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  const text = await res.text()
  console.log(`\nStatus : ${res.status}`)
  try { console.log('Réponse :', JSON.parse(text)) }
  catch { console.log('Réponse :', text) }
```

- [ ] **Étape 2 : Créer un RDV de test dans la fenêtre 23-25h**

Dans Supabase → SQL Editor :

```sql
INSERT INTO appointments (
  calendly_event_id, invitee_name, invitee_email,
  start_at, status, reminder_sent
) VALUES (
  'test-remind-001',
  'Fanny SAEZ',
  'fanny.saez.0486@gmail.com',
  NOW() + INTERVAL '24 hours',
  'active',
  false
);
```

- [ ] **Étape 3 : Lancer le test**

```bash
node test-push.mjs remind-rdv
```

Résultat attendu :
```
Status : 200
Réponse : { ok: true, sent: 1 }
```

Vérifier :
- Push reçu dans le navigateur
- Email reçu dans la boîte fanny.saez.0486@gmail.com
- Dans Supabase → Table Editor → appointments : `reminder_sent = true` sur la ligne test

- [ ] **Étape 4 : Nettoyer le RDV de test**

```sql
DELETE FROM appointments WHERE calendly_event_id = 'test-remind-001';
```

- [ ] **Étape 5 : Commit**

```bash
git add test-push.mjs
git commit -m "test(push): commande remind-rdv dans test-push.mjs"
```

---

### Task 4 : Configurer le Scheduler Supabase

- [ ] **Étape 1 : Ouvrir Supabase Dashboard**

> Supabase → Edge Functions → `remind-rdv` → onglet **"Schedule"**

- [ ] **Étape 2 : Créer le schedule**

Cliquer **"Add schedule"** et configurer :
- **Cron expression** : `0 * * * *` (toutes les heures, à H:00)
- Sauvegarder

- [ ] **Étape 3 : Vérifier dans les logs**

Attendre l'heure suivante (ou utiliser le bouton "Invoke" pour déclencher manuellement).
Vérifier dans Supabase → Edge Functions → `remind-rdv` → **Logs** que la fonction s'exécute et affiche `[Reminder] RDV dans la fenêtre: 0` (normal s'il n'y a pas de RDV dans la fenêtre).

- [ ] **Étape 4 : Commit final + push**

```bash
git push
```

---

## Vérification finale

| Critère | Comment vérifier |
|---------|-----------------|
| Migration appliquée | Table Editor → appointments → colonne `reminder_sent` visible |
| Fonction déployée | Dashboard → Edge Functions → `remind-rdv` présente |
| Test passé | `node test-push.mjs remind-rdv` → `sent: 1`, push + email reçus |
| `reminder_sent = true` après envoi | Table Editor → ligne test |
| Scheduler actif | Edge Functions → remind-rdv → Schedule → cron visible |
