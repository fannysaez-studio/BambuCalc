# Notifications & Push

BambuCalc dispose de deux systèmes de notification indépendants qui se complètent :

1. **Notifications in-app** — via Supabase Realtime (persistées en BDD)
2. **Web Push VAPID** — notifications navigateur (même onglet fermé)

---

## 1. Notifications in-app (Realtime)

### Architecture

```
Action métier (devis, RDV)
  → Trigger PostgreSQL SECURITY DEFINER
      → INSERT dans table notifications
          → Supabase Realtime (canal postgres_changes)
              → NotificationBell.vue mis à jour en temps réel
```

### Types de notifications

| Type | Destinataire | Déclencheur |
|---|---|---|
| `new_quote` | Tous les admins | Client crée ou sauvegarde un devis |
| `status_changed` | Client propriétaire | Admin change le statut du devis |
| `quote_modified` | Client propriétaire | Admin modifie le devis (hors statut) |
| `rdv_booked` | Tous les admins | Nouveau RDV Calendly reçu |

### Composant `NotificationBell.vue`

**Desktop** : panel flottant (dropdown) ancré sous la cloche  
**Mobile** (≤640px) : bottom sheet avec handle, animation slide-up

Fonctionnalités :
- Badge de comptage (non lues) — `9+` si > 9
- Marquer une notification comme lue (clic sur l'item)
- "✓ Tout lire" — marque toutes lues en une fois
- "Tout supprimer" — supprime toutes les notifications
- Icônes différenciées par type :
  - `FileText` — nouveau devis
  - `CheckCircle` — changement de statut
  - `Pencil` — modification devis
  - `Calendar` — RDV réservé
- Temps relatif affiché ("il y a 2 min", "hier")
- Fermeture au clic en dehors (click outside)

### Realtime — abonnement

```js
// useAdminRealtime.js / useClientRealtime.js
supabase
  .channel('notifications-changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    // Ajouter la notif en tête de liste
    notifications.value.unshift(payload.new)
  })
  .subscribe()
```

---

## 2. Web Push VAPID

### Principe

Les Web Push ne nécessitent pas que l'application soit ouverte — le navigateur reçoit la notification même si l'onglet est fermé (tant que le service worker est actif).

### Stack technique

- **Côté client** : API Web Push standard (`PushManager.subscribe`) + service worker (`sw.js`)
- **Côté serveur** : npm `web-push` dans les Edge Functions Deno
- **Authentification** : clés VAPID (paire publique/privée) générées une fois via `scripts/generate-vapid.mjs`

### Flux d'abonnement (client)

```
Utilisateur ouvre Dashboard.vue → onglet "Mon profil"
  → usePushNotifications() composable
  → Vérifie Notification.permission
  → Si 'default' : affiche bouton "Activer les notifications"
  → Clic → navigator.serviceWorker.ready
           → PushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID_PUBLIC_KEY })
           → INSERT push_subscriptions (endpoint, p256dh, auth_key)
           → Badge disparaît de l'onglet profil
```

### Désabonnement

```
Bouton "Désactiver" → PushManager.unsubscribe()
  → DELETE push_subscriptions WHERE endpoint = ...
```

### Envoi d'un push (depuis une Edge Function)

```typescript
// _shared/push-helpers.ts
webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

await webpush.sendNotification(
  { endpoint, keys: { p256dh, auth } },
  JSON.stringify({ title: '...', body: '...', url: '/dashboard' })
)
```

### Qui reçoit quoi

| Événement | Push envoyé à | Edge Function |
|---|---|---|
| Client crée un devis | Admin (toutes ses souscriptions) | `notify-new-quote` |
| Admin change statut devis | Client propriétaire (si abonné) | `notify-quote-update` |
| RDV Calendly réservé | Admin (toutes ses souscriptions) | `handle-calendly-webhook` |
| 24h avant un RDV | Client invitee (si abonné) | `remind-rdv` |
| Admin envoie push manuel | Tous les clients abonnés | `send-push` |

### Service Worker (`public/sw.js`)

Gère :
- La réception des messages push
- L'affichage de la notification système
- Le clic sur la notification → ouverture de l'URL dans l'onglet

---

## Combinaison des deux systèmes

| Cas | Notif in-app | Push navigateur |
|---|---|---|
| Admin a l'app ouverte | ✅ Realtime immédiat | ✅ (si abonné) |
| Admin a l'app fermée | Visible à la prochaine ouverture | ✅ Push reçu même fermé |
| Client a l'app ouverte | ✅ Realtime immédiat | ✅ (si abonné) |
| Client a l'app fermée | Visible à la prochaine ouverture | ✅ Push reçu même fermé |

Les notifications in-app et les push sont **indépendantes** — une notif in-app est persistée en BDD même si le push échoue.

---

<div align="center">

**Précédent :** [← Rôles & Sécurité](./11-roles-securite.md) &nbsp;|&nbsp; **Suivant :** [RDV & Calendly →](./13-rdv-calendly.md)

</div>
