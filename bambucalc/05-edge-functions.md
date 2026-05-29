# Edge Functions Supabase

Les Edge Functions sont hébergées sur Supabase et gèrent toute la logique backend sensible (emails, paiements, push).

## Fonctions disponibles

| Fonction                | Fournisseur | Déclencheur        | Rôle                                        |
| ----------------------- | ----------- | ------------------ | ------------------------------------------- |
| `send-quote-email`      | Brevo       | Admin "Envoyer"    | Email devis client + notification admin     |
| `send-welcome-email`    | Brevo       | Inscription        | Email de bienvenue                          |
| `send-contact-email`    | Resend      | Formulaire contact | Email admin + confirmation visiteur         |
| `create-payment-intent` | Stripe      | Client paie        | Crée un PaymentIntent sécurisé              |
| `stripe-webhook`        | Stripe      | Événement Stripe   | Met à jour le statut du devis en base       |
| `send-push`             | VAPID       | Admin déclenche    | Notification push navigateur (admin)        |

---

## Brevo vs Resend — pourquoi deux fournisseurs ?

| | Brevo | Resend |
| --- | --- | --- |
| **Utilisé pour** | Devis client + bienvenue | Formulaire de contact |
| **Raison** | Supporte les **pièces jointes** (PDF du devis) | Simple à mettre en place, pas de domaine requis |
| **Expéditeur** | Ton adresse admin | `onboarding@resend.dev` (sandbox gratuit) |
| **Destinataire** | Client + toi (admin) | Toi (admin) + confirmation au visiteur |

> **À noter** : Resend envoie depuis `onboarding@resend.dev` (adresse sandbox Resend).
> Pour envoyer depuis ton propre domaine, il faudra vérifier un domaine dans le dashboard Resend — à faire dès que tu as un domaine pro.

---

## Déployer une fonction

```sh
npx supabase functions deploy send-quote-email --no-verify-jwt
npx supabase functions deploy send-welcome-email --no-verify-jwt
npx supabase functions deploy send-contact-email --no-verify-jwt
npx supabase functions deploy create-payment-intent --no-verify-jwt
npx supabase functions deploy stripe-webhook --no-verify-jwt
npx supabase functions deploy send-push --no-verify-jwt
```

> **`--no-verify-jwt` est obligatoire** : la clé anon Supabase (`sb_publishable_*`) n'est pas un JWT signé. Sans ce flag, le déploiement échoue avec une erreur d'authentification.

---

## Secrets à configurer

Dans **Supabase → Edge Functions → Secrets** :

```text
BREVO_API_KEY              → xkeysib-...          (send-quote-email, send-welcome-email)
RESEND_API_KEY             → re_...               (send-contact-email)
STRIPE_SECRET_KEY          → sk_live_...          (create-payment-intent)
STRIPE_WEBHOOK_SECRET      → whsec_...            (stripe-webhook)
VAPID_PUBLIC_KEY           → générer via scripts/generate-vapid.mjs
VAPID_PRIVATE_KEY          → générer via scripts/generate-vapid.mjs
SUPABASE_SERVICE_ROLE_KEY  → auto-injectée
```

## Gérer les secrets

```sh
npx supabase secrets list                    # voir les secrets configurés
npx supabase secrets set CLE=valeur          # ajouter ou mettre à jour un secret
```

---

<div align="center">

**Précédent :** [← Flux métier](./04-flux-metier.md) &nbsp;|&nbsp; **Suivant :** [Commandes →](./06-commandes.md)

</div>
