# Notification Bell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une cloche de notifications persistantes dans GlobalNav pour l'admin (nouveau devis) et les clients/invités (changement de statut, modification de devis).

**Architecture:** Table `notifications` dans Supabase avec RLS + deux triggers Postgres (INSERT et UPDATE sur `quotes`). Composant autonome `NotificationBell.vue` en `<script setup>` intégré dans `GlobalNav.vue`. Realtime Supabase pour les nouvelles notifs en live.

**Tech Stack:** Vue 3 `<script setup>`, Supabase (PostgreSQL triggers, RLS, Realtime), Supabase CLI (`supabase db query --linked`), lucide-vue-next.

---

## Fichiers concernés

| Fichier | Action |
|---|---|
| `supabase/migrations/20260531_notifications.sql` | Créer — table + RLS |
| `supabase/migrations/20260531_notifications_triggers.sql` | Créer — triggers |
| `src/components/ui/NotificationBell.vue` | Créer — composant autonome |
| `src/components/ui/GlobalNav.vue` | Modifier — ajouter `<NotificationBell />` |

---

### Task 1 : Table `notifications` + RLS + Realtime

**Fichiers :**
- Créer : `supabase/migrations/20260531_notifications.sql`

- [ ] **Step 1 : Écrire le fichier de migration**

Créer `supabase/migrations/20260531_notifications.sql` avec ce contenu exact :

```sql
-- Table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type       text NOT NULL CHECK (type IN ('new_quote', 'status_changed', 'quote_modified')),
  title      text NOT NULL,
  message    text,
  quote_id   uuid REFERENCES quotes(id) ON DELETE CASCADE,
  read       boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "notifications_delete_own"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- Index pour les requêtes fréquentes
CREATE INDEX notifications_user_id_idx ON notifications (user_id, created_at DESC);
```

- [ ] **Step 2 : Appliquer la migration**

```powershell
cd "C:/Users/desig/Desktop/Vue.Js et +/BambuCalc"
Get-Content supabase/migrations/20260531_notifications.sql | supabase db query --linked
```

Résultat attendu : aucune erreur.

- [ ] **Step 3 : Vérifier la table**

```powershell
supabase db query --linked "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'notifications' ORDER BY ordinal_position;"
```

Résultat attendu : 8 colonnes listées (id, user_id, type, title, message, quote_id, read, created_at).

- [ ] **Step 4 : Activer Realtime sur `notifications`**

Dans Supabase Dashboard → Database → Replication → cocher la table `notifications`.

- [ ] **Step 5 : Commiter le fichier de migration**

```powershell
git add supabase/migrations/20260531_notifications.sql
git commit -m "feat(db): table notifications + RLS"
```

---

### Task 2 : Trigger INSERT — nouveau devis → notifier l'admin

**Fichiers :**
- Créer : `supabase/migrations/20260531_notifications_triggers.sql`

- [ ] **Step 1 : Écrire la fonction et le trigger INSERT**

Créer `supabase/migrations/20260531_notifications_triggers.sql` avec ce contenu :

```sql
-- Trigger 1 : nouveau devis → notifier tous les admins
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
      COALESCE(NEW.project_name, 'Sans nom') || CASE
        WHEN NEW.material IS NOT NULL AND NEW.material != '' THEN ' — ' || NEW.material
        ELSE ''
      END,
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

- [ ] **Step 2 : Appliquer uniquement la partie INSERT**

```powershell
$sql = Get-Content supabase/migrations/20260531_notifications_triggers.sql -Raw
# Appliquer via Dashboard SQL Editor (coller le contenu ci-dessus)
# OU via CLI si stdin fonctionne :
supabase db query --linked "$(Get-Content supabase/migrations/20260531_notifications_triggers.sql -Raw)"
```

**Alternative fiable — Dashboard SQL Editor :** Supabase Dashboard → SQL Editor → coller le contenu du fichier → Run.

- [ ] **Step 3 : Tester le trigger INSERT**

Dans Supabase Dashboard → SQL Editor :

```sql
-- Insérer un devis de test (remplacer USER_ID par un vrai user_id non-admin)
INSERT INTO quotes (user_id, project_name, material, status)
VALUES ('REMPLACER_PAR_UN_USER_ID', 'Test Trigger', 'PLA+', 'pending');

-- Vérifier que la notification admin a été créée
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 3;
```

Résultat attendu : une ligne avec `type = 'new_quote'`, `title = 'Nouveau devis reçu'`, `user_id` = l'admin.

```sql
-- Nettoyer
DELETE FROM quotes WHERE project_name = 'Test Trigger';
```

---

### Task 3 : Trigger UPDATE — changement statut/modification → notifier le client

**Fichiers :**
- Modifier : `supabase/migrations/20260531_notifications_triggers.sql`

- [ ] **Step 1 : Ajouter la fonction et le trigger UPDATE dans le fichier**

Ajouter à la fin de `supabase/migrations/20260531_notifications_triggers.sql` :

```sql
-- Trigger 2 : statut changé ou devis modifié par admin → notifier le client
CREATE OR REPLACE FUNCTION trigger_notify_quote_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  modifier_id uuid;
  status_label text;
BEGIN
  modifier_id := auth.uid();

  -- Changement de statut → notif pour le propriétaire du devis
  IF OLD.status IS DISTINCT FROM NEW.status
     AND modifier_id IS DISTINCT FROM NEW.user_id THEN
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

  -- Modification par l'admin (hors changement de statut) → notif client
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

- [ ] **Step 2 : Appliquer via Dashboard SQL Editor**

Supabase Dashboard → SQL Editor → coller uniquement le bloc ci-dessus (la fonction + le trigger) → Run.

- [ ] **Step 3 : Tester le trigger UPDATE**

Dans SQL Editor :

```sql
-- Récupérer un quote_id et son user_id existants
SELECT id, user_id, status, quote_number FROM quotes LIMIT 3;

-- Simuler un changement de statut par l'admin
-- (remplacer QUOTE_ID par un vrai id)
UPDATE quotes SET status = 'accepted' WHERE id = 'REMPLACER_PAR_QUOTE_ID';

-- Vérifier la notification
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 3;
```

Résultat attendu : une ligne avec `type = 'status_changed'`, `user_id` = le propriétaire du devis.

- [ ] **Step 4 : Commiter les triggers**

```powershell
git add supabase/migrations/20260531_notifications_triggers.sql
git commit -m "feat(db): triggers notifications — insert + update quotes"
```

---

### Task 4 : Créer `NotificationBell.vue`

**Fichiers :**
- Créer : `src/components/ui/NotificationBell.vue`

- [ ] **Step 1 : Créer le fichier avec le contenu complet**

```vue
<template>
  <div class="notif-wrap" ref="bellWrap">
    <!-- Bouton cloche -->
    <button
      class="notif-btn"
      :class="{ 'notif-btn--active': open }"
      @click="open = !open"
      :title="unreadCount > 0 ? `${unreadCount} notification(s)` : 'Notifications'"
    >
      <Bell :size="18" />
      <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </button>

    <!-- Panel dropdown -->
    <Transition name="notif-drop">
      <div v-if="open" class="notif-panel">
        <div class="notif-panel-header">
          <span class="notif-panel-title">Notifications</span>
          <div class="notif-panel-actions">
            <button
              v-if="notifications.some(n => !n.read)"
              class="notif-action"
              @click="markAllRead"
            >✓ Tout lire</button>
            <button
              v-if="notifications.length > 0"
              class="notif-action notif-action--danger"
              @click="removeAll"
            >Tout supprimer</button>
          </div>
        </div>

        <div v-if="loading" class="notif-empty">
          <div class="notif-spinner" />
        </div>

        <div v-else-if="notifications.length === 0" class="notif-empty">
          <BellOff :size="22" class="notif-empty-icon" />
          <p>Aucune notification</p>
        </div>

        <div v-else class="notif-list">
          <div
            v-for="n in notifications"
            :key="n.id"
            class="notif-item"
            :class="{ 'notif-item--unread': !n.read }"
            @click="markRead(n)"
          >
            <div class="notif-icon-wrap">
              <FileText v-if="n.type === 'new_quote'" :size="14" />
              <CheckCircle v-else-if="n.type === 'status_changed'" :size="14" />
              <Pencil v-else :size="14" />
            </div>
            <div class="notif-content">
              <p class="notif-title">{{ n.title }}</p>
              <p v-if="n.message" class="notif-message">{{ n.message }}</p>
              <p class="notif-time">{{ timeAgo(n.created_at) }}</p>
            </div>
            <button class="notif-close" @click.stop="remove(n.id)" title="Supprimer">✕</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Bell, BellOff, FileText, CheckCircle, Pencil } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'

const notifications = ref([])
const open = ref(false)
const loading = ref(false)
const bellWrap = ref(null)
let realtimeChannel = null

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return "À l'instant"
  if (min < 60) return `Il y a ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `Il y a ${h}h`
  return `Il y a ${Math.floor(h / 24)}j`
}

async function loadNotifications() {
  loading.value = true
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  notifications.value = data ?? []
  loading.value = false
}

async function setupRealtime() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  realtimeChannel = supabase
    .channel(`notif-bell-${user.id}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
      (payload) => {
        notifications.value = [payload.new, ...notifications.value]
      }
    )
    .subscribe()
}

async function markRead(n) {
  if (n.read) return
  n.read = true
  await supabase.from('notifications').update({ read: true }).eq('id', n.id)
}

async function markAllRead() {
  notifications.value.forEach(n => { n.read = true })
  await supabase.from('notifications').update({ read: true }).eq('read', false)
}

async function remove(id) {
  notifications.value = notifications.value.filter(n => n.id !== id)
  await supabase.from('notifications').delete().eq('id', id)
}

async function removeAll() {
  const ids = notifications.value.map(n => n.id)
  notifications.value = []
  open.value = false
  if (ids.length) await supabase.from('notifications').delete().in('id', ids)
}

function handleClickOutside(e) {
  if (bellWrap.value && !bellWrap.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(async () => {
  await loadNotifications()
  await setupRealtime()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.notif-wrap {
  position: relative;
}

/* ── Bouton cloche ── */
.notif-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease, transform 0.22s cubic-bezier(0.34,1.3,0.64,1);
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}
.notif-btn:hover, .notif-btn--active {
  color: #2e9cab;
  background: rgba(46, 156, 171, 0.10);
  transform: translateY(-2px);
}

.notif-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #dc2626;
  color: #fff;
  font-size: 0.58rem;
  font-weight: 800;
  font-family: Inter, 'Segoe UI', Arial, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  pointer-events: none;
}

/* ── Panel dropdown ── */
.notif-panel {
  position: absolute;
  bottom: calc(100% + 12px);
  right: 50%;
  transform: translateX(50%);
  width: 320px;
  max-height: 420px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.14);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 10000;
}

.notif-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #1b2f39;
  flex-shrink: 0;
}
.notif-panel-title {
  font-size: 0.82rem;
  font-weight: 800;
  color: #fff;
}
.notif-panel-actions {
  display: flex;
  gap: 0.5rem;
}
.notif-action {
  font-size: 0.68rem;
  font-weight: 600;
  color: rgba(255,255,255,0.65);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  transition: color 0.15s;
}
.notif-action:hover { color: #fff; }
.notif-action--danger:hover { color: #fca5a5; }

/* ── Empty / Loading ── */
.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  color: #a0aec0;
  font-size: 0.8rem;
}
.notif-empty-icon { color: #cbd5e0; }
.notif-spinner {
  width: 1.5rem; height: 1.5rem;
  border: 2px solid #e2e8f0;
  border-top-color: #2e9cab;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Liste ── */
.notif-list {
  overflow-y: auto;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f0f4f8;
  cursor: pointer;
  transition: background 0.15s;
}
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background: #f7f9fc; }
.notif-item--unread { background: rgba(46,156,171,0.06); }
.notif-item--unread:hover { background: rgba(46,156,171,0.10); }

.notif-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(46,156,171,0.12);
  color: #2e9cab;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.notif-content { flex: 1; min-width: 0; }
.notif-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1b2f39;
  margin: 0 0 0.15rem;
  line-height: 1.35;
}
.notif-message {
  font-size: 0.72rem;
  color: #718096;
  margin: 0 0 0.2rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.notif-time {
  font-size: 0.65rem;
  color: #a0aec0;
  margin: 0;
}

.notif-close {
  font-size: 0.7rem;
  color: #cbd5e0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.1rem 0.2rem;
  border-radius: 4px;
  line-height: 1;
  flex-shrink: 0;
  transition: color 0.15s, background 0.15s;
  font-family: inherit;
}
.notif-close:hover { color: #e53e3e; background: rgba(229,62,62,0.08); }

/* ── Transition dropdown ── */
.notif-drop-enter-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.notif-drop-leave-active { transition: opacity 0.13s ease, transform 0.13s ease; }
.notif-drop-enter-from, .notif-drop-leave-to {
  opacity: 0;
  transform: translateX(50%) translateY(6px);
}

/* ── Mobile (barre bottom) ── */
@media (max-width: 640px) {
  /* S'intègre dans le flex de la nav-bar comme les autres items */
  .notif-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .notif-panel {
    position: fixed;
    bottom: 70px;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    width: calc(100vw - 2rem);
    max-width: 360px;
  }
  .notif-drop-enter-from, .notif-drop-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(6px);
  }
}
</style>
```

- [ ] **Step 2 : Vérifier que le fichier est créé**

```powershell
Test-Path "src/components/ui/NotificationBell.vue"
```

Résultat attendu : `True`

---

### Task 5 : Intégrer `NotificationBell` dans `GlobalNav.vue`

**Fichiers :**
- Modifier : `src/components/ui/GlobalNav.vue`

- [ ] **Step 1 : Lire le fichier pour repérer les lignes exactes**

Lire `src/components/ui/GlobalNav.vue`. Le template desktop (pill) contient les nav-items. La barre mobile contient les nav-bar-items.

- [ ] **Step 2 : Ajouter l'import dans `<script setup>`**

Dans `src/components/ui/GlobalNav.vue`, dans le bloc `<script setup>`, ajouter l'import après les imports existants :

```js
import NotificationBell from '@/components/ui/NotificationBell.vue'
```

- [ ] **Step 3 : Ajouter `<NotificationBell />` dans la pill desktop**

Dans le template, dans `<nav class="nav-island">`, ajouter `<NotificationBell v-if="isAuth" />` après le lien Contact et avant le lien Admin :

```html
      <router-link
        to="/contact"
        class="nav-item"
        :class="{ 'nav-item--on': isActive(['/contact']) }"
        data-tip="Contact"
      >
        <Mail :size="17" />
      </router-link>

      <NotificationBell v-if="isAuth" />

      <router-link
        v-if="isAdminUser"
        to="/admin"
```

- [ ] **Step 4 : Ajouter `<NotificationBell />` dans la barre mobile**

Dans `<nav class="nav-bar">`, ajouter après le lien Contact :

```html
      <router-link
        to="/contact"
        class="nav-bar-item"
        :class="{ 'nav-bar-item--on': isActive(['/contact']) }"
      >
        <Mail :size="21" />
        <span>Contact</span>
      </router-link>

      <NotificationBell v-if="isAuth" />

      <router-link
        v-if="isAdminUser"
        to="/admin"
```

**Note :** Dans la barre mobile, `NotificationBell` s'affiche comme un élément flex (même hauteur 62px). Son bouton est déjà `width: 36px / height: 36px` et s'intègre naturellement.

- [ ] **Step 5 : Lancer le serveur dev et vérifier visuellement**

```powershell
npm run dev
```

Vérifier :
- La cloche apparaît dans la nav pill (desktop) entre Contact et Admin/Profil
- La cloche apparaît dans la barre mobile
- Aucune erreur dans la console
- Le badge rouge apparaît si des notifications existent

---

### Task 6 : Test manuel + commit

- [ ] **Step 1 : Tester le flux complet admin — nouveau devis**

- Onglet A : connecté en admin → ouvrir le dashboard admin
- Onglet B : créer un nouveau devis (calculateur, étape 1 → 4 → soumettre)
- Onglet A : la cloche doit afficher un badge rouge et la notif "Nouveau devis reçu" dans le dropdown

- [ ] **Step 2 : Tester le flux client — changement de statut**

- Onglet A : connecté en client → ouvrir le dashboard client
- Onglet B : connecté en admin → changer le statut d'un devis du client
- Onglet A : la cloche du client doit afficher un badge rouge avec "Statut de votre devis mis à jour"

- [ ] **Step 3 : Tester marquer comme lu + supprimer**

- Cliquer une notif → fond teal disparaît, badge diminue
- "Tout lire" → badge passe à 0
- ✕ sur une notif → disparaît de la liste
- "Tout supprimer" → liste vide

- [ ] **Step 4 : Vérifier le diff**

```powershell
git diff --stat
```

Seuls `src/components/ui/GlobalNav.vue` doit être modifié. `NotificationBell.vue` est un nouveau fichier.

- [ ] **Step 5 : Commit**

```powershell
git add src/components/ui/NotificationBell.vue src/components/ui/GlobalNav.vue
git commit -m "feat(notif): cloche notifications — admin + client/invités"
```
