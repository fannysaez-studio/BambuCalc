# Edge Functions Supabase

Les Edge Functions sont hébergées sur Supabase et tournent en **Deno** (TypeScript). Elles gèrent toute la logique backend sensible : emails, paiements, push, webhooks.

---

## Vue d'ensemble — 10 fonctions

| Fonction | Fournisseur | Déclencheur | Rôle |
|---|---|---|---|
| `send-quote-email` | Brevo | Admin "Envoyer" | Email devis client + PDF joint + copie admin |
| `send-welcome-email` | Brevo | Inscription | Email de bienvenue |
| `send-contact-email` | Resend | Formulaire contact | Email admin + confirmation visiteur |
| `create-payment-intent` | Stripe | Client paie | Crée PaymentIntent sécurisé + vérifie ownership |
| `stripe-webhook` | Stripe | Événement Stripe | Met à jour statut devis → "paid" |
| `send-push` | VAPID | Admin déclenche | Push navigateur à tous les clients abonnés |
| `notify-new-quote` | VAPID | Auto (devis créé) | Push admin quand nouveau devis |
| `notify-quote-update` | VAPID | Auto (statut changé) | Push client quand statut devis mis à jour |
| `handle-calendly-webhook` | Calendly | RDV réservé/annulé | Insert appointments + notif admin + push |
| `remind-rdv` | Brevo + VAPID | Cron / manuel 24h avant | Email + push rappel RDV |

---

## Détail par fonction

### `send-quote-email`
- **Fournisseur** : Brevo (API v3)
- **Déclencheur** : bouton "Envoyer" dans GestionDevisTab.vue
- **Ce qu'elle fait** :
  - Reçoit le devis + PDF en base64 + coordonnées client
  - Envoie un email au client avec PDF joint
  - Envoie une copie à l'admin
  - Met à jour le statut du devis → `sent`
- **Sécurité** : JWT vérifié + vérification `is_admin`

### `send-welcome-email`
- **Fournisseur** : Brevo
- **Déclencheur** : inscription d'un nouveau client
- **Ce qu'elle fait** : envoie un email de bienvenue personnalisé

### `send-contact-email`
- **Fournisseur** : Resend
- **Déclencheur** : soumission formulaire Contact.vue
- **Ce qu'elle fait** :
  - Rate limiting serveur : 3 messages max / 10 min / IP (hash SHA-256 salé, jamais l'IP en clair)
  - `htmlEscape()` sur tous les inputs (anti-XSS)
  - Email admin + email de confirmation au visiteur
- **Réponse** : `429` si limite atteinte

### `create-payment-intent`
- **Fournisseur** : Stripe
- **Déclencheur** : client sur `/pay/:quoteId`
- **Ce qu'elle fait** :
  1. Vérifie le JWT Supabase de l'appelant
  2. Vérifie que le devis appartient à l'utilisateur (`user_id = auth.uid()`)
  3. Bloque si `payment_status = 'paid'` (double paiement impossible)
  4. **Recalcule le montant depuis la BDD** (jamais depuis le body)
  5. Crée un `PaymentIntent` Stripe et retourne `client_secret`
- **Sécurité** : la `STRIPE_SECRET_KEY` ne quitte jamais le serveur Deno

### `stripe-webhook`
- **Fournisseur** : Stripe
- **Déclencheur** : événement `payment_intent.succeeded`
- **Ce qu'elle fait** :
  - Vérifie la signature cryptographique via `STRIPE_WEBHOOK_SECRET`
  - Retrouve le devis via `stripe_payment_intent_id`
  - Met à jour `payment_status → 'paid'` via `SERVICE_ROLE_KEY`
- **Note** : utilise `SERVICE_ROLE_KEY` (contourne RLS — voulu pour webhook serveur→serveur)

### `send-push`
- **Fournisseur** : Web Push VAPID (npm `web-push`)
- **Déclencheur** : admin déclenche manuellement depuis SettingsTab.vue
- **Ce qu'elle fait** :
  - Vérifie JWT + `is_admin` (401 sinon)
  - Récupère toutes les souscriptions push des clients
  - Envoie la notification push à chacun
- **Sécurité** : JWT obligatoire — les invités ne peuvent pas déclencher de push

### `notify-new-quote`
- **Fournisseur** : VAPID
- **Déclencheur** : automatique après sauvegarde d'un devis
- **Ce qu'elle fait** : push navigateur vers l'admin — "Nouveau devis reçu"

### `notify-quote-update`
- **Fournisseur** : VAPID
- **Déclencheur** : admin change le statut d'un devis
- **Ce qu'elle fait** : push navigateur vers le client propriétaire du devis

### `handle-calendly-webhook`
- **Fournisseur** : Calendly
- **Déclencheur** : événements `invitee.created` et `invitee.canceled`
- **Ce qu'elle fait** :
  - Vérifie `CALENDLY_WEBHOOK_SECRET` (paramètre URL — plan gratuit sans HMAC)
  - `invitee.created` → INSERT dans `appointments` + notification admin + push admin
  - `invitee.canceled` → UPDATE `appointments.status = 'canceled'`
  - Récupère heure/date via API Calendly si `CALENDLY_API_TOKEN` défini
- **Note** : utilise `SERVICE_ROLE_KEY` pour contourner RLS (webhook serveur Calendly)

### `remind-rdv`
- **Fournisseur** : Brevo (email) + VAPID (push)
- **Déclencheur** : à appeler via cron ou webhook 24h avant les RDV
- **Ce qu'elle fait** :
  - Cherche les RDV dans la fenêtre +23h à +25h (`status = active`, `reminder_sent = false`)
  - Pour chaque RDV : envoie push navigateur + email Brevo "Votre RDV est demain"
  - Marque `reminder_sent = true` (pas de doublon)

---

## Brevo vs Resend — pourquoi deux fournisseurs ?

| | Brevo | Resend |
|---|---|---|
| **Utilisé pour** | Devis + bienvenue + rappel RDV | Formulaire de contact |
| **Avantage clé** | Supporte les **pièces jointes** (PDF) | Simple, sandbox gratuit sans domaine |
| **Expéditeur** | Adresse admin configurée | `onboarding@resend.dev` (sandbox) |

> Pour envoyer depuis ton propre domaine avec Resend, il faut vérifier un domaine dans le dashboard Resend.

---

## Déployer une fonction

```sh
npx supabase functions deploy send-quote-email --no-verify-jwt
npx supabase functions deploy send-welcome-email --no-verify-jwt
npx supabase functions deploy send-contact-email --no-verify-jwt
npx supabase functions deploy create-payment-intent --no-verify-jwt
npx supabase functions deploy stripe-webhook --no-verify-jwt
npx supabase functions deploy send-push --no-verify-jwt
npx supabase functions deploy notify-new-quote --no-verify-jwt
npx supabase functions deploy notify-quote-update --no-verify-jwt
npx supabase functions deploy handle-calendly-webhook --no-verify-jwt
npx supabase functions deploy remind-rdv --no-verify-jwt
```

> **`--no-verify-jwt` est obligatoire** : la clé anon Supabase (`sb_publishable_*`) n'est pas un JWT signé. Sans ce flag, le déploiement échoue.

---

## Secrets à configurer

Dans **Supabase → Edge Functions → Secrets** :

```text
BREVO_API_KEY              → xkeysib-...       (send-quote-email, send-welcome-email, remind-rdv)
RESEND_API_KEY             → re_...            (send-contact-email)
STRIPE_SECRET_KEY          → sk_live_...       (create-payment-intent)
STRIPE_WEBHOOK_SECRET      → whsec_...         (stripe-webhook)
VAPID_PUBLIC_KEY           → générer via scripts/generate-vapid.mjs
VAPID_PRIVATE_KEY          → générer via scripts/generate-vapid.mjs
CALENDLY_WEBHOOK_SECRET    → token secret URL  (handle-calendly-webhook)
CALENDLY_API_TOKEN         → optionnel — token API Calendly (pour récupérer l'heure RDV)
SUPABASE_SERVICE_ROLE_KEY  → auto-injectée par Supabase
```

## Gérer les secrets

```sh
npx supabase secrets list                    # voir les secrets configurés
npx supabase secrets set CLE=valeur          # ajouter ou mettre à jour
```

---

## Fichiers partagés (`_shared/`)

| Fichier | Contenu |
|---|---|
| `cors.ts` | Headers CORS (origines autorisées : bambucalc.netlify.app + localhost) |
| `push-helpers.ts` | `getAdminSubs()`, `getClientSubsByEmail()`, `sendPushToSubs()`, `formatRdvDate()` |

---

<div align="center">

**Précédent :** [← Flux métier](./04-flux-metier.md) &nbsp;|&nbsp; **Suivant :** [Commandes →](./06-commandes.md)

</div>
