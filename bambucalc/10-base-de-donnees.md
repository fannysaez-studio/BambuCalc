# Base de données

BambuCalc utilise **PostgreSQL via Supabase** (région EU Frankfurt). La sécurité repose entièrement sur **Row Level Security (RLS)** : chaque utilisateur ne peut accéder qu'à ses propres données, côté serveur.

---

## Schéma complet

### Table `auth.users` (Supabase — gérée automatiquement)

Gérée par Supabase Auth. Contient id, email, created_at, last_sign_in_at, raw_user_meta_data.

---

### Table `profiles`

Étend `auth.users` avec les informations du profil.

```sql
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  avatar_url  text,
  email       text,          -- copié depuis auth.users à l'inscription
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
```

**Trigger** : `on_auth_user_created` → crée automatiquement un profil à l'inscription.

**RLS** :
- Client : lit et modifie uniquement son propre profil (`id = auth.uid()`)
- Admin : lit tous les profils

---

### Table `admins`

Marque quels utilisateurs sont administrateurs.

```sql
CREATE TABLE admins (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
```

**Remplir** : `INSERT INTO admins (user_id) VALUES ('votre-uid');` dans le SQL Editor Supabase.

**RLS** :
- Tous les utilisateurs connectés peuvent lire (pour vérifier s'ils sont admin)
- INSERT/DELETE uniquement via SQL Editor (pas de policy — accès manuel uniquement)

**Fonction** `is_admin()` (RPC) : utilisée par le guard router et les Edge Functions.

---

### Table `quotes`

Stocke tous les devis avec snapshot des coûts au moment de la sauvegarde.

```sql
CREATE TABLE quotes (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_number           text,                    -- ex: "DEV-2026-0042"
  project_name           text DEFAULT 'Sans titre',

  -- Imprimante & profil
  print_profile          text DEFAULT 'normal',   -- normal/quality/speed/silent
  printer_model          text DEFAULT 'p2s-mono', -- p2s-mono/x1c/a1-mini/a1
  nozzle_size            text DEFAULT '0.4',

  -- Filament
  material               text DEFAULT 'PLA',
  cost_per_kg            numeric(10,2) DEFAULT 0,
  weight                 numeric(10,2) DEFAULT 0,  -- grammes

  -- Temps
  hours                  integer DEFAULT 0,
  minutes                integer DEFAULT 0,
  work_time              numeric(10,2) DEFAULT 0,  -- minutes

  -- Emballage & taxes
  packaging_cost         numeric(10,2) DEFAULT 0,
  tax_rate               numeric(5,2) DEFAULT 20,

  -- Production en série
  series_mode            boolean DEFAULT false,
  series_settings        jsonb,                    -- quantité, remise, rebut, setup…

  -- Tarification
  selected_pricing       text DEFAULT 'standard', -- standard/competitive/premium/custom
  custom_margin          numeric(5,2) DEFAULT 50,

  -- Résultats calculés (snapshot)
  material_cost          numeric(10,2) DEFAULT 0,
  equipment_cost         numeric(10,2) DEFAULT 0,
  work_cost              numeric(10,2) DEFAULT 0,
  total_cost             numeric(10,2) DEFAULT 0,
  cost_per_unit          numeric(10,2) DEFAULT 0,
  quantity               integer DEFAULT 1,

  -- Statut métier
  status                 text DEFAULT 'pending',  -- pending/sent/accepted/refused/archived
  archived               boolean DEFAULT false,

  -- Paiement Stripe
  payment_status         text DEFAULT 'pending',  -- pending/processing/paid/failed/refunded
  stripe_payment_intent_id text UNIQUE,

  -- Coordonnées client (pour le PDF)
  client_name            text,
  client_email           text,
  client_phone           text,
  client_address         text,
  payment_preference     text,                    -- stripe/paypal/virement/cheque/especes

  -- Marges avancées
  margin_rate            numeric(5,2),
  delay_days             integer,

  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);
```

**Index** :
- `quotes_user_id_idx` sur `user_id`
- `quotes_created_at_idx` sur `created_at DESC`
- `quotes_stripe_intent_idx` sur `stripe_payment_intent_id` (partiel, IS NOT NULL)
- `quotes_payment_status_idx` sur `payment_status`

---

### Table `notifications`

Notifications in-app pour admins et clients.

```sql
CREATE TABLE notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       text NOT NULL CHECK (type IN (
               'new_quote', 'status_changed', 'quote_modified', 'rdv_booked'
             )),
  title      text NOT NULL,
  message    text,
  quote_id   uuid REFERENCES quotes(id) ON DELETE CASCADE,
  read       boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
```

**Triggers** :
- `on_quote_insert` → notifie tous les admins (`new_quote`)
- `on_quote_update` → notifie le client (`status_changed` ou `quote_modified`)

**RLS** :
- Chaque utilisateur : SELECT, UPDATE, DELETE sur ses propres notifications
- INSERT uniquement via triggers `SECURITY DEFINER` (pas de policy INSERT)

---

### Table `push_subscriptions`

Souscriptions Web Push VAPID des navigateurs clients.

```sql
CREATE TABLE push_subscriptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   text NOT NULL,
  p256dh     text NOT NULL,
  auth_key   text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, endpoint)
);
```

**RLS** :
- Chaque utilisateur gère ses propres souscriptions (`user_id = auth.uid()`)
- `service_role` peut tout lire (pour l'envoi par les Edge Functions)

---

### Table `appointments`

Rendez-vous Calendly synchronisés via webhook.

```sql
CREATE TABLE appointments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendly_event_id  text UNIQUE NOT NULL,  -- identifiant Calendly (clé d'idempotence)
  event_name         text,
  invitee_name       text,
  invitee_email      text,
  start_at           timestamptz,
  end_at             timestamptz,
  status             text DEFAULT 'active' CHECK (status IN ('active', 'canceled')),
  format             text,  -- 'online' | 'inperson' (rempli par l'admin)
  presence           text,  -- '' | 'present' | 'absent'
  admin_note         text,
  reminder_sent      boolean DEFAULT false,
  raw                jsonb,  -- payload Calendly complet
  created_at         timestamptz DEFAULT now() NOT NULL
);
```

**Realtime** : `ALTER PUBLICATION supabase_realtime ADD TABLE appointments;`

**RLS** :
- Admins : SELECT, UPDATE, DELETE sur tous les RDV
- Clients : SELECT sur les RDV où `invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())`
- INSERT uniquement via `service_role` (webhook Calendly)

---

### Table `email_settings`

Templates email personnalisables par l'admin.

```sql
CREATE TABLE email_settings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject     text,
  body        text,
  updated_at  timestamptz DEFAULT now()
);
```

**RLS** : SELECT et UPDATE réservés aux admins uniquement.

---

### Table `contact_rate_limit`

Rate limiting du formulaire de contact (côté serveur, IP hashée).

```sql
CREATE TABLE contact_rate_limit (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash    text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
```

**Accès** : uniquement via `SERVICE_ROLE_KEY` (Edge Function `send-contact-email`). L'IP n'est jamais stockée en clair (hash SHA-256 salé).

---

## Triggers automatiques

| Trigger | Sur quelle table | Événement | Ce qu'il fait |
|---|---|---|---|
| `on_auth_user_created` | `auth.users` | INSERT | Crée un profil dans `profiles` |
| `on_quote_insert` | `quotes` | INSERT | Notifie tous les admins (`new_quote`) |
| `on_quote_update` | `quotes` | UPDATE | Notifie le client si statut change ou si modifié par admin |

---

## Fonctions PostgreSQL

| Fonction | Type | Rôle |
|---|---|---|
| `handle_new_user()` | trigger fn | Crée le profil à l'inscription |
| `is_admin()` | RPC | Retourne `true` si l'utilisateur courant est admin |
| `admin_delete_user(uuid)` | RPC sécurisée | Supprime un utilisateur (admin uniquement) |
| `sync_profile_emails()` | utilitaire | Synchronise les emails des profils existants |
| `trigger_notify_new_quote()` | trigger fn | INSERT notifications pour les admins |
| `trigger_notify_quote_update()` | trigger fn | INSERT notification pour le client |
| `delete_own_account()` | RPC | Permet à un utilisateur de supprimer son propre compte |

---

## Migrations (chronologique)

| Fichier | Date | Contenu |
|---|---|---|
| `schema.sql` | Initial | Profiles, quotes, RLS base |
| `20260510000000_quotes_columns_v2.sql` | 10/05 | Colonnes supplémentaires quotes |
| `20260510000001_admin_setup.sql` | 10/05 | Table admins + email profil + RLS admin |
| `20260516000000_email_settings.sql` | 16/05 | Table email_settings |
| `20260516000001_email_settings_subject.sql` | 16/05 | Ajout colonne subject |
| `20260519000000_add_stripe_payment.sql` | 19/05 | Colonnes payment_status + stripe_payment_intent_id |
| `20260524000000_add_margin_columns.sql` | 24/05 | margin_rate sur quotes |
| `20260524000001_add_delay_columns.sql` | 24/05 | delay_days sur quotes |
| `20260525000000_add_updated_at.sql` | 25/05 | updated_at sur quotes |
| `20260525000001_push_subscriptions.sql` | 25/05 | Table push_subscriptions + RLS |
| `20260530000000_contact_rate_limit.sql` | 30/05 | Table contact_rate_limit |
| `20260531000000_notifications.sql` | 31/05 | Table notifications + RLS |
| `20260531000001_notifications_triggers.sql` | 31/05 | Triggers notify_new_quote + notify_quote_update |
| `20260531000002_appointments.sql` | 31/05 | Table appointments + Realtime |
| `20260601000001_appointments_tracking.sql` | 01/06 | Colonnes tracking admin |
| `20260601000002_appointments_presence.sql` | 01/06 | Colonne presence |
| `20260601000003_appointments_format.sql` | 01/06 | Colonne format |
| `20260601000004_appointments_admin_write.sql` | 01/06 | RLS admin UPDATE/DELETE |
| `20260601000005_appointments_rls_delete.sql` | 01/06 | RLS suppression admin |
| `20260601000006_appointments_grants.sql` | 01/06 | GRANT authenticated |
| `20260601000007_appointments_grants_service.sql` | 01/06 | GRANT service_role |
| `20260601000008_appointments_realtime.sql` | 01/06 | REPLICA IDENTITY FULL |
| `20260602000001_cleanup_test_data.sql` | 02/06 | Nettoyage données test |
| `20260602000002_appointments_client_read.sql` | 02/06 | RLS clients lire leurs RDV |
| `20260605000001_appointments_reminder_sent.sql` | 05/06 | Colonne reminder_sent |
| `20260605000002_delete_own_account.sql` | 05/06 | Fonction delete_own_account() |

---

<div align="center">

**Précédent :** [← Performances Lighthouse](./09-lighthouse.md) &nbsp;|&nbsp; **Suivant :** [Rôles & Sécurité →](./11-roles-securite.md)

</div>
