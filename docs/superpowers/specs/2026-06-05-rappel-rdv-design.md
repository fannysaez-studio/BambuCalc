# Rappel RDV automatique 24h avant — Design

## Contexte

BambuCalc gère des rendez-vous Calendly stockés dans la table `appointments`. Les clients doivent recevoir un rappel automatique 24h avant leur RDV par push notification ET par email.

## Architecture

### Déclenchement

- **Supabase Scheduled Function** — Edge Function `remind-rdv` planifiée avec cron `0 * * * *` (toutes les heures)
- Aucun service externe, tout reste dans Supabase

### Flux d'exécution

1. La fonction interroge `appointments` : `start_at BETWEEN now()+23h AND now()+25h`, `status = 'active'`, `reminder_sent = false`
2. Pour chaque RDV trouvé :
   a. Lookup push subscription via `getClientSubsByEmail(invitee_email)`
   b. Si subscription trouvée → push notification via `webpush.sendNotification()`
   c. Envoi email de rappel via `Resend` (même pattern que les emails existants)
   d. Marque `reminder_sent = true` dans la DB
3. Retourne `{ sent: N }` dans les logs

### Déduplication

Colonne `reminder_sent boolean DEFAULT false` sur `appointments`. Mise à jour après envoi, même si push ou email échoue partiellement — évite le re-spam.

## Composants à créer/modifier

### 1. Migration SQL
**Fichier** : `supabase/migrations/20260605000001_appointments_reminder_sent.sql`
```sql
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false;
```

### 2. Edge Function `remind-rdv`
**Fichier** : `supabase/functions/remind-rdv/index.ts`

- Secrets requis : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `BREVO_API_KEY`
- Utilise les helpers existants : `getClientSubsByEmail`, `sendPushToSubs`, `formatRdvDate` depuis `_shared/push-helpers.ts`
- Pas de vérification JWT (fonction interne, appelée par le scheduler)

### 3. Configuration Scheduler
Dans Supabase Dashboard → Edge Functions → `remind-rdv` → Schedule :
- Cron : `0 * * * *` (toutes les heures)

## Contenu des notifications

### Push
```json
{
  "title": "⏰ Rappel rendez-vous",
  "body": "Votre RDV est demain à 14h30",
  "url": "/dashboard"
}
```

### Email
- **Sujet** : `⏰ Rappel — Votre rendez-vous BambuCalc est demain`
- **Contenu** : date/heure formatée en français, nom de l'événement, bouton "Voir mon tableau de bord" → `/dashboard`
- **Format** : HTML inline, même style que les emails existants (fond blanc, bouton teal)

## Gestion des erreurs

| Cas | Comportement |
|-----|-------------|
| Pas de push subscription | Skip push, email suffit |
| Pas d'email (invitee_email vide) | Log + skip |
| Push échoue (410 expired) | Supprime la subscription, continue |
| Email échoue | Log l'erreur, continue |
| Erreur Supabase (update reminder_sent) | Log, ne bloque pas |
| Crash complet de la fonction | Scheduler relance à h+1, fenêtre 2h évite les doublons |

## Ce qui n'est pas dans le scope

- Rappel pour l'admin (pas nécessaire, c'est lui qui gère le calendrier)
- Rappel par SMS
- Personnalisation du délai (toujours 24h)
- Interface admin pour voir les rappels envoyés
