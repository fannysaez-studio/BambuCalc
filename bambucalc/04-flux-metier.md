# Flux métier

## Création d'un devis

```text
Calculateur (5 étapes) → saveQuote() → Supabase (quotes)
→ Devis visible Dashboard client + Admin
```

Les 5 étapes du calculateur : **Projet** → **Matière** → **Temps** → **Tarifs** → **Coûts**

---

## Envoi par l'admin

```text
Admin → "Gestion Devis" → bouton "Envoyer"
→ Modal prévisualisation → Edge Function send-quote-email (Brevo)
   ├── Email CLIENT : devis + PDF joint
   └── Email ADMIN  : notification
→ Statut devis → "sent"
```

---

## Paiement

Le client choisit son mode dans le formulaire (étape coordonnées) :

| Méthode                        | Traitement                                                        |
| ------------------------------ | ----------------------------------------------------------------- |
| Carte / Apple Pay / Google Pay | Automatisé via Stripe Payment Element + webhook                   |
| PayPal                         | Préférence enregistrée — admin envoie un lien PayPal manuellement |
| Virement / Chèque / Espèces    | Hors-ligne — suivi manuel                                         |

### Flux Stripe

```text
Admin ajoute un lien de paiement dans "Gestion Devis"
→ Client reçoit le lien → PaymentView (Stripe Payment Element)
→ Webhook Stripe → Edge Function stripe-webhook
→ Statut devis → "paid"
```

> Le **Stripe Payment Element** (`layout: 'tabs'`) affiche automatiquement toutes les méthodes activées dans le Stripe Dashboard (dont PayPal si activé côté Stripe).

---

## Variables email personnalisables

Dans l'onglet **Emails** du dashboard admin :

| Variable        | Remplacée par       |
| --------------- | ------------------- |
| `[client]`      | Prénom du client    |
| `[client_nom]`  | Civilité + nom      |
| `[numéro]`      | Numéro de devis     |
| `[projet]`      | Nom de la pièce     |
| `[total]`       | Montant TTC         |

---

<div align="center">

**Précédent :** [← Structure du projet](./03-structure.md) &nbsp;|&nbsp; **Suivant :** [Edge Functions →](./05-edge-functions.md)

</div>
