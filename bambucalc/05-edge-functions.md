# Edge Functions Supabase

Les Edge Functions sont hébergées sur Supabase et gèrent toute la logique backend sensible (emails, paiements).

## Fonctions disponibles

| Fonction                | Déclencheur      | Rôle                                     |
| ----------------------- | ---------------- | ---------------------------------------- |
| `send-quote-email`      | Admin "Envoyer"  | Email devis client (Brevo) + notif admin |
| `send-welcome-email`    | Inscription      | Email de bienvenue (Brevo)               |
| `create-payment-intent` | Client paie      | Crée un PaymentIntent Stripe sécurisé    |
| `stripe-webhook`        | Événement Stripe | Met à jour le statut du devis en base    |

---

## Déployer une fonction

```sh
npx supabase functions deploy send-quote-email --no-verify-jwt
npx supabase functions deploy send-welcome-email --no-verify-jwt
npx supabase functions deploy create-payment-intent --no-verify-jwt
npx supabase functions deploy stripe-webhook --no-verify-jwt
```

> **`--no-verify-jwt` est obligatoire** : la clé anon Supabase (`sb_publishable_*`) n'est pas un JWT signé. Sans ce flag, le déploiement échoue avec une erreur d'authentification.

---

## Gérer les secrets

```sh
npx supabase secrets list                    # voir les secrets configurés
npx supabase secrets set CLE=valeur          # ajouter ou mettre à jour un secret
```

---

<div align="center">

**Précédent :** [← Flux métier](./04-flux-metier.md) &nbsp;|&nbsp; **Suivant :** [Commandes →](./06-commandes.md)

</div>
