# Notification Bell — Cloche de notifications BambuCalc

**Date :** 2026-05-31
**Statut :** Approuvé

---

## Objectif

Ajouter une cloche de notifications dans la nav (GlobalNav.vue) pour l'admin et les clients/invités. Les notifications sont persistantes (stockées en BDD), déclenchées par des triggers Postgres, et apparaissent en temps réel via Supabase Realtime.

---

## Contexte technique

- Table `admins` existante avec `user_id` — utilisée par les triggers pour identifier l'admin
- Fonction RPC `is_admin()` existante — utilisée côté client pour l'affichage conditionnel
- `GlobalNav.vue` en `<script setup>` (migré ce jour) — prêt à recevoir le composant
- Supabase CLI lié au projet `bambucalc` (`upwzdctedpazranppskz`)

---

## 1. Base de données

### Table `notifications`

```sql
CREATE TABLE notifications (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type       text NOT NULL CHECK (type IN ('new_quote', 'status_changed', 'quote_modified')),
  title      text NOT NULL,
  message    text,
  quote_id   uuid REFERENCES quotes(id) ON DELETE CASCADE,
  read       boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
```

### RLS

```sql
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Lecture : ses propres notifs uniquement
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Mise à jour (marquer comme lu) : ses propres notifs
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Suppression : ses propres notifs
CREATE POLICY "notifications_delete_own"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());
```

Pas de politique INSERT côté client — les triggers s'exécutent en `SECURITY DEFINER` et contournent le RLS.

### Realtime

Activer Realtime sur la table `notifications` dans Supabase Dashboard → Database → Replication.

---

## 2. Triggers Postgres

### Trigger 1 — Nouveau devis (INSERT)

Notifie tous les admins quand un devis est créé.

```sql
CREATE OR REPLACE FUNCTION trigger_notify_new_quote()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  admin_row RECORD;
BEGIN
  FOR admin_row IN SELECT user_id FROM admins LOOP
    INSERT INTO notifications (user_id, type, title, message, quote_id)
    VALUES (
      admin_row.user_id,
      'new_quote',
      'Nouveau devis reçu',
      COALESCE(NEW.project_name, 'Sans nom') || ' — ' || COALESCE(NEW.material, ''),
      NEW.id
    );
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_quote_insert
  AFTER INSERT ON quotes
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_new_quote();
```

### Trigger 2 — Devis modifié (UPDATE)

Notifie le client/invité quand l'admin change le statut ou modifie le devis.

```sql
CREATE OR REPLACE FUNCTION trigger_notify_quote_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  modifier_id uuid;
  status_label text;
BEGIN
  modifier_id := auth.uid();

  -- Changement de statut → notif client
  IF OLD.status IS DISTINCT FROM NEW.status AND modifier_id IS DISTINCT FROM NEW.user_id THEN
    status_label := CASE NEW.status
      WHEN 'accepted' THEN 'Accepté ✓'
      WHEN 'refused'  THEN 'Refusé'
      WHEN 'sent'     THEN 'Envoyé'
      ELSE NEW.status
    END;
    INSERT INTO notifications (user_id, type, title, message, quote_id)
    VALUES (
      NEW.user_id,
      'status_changed',
      'Statut de votre devis mis à jour',
      COALESCE(NEW.quote_number, 'Votre devis') || ' est maintenant : ' || status_label,
      NEW.id
    );
  END IF;

  -- Modification par l'admin (pas un changement de statut) → notif client
  IF OLD.status IS NOT DISTINCT FROM NEW.status
    AND modifier_id IS DISTINCT FROM NEW.user_id
    AND modifier_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, quote_id)
    VALUES (
      NEW.user_id,
      'quote_modified',
      'Votre devis a été modifié',
      COALESCE(NEW.quote_number, 'Votre devis') || ' a été mis à jour par le prestataire.',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_quote_update
  AFTER UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION trigger_notify_quote_update();
```

---

## 3. Composant `NotificationBell.vue`

**Fichier :** `src/components/ui/NotificationBell.vue`

`<script setup>` autonome — gère ses propres données et Realtime.

### State
- `notifications` — ref([]) — liste complète
- `open` — ref(false) — dropdown ouvert/fermé
- `bell` — ref(null) — ref DOM pour détecter clic extérieur

### Computed
- `unreadCount` — nombre de notifications non lues (badge rouge)

### Lifecycle
- Setup : `loadNotifications()` puis `setupRealtime()`
- `onUnmounted` : `supabase.removeChannel(channel)`

### Méthodes
- `loadNotifications()` — SELECT ORDER BY created_at DESC LIMIT 50
- `setupRealtime()` — subscribe INSERT sur `notifications` filtré par `user_id`
- `markRead(id)` — UPDATE read = true
- `markAllRead()` — UPDATE read = true WHERE read = false
- `remove(id)` — DELETE
- `removeAll()` — DELETE (toutes)
- `timeAgo(iso)` — "Il y a 2 min", "Il y a 1h", "Il y a 3j"
- `iconFor(type)` — Bell pour new_quote, CheckCircle pour status_changed, Edit pour quote_modified
- Clic extérieur → `open.value = false` via `onClickOutside` ou listener natif

### UX
- Badge rouge sur la cloche : nombre de non lues (masqué si 0)
- Notif non lue : fond `rgba(46,156,171,0.08)` (teal très léger)
- Cliquer une notif → la marque comme lue
- Animation d'entrée du dropdown (fade + slide)

---

## 4. Intégration dans GlobalNav.vue

- Import et rendu de `<NotificationBell />` conditionnel à `isAuth`
- Desktop (pill) : entre le lien Contact et la route admin/profil
- Mobile (barre) : entre Contact et Profil
- Aucune prop à passer — le composant est autonome

---

## Fichiers créés / modifiés

| Fichier | Action |
|---|---|
| `src/components/ui/NotificationBell.vue` | Créer |
| `src/components/ui/GlobalNav.vue` | Modifier — ajouter `<NotificationBell />` |
| Migration SQL (via CLI ou Dashboard) | Créer table + RLS + triggers |
