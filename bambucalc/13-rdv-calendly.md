# RDV & Calendly

BambuCalc intègre **Calendly** pour la prise de rendez-vous. Les données sont synchronisées en temps réel dans la BDD via webhook, et l'admin dispose d'un tableau de gestion complet.

---

## Architecture

```
Client → /rdv (BookingPage.vue) → widget Calendly embedded
  ↓
Calendly confirme le RDV
  ↓
Calendly POST webhook → Edge Function handle-calendly-webhook
  ├── Vérifie CALENDLY_WEBHOOK_SECRET
  ├── Récupère les détails via API Calendly (optionnel, si token défini)
  ├── INSERT appointments (via service_role — bypass RLS)
  ├── INSERT notifications pour tous les admins (type: 'rdv_booked')
  └── Push navigateur admin
```

---

## Page de réservation `/rdv` (BookingPage.vue)

La page utilise un **stepper 3 étapes** :

| Étape | Contenu |
|---|---|
| **Étape 1** | Présentation du service, tarif, ribbon "OFFERT", liste des avantages |
| **Étape 2** | Widget Calendly embedded (pleine largeur) |
| **Étape 3** | Confirmation post-réservation + bouton retour accueil |

**Design** :
- Backdrop teal animé
- Layout 2 colonnes en paysage (desktop)
- Preview card avec ribbon "OFFERT"
- Transition entre étapes fluide

---

## Webhook Calendly

### Sécurisation (plan gratuit)

Le plan gratuit Calendly ne supporte pas la signature HMAC. La sécurité est assurée par un **token secret dans l'URL du webhook** :

```
https://xxxx.supabase.co/functions/v1/handle-calendly-webhook?secret=TOKEN_SECRET
```

Le `TOKEN_SECRET` est configuré dans :
- `CALENDLY_WEBHOOK_SECRET` (secret Supabase Edge Function)
- URL du webhook dans le dashboard Calendly

### Événements gérés

| Événement Calendly | Action BDD |
|---|---|
| `invitee.created` | INSERT `appointments` |
| `invitee.canceled` | UPDATE `appointments.status = 'canceled'` |

### Idempotence

La colonne `calendly_event_id` est `UNIQUE`. Si le webhook est reçu deux fois (retry Calendly), l'INSERT échoue silencieusement sans doublon.

---

## Tableau admin — `RdvTab.vue`

### Filtres

| Filtre | Contenu |
|---|---|
| À venir | `status = active` ET `start_at > now()` |
| Passés | `status = active` ET `start_at < now()` |
| Annulés | `status = canceled` |
| Tous | Tous |

### Colonnes

| Colonne | Détail |
|---|---|
| Checkbox | Sélection multiple pour bulk delete |
| Date & Heure | Date formatée + heure en teal |
| Client | Nom + durée du RDV |
| Email | Lien cliquable → onglet Clients si client connu |
| Devis lié | `<select>` des devis du client filtré par email → `saveLinkedQuote()` → UPDATE `linked_quote_id` |
| Objet | Extrait du `event_name` ou `raw.name` |
| Format | Select LED : En ligne (bleu) / Extérieur (vert) |
| Présence | Select LED : À confirmer (gris/clignotant) / Présent (vert) / Absent (rouge) |
| Note admin | Input inline, sauvegardé au blur |
| Actions | Éditer note, Annuler, Supprimer |

### LED de statut (Format & Présence)

```css
led-glow--online   : bleu  — En ligne
led-glow--inperson : vert  — Extérieur
led-glow--unknown  : gris clignotant — À confirmer
led-glow--present  : vert  — Présent(e)
led-glow--absent   : rouge — Absent(e)
```

Les LED sont composites (GPU) — animation `led-blink` sur `opacity` uniquement.

### Actions admin

| Action | Mécanisme |
|---|---|
| Modifier Format/Présence | `v-model` sur le select → `saveFormat(a)` / `savePresence(a)` → UPDATE Supabase |
| Modifier note | Input blur → `saveNote(a, val)` → UPDATE Supabase |
| Annuler un RDV | Modale confirmation → Edge Function `admin-appointments` (action: 'cancel') |
| Supprimer un RDV | Modale confirmation → Edge Function `admin-appointments` (action: 'delete') |
| Bulk delete | Sélection multiple → supprimer plusieurs en une fois |

### Broadcast Realtime

RdvTab utilise un canal broadcast pour la synchronisation multi-onglets :

```js
broadcastChannel = supabase.channel('admin-appointments-bus').subscribe()
// Après chaque action → broadcastChannel.send({ type: 'broadcast', event: 'appointments-changed' })
```

---

## Edge Function `admin-appointments`

Sécurisée par JWT. Actions disponibles :
- `cancel` → UPDATE `status = 'canceled'`
- `delete` → DELETE l'enregistrement

Après chaque action : broadcast sur le canal Realtime pour synchroniser les autres onglets admin ouverts.

---

## Rappel automatique 24h avant — `remind-rdv`

```
Déclencheur : cron ou appel manuel
  → Fenêtre : RDV dans +23h à +25h, status=active, reminder_sent=false
  → Pour chaque RDV trouvé :
      ├── Push navigateur (via push_subscriptions par email client)
      ├── Email Brevo "Votre RDV est demain"
      └── PATCH appointments.reminder_sent = true
```

### Configurer le cron

À faire via Supabase Dashboard → Edge Functions → Schedule, ou via un service externe :

```
POST https://xxxx.supabase.co/functions/v1/remind-rdv
(toutes les heures par exemple)
```

---

## Dashboard client — onglet "Mes rendez-vous"

Les clients voient leurs propres RDV grâce à la RLS :
```sql
WHERE invitee_email = auth.email()
```

Affichage :
- Même structure de filtres (À venir / Passés / Annulés / Tous)
- Colonne **Devis lié** : `<select>` des propres devis du client → `saveLinkedQuote()` → UPDATE `linked_quote_id`
- Lecture seule pour les autres colonnes — le client ne peut pas modifier ses RDV
- Lien CalendarPanel dans le hero bar pour réserver un nouveau RDV

---

## `CalendarPanel.vue` — Bouton "Prendre RDV"

Disponible dans la navigation globale :
- **Desktop** : bouton pill "Prendre RDV" → panel flottant avec informations
- **Mobile** : bottom sheet avec handle, bouton "Nouveau RDV" en outline teal

Ce composant n'est affiché qu'aux clients authentifiés non-admin.

---

<div align="center">

**Précédent :** [← Notifications & Push](./12-notifications-push.md) &nbsp;|&nbsp; **Suivant :** [SEO & Méta →](./14-seo-meta.md)

</div>
