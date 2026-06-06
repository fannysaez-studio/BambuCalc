# Flux métier

## 1. Calculateur → Devis

Le calculateur fonctionne en **5 étapes progressives** (accordéon) avec stepper horizontal.

```
Étape 1 — Projet   : nom du projet, imprimante (P2S Combo/X1C/A1 Mini/A1), profil (Normal/Qualité/Vitesse/Silencieux), buse
Étape 2 — Matière  : filament (PLA/PETG/ASA/TPU…), coût/kg, poids en grammes
Étape 3 — Temps    : durée impression (h:min), temps de travail (min)
Étape 4 — Tarifs   : marge Standard (50%) / Compétitif (30%) / Premium (80%) / Personnalisé
Étape 5 — Coûts    : récapitulatif TTC complet (matière + machine + travail + packaging + TVA)
```

### Formule de calcul (Calculator.vue:216-225)

```
coût matière      = (poids_g / 1000) × coût_par_kg
coût machine      = heures_impression × 5 €/h
coût travail      = (minutes_travail / 60) × 15 €/h
coût packaging    = saisi manuellement
sous-total        = matière + machine + travail + packaging
TVA               = sous-total × taux_TVA / 100
total TTC         = sous-total + TVA
```

### Sauvegarde du devis

```
Bouton "Sauvegarder" → saveQuote() (utils/quotes.js)
  → INSERT dans Supabase quotes (snapshot des coûts calculés)
  → Trigger BDD on_quote_insert
      → INSERT notifications pour chaque admin (type: 'new_quote')
      → Realtime broadcast → NotificationBell admin se met à jour
```

### Mode invité

Les visiteurs non connectés peuvent utiliser le calculateur et sauvegarder des devis via une **session anonyme Supabase**. Un bandeau les invite à lier leur email pour conserver leurs données.

---

## 2. Gestion des devis (Admin)

Le dashboard admin propose 3 vues devis :

| Onglet | Contenu |
|---|---|
| **Gestion Devis** | Actions : envoyer email, changer statut, ajouter lien paiement |
| **Tous les devis** | Vue lecture — tous les devis de tous les clients |
| **Archives** | Devis archivés |

### Statuts d'un devis

```
pending   → sent → accepted → paid
                ↘ refused
                ↘ archived
```

### Envoi par l'admin

```
Admin → "Gestion Devis" → bouton "Envoyer"
  → Modal prévisualisation (QuotePreviewModal.vue)
  → Appel Edge Function send-quote-email (Brevo)
      ├── Email CLIENT : devis PDF joint + message personnalisé
      └── Email ADMIN  : copie de notification
  → Statut devis → "sent"
  → Trigger on_quote_update → notification client (type: 'status_changed')
  → Push navigateur client (Edge Function notify-quote-update)
```

### Variables email personnalisables (onglet Emails admin)

| Variable | Remplacée par |
|---|---|
| `[client]` | Prénom du client |
| `[client_nom]` | Civilité + nom |
| `[numéro]` | Numéro de devis |
| `[projet]` | Nom de la pièce |
| `[total]` | Montant TTC |

---

## 3. Paiement Stripe

```
Admin ajoute un lien paiement dans "Gestion Devis"
  → Client reçoit le lien → /pay/:quoteId (PaymentView.vue)
  → PaymentView appelle create-payment-intent (Edge Function)
      ├── Vérifie JWT (auth)
      ├── Vérifie ownership du devis (user_id = auth.uid())
      ├── Recalcule le montant depuis la BDD (jamais depuis le body)
      └── Retourne client_secret Stripe
  → Stripe Payment Element s'affiche (layout tabs)
      → Carte, Apple Pay, Google Pay, PayPal (si activé côté Stripe)
  → Après paiement → webhook Stripe → Edge Function stripe-webhook
      → Vérifie signature cryptographique STRIPE_WEBHOOK_SECRET
      → Met à jour payment_status → "paid" via SERVICE_ROLE_KEY
```

### Modes de paiement hors-ligne

| Méthode | Traitement |
|---|---|
| Virement | Hors-ligne — admin note la préférence, envoie son RIB manuellement |
| Chèque | Hors-ligne — suivi manuel |
| Espèces | Hors-ligne — suivi manuel |

---

## 4. Rendez-vous Calendly

```
Client → /rdv (BookingPage.vue) → Stepper 1→2→3
  → Étape 1 : info & tarif (ribbon "OFFERT")
  → Étape 2 : widget Calendly embedded
  → Étape 3 : confirmation + redirect → /

Côté serveur (en temps réel) :
  Calendly POST webhook → Edge Function handle-calendly-webhook
    ├── Vérifie CALENDLY_WEBHOOK_SECRET (paramètre URL)
    ├── invitee.created → INSERT dans appointments
    │     ├── Notif admin (type: 'rdv_booked') dans notifications
    │     └── Push navigateur admin
    └── invitee.canceled → UPDATE appointments.status = 'canceled'
```

### Rappel automatique 24h avant

```
remind-rdv (Edge Function — à déclencher via cron ou webhook)
  → Requête appointments WHERE start_at BETWEEN +23h ET +25h
                            AND status = 'active'
                            AND reminder_sent = false
  → Pour chaque RDV :
      ├── Push navigateur au client (via push_subscriptions)
      ├── Email Brevo "Votre RDV est demain"
      └── PATCH appointments.reminder_sent = true
```

---

## 5. Notifications in-app (Realtime)

### Déclencheurs automatiques (triggers PostgreSQL)

| Trigger | Événement | Destinataire | Type |
|---|---|---|---|
| `on_quote_insert` | Nouveau devis créé | Tous les admins | `new_quote` |
| `on_quote_update` | Statut changé par admin | Client propriétaire | `status_changed` |
| `on_quote_update` | Devis modifié par admin | Client propriétaire | `quote_modified` |
| (handle-calendly) | RDV réservé | Tous les admins | `rdv_booked` |

### Flux Realtime

```
Trigger BDD → INSERT notifications
  → Supabase Realtime broadcast (canal postgres_changes)
  → NotificationBell.vue reçoit l'événement
  → Badge mis à jour en temps réel (sans rechargement)
```

### Interface NotificationBell

- **Desktop** : panel flottant (dropdown)
- **Mobile** : bottom sheet (slide depuis le bas)
- Actions : marquer lu, tout marquer lu, supprimer, tout supprimer
- Icônes différenciées : FileText (nouveau devis), CheckCircle (statut), Pencil (modification), Calendar (RDV)

---

## 6. Notifications Push (Web Push VAPID)

```
Client s'abonne (Dashboard.vue → usePushNotifications)
  → navigator.serviceWorker + PushManager.subscribe(VAPID_PUBLIC_KEY)
  → INSERT push_subscriptions (endpoint, p256dh, auth_key)

Admin envoie une notif push :
  → Appel Edge Function send-push (JWT obligatoire)
  → Vérifie que l'appelant est admin (table admins)
  → Envoie push à tous les clients abonnés via web-push (npm)

Automatique (via Edge Functions) :
  → notify-new-quote : push admin quand un client sauvegarde un devis
  → handle-calendly-webhook : push admin quand un RDV est réservé
  → remind-rdv : push client 24h avant son RDV
```

---

## 7. Formulaire de contact

```
Contact.vue → captcha math (A + B = ?) côté frontend
  → POST send-contact-email (Resend)
      ├── Rate limiting serveur : 3 messages max / 10 min / IP (hash SHA-256)
      ├── htmlEscape() sur tous les inputs (anti-XSS)
      └── Email admin + confirmation visiteur
```

---

<div align="center">

**Précédent :** [← Structure du projet](./03-structure.md) &nbsp;|&nbsp; **Suivant :** [Edge Functions →](./05-edge-functions.md)

</div>
