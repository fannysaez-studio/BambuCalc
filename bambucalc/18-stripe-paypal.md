# Stripe + PayPal — Guide de mise en place

Guide pas à pas pour configurer les paiements Stripe (CB + PayPal) sur BambuCalc.

---

## État actuel

| Élément | Statut |
|---|---|
| Compte Stripe | Créé le 17/06/2026 — `fannysaez.pro@gmail.com` — **mode test** |
| Edge Function `create-payment-intent` | Déployée et fonctionnelle |
| Edge Function `stripe-webhook` | Déployée et fonctionnelle |
| Code front (`/pay/:quoteId`) | Prêt — utilise `automatic_payment_methods` |
| PayPal | À activer dans le Dashboard Stripe |

---

## Architecture paiement

```
Client clique "Payer"
    ↓
Front → supabase.functions.invoke('create-payment-intent')
    ↓
Edge Function :
  1. Vérifie JWT utilisateur
  2. Vérifie que le devis appartient à l'utilisateur
  3. Recalcule le montant depuis la BDD (anti-manipulation)
  4. Crée un PaymentIntent Stripe
  5. Retourne client_secret au front
    ↓
Front affiche le formulaire Stripe (CB, PayPal, etc.)
    ↓
Client confirme le paiement
    ↓
Stripe envoie un webhook → stripe-webhook Edge Function
    ↓
Edge Function met à jour payment_status → 'paid'
```

---

## Étape 1 — Récupérer les clés API (mode test)

1. Connecte-toi sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Vérifie que tu es en **mode test** (toggle en haut à gauche)
3. Va dans **Developers → API keys**
4. Copie :
   - **Publishable key** : `pk_test_...` (utilisée côté front)
   - **Secret key** : `sk_test_...` (utilisée côté serveur uniquement)

---

## Étape 2 — Ajouter les secrets dans Supabase

### Via le Dashboard Supabase

1. Va dans **Edge Functions → Secrets**
2. Ajoute :

| Nom | Valeur | Utilisé par |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` | `create-payment-intent` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (voir étape 4) | `stripe-webhook` |

### Via le CLI

```sh
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxx
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxx
```

Vérifier :

```sh
npx supabase secrets list
```

---

## Étape 3 — Configurer la clé publishable côté front

Dans le fichier `.env` (ou `.env.local`) :

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxx
```

---

## Étape 4 — Créer le webhook Stripe

1. Dashboard Stripe → **Developers → Webhooks**
2. Clique **Add endpoint**
3. URL : `https://upwzdctedpazranppskz.supabase.co/functions/v1/stripe-webhook`
4. Événement à écouter : `payment_intent.succeeded`
5. Copie le **Signing secret** (`whsec_...`) et ajoute-le dans Supabase Secrets (voir étape 2)

---

## Étape 5 — Activer PayPal

1. Dashboard Stripe → **Settings → Payment methods**
2. Cherche **PayPal** dans la liste
3. Clique **Turn on**
4. Connecte ton compte PayPal quand Stripe le demande
5. PayPal apparaîtra automatiquement dans le formulaire de paiement (grâce à `automatic_payment_methods: { enabled: true }`)

---

## Étape 6 — Tester le paiement

### Cartes de test Stripe

| Numéro | Résultat |
|---|---|
| `4242 4242 4242 4242` | Paiement réussi |
| `4000 0000 0000 3220` | Authentification 3D Secure requise |
| `4000 0000 0000 9995` | Paiement refusé |

- Date d'expiration : n'importe quelle date future
- CVC : n'importe quel nombre à 3 chiffres

### Flux de test

1. Crée un devis dans le calculateur
2. Clique "Payer" sur le devis
3. Utilise la carte `4242 4242 4242 4242`
4. Vérifie que le statut du devis passe à `paid`

---

## Passer en production

Quand tout fonctionne en mode test :

1. Dashboard Stripe → **Passer le compte en mode production** (vérification d'identité requise)
2. Copie les **clés live** (`sk_live_...`, `pk_live_...`)
3. Mets à jour :
   - Supabase Secrets : `STRIPE_SECRET_KEY` → `sk_live_...`
   - `.env` : `VITE_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
4. Crée un **nouveau webhook** avec l'URL de production et mets à jour `STRIPE_WEBHOOK_SECRET`
5. Redéploie les Edge Functions :

```sh
npx supabase functions deploy create-payment-intent --no-verify-jwt
npx supabase functions deploy stripe-webhook --no-verify-jwt
```

---

## Secrets nécessaires — Récapitulatif

| Secret | Où | Format |
|---|---|---|
| `STRIPE_SECRET_KEY` | Supabase Secrets | `sk_test_...` (test) / `sk_live_...` (prod) |
| `STRIPE_WEBHOOK_SECRET` | Supabase Secrets | `whsec_...` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `.env` front | `pk_test_...` (test) / `pk_live_...` (prod) |

---

## Edge Functions concernées

| Fonction | Rôle paiement |
|---|---|
| `create-payment-intent` | Crée le PaymentIntent sécurisé côté serveur |
| `stripe-webhook` | Reçoit les événements Stripe et met à jour le statut |

---

<div align="center">

**Précédent :** [← Templates emails](./17-templates-emails-supabase.md)

</div>
