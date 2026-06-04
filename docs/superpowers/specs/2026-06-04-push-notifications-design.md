# Push Notifications — Design Spec
Date : 2026-06-04

## Contexte

BambuCalc dispose déjà d'une infrastructure push partielle :
- `usePushNotifications.js` — composable d'abonnement (VAPID, ServiceWorker)
- `sw.js` — service worker qui reçoit les push et les affiche
- `send-push` — Edge Function manuelle (envoi admin)
- `notify-new-quote` — Edge Function déclenchée sur INSERT quotes (envoi à TOUS les abonnés, bug : devrait être admins uniquement)
- `handle-calendly-webhook` — traite les RDV Calendly mais n'envoie aucun push

**Ce qui manque :**
- Bouton d'abonnement push pour l'admin (code importé mais bouton absent du template)
- Bouton d'abonnement push pour les clients (absent du dashboard client)
- Push automatique lors d'un nouveau RDV (admin + client)
- Push automatique lors d'un changement de statut de devis (client uniquement)
- Filtre admin-only sur `notify-new-quote`

---

## Architecture

```
Calendly webhook
      │
      ▼
handle-calendly-webhook  ──► push admin (admins table → push_subscriptions)
      │                  ──► push client (invitee_email → profiles → push_subscriptions)

quotes INSERT webhook
      │
      ▼
notify-new-quote (modif)  ──► push admin uniquement

quotes UPDATE webhook (nouveau)
      │
      ▼
notify-quote-update (nouveau)  ──► push client (quote.user_id → push_subscriptions)

Frontend
  AdminDashboard hero    ──► bouton Bell/BellOff (CSS existant)
  Dashboard "Mon profil" ──► bouton push + badge pulsant sur le tab
```

### Résolution des abonnements

| Destinataire | Requête |
|---|---|
| Admins | `push_subscriptions` WHERE `user_id` IN `admins.user_id` |
| Client devis | `push_subscriptions` WHERE `user_id = quotes.user_id` |
| Client RDV | `profiles` WHERE `email = invitee_email` → `user_id` → `push_subscriptions` |

---

## Messages des notifications

| Événement | Destinataire | Titre | Corps | URL |
|---|---|---|---|---|
| Nouveau RDV | Admin | 📅 Nouveau rendez-vous | "{nom} — {date heure}" | /admin |
| Nouveau RDV | Client | ✅ RDV confirmé | "Votre rendez-vous du {date} est enregistré" | /dashboard |
| Devis `pending` | Client | ⏳ Devis en cours d'examen | "Votre devis #{num} est en cours d'examen" | /dashboard |
| Devis `sent` | Client | 📄 Devis disponible | "Votre devis #{num} est prêt à consulter" | /dashboard |
| Devis `accepted` | Client | ✅ Devis accepté | "Votre devis #{num} a été accepté" | /dashboard |
| Devis `refused` | Client | ❌ Devis refusé | "Votre devis #{num} a été refusé" | /dashboard |

---

## Changements frontend

### AdminDashboard.vue
- Re-ajouter le bouton push dans `.admin-hero-actions` (le CSS `.btn-push-toggle` existe déjà dans `admin-dashboard.css`)
- Icône Bell si non abonné, BellOff si abonné
- Désactivé si `!pushSupported` ou `pushPermission === 'denied'`
- Variables déjà importées : `pushSupported`, `isSubscribed`, `subscribePush`, `unsubscribePush`, `pushLoading`, `pushPermission`

### Dashboard.vue (client)
- Importer `usePushNotifications` + `onMounted`
- Appeler `push.init()` au montage
- Dans l'onglet "Mon profil", section Sécurité : ajouter un bloc push avec bouton Activer/Désactiver
- Badge pulsant teal sur le tab "Mon profil" quand `push.isSupported && !push.isSubscribed`
- Message d'aide si permission refusée par le navigateur

---

## Edge Functions

### 1. `handle-calendly-webhook` — modification

Après l'upsert appointments, sur `invitee.created` :

```
// Helpers partagés
async function getAdminSubs(supabaseUrl, serviceKey)
  → fetch admins, puis push_subscriptions filtrées par ces user_ids

async function getClientSubsByEmail(email, supabaseUrl, serviceKey)
  → fetch profiles WHERE email=invitee_email
  → si trouvé : fetch push_subscriptions WHERE user_id=profile.user_id

async function sendPushToSubs(subs, payload, webpush, supabaseUrl, serviceKey)
  → boucle webpush.sendNotification, supprime sub 410

// Envoi
1. getAdminSubs → sendPush "📅 Nouveau rendez-vous — {nom} le {date}"
2. getClientSubsByEmail(invitee_email) → sendPush "✅ RDV confirmé"
```

Sur `invitee.canceled` : pas de push (annulation gérée visuellement dans RdvTab).

### 2. `notify-new-quote` — modification

Remplacer `fetch toutes les push_subscriptions` par `getAdminSubs` (même logique que ci-dessus).

### 3. `notify-quote-update` — nouveau fichier

Déclenché par Database Webhook sur `quotes` UPDATE.

```
Sécurité : x-webhook-secret (même pattern que notify-new-quote)
Payload   : { type: 'UPDATE', record: { id, quote_number, status, user_id, project_name } }

Logique :
1. Vérifier type === 'UPDATE' et record.status présent
2. Construire titre + corps selon status (pending/sent/accepted/refused)
3. Skip si user_id est null (devis invité anonyme, pas d'abonnement possible)
4. fetch push_subscriptions WHERE user_id = record.user_id
5. sendPushToSubs avec url = '/dashboard'
```

### Helpers partagés

Les fonctions `getAdminSubs`, `getClientSubsByEmail`, `sendPushToSubs` sont extraites dans `_shared/push-helpers.ts` pour éviter la duplication entre `handle-calendly-webhook` et `notify-new-quote`.

---

## Configuration Supabase requise (manuel)

Après déploiement des Edge Functions :

1. **Database Webhook `quotes` UPDATE** :
   - Table : `quotes`, Event : `UPDATE`
   - URL : `{SUPABASE_URL}/functions/v1/notify-quote-update`
   - Header : `x-webhook-secret: {NOTIFY_WEBHOOK_SECRET}`

2. **Secret `NOTIFY_WEBHOOK_SECRET`** doit exister dans Supabase Secrets (déjà utilisé par `notify-new-quote`).

3. **REPLICA IDENTITY** : pas nécessaire pour ce cas (on lit uniquement `record`, pas `old_record`).

---

## Périmètre exclu (pour plus tard)

- Push admin quand client accepte/refuse via Stripe (`status = accepted` déclenché côté paiement)
- Notification SMS ou email en fallback si push refusé
