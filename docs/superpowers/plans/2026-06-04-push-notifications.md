# Push Notifications Auto — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter les boutons d'abonnement push pour admin et client, et envoyer automatiquement des notifications push lors de nouveaux RDV (Calendly) et de changements de statut de devis.

**Architecture:** Tout côté serveur via Edge Functions Supabase. Les helpers partagés (`_shared/push-helpers.ts`) évitent la duplication. Les Database Webhooks déclenchent les fonctions. Le frontend fournit uniquement le bouton d'abonnement.

**Tech Stack:** Vue 3 (script setup), Supabase Edge Functions (Deno/TypeScript), web-push (npm), VAPID

---

## Fichiers touchés

| Fichier | Action |
|---|---|
| `supabase/functions/_shared/push-helpers.ts` | Créer — helpers partagés |
| `supabase/functions/handle-calendly-webhook/index.ts` | Modifier — ajouter push RDV |
| `supabase/functions/notify-new-quote/index.ts` | Modifier — filtrer admins uniquement |
| `supabase/functions/notify-quote-update/index.ts` | Créer — push client sur changement statut |
| `src/views/admin/AdminDashboard.vue` | Modifier — bouton push dans hero |
| `src/views/dashboard/Dashboard.vue` | Modifier — bouton push + badge onglet profil |

---

## Task 1 : Helpers partagés push

**Fichiers :**
- Créer : `supabase/functions/_shared/push-helpers.ts`

- [ ] **Créer le fichier avec les 3 helpers**

```typescript
// supabase/functions/_shared/push-helpers.ts
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
  }).replace(' à', ' à')
}
```

- [ ] **Commiter**

```bash
git add supabase/functions/_shared/push-helpers.ts
git commit -m "feat(push): helpers partagés getAdminSubs / getClientSubs / sendPushToSubs"
```

---

## Task 2 : Bouton push admin dans le hero

**Fichiers :**
- Modifier : `src/views/admin/AdminDashboard.vue` (template, lignes 20-32)

> Les variables push sont déjà importées (`pushSupported`, `isSubscribed`, `subscribePush`, `unsubscribePush`, `pushLoading`, `pushPermission`, `initPush`). Le CSS `.btn-push-toggle` existe déjà dans `admin-dashboard.css`. `Bell` et `BellOff` sont déjà importés.

- [ ] **Ajouter le bouton avant `btn-new-quote` dans `.admin-hero-actions`**

Remplacer :
```html
      <div class="admin-hero-actions">
        <div class="hero-bell-mobile">
          <NotificationBell :topPanel="true" />
        </div>
        <button class="btn-new-quote" @click="startNewQuote" title="Nouveau devis">
```

Par :
```html
      <div class="admin-hero-actions">
        <div class="hero-bell-mobile">
          <NotificationBell :topPanel="true" />
        </div>
        <button
          v-if="pushSupported"
          class="btn-push-toggle"
          :class="{ 'btn-push-toggle--active': isSubscribed }"
          :disabled="pushLoading || pushPermission === 'denied'"
          :title="isSubscribed ? 'Désactiver les notifications push' : 'Activer les notifications push'"
          @click="isSubscribed ? unsubscribePush() : subscribePush()"
        >
          <BellOff v-if="isSubscribed" class="btn-push-icon" />
          <Bell v-else class="btn-push-icon" />
        </button>
        <button class="btn-new-quote" @click="startNewQuote" title="Nouveau devis">
```

- [ ] **Vérifier visuellement** : aller sur `/admin` dans le navigateur — le bouton cloche doit apparaître dans le hero. Cliquer dessus doit demander la permission navigateur puis s'activer (fond vert/teal).

- [ ] **Commiter**

```bash
git add src/views/admin/AdminDashboard.vue
git commit -m "feat(push): bouton abonnement push dans le hero admin"
```

---

## Task 3 : Bouton push client dans Mon profil + badge onglet

**Fichiers :**
- Modifier : `src/views/dashboard/Dashboard.vue`

- [ ] **Ajouter `Bell, BellOff` aux imports lucide** (ligne ~551)

Remplacer :
```js
import { User, Plus, FileText, TrendingUp, Package, Wallet, Archive, ChevronDown, Download, UserX, CreditCard, Eye, Calendar, Shield, LogOut, Save } from 'lucide-vue-next'
```
Par :
```js
import { User, Plus, FileText, TrendingUp, Package, Wallet, Archive, ChevronDown, Download, UserX, CreditCard, Eye, Calendar, Shield, LogOut, Save, Bell, BellOff } from 'lucide-vue-next'
```

- [ ] **Importer `usePushNotifications`** après les autres imports de composables (~ligne 542)

```js
import { usePushNotifications } from '@/composables/usePushNotifications'
```

- [ ] **Déclarer `push`** juste après `const navStore = useNavigationStore()` (~ligne 553)

```js
const push = usePushNotifications()
```

- [ ] **Initialiser push dans l'IIFE** — après `isAdminUser.value = !!adminRow` (~ligne 749)

Chercher le bloc :
```js
    const { data: adminRow } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
    isAdminUser.value = !!adminRow
```
Ajouter en dessous :
```js
    push.init()
```

- [ ] **Ajouter le badge pulsant sur l'onglet "Mon profil"** (~ligne 73)

Remplacer :
```html
      <button :class="['ctab-btn', activeTab === 'profile' && 'ctab-btn--active']" @click="activeTab = 'profile'">
        <User class="ctab-icon" />
        <span class="ctab-label-long">Mon profil</span>
        <span class="ctab-label-short">Profil</span>
      </button>
```
Par :
```html
      <button :class="['ctab-btn', activeTab === 'profile' && 'ctab-btn--active']" @click="activeTab = 'profile'">
        <User class="ctab-icon" />
        <span class="ctab-label-long">Mon profil</span>
        <span class="ctab-label-short">Profil</span>
        <span v-if="push.isSupported && !push.isSubscribed && push.permission !== 'denied'" class="ctab-push-dot" />
      </button>
```

- [ ] **Ajouter le bloc push dans la section Sécurité du profil** — après le bouton `pi-btn-logout` (~ligne 492)

Remplacer :
```html
          <button class="pi-btn-logout" @click="logout">
            <LogOut class="pi-btn-icon" /> Se déconnecter
          </button>
        </div>
      </div>
    </div>
```
Par :
```html
          <button class="pi-btn-logout" @click="logout">
            <LogOut class="pi-btn-icon" /> Se déconnecter
          </button>
        </div>

        <!-- Notifications push -->
        <div v-if="push.isSupported" class="pi-col pi-col--push">
          <p class="pi-col-title">Notifications</p>
          <div class="pi-push-row">
            <div class="pi-push-info">
              <p class="pi-label">Alertes push</p>
              <p class="pi-push-sub">
                <template v-if="push.permission === 'denied'">Accès refusé — activez les notifications dans votre navigateur.</template>
                <template v-else>Recevez une alerte quand votre devis change de statut.</template>
              </p>
            </div>
            <button
              class="pi-btn-push"
              :class="{ 'pi-btn-push--on': push.isSubscribed }"
              :disabled="push.loading || push.permission === 'denied'"
              @click="push.isSubscribed ? push.unsubscribe() : push.subscribe()"
            >
              <BellOff v-if="push.isSubscribed" class="pi-btn-icon" />
              <Bell v-else class="pi-btn-icon" />
              {{ push.isSubscribed ? 'Désactiver' : 'Activer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
```

- [ ] **Ajouter le CSS** dans `<style scoped>` de Dashboard.vue, à la fin de la section `/* ── Profil inline ── */`

```css
/* ── Push notifications ── */
.pi-col--push {
  grid-column: 1 / -1;
  border-top: 1px solid #f0f4f8;
  border-right: none;
}
.pi-push-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; padding: 0.75rem 1rem;
  background: #f7f9fc; border: 1px solid #e2e8f0; border-radius: 12px;
}
.pi-push-info { flex: 1; min-width: 0; }
.pi-push-sub  { font-size: 0.72rem; color: #718096; margin: 0.1rem 0 0; }
.pi-btn-push {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.45rem 0.9rem; border: 1.5px solid #e2e8f0; border-radius: 999px;
  background: #fff; color: #718096; font-size: 0.78rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.2s; flex-shrink: 0;
}
.pi-btn-push:hover:not(:disabled) { border-color: #2e9cab; color: #2e9cab; }
.pi-btn-push--on  { border-color: #2e9cab; background: #e8f7f9; color: #1f7f97; }
.pi-btn-push:disabled { opacity: 0.5; cursor: not-allowed; }

/* Badge pulsant sur l'onglet Profil */
.ctab-push-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  background: #2e9cab;
  animation: push-pulse 2s ease-in-out infinite;
}
@keyframes push-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.45; transform: scale(0.75); }
}
```

- [ ] **Vérifier visuellement** : aller sur `/dashboard` → onglet "Mon profil" — le point pulsant doit être sur le tab. Dans l'onglet, le bloc "Alertes push" doit apparaître avec le bouton "Activer".

- [ ] **Commiter**

```bash
git add src/views/dashboard/Dashboard.vue
git commit -m "feat(push): abonnement push client dans Mon profil + badge onglet"
```

---

## Task 4 : handle-calendly-webhook — push admin + client RDV

**Fichiers :**
- Modifier : `supabase/functions/handle-calendly-webhook/index.ts`

- [ ] **Ajouter les imports** en haut du fichier, après les imports existants

Remplacer :
```typescript
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const WEBHOOK_SECRET = Deno.env.get('CALENDLY_WEBHOOK_SECRET')     ?? ''
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')                ?? ''
const SERVICE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')   ?? ''
const CAL_TOKEN      = Deno.env.get('CALENDLY_API_TOKEN')          ?? ''
```
Par :
```typescript
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
```

- [ ] **Ajouter le bloc push après l'upsert**, avant le `console.log` final

Chercher :
```typescript
  // Pas de notification dans la cloche — le CalendarPanel gère l'affichage des RDV

  console.log(`[CALENDLY] ${eventType} — ${inviteeName} (${inviteeEmail})`)
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
```

Remplacer par :
```typescript
  // ── Push notifications ────────────────────────────────────────────────────
  if (!isCanceled && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    try {
      webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
      const dateStr = formatRdvDate(startAt)

      // Push admin
      const adminSubs = await getAdminSubs(SUPABASE_URL, SERVICE_KEY)
      if (adminSubs.length > 0) {
        await sendPushToSubs(
          adminSubs,
          JSON.stringify({ title: '📅 Nouveau rendez-vous', body: `${inviteeName} — ${dateStr}`, url: '/admin' }),
          webpush, SUPABASE_URL, SERVICE_KEY
        )
      }

      // Push client
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
```

- [ ] **Commiter**

```bash
git add supabase/functions/handle-calendly-webhook/index.ts
git commit -m "feat(push): push admin + client lors d'un nouveau RDV Calendly"
```

---

## Task 5 : notify-new-quote — admins uniquement

**Fichiers :**
- Modifier : `supabase/functions/notify-new-quote/index.ts`

- [ ] **Remplacer les imports** en haut du fichier

Remplacer :
```typescript
import { serve }  from 'https://deno.land/std@0.224.0/http/server.ts'
import webpush    from 'npm:web-push'
```
Par :
```typescript
import { serve }  from 'https://deno.land/std@0.224.0/http/server.ts'
import webpush    from 'npm:web-push'
import { getAdminSubs, sendPushToSubs } from '../_shared/push-helpers.ts'
```

- [ ] **Remplacer le fetch de toutes les souscriptions** par `getAdminSubs`

Remplacer :
```typescript
  // ── Récupération des souscriptions push admin ─────────────────────────────
  const res  = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  })
  const subs = await res.json()

  if (!Array.isArray(subs) || subs.length === 0) {
    console.log('[PUSH] Aucune souscription active')
    return new Response(JSON.stringify({ ok: true, sent: 0 }), { status: 200 })
  }

  // ── Envoi des notifications push ──────────────────────────────────────────
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

  const notifPayload = JSON.stringify({
    title: '🖨️ Nouveau devis reçu',
    body:  `${name} — ${client} · ${total}`,
    url:   '/admin',
  })

  let sent = 0
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
        notifPayload,
      )
      sent++
    } catch (err) {
      console.error('[PUSH] sendNotification:', String(err))
      if (err?.statusCode === 410) {
        await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?id=eq.${sub.id}`, {
          method:  'DELETE',
          headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
        })
      }
    }
  }

  console.log('[PUSH] Notifications envoyées:', sent)
  return new Response(JSON.stringify({ ok: true, sent }), { status: 200 })
```
Par :
```typescript
  // ── Envoi push aux admins uniquement ──────────────────────────────────────
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

  const adminSubs = await getAdminSubs(SUPABASE_URL, SERVICE_KEY)
  if (adminSubs.length === 0) {
    console.log('[PUSH] Aucune souscription admin active')
    return new Response(JSON.stringify({ ok: true, sent: 0 }), { status: 200 })
  }

  const notifPayload = JSON.stringify({
    title: '🖨️ Nouveau devis reçu',
    body:  `${name} — ${client} · ${total}`,
    url:   '/admin',
  })

  const sent = await sendPushToSubs(adminSubs, notifPayload, webpush, SUPABASE_URL, SERVICE_KEY)
  console.log('[PUSH] Notifications envoyées:', sent)
  return new Response(JSON.stringify({ ok: true, sent }), { status: 200 })
```

- [ ] **Commiter**

```bash
git add supabase/functions/notify-new-quote/index.ts
git commit -m "fix(push): notify-new-quote filtre admins uniquement via getAdminSubs"
```

---

## Task 6 : notify-quote-update — push client sur changement statut

**Fichiers :**
- Créer : `supabase/functions/notify-quote-update/index.ts`

- [ ] **Créer le fichier**

```typescript
// @ts-nocheck
/**
 * Edge Function : notify-quote-update
 *
 * Déclenchée par un Database Webhook Supabase à chaque UPDATE sur `quotes`.
 * Envoie une notification push au client propriétaire du devis.
 *
 * Config : Supabase Dashboard → Database → Webhooks → quotes → UPDATE
 *   URL    : {SUPABASE_URL}/functions/v1/notify-quote-update
 *   Header : x-webhook-secret: {NOTIFY_WEBHOOK_SECRET}
 */
import { serve }    from 'https://deno.land/std@0.224.0/http/server.ts'
import webpush      from 'npm:web-push'
import { getClientSubsByUserId, sendPushToSubs } from '../_shared/push-helpers.ts'

const WEBHOOK_SECRET    = Deno.env.get('NOTIFY_WEBHOOK_SECRET')     ?? ''
const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')          ?? ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')         ?? ''
const VAPID_SUBJECT     = 'mailto:fannysaez.pro@gmail.com'
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')              ?? ''
const SERVICE_KEY       = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const STATUS_MESSAGES: Record<string, { title: string; body: (num: string) => string }> = {
  pending:  { title: '⏳ Devis en cours d\'examen', body: (n) => `Votre devis #${n} est en cours d'examen` },
  sent:     { title: '📄 Devis disponible',          body: (n) => `Votre devis #${n} est prêt à consulter` },
  accepted: { title: '✅ Devis accepté',              body: (n) => `Votre devis #${n} a été accepté` },
  refused:  { title: '❌ Devis refusé',               body: (n) => `Votre devis #${n} a été refusé` },
}

serve(async (req) => {
  // ── Vérification du secret webhook ───────────────────────────────────────
  const secret = req.headers.get('x-webhook-secret')
  if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
    console.error('[AUTH] Secret webhook invalide ou absent')
    return new Response('Unauthorized', { status: 401 })
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('[INIT] VAPID keys absentes')
    return new Response('VAPID keys manquantes', { status: 500 })
  }

  // ── Parsing du payload ────────────────────────────────────────────────────
  let payload: { type: string; record: Record<string, unknown> }
  try {
    payload = await req.json()
  } catch {
    return new Response('Payload invalide', { status: 400 })
  }

  if (payload.type !== 'UPDATE' || !payload.record) {
    return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 })
  }

  const record  = payload.record
  const status  = String(record.status ?? '')
  const userId  = record.user_id as string | null
  const quoteNum = String(record.quote_number ?? record.id ?? '—')

  // Skip devis anonymes ou statuts inconnus
  if (!userId || !STATUS_MESSAGES[status]) {
    console.log('[SKIP] user_id null ou statut inconnu:', status)
    return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 })
  }

  const msg = STATUS_MESSAGES[status]

  // ── Envoi push au client ──────────────────────────────────────────────────
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

  const subs = await getClientSubsByUserId(userId, SUPABASE_URL, SERVICE_KEY)
  if (subs.length === 0) {
    console.log('[PUSH] Aucune souscription pour user:', userId)
    return new Response(JSON.stringify({ ok: true, sent: 0 }), { status: 200 })
  }

  const notifPayload = JSON.stringify({ title: msg.title, body: msg.body(quoteNum), url: '/dashboard' })
  const sent = await sendPushToSubs(subs, notifPayload, webpush, SUPABASE_URL, SERVICE_KEY)

  console.log(`[PUSH] Devis ${quoteNum} (${status}) → ${sent} push envoyé(s)`)
  return new Response(JSON.stringify({ ok: true, sent }), { status: 200 })
})
```

- [ ] **Commiter**

```bash
git add supabase/functions/notify-quote-update/index.ts
git commit -m "feat(push): notify-quote-update — push client sur changement statut devis"
```

---

## Task 7 : Déploiement et configuration Supabase

- [ ] **Déployer les Edge Functions**

```bash
# Depuis le répertoire du projet
# _shared est bundlé automatiquement lors du déploiement des fonctions qui l'importent
npx supabase functions deploy handle-calendly-webhook --no-verify-jwt
npx supabase functions deploy notify-new-quote --no-verify-jwt
npx supabase functions deploy notify-quote-update --no-verify-jwt
```

- [ ] **Créer le Database Webhook `quotes UPDATE`** dans Supabase Dashboard

```
Supabase Dashboard → Database → Webhooks → + New webhook
  Name    : notify-quote-update
  Table   : public.quotes
  Events  : ✅ Update
  Type    : HTTP Request
  URL     : https://<project-id>.supabase.co/functions/v1/notify-quote-update
  Headers : x-webhook-secret → [valeur de NOTIFY_WEBHOOK_SECRET dans les secrets]
```

> `NOTIFY_WEBHOOK_SECRET` est déjà utilisé par `notify-new-quote` — utiliser la même valeur.

- [ ] **Vérifier que `VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY` sont bien dans Supabase Secrets**

```
Supabase Dashboard → Settings → Edge Functions → Secrets
Vérifier la présence de : VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, NOTIFY_WEBHOOK_SECRET
```

- [ ] **Tester la chaîne complète**

1. **Admin push** : aller sur `/admin`, cliquer sur 🔔 → accepter la permission navigateur → vérifier dans Supabase Table Editor → `push_subscriptions` qu'une ligne existe avec ton `user_id`

2. **Client push** : créer un compte client de test → aller sur `/dashboard` → Mon profil → cliquer "Activer" → vérifier une ligne dans `push_subscriptions`

3. **Test push nouveau devis** : créer un devis depuis le calculateur → l'admin doit recevoir une notification navigateur "🖨️ Nouveau devis reçu"

4. **Test push changement statut** : depuis `/admin` → GestionDevisTab → changer le statut d'un devis client → le client doit recevoir une notification "📄 Devis disponible" (ou autre selon le statut)

5. **Test push RDV** : simuler un webhook Calendly via curl ou un vrai RDV Calendly → admin et client doivent recevoir leur notification respective

- [ ] **Push final**

```bash
git push
```
